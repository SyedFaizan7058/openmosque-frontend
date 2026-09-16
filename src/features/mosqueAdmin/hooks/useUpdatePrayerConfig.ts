import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updatePrayerConfig } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueAdminKeys } from '@/features/mosqueAdmin/api/mosqueAdminKeys'
import type { PrayerConfigUpdateDto } from '@/features/mosqueAdmin/types'
import type { ApiErrorDetail } from '@/features/auth/types'

export function useUpdatePrayerConfig(mosqueId: string) {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, PrayerConfigUpdateDto>({
    mutationFn: (body) => updatePrayerConfig(mosqueId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mosqueAdminKeys.prayerConfig(mosqueId) })
      toast.success('Prayer calculation settings saved.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't save prayer settings. Please try again.")
    },
  })
}
