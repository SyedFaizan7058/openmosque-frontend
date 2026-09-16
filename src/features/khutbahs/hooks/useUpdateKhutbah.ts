import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateKhutbah } from '@/features/khutbahs/api/khutbahsApi'
import { khutbahsKeys } from '@/features/khutbahs/api/khutbahsKeys'
import type { MosqueKhutbahCreateDto } from '@/features/khutbahs/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface UpdateKhutbahVars {
  mosqueId: string
  khutbahId: string
  body: MosqueKhutbahCreateDto
}

export function useUpdateKhutbah() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, UpdateKhutbahVars>({
    mutationFn: ({ mosqueId, khutbahId, body }) => updateKhutbah(mosqueId, khutbahId, body),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: khutbahsKeys.list(mosqueId) })
      toast.success('Khutbah updated.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't update the khutbah. Please try again.")
    },
  })
}
