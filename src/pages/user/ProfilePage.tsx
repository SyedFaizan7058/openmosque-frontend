import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Compass, Loader2, MapPin, ShieldCheck, Star, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BadgeGrid } from '@/features/badges/components/BadgeGrid'
import { useAuthStore, selectUser } from '@/features/auth/store/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { useUpdateLocation } from '@/features/user/hooks/useUpdateLocation'
import { locationUpdateSchema } from '@/features/user/schemas'
import type { LocationUpdateFormValues } from '@/features/user/schemas'

const ROLE_LABELS: Record<string, string> = {
  USER: 'Member',
  MOSQUE_ADMIN: 'Mosque Admin',
  MODERATOR: 'Moderator',
  SUPER_ADMIN: 'Super Admin',
}

function initialsFor(displayName: string | null | undefined, email: string): string {
  const source = displayName?.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

/** The signed-in user's profile: identity summary, a location-edit form
 * (`PUT /users/me/location`), and their earned/locked badges. `UserResponseDto`
 * is already held in the auth store (populated by Phase 1's sync flow), so
 * this reads it straight from there rather than issuing a redundant
 * `GET /users/me`. */
export default function ProfilePage() {
  // `ProtectedRoute` guarantees a signed-in user reaches this page, so
  // `user` is non-null in practice — but the store's type still allows
  // `null` (e.g. a brief render before the guard redirects), so this bails
  // out defensively rather than asserting.
  const user = useAuthStore(selectUser)
  const updateLocation = useUpdateLocation()
  const [detecting, setDetecting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationUpdateFormValues>({
    resolver: zodResolver(locationUpdateSchema),
    defaultValues: {
      preferredCity: user?.preferredCity ?? '',
      preferredCountry: user?.preferredCountry ?? '',
      latitude: user?.latitude != null ? String(user.latitude) : '',
      longitude: user?.longitude != null ? String(user.longitude) : '',
    },
  })

  if (!user) return null

  const handleDetectLocation = async () => {
    setDetecting(true)
    const success = await useLocationStore.getState().detectGps()
    setDetecting(false)
    if (success) {
      const state = useLocationStore.getState()
      if (state.city && state.city !== 'My Location') setValue('preferredCity', state.city)
      if (state.country) setValue('preferredCountry', state.country)
      if (state.coords) {
        setValue('latitude', String(state.coords.lat))
        setValue('longitude', String(state.coords.lng))
      }
      toast.success('Current location detected! Click Save to apply.')
    } else {
      toast.error('Could not detect location. Please check browser permissions.')
    }
  }

  const onSubmit = (values: LocationUpdateFormValues) => {
    updateLocation.mutate({
      preferredCity: values.preferredCity.trim() || undefined,
      preferredCountry: values.preferredCountry.trim() || undefined,
      latitude: values.latitude.trim() !== '' ? Number(values.latitude) : undefined,
      longitude: values.longitude.trim() !== '' ? Number(values.longitude) : undefined,
    })
  }

  const locationLine = [user.preferredCity, user.preferredCountry].filter(Boolean).join(', ')

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
          <Avatar className="size-16">
            {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
            <AvatarFallback className="text-lg">{initialsFor(user.displayName, user.email)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{user.displayName || 'Mosque Contributor'}</h2>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 text-accent" aria-hidden="true" />
                {user.points} point{user.points === 1 ? '' : 's'}
              </span>
              <span>Member since {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
              {locationLine && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {locationLine}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Preferred Location</CardTitle>
            <CardDescription>
              Used to center discovery pages on your area. All fields are optional.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={detecting}
            onClick={handleDetectLocation}
            className="gap-2 rounded-xl text-xs font-semibold shrink-0"
          >
            {detecting ? <Loader2 className="size-3.5 animate-spin" /> : <Compass className="size-3.5 text-primary" />}
            <span>Detect Current Location</span>
          </Button>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-city">City</Label>
              <Input
                id="profile-city"
                autoComplete="address-level2"
                aria-invalid={!!errors.preferredCity}
                aria-describedby={errors.preferredCity ? 'profile-city-error' : undefined}
                {...register('preferredCity')}
              />
              {errors.preferredCity ? (
                <p id="profile-city-error" role="alert" className="text-sm text-destructive">
                  {errors.preferredCity.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-country">Country</Label>
              <Input
                id="profile-country"
                autoComplete="country-name"
                aria-invalid={!!errors.preferredCountry}
                aria-describedby={errors.preferredCountry ? 'profile-country-error' : undefined}
                {...register('preferredCountry')}
              />
              {errors.preferredCountry ? (
                <p id="profile-country-error" role="alert" className="text-sm text-destructive">
                  {errors.preferredCountry.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-latitude">Latitude</Label>
              <Input
                id="profile-latitude"
                type="text"
                inputMode="decimal"
                placeholder="-90 to 90"
                aria-invalid={!!errors.latitude}
                aria-describedby={errors.latitude ? 'profile-latitude-error' : undefined}
                {...register('latitude')}
              />
              {errors.latitude ? (
                <p id="profile-latitude-error" role="alert" className="text-sm text-destructive">
                  {errors.latitude.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-longitude">Longitude</Label>
              <Input
                id="profile-longitude"
                type="text"
                inputMode="decimal"
                placeholder="-180 to 180"
                aria-invalid={!!errors.longitude}
                aria-describedby={errors.longitude ? 'profile-longitude-error' : undefined}
                {...register('longitude')}
              />
              {errors.longitude ? (
                <p id="profile-longitude-error" role="alert" className="text-sm text-destructive">
                  {errors.longitude.message}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={isSubmitting || updateLocation.isPending}>
                {isSubmitting || updateLocation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                Save location
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="size-5 text-primary" aria-hidden="true" />
            Badges
          </CardTitle>
          <CardDescription>Earn badges by contributing mosques, leaving reviews, and more.</CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeGrid />
        </CardContent>
      </Card>
    </div>
  )
}
