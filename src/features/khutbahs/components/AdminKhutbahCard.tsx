import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Mic2, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useDeleteKhutbah } from '@/features/khutbahs/hooks/useDeleteKhutbah'
import type { MosqueKhutbahResponseDto } from '@/features/khutbahs/types'

interface AdminKhutbahCardProps {
  mosqueId: string
  khutbah: MosqueKhutbahResponseDto
  onEdit: () => void
}

export function AdminKhutbahCard({ mosqueId, khutbah, onEdit }: AdminKhutbahCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteKhutbah = useDeleteKhutbah()

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {format(parseISO(khutbah.khutbahDate), 'MMM d, yyyy')} · Batch {khutbah.batchNumber}
            </Badge>
            <Badge variant="outline">{khutbah.language}</Badge>
          </div>
          <h3 className="font-semibold text-foreground">{khutbah.topic}</h3>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mic2 className="size-4" aria-hidden="true" /> {khutbah.khatibName} · {khutbah.khutbahTime.slice(0, 5)}
          </span>
          {khutbah.notes && <p className="text-sm text-muted-foreground">{khutbah.notes}</p>}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Khutbah options" className="size-8 shrink-0">
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil aria-hidden="true" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="text-destructive focus:text-destructive">
              <Trash2 aria-hidden="true" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this khutbah entry?"
        description="This can't be undone."
        isPending={deleteKhutbah.isPending}
        onConfirm={() =>
          deleteKhutbah.mutate({ mosqueId, khutbahId: khutbah.id }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </Card>
  )
}
