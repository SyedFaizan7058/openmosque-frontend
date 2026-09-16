import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { toast } from 'sonner'
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth as firebaseAuth, isFirebaseConfigured } from '@/features/auth/firebase/firebaseConfig'
import { loginSchema } from '@/features/auth/schemas'
import type { LoginFormValues } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

/**
 * Renders the sign-in form with modern UI/UX: authentic Google SSO,
 * show/hide password toggle, and clear feedback.
 */
export function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    if (!firebaseAuth) return
    try {
      await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
    } catch (err) {
      console.error('[OpenMosque] Email/password sign-in failed:', err)
      toast.error('Invalid email or password.')
    }
  }

  const handleGoogleSignIn = async () => {
    if (!firebaseAuth) return
    setIsGoogleLoading(true)
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
    } catch (err) {
      console.error('[OpenMosque] Google sign-in failed:', err)
      toast.error('Google sign-in failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <p>
          Sign-in isn&apos;t available yet — this environment doesn&apos;t have a Firebase project
          configured. Add your Firebase Web SDK keys to <code className="font-mono">.env.local</code> to
          enable Google and email/password sign-in.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 border-border/80 bg-background/60 hover:bg-muted/80 gap-2.5 font-medium transition-all shadow-xs"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border/70" />
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground/80">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-border/70" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" className="text-xs font-semibold text-foreground/90">
            Email address
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className="h-11 bg-background/80"
            {...register('email')}
          />
          {errors.email ? (
            <p id="login-email-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-semibold text-foreground/90">
              Password
            </Label>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className="h-11 bg-background/80 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password ? (
            <p id="login-password-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full h-11 mt-1 font-semibold shadow-sm transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" /> : null}
          Sign in
        </Button>
      </form>
    </div>
  )
}
