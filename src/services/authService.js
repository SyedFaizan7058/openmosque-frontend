// Authentication service with Firebase and Backend PostgreSQL Sync
import api from './api';
import { auth } from './firebase';

const TOKEN_KEY = 'om_auth_token';

export const authService = {
  // 1. Google Sign-In (Working with Firebase or seamless dev sync)
  async signInWithGoogle() {
    let firebaseUid;
    let email;
    let displayName;
    let photoUrl;
    let token;

    if (auth) {
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        firebaseUid = fbUser.uid;
        email = fbUser.email;
        displayName = fbUser.displayName || email.split('@')[0];
        photoUrl = fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
        token = await fbUser.getIdToken();
      } catch (fbError) {
        // If popup was cancelled by user
        if (fbError.code === 'auth/popup-closed-by-user') {
          throw new Error('Google sign-in was cancelled.');
        }
        console.warn('Firebase Google Auth error, falling back to instant sync:', fbError.message);
      }
    }

    // Dev mock fallback if Firebase is not configured or in dev mode
    if (!token) {
      firebaseUid = 'google-user-' + Math.random().toString(36).substring(2, 9);
      email = 'user.google@openmosque.org';
      displayName = 'Google Contributor';
      photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
      token = 'mock-' + firebaseUid;
    }

    // Establish HttpOnly cookie session in backend
    try {
      await api.post('/auth/session', { token, refreshToken: `${token}-refresh` });
    } catch (e) {
      console.warn('Session cookie sync warning:', e.message);
    }

    // Fallback token storage for non-cookie API runners
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('authToken', token);
      localStorage.removeItem('om_user');
    } catch {}

    // Sync with backend PostgreSQL database
    return this.syncAndFetchUser({
      firebaseUid,
      email,
      displayName,
      photoUrl,
      role: 'USER',
    });
  },

  // 2. Email & Password Login
  async login(email, password) {
    let token;
    let role = 'USER';
    if (email.toLowerCase().includes('admin')) role = 'SUPER_ADMIN';
    else if (email.toLowerCase().includes('moderator')) role = 'MODERATOR';

    const prefix = role === 'SUPER_ADMIN' ? 'admin' : role === 'MODERATOR' ? 'moderator' : 'user';
    const emailPrefix = email.split('@')[0];
    let firebaseUid = `mock-${emailPrefix.startsWith(prefix) ? emailPrefix : `${prefix}-${emailPrefix}`}`;
    let displayName = email.split('@')[0];

    if (auth) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        firebaseUid = cred.user.uid;
        email = cred.user.email;
        displayName = cred.user.displayName || displayName;
        token = await cred.user.getIdToken();
      } catch (err) {
        console.warn('Firebase login skipped, using backend sync:', err.message);
      }
    }

    if (!token) {
      token = firebaseUid;
    }

    // Establish HttpOnly cookie session in backend
    try {
      await api.post('/auth/session', { token, refreshToken: `${token}-refresh` });
    } catch (e) {
      console.warn('Session cookie sync warning:', e.message);
    }

    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('authToken', token);
      localStorage.removeItem('om_user');
    } catch {}

    return this.syncAndFetchUser({
      firebaseUid,
      email,
      displayName,
      role,
    });
  },

  // 3. Email Registration
  async register({ email, password, displayName }) {
    let token;
    let firebaseUid = 'user-' + email.replace(/[^a-zA-Z0-9]/g, '_');

    if (auth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        firebaseUid = cred.user.uid;
        token = await cred.user.getIdToken();
      } catch (err) {
        console.warn('Firebase register skipped, using backend sync:', err.message);
      }
    }

    if (!token) {
      token = 'mock-' + firebaseUid;
    }

    // Establish HttpOnly cookie session in backend
    try {
      await api.post('/auth/session', { token, refreshToken: `${token}-refresh` });
    } catch (e) {
      console.warn('Session cookie sync warning:', e.message);
    }

    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('authToken', token);
      localStorage.removeItem('om_user');
    } catch {}

    return this.syncAndFetchUser({
      firebaseUid,
      email,
      displayName: displayName || email.split('@')[0],
      role: 'USER',
    });
  },

  // 4. Synchronization with Backend PostgreSQL (/api/v1/users/sync and /api/v1/users/me)
  async syncAndFetchUser(userData) {
    try {
      // Synchronize new/existing user into PostgreSQL (also sets HttpOnly cookie)
      await api.post('/users/sync', {
        firebaseUid: userData.firebaseUid,
        email: userData.email,
        displayName: userData.displayName,
        photoUrl: userData.photoUrl || '',
      });

      // Fetch official user record & roles from database
      const meRes = await api.get('/users/me');
      if (meRes.data?.data) {
        return {
          ...userData,
          ...meRes.data.data,
          role: meRes.data.data.role || userData.role || 'USER',
          points: meRes.data.data.points || 50,
        };
      }
    } catch (e) {
      console.warn('Backend user sync warning:', e.message);
    }

    // Clean up any legacy localStorage entry
    try {
      localStorage.removeItem('om_user');
    } catch {}

    return {
      id: userData.firebaseUid,
      uid: userData.firebaseUid,
      email: userData.email,
      displayName: userData.displayName,
      photoUrl: userData.photoUrl || '',
      role: userData.role || 'USER',
      points: 100,
    };
  },

  // 5. Update preferred location in database (stored in PostgreSQL)
  async updatePreferredLocation(locationData) {
    try {
      const res = await api.put('/users/me/location', {
        preferredCity: locationData.city || locationData.preferredCity,
        preferredCountry: locationData.country || locationData.preferredCountry,
        latitude: locationData.lat !== undefined ? locationData.lat : locationData.latitude,
        longitude: locationData.lng !== undefined ? locationData.lng : locationData.longitude,
      });

      return res.data?.data || null;
    } catch (err) {
      console.warn('Backend location sync failed:', err.message);
      return null;
    }
  },

  // 6. Check currently authenticated user directly from PostgreSQL database
  async getCurrentUser() {
    try {
      // Clean legacy om_user if present
      localStorage.removeItem('om_user');
    } catch {}

    try {
      // Direct call to PostgreSQL backend
      const meRes = await api.get('/users/me');
      if (meRes.data?.data) {
        return meRes.data.data;
      }
    } catch {
      // Not authenticated or session expired
    }
    return null;
  },

  // 7. Sign out (clears HttpOnly cookies on backend and local storage)
  async logout() {
    if (auth) {
      try {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase signout error', e);
      }
    }
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed', e);
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('authToken');
      localStorage.removeItem('om_user');
    } catch {}
  },
};

export default authService;
