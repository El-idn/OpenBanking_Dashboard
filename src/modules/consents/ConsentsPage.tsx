import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthProvider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { canRevokeConsent } from '@/lib/rbac'
import { formatDate } from '@/lib/format'
import type { Consent } from '@/types'

export function ConsentsPage() {
  const { user, activeRole } = useAuth()
  const queryClient = useQueryClient()
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<Consent | null>(null)

  const customerId = activeRole === 'customer' ? user?.id : undefined

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['consents', customerId],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '50' })
      if (customerId) params.set('customerId', customerId)
      return api.getConsents(params)
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokeConsent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] })
      toast.success('Consent revoked successfully')
      setRevokeTarget(null)
    },
    onError: () => toast.error('Failed to revoke consent'),
  })

  const canRevoke = activeRole ? canRevokeConsent(activeRole) : false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent Management"
        description="Manage third-party Open Banking access permissions"
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No consents found" description="No third-party access grants on record." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((consent) => (
            <Card key={consent.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{consent.provider}</CardTitle>
                  <StatusBadge status={consent.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Access</p>
                  <p>{consent.scopes.join(', ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Granted</p>
                    <p>{formatDate(consent.grantedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p>{formatDate(consent.expiresAt)}</p>
                  </div>
                </div>
                {activeRole !== 'customer' && (
                  <p className="text-muted-foreground text-xs">Customer: {consent.customerName}</p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedConsent(consent)}>
                  View Details
                </Button>
                {canRevoke && consent.status === 'active' && (
                  <Button variant="destructive" size="sm" onClick={() => setRevokeTarget(consent)}>
                    Revoke Consent
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedConsent} onOpenChange={() => setSelectedConsent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consent Details — {selectedConsent?.provider}</DialogTitle>
          </DialogHeader>
          {selectedConsent && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selectedConsent.customerName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={selectedConsent.status} /></div>
              <div><p className="text-muted-foreground mb-1">Scopes</p><ul className="list-disc pl-4">{selectedConsent.scopes.map((s) => <li key={s}>{s}</li>)}</ul></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Granted</span><span>{formatDate(selectedConsent.grantedAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expires</span><span>{formatDate(selectedConsent.expiresAt)}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Consent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke {revokeTarget?.provider}&apos;s access? This action is immediate and will be recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => revokeTarget && revokeMutation.mutate(revokeTarget.id)}
            >
              Revoke Consent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
