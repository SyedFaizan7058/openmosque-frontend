import { useEffect } from 'react'
import { useAuthStore, selectUser } from '@/features/auth/store/useAuthStore'
import { useAdminMosques } from '@/features/mosqueAdmin/hooks/useAdminMosques'
import { useMosqueAdminStore } from '@/features/mosqueAdmin/store/useMosqueAdminStore'

/** The single source of truth every `/mosque-admin/*` page uses to know
 * "which mosque am I managing right now". Auto-selects the admin's first
 * claimed mosque once the list loads, and exposes a setter for the
 * multi-mosque switcher (`MosqueAdminHeader`) to call. A SUPER_ADMIN with
 * no claimed mosque of their own sees `hasNoMosque: true` — this feature
 * only supports managing a mosque via an approved claim, not an arbitrary
 * mosque picked by a platform admin; that would need its own "search any
 * mosque" affordance, left for a later phase. */
export function useSelectedAdminMosque() {
  const user = useAuthStore(selectUser)
  const claimedMosqueIds = user?.claimedMosqueIds ?? []
  const { mosques, isLoading, isError } = useAdminMosques(claimedMosqueIds)
  const selectedMosqueId = useMosqueAdminStore((s) => s.selectedMosqueId)
  const setSelectedMosqueId = useMosqueAdminStore((s) => s.setSelectedMosqueId)

  useEffect(() => {
    const stillValid = mosques.some((m) => m.id === selectedMosqueId)
    if (!stillValid && mosques.length > 0) {
      setSelectedMosqueId(mosques[0]!.id)
    }
  }, [mosques, selectedMosqueId, setSelectedMosqueId])

  const selectedMosque = mosques.find((m) => m.id === selectedMosqueId) ?? mosques[0]

  return {
    mosques,
    selectedMosque,
    setSelectedMosqueId,
    isLoading,
    isError,
    hasNoMosque: !isLoading && claimedMosqueIds.length === 0,
  }
}
