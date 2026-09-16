/** Query-key factory for the prayer feature — matches the pattern in
 * `features/mosques/api/mosqueKeys.ts`. */
export const prayerKeys = {
  all: ['prayer'] as const,
  times: (idOrSlug: string, date?: string) => [...prayerKeys.all, 'times', idOrSlug, date ?? 'today'] as const,
  methods: () => [...prayerKeys.all, 'methods'] as const,
}
