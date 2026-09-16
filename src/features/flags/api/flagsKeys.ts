/** Query-key factory for the flags feature (moderator queue only — the
 * create-flag mutation doesn't read a query). */
export const flagsKeys = {
  all: ['flags'] as const,
  queue: (page: number, size: number) => [...flagsKeys.all, 'queue', page, size] as const,
}
