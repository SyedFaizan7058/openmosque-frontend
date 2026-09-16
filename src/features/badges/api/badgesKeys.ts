/** Query-key factory for the badges feature. */
export const badgesKeys = {
  all: ['badges'] as const,
  catalog: () => [...badgesKeys.all, 'catalog'] as const,
  mine: () => [...badgesKeys.all, 'mine'] as const,
}
