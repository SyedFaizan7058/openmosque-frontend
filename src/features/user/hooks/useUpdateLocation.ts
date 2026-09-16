import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateUserLocation } from '@/features/user/api/userApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import type { UserLocationUpdateRequestDto } from '@/features/user/types'

/** `PUT /api/v1/users/me/location`. On success, writes the response's
 * updated `UserResponseDto` straight back into the auth store so the rest
 * of the app (this page included) reflects the new preferred location
 * immediately, without a redundant `GET /users/me` refetch. */
export function useUpdateLocation() {
  return useMutation({
    mutationFn: (body: UserLocationUpdateRequestDto) => updateUserLocation(body),
    onSuccess: (updatedUser) => {
      useAuthStore.getState().setUser(updatedUser)
      useLocationStore.getState().syncFromUser(updatedUser)
      toast.success('Your location has been updated.')
    },
    onError: () => {
      toast.error("Couldn't update your location. Please try again.")
    },
  })
}
