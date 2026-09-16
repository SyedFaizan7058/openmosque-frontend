export const khutbahsKeys = {
  all: ['khutbahs'] as const,
  list: (idOrSlug: string) => [...khutbahsKeys.all, 'list', idOrSlug] as const,
}
