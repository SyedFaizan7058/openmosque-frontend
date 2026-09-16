/** Query-key factory for the Q&A feature, mirroring `reviewsKeys`. */
export const questionsKeys = {
  all: ['questions'] as const,
  list: (idOrSlug: string) => [...questionsKeys.all, 'list', idOrSlug] as const,
  page: (idOrSlug: string, page: number, size: number) => [...questionsKeys.list(idOrSlug), page, size] as const,
}
