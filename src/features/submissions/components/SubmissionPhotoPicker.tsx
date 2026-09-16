import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, FileText, ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CameraCaptureModal } from '@/features/submissions/components/CameraCaptureModal'
import { useUploadMedia } from '@/features/media/hooks/useUploadMedia'
import { MAX_UPLOAD_BYTES, hasAllowedExtension } from '@/features/media/types'

interface SubmissionPhotoPickerProps {
  value?: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

function isPdf(url: string): boolean {
  const clean = url.split('?')[0]?.toLowerCase() ?? ''
  return clean.endsWith('.pdf')
}

export function SubmissionPhotoPicker({ value = [], onChange, disabled }: SubmissionPhotoPickerProps) {
  const chooseInputRef = useRef<HTMLInputElement>(null)
  const [cameraModalOpen, setCameraModalOpen] = useState(false)
  const [uploadingName, setUploadingName] = useState<string | null>(null)
  const uploadMedia = useUploadMedia()

  function uploadFile(file: File) {
    if (!hasAllowedExtension(file.name)) {
      toast.error('Unsupported file type. Please use an image (JPG, PNG, WEBP) or PDF.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('File is too large (maximum 10 MB).')
      return
    }

    setUploadingName(file.name)
    uploadMedia.mutate(
      { file, category: 'MOSQUE_IMAGE' },
      {
        onSuccess: (publicUrl) => {
          onChange([...value, publicUrl])
          setUploadingName(null)
          toast.success('Uploaded successfully.')
        },
        onError: () => {
          setUploadingName(null)
        },
      },
    )
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadFile(file)
  }

  function removePhoto(urlToRemove: string) {
    onChange(value.filter((url) => url !== urlToRemove))
  }

  const isUploading = uploadMedia.isPending

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden input for Choose Picture / PDF */}
      <input
        ref={chooseInputRef}
        id="sub-choose-picture"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*,application/pdf,.pdf"
        className="sr-only"
        onChange={handleFileSelected}
        disabled={disabled || isUploading}
      />

      {/* Action Buttons: Choose Picture (Image or PDF) & Take Photo (Live Camera) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => chooseInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-4 text-primary" aria-hidden="true" />
          )}
          <span>Choose picture</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCameraModalOpen(true)}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          <Camera className="size-4 text-primary" aria-hidden="true" />
          <span>Take photo</span>
        </Button>

        {uploadingName && isUploading && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="size-3 animate-spin" /> Uploading {uploadingName}…
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Upload photos or PDF documentation, or take a picture using your device camera (JPG, PNG, WEBP, PDF, max 10MB).
      </p>

      {/* Live Device Camera Modal */}
      <CameraCaptureModal
        open={cameraModalOpen}
        onOpenChange={setCameraModalOpen}
        onCapture={uploadFile}
        onFallbackToChooser={() => chooseInputRef.current?.click()}
      />

      {/* Uploaded Photos and Documents Grid */}
      {value.length > 0 && (
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 pt-1">
          {value.map((url, idx) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center"
            >
              {isPdf(url) ? (
                <div className="flex flex-col items-center justify-center p-3 text-center gap-1.5 size-full bg-card">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="size-6" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground truncate max-w-full px-1">
                    PDF Document
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    View file
                  </a>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Mosque upload preview ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Remove item"
                className="absolute right-1.5 top-1.5 size-6 rounded-full shadow-sm opacity-90 hover:opacity-100 z-10"
                onClick={() => removePhoto(url)}
                disabled={disabled || isUploading}
              >
                <X className="size-3" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
