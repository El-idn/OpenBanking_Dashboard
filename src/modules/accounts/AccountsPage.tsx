import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
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
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { canWriteAccounts } from '@/lib/rbac'
import { formatNaira } from '@/lib/format'
import type { Account } from '@/types'

export function AccountsPage() {
  const { user, activeRole } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [freezeTarget, setFreezeTarget] = useState<Account | null>(null)

  const customerId = activeRole === 'customer' ? user?.id : undefined

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['accounts', search, customerId],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '50' })
      if (search) params.set('search', search)
      if (customerId) params.set('customerId', customerId)
      return api.getAccounts(params)
    },
  })

  const freezeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'frozen' }) => api.updateAccount(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success(freezeTarget?.status === 'active' ? 'Account frozen' : 'Account unfrozen')
      setFreezeTarget(null)
    },
    onError: () => toast.error('Failed to update account'),
  })

  const canWrite = activeRole ? canWriteAccounts(activeRole) : false

  const columns: ColumnDef<Account, unknown>[] = [
    { accessorKey: 'nuban', header: 'Account Number' },
    { accessorKey: 'customerName', header: 'Customer' },
    { accessorKey: 'name', header: 'Account Name' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => formatNaira(row.original.balance),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    ...(canWrite
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: { original: Account } }) => (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setFreezeTarget(row.original)
                }}
              >
                {row.original.status === 'active' ? 'Freeze' : 'Unfreeze'}
              </Button>
            ),
          } as ColumnDef<Account, unknown>,
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Customer accounts, balances, and status management" />
      <Input
        placeholder="Search by NUBAN, customer, or account name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No accounts found" />
      ) : (
        <DataTable columns={columns} data={data.data} onRowClick={setSelectedAccount} />
      )}

      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">NUBAN</span><span>{selectedAccount.nuban}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{selectedAccount.customerName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="capitalize">{selectedAccount.type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-semibold">{formatNaira(selectedAccount.balance)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={selectedAccount.status} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!freezeTarget} onOpenChange={() => setFreezeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {freezeTarget?.status === 'active' ? 'Freeze Account' : 'Unfreeze Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {freezeTarget?.status === 'active'
                ? `Are you sure you want to freeze account ${freezeTarget?.nuban}? The customer will not be able to transact.`
                : `Restore access to account ${freezeTarget?.nuban}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (freezeTarget) {
                  freezeMutation.mutate({
                    id: freezeTarget.id,
                    status: freezeTarget.status === 'active' ? 'frozen' : 'active',
                  })
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
