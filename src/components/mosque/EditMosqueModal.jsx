import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Globe, Radio, AlertCircle, CheckCircle2, FileText, Check } from 'lucide-react';

const AVAILABLE_FACILITIES = [
  { code: 'WUDU_AREA', name: 'Wudu Area' },
  { code: 'WOMENS_SECTION', name: "Women's Prayer Area" },
  { code: 'PARKING', name: 'Parking Available' },
  { code: 'WHEELCHAIR_ACCESSIBILITY', name: 'Wheelchair Accessible' },
  { code: 'AIR_CONDITIONING', name: 'Air Conditioning & Heating' },
  { code: 'JANAZAH_SERVICES', name: 'Janazah Services' },
  { code: 'DAILY_HALAQAH', name: 'Daily Halaqah & Lectures' },
  { code: 'QURAN_CLASSES', name: 'Quran Classes' },
  { code: 'YOUTH_PROGRAMS', name: 'Youth Programs' },
  { code: 'COMMUNITY_HALL', name: 'Community Hall' },
  { code: 'LIBRARY', name: 'Islamic Library' },
  { code: 'FUNERAL_FACILITY', name: 'Funeral Facility' },
];

export default function EditMosqueModal({ mosque, onClose, onMosqueUpdated }) {
  const [formData, setFormData] = useState({
    name: mosque?.name || '',
    description: mosque?.description || '',
    address: mosque?.address || '',
    city: mosque?.city || '',
    state: mosque?.state || '',
    country: mosque?.country || '',
    postalCode: mosque?.postalCode || '',
    latitude: mosque?.latitude || 0,
    longitude: mosque?.longitude || 0,
    contactPhone: mosque?.contactPhone || mosque?.phone || '',
    contactEmail: mosque?.contactEmail || mosque?.email || '',
    websiteUrl: mosque?.websiteUrl || mosque?.website || '',
    liveStreamUrl: mosque?.liveStreamUrl || '',
    facilityCodes: [],
  });

  useEffect(() => {
    if (mosque) {
      const facilities = mosque.facilities?.map(f => f.facilityCode || f.code) || mosque.facilityCodes || [];
      setFormData({
        name: mosque.name || '',
        description: mosque.description || '',
        address: mosque.address || '',
        city: mosque.city || '',
        state: mosque.state || '',
        country: mosque.country || '',
        postalCode: mosque.postalCode || '',
        latitude: mosque.latitude || 0,
        longitude: mosque.longitude || 0,
        contactPhone: mosque.contactPhone || mosque.phone || '',
        contactEmail: mosque.contactEmail || mosque.email || '',
        websiteUrl: mosque.websiteUrl || mosque.website || '',
        liveStreamUrl: mosque.liveStreamUrl || '',
        facilityCodes: facilities,
      });
    }
  }, [mosque]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleFacility = (code) => {
    setFormData(prev => {
      const exists = prev.facilityCodes.includes(code);
      return {
        ...prev,
        facilityCodes: exists
          ? prev.facilityCodes.filter(c => c !== code)
          : [...prev.facilityCodes, code],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
      setError('Mosque name, address, city, and country are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        postalCode: formData.postalCode.trim(),
        contactPhone: formData.contactPhone.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        websiteUrl: formData.websiteUrl.trim() || null,
        liveStreamUrl: formData.liveStreamUrl.trim() || null,
      };

      await onMosqueUpdated(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update mosque details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-600 dark:text-primary-300">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Edit Mosque Profile
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Authorized Mosque Administrator & Super Admin Control
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

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="mx-auto text-green-500" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Mosque Updated Successfully!</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All changes have been saved and refreshed on the mosque page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Mosque Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                About / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-primary-500" /> Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Globe size={13} className="text-primary-500" /> Official Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Radio size={13} className="text-rose-500" /> Live Stream Broadcast URL
              </label>
              <input
                type="url"
                value={formData.liveStreamUrl}
                onChange={(e) => setFormData({ ...formData, liveStreamUrl: e.target.value })}
                placeholder="https://youtube.com/live/..."
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Available Facilities & Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_FACILITIES.map(facility => {
                  const selected = formData.facilityCodes.includes(facility.code);
                  return (
                    <button
                      key={facility.code}
                      type="button"
                      onClick={() => toggleFacility(facility.code)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-left ${
                        selected
                          ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selected ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="truncate">{facility.name}</span>
                    </button>
                  );
                })}
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
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                <Building2 size={14} />
                <span>{submitting ? 'Saving...' : 'Save Mosque Info'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
