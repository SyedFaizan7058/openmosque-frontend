import { Check, X as XIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FACILITIES } from '../../utils/constants';

export default function FacilityList({ facilities = [] }) {
  // Normalize existing facility IDs or codes into a Set of uppercase strings
  const activeCodes = new Set();

  if (Array.isArray(facilities)) {
    facilities.forEach((f) => {
      if (!f) return;
      if (typeof f === 'string') {
        f.split(',').forEach((part) => {
          if (part.trim()) activeCodes.add(part.trim().toUpperCase());
        });
      } else if (typeof f === 'object') {
        const code = f.facilityCode || f.code || f.id || f.name || f.facilityName;
        if (code) activeCodes.add(String(code).trim().toUpperCase());
      }
    });
  } else if (typeof facilities === 'string') {
    facilities.split(',').forEach((part) => {
      if (part.trim()) activeCodes.add(part.trim().toUpperCase());
    });
  }

  // Filter to ONLY available facilities
  const availableFacilities = FACILITIES.filter((facility) =>
    activeCodes.has(facility.id.toUpperCase())
  );

  // Support any custom facilities from backend not in predefined list
  const knownIds = new Set(FACILITIES.map((f) => f.id.toUpperCase()));
  const extraFacilities = Array.from(activeCodes)
    .filter((code) => !knownIds.has(code))
    .map((code) => ({
      id: code,
      label: code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: 'Check',
      description: 'Available community facility',
    }));

  const allAvailable = [...availableFacilities, ...extraFacilities];

  if (allAvailable.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No specific facilities recorded for this mosque yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {allAvailable.map((facility) => {
        const IconComponent = Icons[facility.icon] || Check;

        return (
          <div
            key={facility.id}
            className="flex items-center gap-3 p-3.5 rounded-xl border bg-primary-50/70 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-400">
              <IconComponent size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold block truncate text-gray-900 dark:text-white">
                {facility.label}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                {facility.description || 'Verified Available'}
              </span>
            </div>

            <span className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
              <Check size={12} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
