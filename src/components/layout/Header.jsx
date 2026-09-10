import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Globe, ChevronDown, LogOut, User, Heart, Plus, Shield, LayoutDashboard, MapPin, Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocationContext } from '../../context/LocationContext';
import { LANGUAGES } from '../../utils/constants';
import mosqueService from '../../services/mosqueService';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { currentLocation, openLocationModal } = useLocationContext();
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await mosqueService.getUnreadNotificationCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // Background poll failure is silent
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const res = await mosqueService.getNotifications(0, 20);
      const list = res?.content || (Array.isArray(res) ? res : []);
      setNotifications(list);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  const handleToggleNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) {
      setUserMenuOpen(false);
      setLanguageMenuOpen(false);
      loadNotifications();
    }
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await mosqueService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await mosqueService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkRead(notif.id);
    }
    setNotificationsOpen(false);
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setNotificationsOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-primary-500 text-white shadow-sm'
        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isModerator = user?.role === 'MODERATOR' || isSuperAdmin;
  const isMosqueAdmin = user?.role === 'MOSQUE_ADMIN' || isSuperAdmin;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 group-hover:bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 transition-all">
              <span className="text-white font-bold text-lg sm:text-xl">🕌</span>
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Open<span className="text-primary-600 dark:text-primary-400">Mosque</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass} end>{t('nav.home') || 'Home'}</NavLink>
            <NavLink to="/mosques" className={navLinkClass}>{t('nav.mosques') || 'Mosques'}</NavLink>
            <NavLink to="/events" className={navLinkClass}>Events</NavLink>
            <NavLink to="/jumah" className={navLinkClass}>Jumu&apos;ah</NavLink>
            {user && (
              <>
                <NavLink to="/favorites" className={navLinkClass}>
                  <span className="flex items-center gap-1.5"><Heart size={14} className="text-primary-500 fill-primary-500" /> {t('nav.favorites') || 'Favorites'}</span>
                </NavLink>
                <NavLink to="/mosques/add" className={navLinkClass}>
                  <span className="flex items-center gap-1.5"><Plus size={14} /> {t('nav.addMosque') || 'Add Mosque'}</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Location selector pill */}
            <button
              type="button"
              onClick={openLocationModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 transition-colors shadow-xs cursor-pointer max-w-[95px] sm:max-w-[160px]"
              title="Change your preferred location"
            >
              <MapPin size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate font-bold">
                {currentLocation?.city || 'Select Location'}
              </span>
            </button>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Language selector (desktop only, accessible in mobile drawer) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => { setLanguageMenuOpen(!languageMenuOpen); setUserMenuOpen(false); }}
                className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Select language"
              >
                <Globe size={17} />
                <span className="text-xs font-bold">{language.toUpperCase()}</span>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => { setLanguage(lang.code); setLanguageMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                        language === lang.code ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {lang.nativeLabel} ({lang.label})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell & Drawer */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  id="notifications-bell-btn"
                  aria-label="Open notifications"
                  onClick={handleToggleNotifications}
                  className="relative p-1.5 sm:p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      id="notifications-badge"
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs animate-pulse"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    id="notifications-drawer"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-primary-600 dark:text-primary-400" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          type="button"
                          id="mark-all-read-btn"
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <CheckCheck size={13} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                      {loadingNotifications ? (
                        <div className="p-8 text-center text-xs text-gray-400">Loading alerts...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="text-3xl block mb-2">✨</span>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">All caught up!</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            You will receive alerts when mosque prayer times change or your submissions update.
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                              n.isRead
                                ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                                : 'bg-primary-50/40 dark:bg-primary-950/30 hover:bg-primary-50/70 dark:hover:bg-primary-950/50'
                            }`}
                          >
                            <div className="text-lg shrink-0 mt-0.5">
                              {n.type === 'IQAMAH_CHANGE' ? '⏰' :
                               n.type === 'BADGE_EARNED' ? '🏆' :
                               n.type === 'SUBMISSION_APPROVED' ? '✅' :
                               n.type === 'SUBMISSION_REJECTED' ? '❌' :
                               n.type === 'CLAIM_APPROVED' ? '🏛️' : '📢'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs font-bold truncate ${n.isRead ? 'text-gray-900 dark:text-white' : 'text-primary-900 dark:text-primary-200'}`}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400">
                                  {new Date(n.createdAt || Date.now()).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {!n.isRead && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkRead(n.id, e)}
                                    className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                                    title="Mark as read"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User menu (desktop only) */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setLanguageMenuOpen(false); }}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || 'Contributor'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                        {user.role || 'USER'} • {user.points || 150} pts
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} /> My Profile &amp; Points
                    </Link>

                    <Link
                      to="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart size={14} className="text-primary-500 fill-primary-500" /> Saved Mosques
                    </Link>

                    {isModerator && (
                      <Link
                        to="/moderator"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield size={14} /> Moderation Queue
                      </Link>
                    )}

                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Profile Button (opens profile page on click) */}
            {user && (
              <Link
                to="/profile"
                className="md:hidden flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer ml-1"
                title="My Profile"
                aria-label="Open User Profile"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </Link>
            )}

            {/* Mobile Hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ml-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            {/* User card in mobile drawer */}
            {user ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName || 'Contributor'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 shrink-0">
                    {user.points || 150} pts
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pb-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2 text-xs font-bold bg-primary-500 text-white rounded-xl shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Navigation links */}
            <div className="space-y-1">
              <NavLink to="/" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)} end>
                <span>🕌</span> Home
              </NavLink>
              <NavLink to="/mosques" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}>
                <span>🔍</span> Mosques Directory
              </NavLink>
              <NavLink to="/events" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}>
                <span>📅</span> Community Events
              </NavLink>
              <NavLink to="/jumah" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}>
                <span>⏰</span> Jumu&apos;ah Guide
              </NavLink>

              {user && (
                <>
                  <NavLink to="/favorites" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <Heart size={16} className="text-primary-500 fill-primary-500" /> Saved Mosques
                  </NavLink>
                  <NavLink to="/mosques/add" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <Plus size={16} className="text-emerald-500" /> Add a Mosque
                  </NavLink>
                  <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setMobileMenuOpen(false)}>
                    <User size={16} /> My Profile &amp; Points
                  </NavLink>
                  {isModerator && (
                    <NavLink to="/moderator" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setMobileMenuOpen(false)}>
                      <Shield size={16} className="text-primary-500" /> Moderation Queue
                    </NavLink>
                  )}
                  {isSuperAdmin && (
                    <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard size={16} className="text-primary-500" /> Admin Dashboard
                    </NavLink>
                  )}
                </>
              )}
            </div>

            {/* Mobile Language Switcher */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Language</p>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      language === lang.code
                        ? 'bg-primary-500 text-white shadow-xs font-bold'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {lang.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign Out (if logged in) */}
            {user && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
