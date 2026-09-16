export const twoFactorKeys = {
  all: ['2fa'] as const,
  status: () => [...twoFactorKeys.all, 'status'] as const,
}
