import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
} from 'firebase/auth'
import { toast } from 'sonner'
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth as firebaseAuth, isFirebaseConfigured } from '@/features/auth/firebase/firebaseConfig'
import { registerSchema } from '@/features/auth/schemas'
import type { RegisterFormValues } from '@/features/auth/schemas'
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
 * Renders the account-creation form with modern UI/UX: authentic Google SSO,
 * show/hide password toggles, and refined inputs.
 */
export function RegisterForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    if (!firebaseAuth) return
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password)
      await updateProfile(credential.user, { displayName: values.displayName })
    } catch (err) {
      console.error('[OpenMosque] Registration failed:', err)
      toast.error('Could not create your account. The email may already be in use.')
    }
  }

  const handleGoogleSignUp = async () => {
    if (!firebaseAuth) return
    setIsGoogleLoading(true)
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
    } catch (err) {
      console.error('[OpenMosque] Google sign-up failed:', err)
      toast.error('Google sign-up failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <p>
          Registration isn&apos;t available yet — this environment doesn&apos;t have a Firebase project
          configured. Add your Firebase Web SDK keys to <code className="font-mono">.env.local</code> to
          enable sign-up.
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
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        Sign up with Google
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border/70" />
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground/80">
          or sign up with email
        </span>
        <span className="h-px flex-1 bg-border/70" />
      </div>

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name" className="text-xs font-semibold text-foreground/90">
            Full name
          </Label>
          <Input
            id="register-name"
            type="text"
            placeholder="Brother / Sister Name"
            autoComplete="name"
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? 'register-name-error' : undefined}
            className="h-10 bg-background/80"
            {...register('displayName')}
          />
          {errors.displayName ? (
            <p id="register-name-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.displayName.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email" className="text-xs font-semibold text-foreground/90">
            Email address
          </Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className="h-10 bg-background/80"
            {...register('email')}
          />
          {errors.email ? (
            <p id="register-email-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password" className="text-xs font-semibold text-foreground/90">
            Password
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              className="h-10 bg-background/80 pr-10"
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
            <p id="register-password-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-confirm-password" className="text-xs font-semibold text-foreground/90">
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
              className="h-10 bg-background/80 pr-10"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p id="register-confirm-password-error" role="alert" className="text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full h-11 mt-2 font-semibold shadow-sm transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" /> : null}
          Create account
        </Button>
      </form>
    </div>
  )
}
