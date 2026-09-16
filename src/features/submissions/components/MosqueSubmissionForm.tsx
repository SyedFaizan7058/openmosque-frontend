import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LocateFixed, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGeolocation } from '@/hooks/useGeolocation'
import { FacilityCheckboxGroup } from '@/features/submissions/components/FacilityCheckboxGroup'
import { SubmissionPhotoPicker } from '@/features/submissions/components/SubmissionPhotoPicker'
import { LocationMapPickerModal } from '@/features/submissions/components/LocationMapPickerModal'
import { useCreateSubmission } from '@/features/submissions/hooks/useCreateSubmission'
import { useSuggestEdit } from '@/features/submissions/hooks/useSuggestEdit'
import { mosqueSubmissionSchema } from '@/features/submissions/schemas'
import type { MosqueSubmissionFormValues } from '@/features/submissions/schemas'
import type { MosqueSubmissionRequestDto } from '@/features/submissions/types'

interface MosqueSubmissionFormProps {
  /** `'new'` posts to `/mosques/submissions`; `'edit'` posts to
   * `/mosques/{mosqueId}/suggest-edit` — `mosqueId` is required for the
   * latter. Both hit a moderator review queue rather than writing directly
   * (backend_analysis.md §5), so neither mode updates anything visible
   * immediately. */
  mode: 'new' | 'edit'
  mosqueId?: string
  defaultValues?: Partial<MosqueSubmissionFormValues>
  onSuccess?: () => void
}

const emptyDefaults: MosqueSubmissionFormValues = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  contactPhone: '',
  contactEmail: '',
  websiteUrl: '',
  liveStreamUrl: '',
  facilityCodes: [],
  imageUrls: [],
}

/** The shared form body behind both "Submit a Mosque" (a brand-new
 * listing) and "Suggest an Edit" (a correction to an existing one) — same
 * fields, same validation, different endpoint underneath. */
export function MosqueSubmissionForm({ mode, mosqueId, defaultValues, onSuccess }: MosqueSubmissionFormProps) {
  const createSubmission = useCreateSubmission()
  const suggestEdit = useSuggestEdit()
  const isPending = createSubmission.isPending || suggestEdit.isPending
  const geolocation = useGeolocation()
  const [mapPickerOpen, setMapPickerOpen] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MosqueSubmissionFormValues>({
    resolver: zodResolver(mosqueSubmissionSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  })

  useEffect(() => {
    if (geolocation.coords) {
      setValue('latitude', String(geolocation.coords.lat), { shouldValidate: true })
      setValue('longitude', String(geolocation.coords.lng), { shouldValidate: true })
    }
  }, [geolocation.coords, setValue])

  function onSubmit(values: MosqueSubmissionFormValues) {
    const body: MosqueSubmissionRequestDto = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state?.trim() || undefined,
      country: values.country.trim(),
      postalCode: values.postalCode?.trim() || undefined,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      contactPhone: values.contactPhone?.trim() || undefined,
      contactEmail: values.contactEmail?.trim() || undefined,
      websiteUrl: values.websiteUrl?.trim() || undefined,
      liveStreamUrl: values.liveStreamUrl?.trim() || undefined,
      facilityCodes: values.facilityCodes.length > 0 ? values.facilityCodes : undefined,
      imageUrls: values.imageUrls && values.imageUrls.length > 0 ? values.imageUrls : undefined,
    }

    if (mode === 'edit' && mosqueId) {
      suggestEdit.mutate({ mosqueId, body }, { onSuccess })
    } else {
      createSubmission.mutate(body, { onSuccess })
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="sub-name">Mosque name</Label>
          <Input id="sub-name" aria-invalid={!!errors.name} {...register('name')} />
          {errors.name && <p role="alert" className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="sub-description">Description (optional)</Label>
          <Textarea id="sub-description" rows={3} {...register('description')} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="sub-address">Street address</Label>
          <Input id="sub-address" aria-invalid={!!errors.address} {...register('address')} />
          {errors.address && <p role="alert" className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-city">City</Label>
          <Input id="sub-city" aria-invalid={!!errors.city} {...register('city')} />
          {errors.city && <p role="alert" className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-state">State / Province (optional)</Label>
          <Input id="sub-state" {...register('state')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-country">Country</Label>
          <Input id="sub-country" aria-invalid={!!errors.country} {...register('country')} />
          {errors.country && <p role="alert" className="text-sm text-destructive">{errors.country.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-postal">Postal code (optional)</Label>
          <Input id="sub-postal" {...register('postalCode')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-lat">Latitude</Label>
          <Input id="sub-lat" inputMode="decimal" placeholder="-90 to 90" aria-invalid={!!errors.latitude} {...register('latitude')} />
          {errors.latitude && <p role="alert" className="text-sm text-destructive">{errors.latitude.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-lng">Longitude</Label>
          <Input id="sub-lng" inputMode="decimal" placeholder="-180 to 180" aria-invalid={!!errors.longitude} {...register('longitude')} />
          {errors.longitude && <p role="alert" className="text-sm text-destructive">{errors.longitude.message}</p>}
          {geolocation.error && <p className="text-sm text-muted-foreground">{geolocation.error}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:col-span-2">
          <Button type="button" variant="outline" size="sm" onClick={geolocation.requestLocation} disabled={geolocation.loading}>
            {geolocation.loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
            Use my current location
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMapPickerOpen(true)}
            className="gap-1.5"
          >
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            <span>Pin location on map</span>
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-phone">Contact phone (optional)</Label>
          <Input id="sub-phone" type="tel" {...register('contactPhone')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-email">Contact email (optional)</Label>
          <Input id="sub-email" type="email" aria-invalid={!!errors.contactEmail} {...register('contactEmail')} />
          {errors.contactEmail && <p role="alert" className="text-sm text-destructive">{errors.contactEmail.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-website">Website (optional)</Label>
          <Input id="sub-website" type="url" placeholder="https://…" aria-invalid={!!errors.websiteUrl} {...register('websiteUrl')} />
          {errors.websiteUrl && <p role="alert" className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sub-stream">Live stream URL (optional)</Label>
          <Input id="sub-stream" type="url" placeholder="https://…" aria-invalid={!!errors.liveStreamUrl} {...register('liveStreamUrl')} />
          {errors.liveStreamUrl && <p role="alert" className="text-sm text-destructive">{errors.liveStreamUrl.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Facilities (optional)</Label>
        <Controller
          name="facilityCodes"
          control={control}
          render={({ field }) => <FacilityCheckboxGroup value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Mosque Photos (optional)</Label>
        <Controller
          name="imageUrls"
          control={control}
          render={({ field }) => (
            <SubmissionPhotoPicker
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
      </div>

      <LocationMapPickerModal
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        initialLat={watch('latitude') ? Number(watch('latitude')) : undefined}
        initialLng={watch('longitude') ? Number(watch('longitude')) : undefined}
        onConfirm={({ lat, lng }) => {
          setValue('latitude', String(lat), { shouldValidate: true })
          setValue('longitude', String(lng), { shouldValidate: true })
        }}
      />

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {mode === 'edit' ? 'Submit edit suggestion' : 'Submit for review'}
      </Button>
    </form>
  )
}
