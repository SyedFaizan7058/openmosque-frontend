import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Loader2, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUploadMedia } from '@/features/media/hooks/useUploadMedia'
import { ALLOWED_UPLOAD_ACCEPT, hasAllowedExtension } from '@/features/media/types'
import type { MediaFolderCategory } from '@/features/media/types'
import { cn } from '@/lib/utils'

interface FileUploadFieldProps {
  id: string
  category: MediaFolderCategory
  /** Called with the resulting public URL once the upload succeeds. This
   * component never holds the URL as its own state — the parent form
   * field is the single source of truth, so all this does is report the
   * outcome upward (typically into a `setValue(...)` call). */
  onUploaded: (publicUrl: string) => void
  disabled?: boolean
  className?: string
  /** Button label — defaults to "Choose file". */
  label?: string
  /** Max allowed file size in bytes — defaults to 5 MB. */
  maxBytes?: number
  /** Label for max size error message — defaults to "5 MB". */
  maxSizeLabel?: string
  /** Whether to render the uploaded filename next to the button — defaults to false. */
  showFileName?: boolean
}

/** A small "pick a file, upload it, hand back the public URL" control.
 * Native file inputs can't be restyled directly, so this wraps a visually
 * hidden one behind a normal `Button` and owns the actual upload request
 * itself via `useUploadMedia` — a form using this just needs an
 * `onUploaded` callback, not its own upload plumbing. Meant for a single
 * file per instance (a claim's proof document, a cover photo); a
 * multi-file uploader would need its own component. */
export function FileUploadField({
  id,
  category,
  onUploaded,
  disabled,
  className,
  label = 'Choose file',
  maxBytes = 5 * 1024 * 1024,
  maxSizeLabel = '5 MB',
  showFileName = false,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const uploadMedia = useUploadMedia()

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset the input's own value so choosing the *same* file again after
    // a failed upload still fires a change event.
    e.target.value = ''
    if (!file) return

    if (!hasAllowedExtension(file.name)) {
      toast.error('Unsupported file type. Use JPG, PNG, WEBP, or PDF.')
      return
    }
    if (file.size > maxBytes) {
      toast.error(`File is too large (max ${maxSizeLabel}).`)
      return
    }

    setFileName(file.name)
    uploadMedia.mutate(
      { file, category },
      {
        onSuccess: (publicUrl) => onUploaded(publicUrl),
        onError: () => setFileName(null),
      },
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ALLOWED_UPLOAD_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled || uploadMedia.isPending}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploadMedia.isPending}
      >
        {uploadMedia.isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Paperclip aria-hidden="true" />
        )}
        {uploadMedia.isPending ? 'Uploading…' : label}
      </Button>
      {showFileName && fileName && (
        <span className="truncate text-xs text-muted-foreground">
          {uploadMedia.isSuccess ? `Uploaded: ${fileName}` : fileName}
        </span>
      )}
    </div>
  )
}
