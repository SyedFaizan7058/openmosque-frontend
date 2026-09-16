import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateKhutbah } from '@/features/khutbahs/hooks/useCreateKhutbah'
import { useUpdateKhutbah } from '@/features/khutbahs/hooks/useUpdateKhutbah'
import { khutbahFormSchema } from '@/features/khutbahs/schemas'
import type { KhutbahFormValues } from '@/features/khutbahs/schemas'
import type { MosqueKhutbahCreateDto, MosqueKhutbahResponseDto } from '@/features/khutbahs/types'

interface KhutbahFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueId: string
  /** Present -> editing (`PUT`); absent -> creating (`POST`). */
  khutbah?: MosqueKhutbahResponseDto
}

const emptyDefaults: KhutbahFormValues = {
  khutbahDate: '',
  topic: '',
  khatibName: '',
  batchNumber: '1',
  khutbahTime: '',
  adhaanTime: '',
  iqamahTime: '',
  language: 'English',
  streamUrl: '',
  recordingUrl: '',
  notes: '',
}

/** `"HH:mm:ss"` (backend) <-> `"HH:mm"` (what `<input type="time">`
 * produces/accepts). */
function toTimeInputValue(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : ''
}
function toBackendTime(time: string | undefined): string | undefined {
  if (!time?.trim()) return undefined
  return time.length === 5 ? `${time}:00` : time
}

/** Create/edit dialog for a mosque's Friday khutbah schedule entries. */
export function KhutbahForm({ open, onOpenChange, mosqueId, khutbah }: KhutbahFormProps) {
  const createKhutbah = useCreateKhutbah()
  const updateKhutbah = useUpdateKhutbah()
  const isPending = createKhutbah.isPending || updateKhutbah.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KhutbahFormValues>({
    resolver: zodResolver(khutbahFormSchema),
    values: khutbah
      ? {
          khutbahDate: khutbah.khutbahDate,
          topic: khutbah.topic,
          khatibName: khutbah.khatibName,
          batchNumber: String(khutbah.batchNumber),
          khutbahTime: toTimeInputValue(khutbah.khutbahTime),
          adhaanTime: toTimeInputValue(khutbah.adhaanTime),
          iqamahTime: toTimeInputValue(khutbah.iqamahTime),
          language: khutbah.language,
          streamUrl: khutbah.streamUrl ?? '',
          recordingUrl: khutbah.recordingUrl ?? '',
          notes: khutbah.notes ?? '',
        }
      : emptyDefaults,
  })

  function onSubmit(values: KhutbahFormValues) {
    const body: MosqueKhutbahCreateDto = {
      khutbahDate: values.khutbahDate,
      topic: values.topic.trim(),
      khatibName: values.khatibName.trim(),
      batchNumber: values.batchNumber?.trim() ? Number(values.batchNumber) : undefined,
      khutbahTime: toBackendTime(values.khutbahTime) as string,
      adhaanTime: toBackendTime(values.adhaanTime),
      iqamahTime: toBackendTime(values.iqamahTime),
      language: values.language?.trim() || undefined,
      streamUrl: values.streamUrl?.trim() || undefined,
      recordingUrl: values.recordingUrl?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    }

    const onSuccess = () => {
      onOpenChange(false)
      reset()
    }

    if (khutbah) {
      updateKhutbah.mutate({ mosqueId, khutbahId: khutbah.id, body }, { onSuccess })
    } else {
      createKhutbah.mutate({ mosqueId, body }, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{khutbah ? 'Edit khutbah' : 'New khutbah'}</DialogTitle>
          <DialogDescription>
            {khutbah ? 'Update this khutbah entry.' : "Add an entry to your mosque's Friday khutbah schedule."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-date">Date</Label>
              <Input id="kh-date" type="date" aria-invalid={!!errors.khutbahDate} {...register('khutbahDate')} />
              {errors.khutbahDate && <p role="alert" className="text-sm text-destructive">{errors.khutbahDate.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-batch">Batch number</Label>
              <Input id="kh-batch" type="number" inputMode="numeric" min={1} {...register('batchNumber')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kh-topic">Topic</Label>
            <Input id="kh-topic" aria-invalid={!!errors.topic} {...register('topic')} />
            {errors.topic && <p role="alert" className="text-sm text-destructive">{errors.topic.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kh-khatib">Khatib name</Label>
            <Input id="kh-khatib" aria-invalid={!!errors.khatibName} {...register('khatibName')} />
            {errors.khatibName && <p role="alert" className="text-sm text-destructive">{errors.khatibName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-khutbah-time">Khutbah time</Label>
              <Input id="kh-khutbah-time" type="time" aria-invalid={!!errors.khutbahTime} {...register('khutbahTime')} />
              {errors.khutbahTime && <p role="alert" className="text-sm text-destructive">{errors.khutbahTime.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-adhaan-time">Adhaan time (optional)</Label>
              <Input id="kh-adhaan-time" type="time" {...register('adhaanTime')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-iqamah-time">Iqamah time (optional)</Label>
              <Input id="kh-iqamah-time" type="time" {...register('iqamahTime')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kh-language">Language</Label>
            <Input id="kh-language" {...register('language')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-stream">Live stream URL (optional)</Label>
              <Input id="kh-stream" type="url" placeholder="https://…" aria-invalid={!!errors.streamUrl} {...register('streamUrl')} />
              {errors.streamUrl && <p role="alert" className="text-sm text-destructive">{errors.streamUrl.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kh-recording">Recording URL (optional)</Label>
              <Input id="kh-recording" type="url" placeholder="https://…" aria-invalid={!!errors.recordingUrl} {...register('recordingUrl')} />
              {errors.recordingUrl && <p role="alert" className="text-sm text-destructive">{errors.recordingUrl.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kh-notes">Notes (optional)</Label>
            <Textarea id="kh-notes" rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {khutbah ? 'Save changes' : 'Add khutbah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
