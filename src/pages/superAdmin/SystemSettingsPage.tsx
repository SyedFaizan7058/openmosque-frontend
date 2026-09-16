import { ExternalLink, Info, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/constants'

/** There is no `/api/v1/admin/settings`-style endpoint anywhere in the
 * backend contract — `UserAdminController` exposes only user listing and a
 * role patch, and nothing else under `/api/v1/admin/**` reads or writes
 * platform configuration. Building toggles here that don't actually
 * persist anywhere would be worse than no page at all (the same call the
 * Platform Statistics page's doc comment already makes about not
 * manufacturing charts the backend can't support), so this stays a
 * read-only "what's true about this deployment" reference instead of a
 * settings form with nowhere to save to. */
export default function SystemSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Settings className="size-6 text-primary" aria-hidden="true" />
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground">Deployment information for this environment.</p>
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-start gap-2.5 pt-6 text-sm text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <p>
            The backend doesn't expose a platform-settings resource yet — there's nothing here to change server-side
            configuration. This page shows what's currently true about the deployment instead.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Read-only, sourced from this build's configuration.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border text-sm">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Frontend build mode</span>
            <span className="font-medium text-foreground">{import.meta.env.MODE}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">API base URL</span>
            <span className="max-w-[60%] truncate font-medium text-foreground" title={API_BASE_URL}>
              {API_BASE_URL}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Rate limiting</span>
            <span className="font-medium text-foreground">Token bucket, per-account/IP</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API reference</CardTitle>
          <CardDescription>The backend's own interactive documentation.</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={`${API_BASE_URL}/swagger-ui.html`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Open Swagger UI
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
