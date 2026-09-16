import { useQuery } from '@tanstack/react-query'
import { getMosqueAdminStats } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueAdminKeys } from '@/features/mosqueAdmin/api/mosqueAdminKeys'

export function useMosqueAdminStats(mosqueId: string | undefined) {
  return useQuery({
    queryKey: mosqueAdminKeys.stats(mosqueId ?? ''),
    queryFn: () => getMosqueAdminStats(mosqueId as string),
    enabled: Boolean(mosqueId),
  })
}
