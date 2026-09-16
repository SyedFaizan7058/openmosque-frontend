import { useState } from 'react'
import { Mic2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { MosqueAdminHeader } from '@/features/mosqueAdmin/components/MosqueAdminHeader'
import { AdminKhutbahCard } from '@/features/khutbahs/components/AdminKhutbahCard'
import { KhutbahForm } from '@/features/khutbahs/components/KhutbahForm'
import { useMosqueKhutbahs } from '@/features/khutbahs/hooks/useMosqueKhutbahs'
import type { MosqueKhutbahResponseDto } from '@/features/khutbahs/types'

interface KhutbahManagementBodyProps {
  mosqueId: string
}

function KhutbahManagementBody({ mosqueId }: KhutbahManagementBodyProps) {
  const { data: khutbahs, isLoading, isError } = useMosqueKhutbahs(mosqueId)
  const [formOpen, setFormOpen] = useState(false)
  const [editingKhutbah, setEditingKhutbah] = useState<MosqueKhutbahResponseDto | undefined>(undefined)

  function openCreate() {
    setEditingKhutbah(undefined)
    setFormOpen(true)
  }

  function openEdit(khutbah: MosqueKhutbahResponseDto) {
    setEditingKhutbah(khutbah)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Button type="button" className="w-fit" onClick={openCreate}>
        <Plus aria-hidden="true" /> Add khutbah
      </Button>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load the khutbah schedule" description="Something went wrong reaching the server." />
      ) : !khutbahs || khutbahs.length === 0 ? (
        <EmptyState icon={Mic2} title="No khutbahs scheduled" description="Add your mosque's first khutbah entry above." />
      ) : (
        <div className="flex flex-col gap-4">
          {khutbahs.map((khutbah) => (
            <AdminKhutbahCard key={khutbah.id} mosqueId={mosqueId} khutbah={khutbah} onEdit={() => openEdit(khutbah)} />
          ))}
        </div>
      )}

      <KhutbahForm open={formOpen} onOpenChange={setFormOpen} mosqueId={mosqueId} khutbah={editingKhutbah} />
    </div>
  )
}

export default function KhutbahManagementPage() {
  return (
    <MosqueAdminHeader
      title="Khutbah Schedule"
      description="Manage your mosque's Friday khutbah entries."
      icon={Mic2}
    >
      {(mosque) => <KhutbahManagementBody mosqueId={mosque.id} />}
    </MosqueAdminHeader>
  )
}
