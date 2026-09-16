import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Camera, Check, FlipHorizontal, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CameraCaptureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  onFallbackToChooser?: () => void
}

export function CameraCaptureModal({
  open,
  onOpenChange,
  onCapture,
  onFallbackToChooser,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLoadingCamera, setIsLoadingCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  async function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  async function startCamera(facing: 'environment' | 'user' = facingMode) {
    setIsLoadingCamera(true)
    setCameraError(null)
    setCapturedDataUrl(null)
    setCapturedBlob(null)
    await stopStream()

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported on this device/browser.')
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
      } catch {
        // Fallback if preferred facing mode is unavailable on desktop/webcam
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not access device camera. Please check permissions.'
      setCameraError(msg)
    } finally {
      setIsLoadingCamera(false)
    }
  }

  useEffect(() => {
    if (open) {
      void startCamera(facingMode)
    } else {
      void stopStream()
      setCapturedDataUrl(null)
      setCapturedBlob(null)
      setCameraError(null)
    }
    return () => {
      void stopStream()
    }
  }, [open])

  function handleSnap() {
    const video = videoRef.current
    if (!video || !streamRef.current) return

    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // If front camera, flip horizontally for mirror effect
    if (facingMode === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedDataUrl(dataUrl)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob)
          void stopStream()
        }
      },
      'image/jpeg',
      0.9,
    )
  }

  function handleRetake() {
    setCapturedBlob(null)
    setCapturedDataUrl(null)
    void startCamera(facingMode)
  }

  function handleSwitchFacing() {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextFacing)
    void startCamera(nextFacing)
  }

  function handleConfirm() {
    if (!capturedBlob) return
    const file = new File([capturedBlob], `mosque-photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })
    onCapture(file)
    onOpenChange(false)
  }

  function handleClose(next: boolean) {
    if (!next) {
      void stopStream()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5 text-primary" aria-hidden="true" />
            Take a Photo
          </DialogTitle>
          <DialogDescription>
            Use your device camera to take a photo of the mosque.
          </DialogDescription>
        </DialogHeader>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center border border-border">
          {isLoadingCamera && (
            <div className="flex flex-col items-center gap-2 text-white/80">
              <Loader2 className="size-8 animate-spin" />
              <span className="text-xs">Starting camera…</span>
            </div>
          )}

          {cameraError && !isLoadingCamera && (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-white/90">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm">{cameraError}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => void startCamera(facingMode)}>
                  <RefreshCw className="size-3.5 mr-1.5" /> Try again
                </Button>
                {onFallbackToChooser && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent text-white border-white/30 hover:bg-white/10"
                    onClick={() => {
                      onOpenChange(false)
                      onFallbackToChooser()
                    }}
                  >
                    Choose picture instead
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
              capturedDataUrl || cameraError || isLoadingCamera ? 'hidden' : 'block'
            }`}
          />

          {/* Captured Snapshot Preview */}
          {capturedDataUrl && (
            <img
              src={capturedDataUrl}
              alt="Captured mosque preview"
              className="h-full w-full object-cover"
            />
          )}

          {/* Flip camera button (if live stream active) */}
          {!capturedDataUrl && !cameraError && !isLoadingCamera && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 size-9 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-md backdrop-blur-xs"
              onClick={handleSwitchFacing}
              title="Switch camera"
            >
              <FlipHorizontal className="size-4" />
            </Button>
          )}
        </div>

        {/* Footer controls */}
        <DialogFooter className="flex-row justify-between sm:justify-between items-center gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>

          {capturedDataUrl ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleRetake} className="gap-1.5">
                <RefreshCw className="size-3.5" />
                <span>Retake</span>
              </Button>
              <Button type="button" onClick={handleConfirm} className="gap-1.5">
                <Check className="size-4" />
                <span>Use this photo</span>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleSnap}
              disabled={isLoadingCamera || !!cameraError}
              className="gap-2 px-5"
            >
              <Camera className="size-4" />
              <span>Capture photo</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
