import { useQuery } from '@tanstack/react-query'
import { getMosqueKhutbahs } from '@/features/khutbahs/api/khutbahsApi'
import { khutbahsKeys } from '@/features/khutbahs/api/khutbahsKeys'

export function useMosqueKhutbahs(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: khutbahsKeys.list(idOrSlug ?? ''),
    queryFn: () => getMosqueKhutbahs(idOrSlug as string),
    enabled: Boolean(idOrSlug),
  })
}
