import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '@/app/AuthProvider'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { exportToCsv } from '@/hooks/useExportCsv'
import { api } from '@/lib/api'
import { formatChannel, formatDateTime, formatNaira } from '@/lib/format'
import type { Transaction, TransactionStatus } from '@/types'

export function TransactionsPage() {
  const { user, activeRole } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  const customerId = activeRole === 'customer' ? user?.id : undefined

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', search, status, minAmount, maxAmount, customerId],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '100' })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)
      if (minAmount) params.set('minAmount', minAmount)
      if (maxAmount) params.set('maxAmount', maxAmount)
      if (customerId) params.set('customerId', customerId)
      return api.getTransactions(params)
    },
  })

  const columns: ColumnDef<Transaction, unknown>[] = useMemo(
    () => [
      { accessorKey: 'id', header: 'Transaction ID' },
      { accessorKey: 'sessionId', header: 'Session ID' },
      { accessorKey: 'customerName', header: 'Customer' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatNaira(row.original.amount),
      },
      { accessorKey: 'bank', header: 'Bank' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => formatDateTime(row.original.date),
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => formatChannel(row.original.channel),
      },
    ],
    [],
  )

  const handleExport = () => {
    if (!data?.data.length) return
    exportToCsv(data.data, `transactions-${Date.now()}.csv`, [
      { key: 'id', header: 'Transaction ID' },
      { key: 'sessionId', header: 'Session ID' },
      { key: 'customerName', header: 'Customer' },
      { key: 'amount', header: 'Amount' },
      { key: 'bank', header: 'Bank' },
      { key: 'status', header: 'Status' },
      { key: 'date', header: 'Date' },
      { key: 'channel', header: 'Channel' },
    ])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Monitoring"
        description="Search, filter, and export transaction records"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!data?.data.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search ID, customer, bank..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(['pending', 'success', 'failed', 'reversed'] as TransactionStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Min amount"
          type="number"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="w-32"
        />
        <Input
          placeholder="Max amount"
          type="number"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="w-32"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No transactions found" description="Try adjusting your filters." />
      ) : (
        <DataTable columns={columns} data={data.data} />
      )}
    </div>
  )
}
