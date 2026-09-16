import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIngestRadius } from '@/features/ingestion/hooks/useIngestRadius'
import { radiusIngestFormSchema } from '@/features/ingestion/schemas'
import type { RadiusIngestFormValues } from '@/features/ingestion/schemas'
import type { IngestionSummaryDto } from '@/features/ingestion/types'

interface RadiusIngestFormProps {
  onResult: (summary: IngestionSummaryDto) => void
}

/** `POST /api/v1/admin/ingest/osm/radius` — a center point + radius (in
 * meters, `@Min(100) @Max(100000)` server-side). */
export function RadiusIngestForm({ onResult }: RadiusIngestFormProps) {
  const ingestRadius = useIngestRadius()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RadiusIngestFormValues>({
    resolver: zodResolver(radiusIngestFormSchema),
    defaultValues: {
      latitude: '',
      longitude: '',
      radiusMeters: '10000',
      defaultCity: '',
      defaultCountry: '',
      dryRun: true,
    },
  })

  function onSubmit(values: RadiusIngestFormValues) {
    ingestRadius.mutate(
      {
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        radiusMeters: Number(values.radiusMeters),
        defaultCity: values.defaultCity?.trim() || undefined,
        defaultCountry: values.defaultCountry?.trim() || undefined,
        dryRun: values.dryRun,
      },
      { onSuccess: onResult },
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-lat">Latitude</Label>
          <Input id="ingest-lat" inputMode="decimal" aria-invalid={!!errors.latitude} {...register('latitude')} />
          {errors.latitude && <p role="alert" className="text-sm text-destructive">{errors.latitude.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-lng">Longitude</Label>
          <Input id="ingest-lng" inputMode="decimal" aria-invalid={!!errors.longitude} {...register('longitude')} />
          {errors.longitude && <p role="alert" className="text-sm text-destructive">{errors.longitude.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-radius">Radius (meters)</Label>
          <Input id="ingest-radius" inputMode="numeric" aria-invalid={!!errors.radiusMeters} {...register('radiusMeters')} />
          {errors.radiusMeters && <p role="alert" className="text-sm text-destructive">{errors.radiusMeters.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-default-city">Default city (optional)</Label>
          <Input id="ingest-default-city" placeholder="Used for results missing an address" {...register('defaultCity')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-default-country">Default country (optional)</Label>
          <Input id="ingest-default-country" {...register('defaultCountry')} />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="size-4 rounded border-input accent-primary" {...register('dryRun')} />
        Dry run (preview only, nothing is saved)
      </label>

      <Button type="submit" className="w-fit" disabled={ingestRadius.isPending}>
        {ingestRadius.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
        Run ingest
      </Button>
    </form>
  )
}
