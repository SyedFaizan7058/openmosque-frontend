import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface QrCodeDisplayProps {
  qrCodeUri: string
  manualEntryKey: string
  instructions?: string
}

export function QrCodeDisplay({ qrCodeUri, manualEntryKey, instructions }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current && qrCodeUri) {
      void QRCode.toCanvas(canvasRef.current, qrCodeUri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#007378', // Deep teal for QR modules
          light: '#ffffff',
        },
      })
    }
  }, [qrCodeUri])

  const copyManualKey = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey)
      setCopied(true)
      toast.success('Key copied to clipboard.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy key.')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-xl border border-border bg-white p-3 shadow-xs">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      {instructions ? (
        <p className="text-xs text-muted-foreground max-w-sm">{instructions}</p>
      ) : (
        <p className="text-xs text-muted-foreground max-w-sm">
          Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator.
        </p>
      )}

      <div className="w-full max-w-sm rounded-lg border border-border bg-muted/50 p-3 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Or enter key manually:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyManualKey}
            className="h-7 text-xs gap-1 px-2 text-primary hover:text-primary"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <code className="mt-1 block break-all font-mono text-xs font-semibold text-foreground tracking-wider select-all">
          {manualEntryKey}
        </code>
      </div>
    </div>
  )
}
