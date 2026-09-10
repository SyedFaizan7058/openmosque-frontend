import { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import MosqueCard from '../discovery/MosqueCard';
import mosqueService from '../../services/mosqueService';
import { useAuth } from '../../context/AuthContext';

export default function Favorites() {
  const { user } = useAuth();
  const [favoriteMosques, setFavoriteMosques] = useState([]);
  const [loading, setLoading] = useState(true);

  const userKey = user?.id || user?.email || user?.uid || null;

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await mosqueService.getFavorites();
      setFavoriteMosques(data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setFavoriteMosques([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (id) => {
    if (!user) return;
    try {
      await mosqueService.toggleFavorite(id);
      setFavoriteMosques((prev) => prev.filter((m) => m.id !== id && m.slug !== id && m.mosqueId !== id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  // Case 1: User is NOT logged in -> Show friendly sign-in prompt
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto shadow-sm">
            <Heart size={32} className="fill-current" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sign In to View Saved Mosques
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Create an account or sign in to save your frequented mosques, track daily congregation Iqamah times, and access them across all your devices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              state={{ from: '/favorites', message: 'Please sign in to view your saved mosques.' }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              <LogIn size={16} />
              <span>Sign In to Account</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold transition-colors"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User IS logged in
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
          <Heart size={28} className="text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400" />
          Saved Mosques
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Instant access to your frequented mosques, today&apos;s Iqamah countdown, and prayer times
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="h-48 rounded-xl skeleton" />
              <div className="h-5 w-3/4 rounded skeleton" />
              <div className="h-4 w-1/2 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : favoriteMosques.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
          <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No saved mosques yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Click the heart icon on any mosque card in the directory to add it to your personal favorites.
          </p>
          <Link
            to="/mosques"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
          >
            <span>Explore Mosques</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteMosques.map((mosque) => {
            const item = { ...mosque, id: mosque.id || mosque.mosqueId };
            return (
              <div key={item.id || item.slug} className="h-full">
                <MosqueCard mosque={item} isFavorited onFavorite={() => handleRemove(item.id)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
