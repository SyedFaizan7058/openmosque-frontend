import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateUserRole } from '@/features/admin/api/adminUsersApi'
import { adminUsersKeys } from '@/features/admin/api/adminUsersKeys'
import type { UserRole } from '@/lib/constants'

/** `PATCH /api/v1/admin/users/{id}/role`. Invalidates every cached user-list
 * page (any role filter), since a role change moves the user out of
 * whichever filtered view it was found in. */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateUserRole(userId, role),
    onSuccess: (updatedUser) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
      toast.success(`${updatedUser.displayName ?? updatedUser.email} is now ${updatedUser.role}.`)
    },
    onError: () => {
      toast.error("Couldn't update that user's role. Please try again.")
    },
  })
}
