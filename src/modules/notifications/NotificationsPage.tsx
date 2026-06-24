import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthProvider'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { NotificationType } from '@/types'

const typeColors: Record<NotificationType, string> = {
  fraud: 'border-l-destructive',
  payment: 'border-l-warning',
  security: 'border-l-primary',
  system: 'border-l-muted-foreground',
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { activeRole } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = data?.filter((n) => !n.read).length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`Alerts for ${activeRole} — failed payments, security, fraud, and system events`}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={() => markAllMutation.mutate()}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} cols={1} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No notifications" />
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <Card
              key={n.id}
              className={cn('border-l-4 cursor-pointer transition-colors', typeColors[n.type], !n.read && 'bg-accent/30')}
              onClick={() => !n.read && markReadMutation.mutate(n.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize mb-1">{n.type}</p>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                    {!n.read && <span className="inline-block mt-1 h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
