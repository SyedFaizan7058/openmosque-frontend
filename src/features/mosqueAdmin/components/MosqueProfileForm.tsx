import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FacilityCheckboxGroup } from '@/features/submissions/components/FacilityCheckboxGroup'
import { ImageUrlList } from '@/features/mosqueAdmin/components/ImageUrlList'
import { useUpdateMosqueProfile } from '@/features/mosqueAdmin/hooks/useUpdateMosqueProfile'
import { mosqueProfileFormSchema } from '@/features/mosqueAdmin/schemas'
import type { MosqueProfileFormValues } from '@/features/mosqueAdmin/schemas'
import type { MosqueUpdateRequestDto } from '@/features/mosqueAdmin/types'
import type { MosqueResponseDto } from '@/features/mosques/types'

interface MosqueProfileFormProps {
  mosque: MosqueResponseDto
}

function mosqueToFormValues(mosque: MosqueResponseDto): MosqueProfileFormValues {
  return {
    name: mosque.name,
    description: mosque.description ?? '',
    address: mosque.address,
    city: mosque.city,
    state: mosque.state ?? '',
    country: mosque.country,
    postalCode: mosque.postalCode ?? '',
    latitude: String(mosque.latitude),
    longitude: String(mosque.longitude),
    contactPhone: mosque.contactPhone ?? '',
    contactEmail: mosque.contactEmail ?? '',
    websiteUrl: mosque.websiteUrl ?? '',
    liveStreamUrl: mosque.liveStreamUrl ?? '',
    facilityCodes: (mosque.facilities ?? []).map((f) => f.facilityCode),
    imageUrls: (mosque.images ?? []).map((img) => img.imageUrl),
  }
}

/** Direct edit of an already-owned, already-verified mosque's profile —
 * `PUT /api/v1/mosques/{id}`, no moderation queue (unlike "Suggest an
 * edit", which any visitor can use and always goes to review). Shares its
 * field set and validation shape with `MosqueSubmissionForm` but is its
 * own component/schema, since the two forms serve different actions (see
 * the doc comment on `mosqueProfileFormSchema`). */
export function MosqueProfileForm({ mosque }: MosqueProfileFormProps) {
  const updateProfile = useUpdateMosqueProfile(mosque.id)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MosqueProfileFormValues>({
    resolver: zodResolver(mosqueProfileFormSchema),
    values: mosqueToFormValues(mosque),
  })

  function onSubmit(values: MosqueProfileFormValues) {
    const body: MosqueUpdateRequestDto = {
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
      facilityCodes: values.facilityCodes,
      imageUrls: values.imageUrls,
    }
    updateProfile.mutate(body)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mosque Profile</CardTitle>
        <CardDescription>Changes here go live immediately — no moderator review, since this is your own verified mosque.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="mp-name">Mosque name</Label>
              <Input id="mp-name" aria-invalid={!!errors.name} {...register('name')} />
              {errors.name && <p role="alert" className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="mp-description">Description (optional)</Label>
              <Textarea id="mp-description" rows={3} {...register('description')} />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="mp-address">Street address</Label>
              <Input id="mp-address" aria-invalid={!!errors.address} {...register('address')} />
              {errors.address && <p role="alert" className="text-sm text-destructive">{errors.address.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-city">City</Label>
              <Input id="mp-city" aria-invalid={!!errors.city} {...register('city')} />
              {errors.city && <p role="alert" className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-state">State / Province (optional)</Label>
              <Input id="mp-state" {...register('state')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-country">Country</Label>
              <Input id="mp-country" aria-invalid={!!errors.country} {...register('country')} />
              {errors.country && <p role="alert" className="text-sm text-destructive">{errors.country.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-postal">Postal code (optional)</Label>
              <Input id="mp-postal" {...register('postalCode')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-lat">Latitude</Label>
              <Input id="mp-lat" inputMode="decimal" aria-invalid={!!errors.latitude} {...register('latitude')} />
              {errors.latitude && <p role="alert" className="text-sm text-destructive">{errors.latitude.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-lng">Longitude</Label>
              <Input id="mp-lng" inputMode="decimal" aria-invalid={!!errors.longitude} {...register('longitude')} />
              {errors.longitude && <p role="alert" className="text-sm text-destructive">{errors.longitude.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-phone">Contact phone (optional)</Label>
              <Input id="mp-phone" type="tel" {...register('contactPhone')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-email">Contact email (optional)</Label>
              <Input id="mp-email" type="email" aria-invalid={!!errors.contactEmail} {...register('contactEmail')} />
              {errors.contactEmail && <p role="alert" className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-website">Website (optional)</Label>
              <Input id="mp-website" type="url" placeholder="https://…" aria-invalid={!!errors.websiteUrl} {...register('websiteUrl')} />
              {errors.websiteUrl && <p role="alert" className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mp-stream">Live stream URL (optional)</Label>
              <Input id="mp-stream" type="url" placeholder="https://…" aria-invalid={!!errors.liveStreamUrl} {...register('liveStreamUrl')} />
              {errors.liveStreamUrl && <p role="alert" className="text-sm text-destructive">{errors.liveStreamUrl.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Facilities</Label>
            <Controller
              name="facilityCodes"
              control={control}
              render={({ field }) => <FacilityCheckboxGroup value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Photos</Label>
            <Controller
              name="imageUrls"
              control={control}
              render={({ field }) => (
                <ImageUrlList value={field.value} onChange={field.onChange} disabled={updateProfile.isPending} />
              )}
            />
          </div>

          <Button type="submit" className="w-fit" disabled={updateProfile.isPending || !isDirty}>
            {updateProfile.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save mosque profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
