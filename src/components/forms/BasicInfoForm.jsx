import { MapPin } from 'lucide-react';

export default function BasicInfoForm({ data, onChange, errors = {} }) {
  const handleChange = (field) => (e) => {
    onChange({ [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Basic Information
      </h2>

      {/* Mosque name */}
      <div>
        <label htmlFor="mosque-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mosque Name <span className="text-red-500">*</span>
        </label>
        <input
          id="mosque-name"
          type="text"
          value={data.name}
          onChange={handleChange('name')}
          placeholder="e.g., Masjid Al-Noor"
          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="mosque-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="mosque-address"
            type="text"
            value={data.address}
            onChange={handleChange('address')}
            placeholder="Full street address"
            className={`w-full pl-9 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
              errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
      </div>

      {/* City & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mosque-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="mosque-city"
            type="text"
            value={data.city}
            onChange={handleChange('city')}
            placeholder="e.g. Udgir, London, New York"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
              errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="mosque-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            id="mosque-country"
            type="text"
            value={data.country || ''}
            onChange={handleChange('country')}
            placeholder="e.g. India, United Kingdom, USA"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none ${
              errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="mosque-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="mosque-desc"
          value={data.description}
          onChange={handleChange('description')}
          placeholder="Tell us about this mosque..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
        />
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mosque-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            id="mosque-phone"
            type="tel"
            value={data.phone}
            onChange={handleChange('phone')}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div>
          <label htmlFor="mosque-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="mosque-email"
            type="email"
            value={data.email}
            onChange={handleChange('email')}
            placeholder="info@mosque.org"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label htmlFor="mosque-website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Website
        </label>
        <input
          id="mosque-website"
          type="url"
          value={data.website}
          onChange={handleChange('website')}
          placeholder="https://mosque.org"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>
    </div>
  );
}
