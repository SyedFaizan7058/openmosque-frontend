import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Menu, Search, Settings, ShieldCheck, UserCircle } from 'lucide-react'
import { logoutUser } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

import { LocationChip } from '@/components/location/LocationChip'

function initialsFromName(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }
  return email ? email[0]!.toUpperCase() : '?'
}

/** App top bar: mobile menu toggle, search input, live notification bell,
 * and the account dropdown. */
export function TopBar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login', { replace: true })
    toast.success('Signed out.')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/90 backdrop-blur-md px-4 shadow-xs transition-colors">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        className="md:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <form onSubmit={handleSearchSubmit} className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search mosques by name or city…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search mosques"
          className="pl-9"
        />
      </form>

      <div className="flex flex-1 items-center justify-end gap-2.5">
        <LocationChip />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="gap-2 px-2" aria-label="Account menu">
              <Avatar className="size-8">
                <AvatarImage src={user?.photoUrl ?? undefined} alt="" />
                <AvatarFallback>{initialsFromName(user?.displayName, user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="truncate">
              {user?.displayName || user?.email || 'Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserCircle /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/security-settings')}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/2fa')}>
              <ShieldCheck /> 2FA
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
