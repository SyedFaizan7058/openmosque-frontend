import { Clock } from 'lucide-react';
import { PRAYER_NAMES } from '../../utils/constants';

const FORM_PRAYERS = PRAYER_NAMES.filter((prayer) => prayer.toLowerCase() !== 'sunrise');

export default function PrayerForm({ data, onChange }) {
  const handleChange = (prayer) => (e) => {
    const updated = { ...data.prayerTimes, [prayer]: e.target.value };
    onChange({ prayerTimes: updated });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Prayer Timings
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter prayer times in 24-hour format (HH:MM). Leave blank if unknown.
      </p>

      <div className="space-y-3">
        {FORM_PRAYERS.map((prayer) => (
          <div key={prayer} className="flex items-center gap-3">
            <label className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
              {prayer}
            </label>
            <div className="relative flex-1 max-w-xs">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="time"
                value={data.prayerTimes?.[prayer] || ''}
                onChange={handleChange(prayer)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
