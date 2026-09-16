import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateIqamahSchedule } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueAdminKeys } from '@/features/mosqueAdmin/api/mosqueAdminKeys'
import type { IqamahScheduleUpdateDto } from '@/features/mosqueAdmin/types'
import type { ApiErrorDetail } from '@/features/auth/types'

export function useUpdateIqamahSchedule(mosqueId: string) {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, IqamahScheduleUpdateDto>({
    mutationFn: (body) => updateIqamahSchedule(mosqueId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mosqueAdminKeys.iqamahSchedule(mosqueId) })
      toast.success('Iqamah schedule saved.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't save the iqamah schedule. Please try again.")
    },
  })
}
