import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createKhutbah } from '@/features/khutbahs/api/khutbahsApi'
import { khutbahsKeys } from '@/features/khutbahs/api/khutbahsKeys'
import type { MosqueKhutbahCreateDto } from '@/features/khutbahs/types'
import type { ApiErrorDetail } from '@/features/auth/types'

interface CreateKhutbahVars {
  mosqueId: string
  body: MosqueKhutbahCreateDto
}

export function useCreateKhutbah() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, CreateKhutbahVars>({
    mutationFn: ({ mosqueId, body }) => createKhutbah(mosqueId, body),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: khutbahsKeys.list(mosqueId) })
      toast.success('Khutbah added.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't add the khutbah. Please try again.")
    },
  })
}
