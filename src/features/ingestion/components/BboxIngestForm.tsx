import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIngestBbox } from '@/features/ingestion/hooks/useIngestBbox'
import { bboxIngestFormSchema } from '@/features/ingestion/schemas'
import type { BboxIngestFormValues } from '@/features/ingestion/schemas'
import type { IngestionSummaryDto } from '@/features/ingestion/types'

interface BboxIngestFormProps {
  onResult: (summary: IngestionSummaryDto) => void
}

/** `POST /api/v1/admin/ingest/osm/bbox` — a raw south/west/north/east
 * bounding box, for a moderator who already has exact map coordinates
 * (e.g. drawn on an external map tool) rather than a named place. */
export function BboxIngestForm({ onResult }: BboxIngestFormProps) {
  const ingestBbox = useIngestBbox()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BboxIngestFormValues>({
    resolver: zodResolver(bboxIngestFormSchema),
    defaultValues: { south: '', west: '', north: '', east: '', defaultCity: '', defaultCountry: '', dryRun: true },
  })

  function onSubmit(values: BboxIngestFormValues) {
    ingestBbox.mutate(
      {
        south: Number(values.south),
        west: Number(values.west),
        north: Number(values.north),
        east: Number(values.east),
        defaultCity: values.defaultCity?.trim() || undefined,
        defaultCountry: values.defaultCountry?.trim() || undefined,
        dryRun: values.dryRun,
      },
      { onSuccess: onResult },
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-north">North</Label>
          <Input id="ingest-north" inputMode="decimal" aria-invalid={!!errors.north} {...register('north')} />
          {errors.north && <p role="alert" className="text-sm text-destructive">{errors.north.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-south">South</Label>
          <Input id="ingest-south" inputMode="decimal" aria-invalid={!!errors.south} {...register('south')} />
          {errors.south && <p role="alert" className="text-sm text-destructive">{errors.south.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-east">East</Label>
          <Input id="ingest-east" inputMode="decimal" aria-invalid={!!errors.east} {...register('east')} />
          {errors.east && <p role="alert" className="text-sm text-destructive">{errors.east.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-west">West</Label>
          <Input id="ingest-west" inputMode="decimal" aria-invalid={!!errors.west} {...register('west')} />
          {errors.west && <p role="alert" className="text-sm text-destructive">{errors.west.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-bbox-default-city">Default city (optional)</Label>
          <Input id="ingest-bbox-default-city" placeholder="Used for results missing an address" {...register('defaultCity')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ingest-bbox-default-country">Default country (optional)</Label>
          <Input id="ingest-bbox-default-country" {...register('defaultCountry')} />
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" className="size-4 rounded border-input accent-primary" {...register('dryRun')} />
        Dry run (preview only, nothing is saved)
      </label>

      <Button type="submit" className="w-fit" disabled={ingestBbox.isPending}>
        {ingestBbox.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
        Run ingest
      </Button>
    </form>
  )
}
