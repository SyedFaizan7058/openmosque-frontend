import { useState, useEffect } from 'react';
import { User, Award, Shield, Bell, Globe, CheckCircle2, Star, Save, Compass, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import mosqueService from '../services/mosqueService';
import NotificationSettings from '../components/account/NotificationSettings';
import LanguageSettings from '../components/account/LanguageSettings';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || 'Community Contributor');
  const [phone, setPhone] = useState(user?.phoneNumber || user?.phone || '+1 234 567 890');
  const [saved, setSaved] = useState(false);
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingBadges(true);
      mosqueService.getMyBadges()
        .then((data) => setBadges(data || []))
        .catch(() => setBadges([]))
        .finally(() => setLoadingBadges(false));
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (user) {
      const updated = { ...user, displayName, phoneNumber: phone, phone };
      setUser(updated);
      try {
        localStorage.removeItem('om_user');
      } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const role = user?.role || 'USER';
  const points = user?.points || 150;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-5 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left min-w-0">
          <div className="w-20 h-20 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary-500/20 shrink-0 overflow-hidden">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              (displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div className="min-w-0 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words max-w-full text-center sm:text-left">
                {displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                {role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all text-center sm:text-left">
              {user?.email || 'contributor@openmosque.org'}
            </p>
          </div>
        </div>

        {/* Contribution points badge */}
        <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/50 px-5 py-3 rounded-2xl shrink-0">
          <Award size={28} className="text-accent-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contributor Points</p>
            <p className="text-xl font-extrabold text-primary-700 dark:text-primary-300">{points} pts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <span>Badges &amp; Achievements</span>
          {badges.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 font-bold">
              {badges.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('language')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'language'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Language & Region
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'contributor@openmosque.org'}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Managed by authentication provider</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              {saved && (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={16} />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Community Badges &amp; Honors</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Earned through verified crowdsourced submissions, community reviews, and active platform contributions.
            </p>
          </div>

          {loadingBadges ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-700/50 skeleton" />
              ))}
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <Award size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">No Badges Earned Yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Bookmark mosques to earn Devoted Patron, or submit unlisted mosques to earn Pioneer!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id || b.code}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-primary-400 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 shadow-sm">
                    {b.code === 'DEVOTED_PATRON' ? <Heart size={24} className="fill-current text-red-500" /> :
                     b.code === 'MOSQUE_EXPLORER' ? <Star size={24} className="fill-current text-amber-500" /> :
                     b.code === 'PIONEER' ? <Compass size={24} className="text-emerald-500" /> :
                     b.code === 'VERIFIED_IMAM' ? <ShieldCheck size={24} className="text-blue-500" /> :
                     <Award size={24} className="text-primary-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</h4>
                      <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 shrink-0">
                        {new Date(b.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
          <NotificationSettings />
        </div>
      )}

      {activeTab === 'language' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
          <LanguageSettings />
        </div>
      )}
    </div>
  );
}
