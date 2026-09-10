import { Bell, Clock, Calendar, Megaphone } from 'lucide-react';
import { useState } from 'react';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    prayerTimes: true,
    events: true,
    announcements: true,
    weeklyDigest: false,
    nearbyMosques: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const options = [
    { key: 'prayerTimes', label: 'Prayer Time Reminders', description: 'Get notified before each prayer', icon: Clock },
    { key: 'events', label: 'Events & Programs', description: 'New events at your favorite mosques', icon: Calendar },
    { key: 'announcements', label: 'Important Announcements', description: 'Community-wide announcements', icon: Megaphone },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of activity from your mosques', icon: Bell },
    { key: 'nearbyMosques', label: 'Nearby Mosque Updates', description: 'New mosques or updates near you', icon: Bell },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell size={24} />
        Notification Preferences
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.key} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting(option.key)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  settings[option.key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-label={option.label}
                aria-checked={settings[option.key]}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[option.key] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
