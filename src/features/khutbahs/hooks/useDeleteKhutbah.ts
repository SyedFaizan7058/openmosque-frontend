import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteKhutbah } from '@/features/khutbahs/api/khutbahsApi'
import { khutbahsKeys } from '@/features/khutbahs/api/khutbahsKeys'
import type { ApiErrorDetail } from '@/features/auth/types'

interface DeleteKhutbahVars {
  mosqueId: string
  khutbahId: string
}

export function useDeleteKhutbah() {
  const queryClient = useQueryClient()

  return useMutation<unknown, ApiErrorDetail, DeleteKhutbahVars>({
    mutationFn: ({ mosqueId, khutbahId }) => deleteKhutbah(mosqueId, khutbahId),
    onSuccess: (_data, { mosqueId }) => {
      void queryClient.invalidateQueries({ queryKey: khutbahsKeys.list(mosqueId) })
      toast.success('Khutbah deleted.')
    },
    onError: (error) => {
      toast.error(error?.message ?? "Couldn't delete the khutbah. Please try again.")
    },
  })
}
