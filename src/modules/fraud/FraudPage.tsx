import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthProvider'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { canInvestigateFraud } from '@/lib/rbac'
import { formatDateTime, formatNaira } from '@/lib/format'
import type { FraudAlert, FraudAlertStatus, FraudRiskLevel } from '@/types'

export function FraudPage() {
  const { activeRole } = useAuth()
  const queryClient = useQueryClient()
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<FraudAlert | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['fraud-alerts', riskFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '50' })
      if (riskFilter !== 'all') params.set('riskLevel', riskFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      return api.getFraudAlerts(params)
    },
    refetchInterval: 15_000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FraudAlertStatus }) =>
      api.updateFraudAlert(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] })
      toast.success(status === 'approved' ? 'Alert approved and cleared' : 'Alert flagged for escalation')
      setSelected(null)
    },
    onError: () => toast.error('Failed to update alert'),
  })

  const canInvestigate = activeRole ? canInvestigateFraud(activeRole) : false

  const columns: ColumnDef<FraudAlert, unknown>[] = [
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <Link to={`/customers/${row.original.customerId}`} className="text-primary hover:underline font-medium">
          {row.original.customerName}
        </Link>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatNaira(row.original.amount),
    },
    {
      accessorKey: 'riskLevel',
      header: 'Risk',
      cell: ({ row }) => <StatusBadge status={row.original.riskLevel} />,
    },
    {
      accessorKey: 'riskScore',
      header: 'Score',
      cell: ({ row }) => <span className="font-mono">{row.original.riskScore}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Detected',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setSelected(row.original)}>
          Investigate
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Center"
        description="Monitor high-risk transactions and investigate suspicious activity"
      />

      <div className="flex flex-wrap gap-3">
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            {(['high', 'medium', 'low'] as FraudRiskLevel[]).map((r) => (
              <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(['open', 'investigating', 'approved', 'flagged'] as FraudAlertStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No fraud alerts" description="All transactions are within normal parameters." />
      ) : (
        <DataTable columns={columns} data={data.data} />
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investigation — {selected?.customerName}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Transaction</p><p className="font-medium">{selected.transactionId}</p></div>
                <div><p className="text-muted-foreground">Amount</p><p className="font-medium">{formatNaira(selected.amount)}</p></div>
                <div><p className="text-muted-foreground">Risk Score</p><p className="font-mono font-bold">{selected.riskScore}/100</p></div>
                <div><p className="text-muted-foreground">Status</p><StatusBadge status={selected.status} /></div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Reason</p>
                <p>{selected.reason}</p>
              </div>
              <Separator />
              <Card>
                <CardHeader className="py-3"><CardTitle className="text-sm">Transaction Timeline</CardTitle></CardHeader>
                <CardContent className="py-0 pb-3 text-muted-foreground">
                  Alert detected {formatDateTime(selected.createdAt)}
                </CardContent>
              </Card>
              <div>
                <p className="text-muted-foreground mb-1">Customer Devices</p>
                <ul className="list-disc pl-4">{selected.devices.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">IP History</p>
                <ul className="list-disc pl-4 font-mono text-xs">{selected.ipHistory.map((ip) => <li key={ip}>{ip}</li>)}</ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Previous Flags</p><p className="font-medium">{selected.previousFlags}</p></div>
                <div><p className="text-muted-foreground">Velocity (10 min)</p><p className="font-medium">{selected.velocityCount} txns</p></div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Geo-location Check</p>
                <p>{selected.geoLocation}</p>
              </div>
            </div>
          )}
          {canInvestigate && selected && (selected.status === 'open' || selected.status === 'investigating') && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => updateMutation.mutate({ id: selected.id, status: 'approved' })}
                disabled={updateMutation.isPending}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => updateMutation.mutate({ id: selected.id, status: 'flagged' })}
                disabled={updateMutation.isPending}
              >
                Flag
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
