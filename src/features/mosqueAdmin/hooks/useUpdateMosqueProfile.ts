import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateMosqueProfile } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueKeys } from '@/features/mosques/api/mosqueKeys'
import type { MosqueUpdateRequestDto } from '@/features/mosqueAdmin/types'
import type { ApiErrorDetail } from '@/features/auth/types'

export function useUpdateMosqueProfile(mosqueId: string) {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, MosqueUpdateRequestDto>({
    mutationFn: (body) => updateMosqueProfile(mosqueId, body),
    onSuccess: () => {
      // Invalidates both this admin's own cached copy (`useAdminMosques`)
      // and the public detail page's cache — they share the same
      // `mosqueKeys.detail` key, so one invalidation covers both.
      void queryClient.invalidateQueries({ queryKey: mosqueKeys.detail(mosqueId) })
      toast.success('Mosque profile updated.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't save the mosque profile. Please try again.")
    },
  })
}
