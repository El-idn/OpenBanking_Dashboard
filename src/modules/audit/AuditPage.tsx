import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { exportToCsv } from '@/hooks/useExportCsv'
import { api } from '@/lib/api'
import { formatDateTime, formatRole } from '@/lib/format'
import type { AuditEvent, UserRole } from '@/types'

export function AuditPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>('all')
  const [action, setAction] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', search, role, action],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '100' })
      if (search) params.set('search', search)
      if (role !== 'all') params.set('role', role)
      if (action) params.set('action', action)
      return api.getAuditLogs(params)
    },
  })

  const columns: ColumnDef<AuditEvent, unknown>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => formatDateTime(row.original.timestamp),
    },
    { accessorKey: 'userName', header: 'User' },
    {
      accessorKey: 'userRole',
      header: 'Role',
      cell: ({ row }) => formatRole(row.original.userRole),
    },
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'entityType', header: 'Entity' },
    { accessorKey: 'entityId', header: 'Entity ID' },
    { accessorKey: 'details', header: 'Details' },
  ]

  const handleExport = () => {
    if (!data?.data.length) return
    exportToCsv(data.data, `audit-logs-${Date.now()}.csv`, [
      { key: 'timestamp', header: 'Timestamp' },
      { key: 'userName', header: 'User' },
      { key: 'userRole', header: 'Role' },
      { key: 'action', header: 'Action' },
      { key: 'entityType', header: 'Entity Type' },
      { key: 'entityId', header: 'Entity ID' },
      { key: 'details', header: 'Details' },
    ])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of all platform activities"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!data?.data.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search user, action, entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(['admin', 'compliance', 'auditor', 'customer'] as UserRole[]).map((r) => (
              <SelectItem key={r} value={r}>{formatRole(r)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by action..."
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No audit events found" />
      ) : (
        <DataTable columns={columns} data={data.data} />
      )}
    </div>
  )
}
