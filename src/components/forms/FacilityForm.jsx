import { FACILITIES } from '../../utils/constants';
import * as Icons from 'lucide-react';

export default function FacilityForm({ data, onChange }) {
  const toggleFacility = (facilityId) => {
    const current = data.facilities || [];
    const updated = current.includes(facilityId)
      ? current.filter((f) => f !== facilityId)
      : [...current, facilityId];
    onChange({ facilities: updated });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Facilities & Amenities
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select all facilities available at this mosque
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FACILITIES.map((facility) => {
          const isSelected = data.facilities?.includes(facility.id);
          const IconComponent = Icons[facility.icon] || Icons.Check;

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => toggleFacility(facility.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <IconComponent
                size={20}
                className={isSelected ? 'text-primary-500' : 'text-gray-400'}
              />
              <span className={`text-sm font-medium ${
                isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {facility.label}
              </span>
              {isSelected && (
                <div className="ml-auto w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Icons.Check size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
