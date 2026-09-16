import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Search, ShieldAlert, Users, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { RoleChangeDialog } from '@/features/admin/components/RoleChangeDialog'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'
import { useUpdateUserRole } from '@/features/admin/hooks/useUpdateUserRole'
import { useAuthStore, selectUser } from '@/features/auth/store/useAuthStore'
import type { UserResponseDto } from '@/features/auth/types'
import { StatusFilterTabs } from '@/features/moderation/components/StatusFilterTabs'
import { ALL_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/constants'

const ROLE_BADGE_VARIANT: Record<UserRole, 'secondary' | 'default' | 'accent' | 'destructive'> = {
  USER: 'secondary',
  MOSQUE_ADMIN: 'default',
  MODERATOR: 'accent',
  SUPER_ADMIN: 'destructive',
}

interface PendingChange {
  userId: string
  userLabel: string
  fromRole: UserRole
  toRole: UserRole
}

/** Super-admin user directory: paginated, filterable by role, with an
 * inline role-change control per row. There's no suspend/deactivate or
 * delete endpoint in the backend contract (`UserAdminController` exposes
 * only listing + a role patch) — so those actions aren't fabricated here;
 * this page does exactly what the API supports. */
export default function UserManagementPage() {
  const [role, setRole] = useState<UserRole | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pending, setPending] = useState<PendingChange | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isError } = useAdminUsers(role, debouncedSearch, page)
  const updateRole = useUpdateUserRole()
  const currentUser = useAuthStore(selectUser)

  const users = data?.content ?? []

  function requestRoleChange(user: UserResponseDto, toRole: UserRole) {
    if (toRole === user.role) return
    setPending({ userId: user.id, userLabel: user.displayName ?? user.email, fromRole: user.role, toRole })
  }

  function confirmRoleChange() {
    if (!pending) return
    updateRole.mutate(
      { userId: pending.userId, role: pending.toRole },
      { onSuccess: () => setPending(null) },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Users className="size-6 text-primary" aria-hidden="true" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">Every registered user, with the ability to change their role.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusFilterTabs
          value={role}
          onChange={(v) => {
            setRole(v)
            setPage(0)
          }}
          options={[
            { value: undefined, label: 'All roles' },
            ...ALL_ROLES.map((r) => ({ value: r, label: r })),
          ]}
        />
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-xl pl-9 pr-8 text-xs sm:text-sm bg-card"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load users" description="Something went wrong reaching the server." />
      ) : users.length === 0 ? (
        debouncedSearch ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={`No users matched "${debouncedSearch}". Try a different name or email.`}
            action={
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState icon={Users} title="Nothing here" description="No users match this filter." />
        )
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id
            return (
              <Card key={user.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar>
                      {user.photoUrl != null && <AvatarImage src={user.photoUrl} alt="" />}
                      <AvatarFallback>{(user.displayName ?? user.email).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">{user.displayName ?? 'Unnamed user'}</span>
                        <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{user.role}</Badge>
                        {!user.active && <Badge variant="destructive">Suspended</Badge>}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.points} pts · Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  {isSelf ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ShieldAlert className="size-3.5" aria-hidden="true" /> This is you
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>You can't change your own role from here.</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Select
                      aria-label={`Change role for ${user.email}`}
                      className="w-auto min-w-36"
                      value={user.role}
                      onChange={(e) => requestRoleChange(user, e.target.value as UserRole)}
                      disabled={updateRole.isPending}
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </Select>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}

      <RoleChangeDialog
        pending={pending}
        isPending={updateRole.isPending}
        onCancel={() => setPending(null)}
        onConfirm={confirmRoleChange}
      />
    </div>
  )
}
