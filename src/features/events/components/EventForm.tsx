import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FileUploadField } from '@/components/shared/FileUploadField'
import { useCreateEvent } from '@/features/events/hooks/useCreateEvent'
import { useUpdateEvent } from '@/features/events/hooks/useUpdateEvent'
import { eventFormSchema } from '@/features/events/schemas'
import type { EventFormValues } from '@/features/events/schemas'
import type { MosqueEventCreateDto, MosqueEventResponseDto } from '@/features/events/types'
import { toDatetimeLocalValue } from '@/lib/dateTimeLocal'

const EVENT_TYPE_OPTIONS: Record<string, string> = {
  HALAQAH: 'Halaqah',
  WORKSHOP: 'Workshop',
  YOUTH_PROGRAM: 'Youth Program',
  CHARITY: 'Charity',
  RAMADAN: 'Ramadan',
  EID: 'Eid',
  COMMUNITY_MEETING: 'Community Meeting',
  OTHER: 'Other',
}

const AUDIENCE_OPTIONS: Record<string, string> = {
  ALL: 'Everyone',
  BROTHERS: 'Brothers',
  SISTERS: 'Sisters',
  YOUTH: 'Youth',
}

interface EventFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mosqueId: string
  /** Present -> editing that event (`PUT`); absent -> creating a new one
   * (`POST`). */
  event?: MosqueEventResponseDto
}

const emptyDefaults: EventFormValues = {
  title: '',
  description: '',
  eventType: 'HALAQAH',
  audience: 'ALL',
  startDateTime: '',
  endDateTime: '',
  locationDetails: '',
  speakerName: '',
  bannerImageUrl: '',
  registrationUrl: '',
}

/** Create/edit dialog for a mosque's events — one form backs both `POST
 * .../events` and `PUT .../events/{id}` since `MosqueEventCreateDto` is
 * the same shape either way (per the backend contract). */
export function EventForm({ open, onOpenChange, mosqueId, event }: EventFormProps) {
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isPending = createEvent.isPending || updateEvent.isPending

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    values: event
      ? {
          title: event.title,
          description: event.description ?? '',
          eventType: event.eventType,
          audience: event.audience,
          startDateTime: toDatetimeLocalValue(event.startDateTime),
          endDateTime: toDatetimeLocalValue(event.endDateTime),
          locationDetails: event.locationDetails ?? '',
          speakerName: event.speakerName ?? '',
          bannerImageUrl: event.bannerImageUrl ?? '',
          registrationUrl: event.registrationUrl ?? '',
        }
      : emptyDefaults,
  })

  function onSubmit(values: EventFormValues) {
    const body: MosqueEventCreateDto = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      eventType: values.eventType,
      audience: values.audience,
      startDateTime: new Date(values.startDateTime).toISOString(),
      endDateTime: new Date(values.endDateTime).toISOString(),
      locationDetails: values.locationDetails?.trim() || undefined,
      speakerName: values.speakerName?.trim() || undefined,
      bannerImageUrl: values.bannerImageUrl?.trim() || undefined,
      registrationUrl: values.registrationUrl?.trim() || undefined,
    }

    const onSuccess = () => {
      onOpenChange(false)
      reset()
    }

    if (event) {
      updateEvent.mutate({ mosqueId, eventId: event.id, body }, { onSuccess })
    } else {
      createEvent.mutate({ mosqueId, body }, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit event' : 'New event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update the details for this event.' : 'Announce a new event at your mosque.'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" aria-invalid={!!errors.title} {...register('title')} />
            {errors.title && <p role="alert" className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-description">Description (optional)</Label>
            <Textarea id="ev-description" rows={3} {...register('description')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-type">Event type</Label>
              <Select id="ev-type" {...register('eventType')}>
                {Object.entries(EVENT_TYPE_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-audience">Audience</Label>
              <Select id="ev-audience" {...register('audience')}>
                {Object.entries(AUDIENCE_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-start">Starts</Label>
              <Input id="ev-start" type="datetime-local" aria-invalid={!!errors.startDateTime} {...register('startDateTime')} />
              {errors.startDateTime && <p role="alert" className="text-sm text-destructive">{errors.startDateTime.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-end">Ends</Label>
              <Input id="ev-end" type="datetime-local" aria-invalid={!!errors.endDateTime} {...register('endDateTime')} />
              {errors.endDateTime && <p role="alert" className="text-sm text-destructive">{errors.endDateTime.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-location">Location details (optional)</Label>
            <Input id="ev-location" {...register('locationDetails')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-speaker">Speaker (optional)</Label>
            <Input id="ev-speaker" {...register('speakerName')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-banner">Banner image URL (optional)</Label>
            <Input id="ev-banner" type="url" placeholder="https://…" aria-invalid={!!errors.bannerImageUrl} {...register('bannerImageUrl')} />
            {errors.bannerImageUrl && <p role="alert" className="text-sm text-destructive">{errors.bannerImageUrl.message}</p>}
            <FileUploadField
              id="ev-banner-upload"
              category="EVENT_BANNER"
              disabled={isPending}
              onUploaded={(url) => setValue('bannerImageUrl', url, { shouldValidate: true, shouldDirty: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-registration">Registration URL (optional)</Label>
            <Input id="ev-registration" type="url" placeholder="https://…" aria-invalid={!!errors.registrationUrl} {...register('registrationUrl')} />
            {errors.registrationUrl && <p role="alert" className="text-sm text-destructive">{errors.registrationUrl.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {event ? 'Save changes' : 'Create event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
