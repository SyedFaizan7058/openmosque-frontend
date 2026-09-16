import { useQuery } from '@tanstack/react-query'
import { getIqamahSchedule } from '@/features/mosqueAdmin/api/mosqueAdminApi'
import { mosqueAdminKeys } from '@/features/mosqueAdmin/api/mosqueAdminKeys'

export function useIqamahSchedule(mosqueId: string | undefined) {
  return useQuery({
    queryKey: mosqueAdminKeys.iqamahSchedule(mosqueId ?? ''),
    queryFn: () => getIqamahSchedule(mosqueId as string),
    enabled: Boolean(mosqueId),
  })
}
