import { useState } from 'react';
import { Sparkles, Calendar, Clock, User, Globe, Radio, AlertCircle } from 'lucide-react';

export default function KhutbahModal({ mosqueId, onClose, onKhutbahCreated, existingKhutbahs = [] }) {
  const getNextFriday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    khutbahDate: getNextFriday(),
    topic: '',
    khatibName: '',
    batchNumber: 1,
    khutbahTime: '13:00',
    adhaanTime: '12:45',
    iqamahTime: '13:30',
    language: 'English & Arabic',
    streamUrl: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim() || !formData.khatibName.trim()) {
      setError('Topic and Khatib name are required.');
      return;
    }

    const selectedBatch = parseInt(formData.batchNumber, 10) || 1;
    const selectedTime = formData.khutbahTime.length === 5 ? `${formData.khutbahTime}:00` : formData.khutbahTime;

    // Check duplicate Khutbah at the same date & time or same batch
    if (Array.isArray(existingKhutbahs) && existingKhutbahs.length > 0) {
      const conflictBatch = existingKhutbahs.find(
        (k) => k.khutbahDate === formData.khutbahDate && Number(k.batchNumber) === selectedBatch
      );
      if (conflictBatch) {
        setError(`Batch conflict: Batch #${selectedBatch} is already scheduled on ${formData.khutbahDate} ("${conflictBatch.topic}"). Please choose a different batch number.`);
        return;
      }

      const conflictTime = existingKhutbahs.find((k) => {
        if (k.khutbahDate !== formData.khutbahDate) return false;
        const kt = (k.khutbahTime || '').slice(0, 5);
        const st = selectedTime.slice(0, 5);
        return kt === st;
      });
      if (conflictTime) {
        setError(`Time conflict: Another Khutbah ("${conflictTime.topic}") is already scheduled at ${selectedTime.slice(0, 5)} on ${formData.khutbahDate}. Admin cannot host 2 khutbahs at the exact same time.`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        batchNumber: parseInt(formData.batchNumber, 10) || 1,
        khutbahTime: formData.khutbahTime.length === 5 ? `${formData.khutbahTime}:00` : formData.khutbahTime,
        adhaanTime: formData.adhaanTime ? (formData.adhaanTime.length === 5 ? `${formData.adhaanTime}:00` : formData.adhaanTime) : null,
        iqamahTime: formData.iqamahTime ? (formData.iqamahTime.length === 5 ? `${formData.iqamahTime}:00` : formData.iqamahTime) : null,
      };
      await onKhutbahCreated(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to publish Khutbah announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Schedule Friday Jumu'ah Sermon
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publish topic, Khatib, timings, and broadcast link
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Khutbah Topic *
            </label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. Cultivating Gratitude in Daily Life"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User size={13} className="text-emerald-500" /> Khatib / Speaker *
              </label>
              <input
                type="text"
                required
                value={formData.khatibName}
                onChange={(e) => setFormData({ ...formData, khatibName: e.target.value })}
                placeholder="e.g. Sheikh Abdul Rahman"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-500" /> Date *
              </label>
              <input
                type="date"
                required
                value={formData.khutbahDate}
                onChange={(e) => setFormData({ ...formData, khutbahDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={12} className="text-emerald-500" /> Khutbah *
              </label>
              <input
                type="time"
                required
                value={formData.khutbahTime}
                onChange={(e) => setFormData({ ...formData, khutbahTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Adhaan Time
              </label>
              <input
                type="time"
                value={formData.adhaanTime}
                onChange={(e) => setFormData({ ...formData, adhaanTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Iqamah Time
              </label>
              <input
                type="time"
                value={formData.iqamahTime}
                onChange={(e) => setFormData({ ...formData, iqamahTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-emerald-500" /> Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="English & Arabic">English & Arabic</option>
                <option value="Arabic">Arabic</option>
                <option value="Urdu & English">Urdu & English</option>
                <option value="Turkish">Turkish</option>
                <option value="Bengali">Bengali</option>
                <option value="French">French</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Jumu'ah Shift / Batch
              </label>
              <select
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={1}>1st Jumu'ah Prayer</option>
                <option value={2}>2nd Jumu'ah Prayer</option>
                <option value={3}>3rd Jumu'ah Prayer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Radio size={13} className="text-rose-500" /> Live Stream Broadcast URL
            </label>
            <input
              type="url"
              value={formData.streamUrl}
              onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              placeholder="https://youtube.com/live/... or https://facebook.com/..."
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{submitting ? 'Publishing...' : 'Publish Khutbah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
