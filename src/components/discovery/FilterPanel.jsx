import { useState } from 'react';
import { SlidersHorizontal, X, Check, Building2 } from 'lucide-react';
import { FACILITIES } from '../../utils/constants';
import { useLocationContext } from '../../context/LocationContext';

export default function FilterPanel({ filters, onFilterChange, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLocation } = useLocationContext() || {};

  const activeFilterCount = [
    filters.facilities?.length > 0,
    filters.sort && filters.sort !== 'relevance',
  ].filter(Boolean).length;

  const toggleFacility = (facilityId) => {
    const current = filters.facilities || [];
    const updated = current.includes(facilityId)
      ? current.filter((f) => f !== facilityId)
      : [...current, facilityId];
    onFilterChange({ ...filters, facilities: updated });
  };

  const handleSortChange = (sort) => {
    onFilterChange({ ...filters, sort });
  };

  return (
    <div className="relative">
      {/* Filter toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors shadow-sm cursor-pointer ${
          activeFilterCount > 0
            ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <SlidersHorizontal size={16} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5 z-40 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary-500" />
              Filter Mosques
            </h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { onClear?.(); }}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          </div>



          {/* Sort order */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'distance', label: 'Distance' },
                { value: 'name', label: 'Name (A-Z)' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSortChange(option.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                    filters.sort === option.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Facilities / Amenities */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Facilities & Services
              </label>
              {filters.facilities?.length > 0 && (
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  {filters.facilities.length} selected
                </span>
              )}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {FACILITIES.map((facility) => {
                const checked = filters.facilities?.includes(facility.id) || false;
                return (
                  <label
                    key={facility.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{facility.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacility(facility.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Apply button */}
          <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
