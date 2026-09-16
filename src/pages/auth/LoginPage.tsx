import { Link, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Clock, Compass, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()

  if (!isLoading && isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from
    return <Navigate to={from?.pathname ?? '/'} replace />
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background decoration */}
      <div className="islamic-pattern absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Top back-to-home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-border/80 bg-card/95 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <CardHeader className="text-center pt-8 pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md shadow-primary/20"
            >
              OM
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Sign in to your OpenMosque account to access prayer times, favorites, and community updates.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 px-6 sm:px-8 pb-8">
            <LoginForm />

            {/* Quick feature highlights */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <Clock className="size-4 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">Live Iqamah</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <Compass className="size-4 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">Nearby Mosques</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/30">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">Verified Data</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-1">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline ml-0.5">
                Create one now
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
