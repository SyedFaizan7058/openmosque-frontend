/** Query-key factory for the mosque-admin feature — mirrors the convention
 * in `features/mosques/api/mosqueKeys.ts`. Every key is scoped by mosque id
 * since an admin can manage more than one mosque. */
export const mosqueAdminKeys = {
  all: ['mosqueAdmin'] as const,
  prayerConfig: (mosqueId: string) => [...mosqueAdminKeys.all, 'prayerConfig', mosqueId] as const,
  iqamahSchedule: (mosqueId: string) => [...mosqueAdminKeys.all, 'iqamahSchedule', mosqueId] as const,
  stats: (mosqueId: string) => [...mosqueAdminKeys.all, 'stats', mosqueId] as const,
}
