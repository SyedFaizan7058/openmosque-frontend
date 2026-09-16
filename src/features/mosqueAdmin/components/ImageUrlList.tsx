import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FileUploadField } from '@/components/shared/FileUploadField'

interface ImageUrlListProps {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

/** A mosque's photo list, editable as a flat array of public URLs — what
 * `MosqueUpdateRequestDto.imageUrls` actually accepts. This is a real
 * simplification versus the richer `MosqueImageDto` shape the detail page
 * reads (`caption`/`cover`/`displayOrder` per image): saving from here
 * replaces the whole list with plain URLs, so any existing captions or a
 * chosen cover photo are not preserved. Per-image metadata editing would
 * need its own dedicated endpoint/UI and is left for a later phase. */
export function ImageUrlList({ value, onChange, disabled }: ImageUrlListProps) {
  function remove(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  function add(url: string) {
    onChange([...value, url])
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url) => (
            <li key={url} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 size-7"
                onClick={() => remove(url)}
                disabled={disabled}
              >
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <FileUploadField
        id="mosque-image-upload"
        category="MOSQUE_IMAGE"
        label="Add photo"
        disabled={disabled}
        onUploaded={add}
      />
    </div>
  )
}
