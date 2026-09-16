/** Query-key factory for the reviews feature. Keyed by `idOrSlug` (whatever
 * the caller — `MosqueDetailPage` — already has from the route param),
 * mirroring `mosqueKeys.detail`. */
export const reviewsKeys = {
  all: ['reviews'] as const,
  list: (idOrSlug: string) => [...reviewsKeys.all, 'list', idOrSlug] as const,
  page: (idOrSlug: string, page: number, size: number) => [...reviewsKeys.list(idOrSlug), page, size] as const,
  summary: (idOrSlug: string) => [...reviewsKeys.all, 'summary', idOrSlug] as const,
}
