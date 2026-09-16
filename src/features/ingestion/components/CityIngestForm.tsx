import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIngestCity } from '@/features/ingestion/hooks/useIngestCity'
import { cityIngestFormSchema } from '@/features/ingestion/schemas'
import type { CityIngestFormValues } from '@/features/ingestion/schemas'
import type { IngestionSummaryDto } from '@/features/ingestion/types'

interface CityIngestFormProps {
  onResult: (summary: IngestionSummaryDto) => void
}

/** `POST /api/v1/admin/ingest/osm/city` — the simplest of the three ingest
 * modes, just a city (and optional country) name resolved by Overpass. */
export function CityIngestForm({ onResult }: CityIngestFormProps) {
  const ingestCity = useIngestCity()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CityIngestFormValues>({
    resolver: zodResolver(cityIngestFormSchema),
    // Defaults to a dry run so the first submission is always a safe
    // preview — the moderator reviews the summary, then unchecks "Dry run"
    // and submits again to actually write to the database.
    defaultValues: { city: '', country: '', dryRun: true },
  })

  function onSubmit(values: CityIngestFormValues) {
    ingestCity.mutate(
      { city: values.city.trim(), country: values.country?.trim() || undefined, dryRun: values.dryRun },
      { onSuccess: onResult },
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-city">City</Label>
          <Input id="ingest-city" placeholder="e.g. Toronto" aria-invalid={!!errors.city} {...register('city')} />
          {errors.city && <p role="alert" className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-country">Country (optional)</Label>
          <Input id="ingest-country" placeholder="e.g. Canada" {...register('country')} />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="size-4 rounded border-input accent-primary" {...register('dryRun')} />
        Dry run (preview only, nothing is saved)
      </label>

      <Button type="submit" className="w-fit" disabled={ingestCity.isPending}>
        {ingestCity.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
        Run ingest
      </Button>
    </form>
  )
}
