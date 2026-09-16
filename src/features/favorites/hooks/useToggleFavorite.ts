import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addFavorite, removeFavorite } from '@/features/favorites/api/favoritesApi'
import { favoritesKeys } from '@/features/favorites/api/favoritesKeys'
import type { FavoriteMosqueResponseDto } from '@/features/favorites/types'

interface ToggleFavoriteVars {
  mosqueId: string
  /** Whether the mosque is currently favorited — i.e. what we're toggling
   * away from. `true` calls the DELETE endpoint, `false` calls POST. */
  isFavorited: boolean
}

/**
 * Optimistic add/remove toggle. `onMutate` updates the cached favorites
 * list immediately so `useFavoriteMosqueIds`'s membership `Set` (and every
 * `FavoriteButton` reading it) flips instantly, without waiting on the
 * round trip.
 *
 * Removing is a simple filter of the existing full-detail entries. Adding
 * is a compromise: the add/remove endpoints only return a `FavoriteStatusDto`
 * (`{mosqueId, favorite}`), not the full mosque details a real
 * `FavoriteMosqueResponseDto` list entry needs (name, slug, address, etc.),
 * so a minimal placeholder entry is pushed just so the membership `Set`
 * gains the id — enough for every `FavoriteButton` to flip to "favorited",
 * but not enough to render a correct `FavoritesPage` card list entry. That
 * gap is self-correcting: `onSettled` always invalidates the query, so the
 * authoritative list (fetched fresh, with full data) replaces the
 * placeholder within one round trip regardless of success or failure.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mosqueId, isFavorited }: ToggleFavoriteVars) =>
      isFavorited ? removeFavorite(mosqueId) : addFavorite(mosqueId),

    onMutate: async ({ mosqueId, isFavorited }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.list() })

      const previousFavorites = queryClient.getQueryData<FavoriteMosqueResponseDto[]>(favoritesKeys.list())

      queryClient.setQueryData<FavoriteMosqueResponseDto[]>(favoritesKeys.list(), (current) => {
        const list = current ?? []
        if (isFavorited) {
          return list.filter((f) => f.mosqueId !== mosqueId)
        }
        if (list.some((f) => f.mosqueId === mosqueId)) return list
        const placeholder: FavoriteMosqueResponseDto = {
          mosqueId,
          name: '',
          slug: '',
          description: undefined,
          address: '',
          city: '',
          state: undefined,
          country: '',
          postalCode: undefined,
          latitude: undefined,
          longitude: undefined,
          distanceKm: undefined,
          coverImageUrl: undefined,
          verified: false,
          facilityCodes: [],
          favoritedAt: new Date().toISOString(),
        }
        return [...list, placeholder]
      })

      return { previousFavorites }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(favoritesKeys.list(), context.previousFavorites)
      }
      toast.error('Something went wrong updating your favorites. Please try again.')
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoritesKeys.list() })
    },
  })
}
