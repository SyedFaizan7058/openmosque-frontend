import type { FavoriteMosqueResponseDto } from '@/features/favorites/types'
import type { MosqueSummaryDto } from '@/features/mosques/types'

/**
 * Pure mapper: `FavoriteMosqueResponseDto` -> `MosqueSummaryDto`, so
 * `FavoritesPage` can reuse the existing `MosqueCard` instead of forking a
 * near-duplicate. The two DTOs are not the same shape (`mosqueId` vs `id`,
 * no `rating`/`reviewCount`/`status` on the favorite response, and
 * `latitude`/`longitude`/`distanceKm` are nullable here but not on
 * `MosqueSummaryDto`) — every gap is filled with an explicit, reasonable
 * placeholder rather than silently coercing types.
 */
export function favoriteToCardMosque(fav: FavoriteMosqueResponseDto): MosqueSummaryDto {
  return {
    id: fav.mosqueId,
    name: fav.name,
    slug: fav.slug,
    address: fav.address,
    city: fav.city,
    state: fav.state,
    country: fav.country,
    // MosqueSummaryDto.latitude/longitude are required numbers; the favorite
    // response's are nullable, so a missing value falls back to 0 rather
    // than lying about a real coordinate. MosqueCard never reads these
    // directly (only the map view does, which FavoritesPage doesn't use).
    latitude: fav.latitude ?? 0,
    longitude: fav.longitude ?? 0,
    distanceKm: fav.distanceKm,
    coverImageUrl: fav.coverImageUrl,
    verified: fav.verified,
    // `FavoriteMosqueResponseDto` doesn't carry `status` — a favorited
    // mosque is by definition an existing, previously-active mosque, so
    // 'ACTIVE' is a reasonable placeholder default. MosqueCard doesn't
    // currently branch on `status` at all, but this keeps the mapped value
    // honest rather than leaving it `undefined`.
    status: 'ACTIVE',
    liveStreamUrl: undefined,
    facilityCodes: fav.facilityCodes ?? [],
    rating: undefined,
    reviewCount: undefined,
  }
}
