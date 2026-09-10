import { useState } from 'react';
import { BookOpen, Calendar, Clock, User, MapPin, Radio, ExternalLink, AlertCircle } from 'lucide-react';

export default function EventModal({ mosqueId, onClose, onEventCreated, existingEvents = [] }) {
  // Tomorrow's default date string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'HALAQAH',
    audience: 'ALL',
    startDate: defaultDateStr,
    startTime: '18:00',
    endDate: defaultDateStr,
    endTime: '20:00',
    locationDetails: 'Main Prayer Hall',
    speakerName: '',
    registrationUrl: '',
    streamUrl: '',
    bannerImageUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }

    const startObj = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endObj = new Date(`${formData.endDate}T${formData.endTime}:00`);

    if (endObj <= startObj) {
      setError('Event end time must be strictly after the start time.');
      return;
    }

    // Client-side conflict check against existing events
    if (Array.isArray(existingEvents) && existingEvents.length > 0) {
      const conflict = existingEvents.find((ev) => {
        const evStart = new Date(ev.startDateTime);
        const evEnd = new Date(ev.endDateTime);
        return startObj < evEnd && endObj > evStart;
      });

      if (conflict) {
        const conflictStart = new Date(conflict.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const conflictEnd = new Date(conflict.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setError(`Event scheduling conflict: Another event "${conflict.title}" is already scheduled during this time (${conflictStart} – ${conflictEnd}). Please select a different time slot.`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Build ISO-8601 UTC timestamps
      const startDateTime = startObj.toISOString();
      const endDateTime = endObj.toISOString();

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        eventType: formData.eventType,
        audience: formData.audience,
        startDateTime,
        endDateTime,
        locationDetails: formData.locationDetails.trim(),
        speakerName: formData.speakerName.trim(),
        registrationUrl: formData.registrationUrl.trim() || null,
        streamUrl: formData.streamUrl.trim() || null,
        bannerImageUrl: formData.bannerImageUrl.trim() || null,
      };

      await onEventCreated(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create community program.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-300">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Schedule Mosque Program / Event
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Post halaqahs, lectures, youth programs, and workshops
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
              Program Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Weekly Tafseer Ibn Kathir Halaqah"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Category / Event Type *
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="HALAQAH">Halaqah / Study Circle</option>
                <option value="WORKSHOP">Workshop / Seminar</option>
                <option value="YOUTH_PROGRAM">Youth Program</option>
                <option value="CHARITY">Charity & Community Fundraiser</option>
                <option value="RAMADAN">Ramadan & Taraweeh Program</option>
                <option value="EID">Eid Gathering & Celebration</option>
                <option value="COMMUNITY_MEETING">Community Meeting / Consultation</option>
                <option value="OTHER">Other Activity / Lecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="ALL">Everyone (Families, Brothers & Sisters)</option>
                <option value="BROTHERS">Brothers Only</option>
                <option value="SISTERS">Sisters Only</option>
                <option value="YOUTH">Youth & Young Adults</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User size={13} className="text-sky-500" /> Guest Speaker / Instructor
              </label>
              <input
                type="text"
                value={formData.speakerName}
                onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                placeholder="e.g. Dr. Bilal Philips"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-sky-500" /> Location / Hall
              </label>
              <input
                type="text"
                value={formData.locationDetails}
                onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                placeholder="e.g. Second Floor Community Hall"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Join us for an inspiring session covering practical reflections from the Quran and Sunnah..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ExternalLink size={13} className="text-sky-500" /> Registration URL (Optional)
              </label>
              <input
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://eventbrite.com/..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Radio size={13} className="text-rose-500" /> Live Stream Link (Optional)
              </label>
              <input
                type="url"
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                placeholder="https://youtube.com/live/..."
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
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
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>{submitting ? 'Creating...' : 'Schedule Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
