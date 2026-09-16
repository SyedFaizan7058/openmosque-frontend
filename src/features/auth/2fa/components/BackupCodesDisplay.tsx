import { useState } from 'react'
import { AlertTriangle, Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BackupCodesDisplayProps {
  codes: string[]
}

export function BackupCodesDisplay({ codes }: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = async () => {
    try {
      const text = codes.join('\n')
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Backup codes copied to clipboard.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy backup codes.')
    }
  }

  const handleDownload = () => {
    try {
      const content = [
        'OpenMosque Two-Factor Authentication Backup Codes',
        '------------------------------------------------',
        'Each code can only be used once if you lose access to your authenticator app.',
        '',
        ...codes,
        '',
        `Generated: ${new Date().toISOString()}`,
      ].join('\n')

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'openmosque-backup-codes.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Backup codes downloaded.')
    } catch {
      toast.error('Failed to download backup codes.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3.5 text-xs text-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
        <div>
          <p className="font-semibold text-accent-foreground">Save your backup recovery codes</p>
          <p className="mt-0.5 text-muted-foreground">
            These one-time codes are shown <strong>only once</strong>. If you lose access to your authenticator
            device, each code can be used to log into your account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm tracking-wider font-semibold text-center">
        {codes.map((code, idx) => (
          <div
            key={idx}
            className="rounded border border-border/70 bg-card py-2 px-3 text-foreground select-all"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className="gap-1.5 text-xs"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied to clipboard' : 'Copy all codes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-1.5 text-xs"
        >
          <Download className="size-3.5" />
          Download as .txt
        </Button>
      </div>
    </div>
  )
}
