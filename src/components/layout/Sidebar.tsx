import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { NAV_GROUPS } from '@/components/layout/navConfig'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useUnreadCount'
import { useModerationCounts } from '@/features/moderation/hooks/useModerationCounts'

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

function SidebarContents({ collapsed }: { collapsed: boolean }) {
  const role = useAuthStore((s) => s.user?.role)
  const user = useAuthStore((s) => s.user)
  const { data: unreadNotifs } = useUnreadNotificationCount()
  const { data: modCounts } = useModerationCounts()

  const getItemBadgeCount = (to: string): number => {
    if (to === '/notifications') return unreadNotifs?.unreadCount ?? 0
    if (to === '/moderator/submissions') return modCounts?.pendingSubmissions ?? 0
    if (to === '/moderator/claims') return modCounts?.pendingClaims ?? 0
    if (to === '/moderator/flags') return modCounts?.pendingFlags ?? 0
    return 0
  }

  const visibleGroups = NAV_GROUPS.filter((group) => !group.roles || (role && group.roles.includes(role)))

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className={cn('flex h-16 shrink-0 items-center border-b border-border px-4', collapsed && 'justify-center px-2')}>
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            OM
          </span>
          {!collapsed ? <span className="text-lg">OpenMosque</span> : null}
        </span>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2 py-3">
        <nav className="flex flex-col gap-4" aria-label="Main navigation">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              {!collapsed ? (
                <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h3>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const badgeCount = getItemBadgeCount(item.to)
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
                            collapsed && 'justify-center px-0',
                          )
                        }
                        title={collapsed ? (badgeCount > 0 ? `${item.label} (${badgeCount})` : item.label) : undefined}
                      >
                        <div className="relative flex items-center justify-center">
                          <item.icon className="size-4.5 shrink-0" aria-hidden="true" />
                          {collapsed && badgeCount > 0 ? (
                            <span className="absolute -top-1 -right-1 flex size-2 rounded-full bg-primary" />
                          ) : null}
                        </div>
                        {!collapsed ? (
                          <>
                            <span className="truncate">{item.label}</span>
                            {badgeCount > 0 ? (
                              <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className={cn('flex shrink-0 items-center gap-3 border-t border-border p-3', collapsed && 'justify-center')}>
        <Avatar>
          <AvatarImage src={user?.photoUrl ?? undefined} alt="" />
          <AvatarFallback>{initialsFromName(user?.displayName, user?.email)}</AvatarFallback>
        </Avatar>
        {!collapsed ? (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.displayName || user?.email || 'Guest'}
            </span>
            {user?.role ? (
              <Badge variant="secondary" className="mt-0.5 w-fit text-[10px]">
                {user.role.replace('_', ' ')}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Desktop sidebar (collapsible, animated width) + mobile slide-over drawer.
 * Both are rendered from the same `SidebarContents` so nav state never
 * drifts between the two breakpoints. */
export function Sidebar() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 264 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative hidden shrink-0 border-r border-border bg-card md:block h-full max-h-screen z-50"
      >
        <SidebarContents collapsed={sidebarCollapsed} />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-16 z-50 size-7 rounded-full border border-border bg-card hover:bg-accent text-foreground shadow-md flex items-center justify-center transition-transform hover:scale-110"
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-2 top-3"
              >
                <X className="size-5" />
              </Button>
              <SidebarContents collapsed={false} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
