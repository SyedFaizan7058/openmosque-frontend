export const eventsKeys = {
  all: ['events'] as const,
  list: (idOrSlug: string) => [...eventsKeys.all, 'list', idOrSlug] as const,
  page: (idOrSlug: string, page: number, size: number) => [...eventsKeys.list(idOrSlug), page, size] as const,
}
