import { useQuery } from '@tanstack/react-query'
import { getPrayerConfig } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueAdminKeys } from '@/features/mosqueAdmin/api/mosqueAdminKeys'

export function usePrayerConfig(mosqueId: string | undefined) {
  return useQuery({
    queryKey: mosqueAdminKeys.prayerConfig(mosqueId ?? ''),
    queryFn: () => getPrayerConfig(mosqueId as string),
    enabled: Boolean(mosqueId),
  })
}
