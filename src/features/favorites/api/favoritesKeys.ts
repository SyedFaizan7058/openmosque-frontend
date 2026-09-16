/** Query-key factory for the favorites feature. A single `list()` key is
 * enough — `GET /users/me/favorites` takes no params and always describes
 * "the current user's favorites". */
export const favoritesKeys = {
  all: ['favorites'] as const,
  list: () => [...favoritesKeys.all, 'list'] as const,
}
