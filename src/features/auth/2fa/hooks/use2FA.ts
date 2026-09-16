import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  get2FAStatus,
  post2FASetup,
  post2FAEnable,
  post2FAVerify,
  post2FADisable,
  post2FARegenerateBackupCodes,
} from '@/features/auth/2fa/api/twoFactorApi'
import { twoFactorKeys } from '@/features/auth/2fa/api/twoFactorKeys'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import type { TwoFactorVerifyRequestDto } from '@/features/auth/2fa/types'

export function use2FAStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: twoFactorKeys.status(),
    queryFn: get2FAStatus,
    enabled: isAuthenticated,
    staleTime: 60000,
  })
}

export function useSetup2FA() {
  return useMutation({
    mutationFn: post2FASetup,
  })
}

export function useEnable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => post2FAEnable(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.all })
    },
  })
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: (dto: TwoFactorVerifyRequestDto) => post2FAVerify(dto),
  })
}

export function useDisable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: TwoFactorVerifyRequestDto) => post2FADisable(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.all })
    },
  })
}

export function useRegenerateBackupCodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => post2FARegenerateBackupCodes(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.all })
    },
  })
}
