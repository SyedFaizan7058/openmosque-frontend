import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Building2 } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSelectedAdminMosque } from '@/features/mosqueAdmin/hooks/useSelectedAdminMosque'
import type { MosqueResponseDto } from '@/features/mosques/types'

interface MosqueAdminHeaderProps {
  title: string
  description?: string
  icon: LucideIcon
  /** Rendered only once a mosque is selected and loaded — every
   * mosque-admin page's actual content. Receives the resolved mosque so
   * the page doesn't have to call `useSelectedAdminMosque` a second time. */
  children: (mosque: MosqueResponseDto) => ReactNode
}

/**
 * Shared chrome for every `/mosque-admin/*` page: the page title, a mosque
 * switcher (only rendered when the admin has more than one approved
 * claim — the common case of exactly one claimed mosque never shows it),
 * and the loading/empty states around `useSelectedAdminMosque`. Each page
 * renders this once and puts its real content in `children`, so the
 * "which mosque, is it still loading, does this admin even have one"
 * handling lives in exactly one place instead of five.
 */
export function MosqueAdminHeader({ title, description, icon: Icon, children }: MosqueAdminHeaderProps) {
  const { mosques, selectedMosque, setSelectedMosqueId, isLoading, hasNoMosque } = useSelectedAdminMosque()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Icon className="size-6 text-primary" aria-hidden="true" />
            {title}
          </h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        {mosques.length > 1 && (
          <div className="flex flex-col gap-1 sm:w-64">
            <label htmlFor="mosque-admin-switcher" className="sr-only">
              Managing mosque
            </label>
            <Select
              id="mosque-admin-switcher"
              value={selectedMosque?.id ?? ''}
              onChange={(e) => setSelectedMosqueId(e.target.value)}
            >
              {mosques.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : hasNoMosque ? (
        <EmptyState
          icon={Building2}
          title="No mosque to manage yet"
          description="This area manages a mosque you're an approved admin for. Claim a mosque from its detail page once your claim is approved, this dashboard will pick it up automatically."
        />
      ) : selectedMosque ? (
        <>
          {mosques.length === 1 && (
            <p className="-mt-4 text-sm text-muted-foreground">Managing {selectedMosque.name}</p>
          )}
          {children(selectedMosque)}
        </>
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </div>
  )
}
