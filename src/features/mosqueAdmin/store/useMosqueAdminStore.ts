import { create } from 'zustand'

interface MosqueAdminState {
  /** The mosque a MOSQUE_ADMIN is currently managing across the
   * `/mosque-admin/*` pages. An admin can hold more than one approved
   * claim (`UserResponseDto.claimedMosqueIds`), so this is a small piece
   * of client-only UI state — not server data — shared across the five
   * mosque-admin routes via this store rather than a URL param, so
   * clicking between "Prayer Configuration", "Events", etc. keeps the
   * same mosque selected without threading it through every link.
   * Deliberately in-memory only (no persist middleware): resets on reload,
   * which just re-triggers `useSelectedAdminMosque`'s auto-select of the
   * first claimed mosque — an acceptable, simple default for the common
   * case of a single claimed mosque. */
  selectedMosqueId: string | null
  setSelectedMosqueId: (id: string) => void
}

export const useMosqueAdminStore = create<MosqueAdminState>((set) => ({
  selectedMosqueId: null,
  setSelectedMosqueId: (id) => set({ selectedMosqueId: id }),
}))
