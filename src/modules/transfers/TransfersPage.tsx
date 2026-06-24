import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthProvider'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { canInitiateTransfer } from '@/lib/rbac'
import { formatDateTime, formatNaira } from '@/lib/format'
import type { Transfer, TransferType } from '@/types'

const NIGERIAN_BANKS = ['GTBank', 'Access Bank', 'UBA', 'Zenith', 'First Bank', 'Moniepoint', 'PalmPay', 'Opay']

const transferSchema = z.object({
  type: z.enum(['own_account', 'interbank', 'bulk']),
  fromAccount: z.string().min(10, 'Enter a valid NUBAN'),
  toAccount: z.string().min(1, 'Required'),
  toBank: z.string().optional(),
  amount: z.coerce.number().min(100, 'Minimum transfer is ₦100'),
  description: z.string().optional(),
})

type TransferForm = z.infer<typeof transferSchema>

export function TransfersPage() {
  const { user, activeRole } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TransferType>('own_account')

  const customerId = activeRole === 'customer' ? user?.id : undefined
  const canTransfer = activeRole ? canInitiateTransfer(activeRole) : false

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['transfers', customerId],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', pageSize: '50' })
      if (customerId) params.set('customerId', customerId)
      return api.getTransfers(params)
    },
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: { type: 'own_account', fromAccount: '', toAccount: '', amount: 0 },
  })

  const transferType = watch('type')

  const createMutation = useMutation({
    mutationFn: (form: TransferForm) =>
      api.createTransfer({
        customerId: user?.id ?? '',
        customerName: user?.name ?? '',
        type: form.type,
        fromAccount: form.fromAccount,
        toAccount: form.toAccount,
        toBank: form.toBank,
        amount: form.amount,
        description: form.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      toast.success('Transfer initiated successfully')
      reset({ type: activeTab, fromAccount: '', toAccount: '', amount: 0 })
    },
    onError: () => toast.error('Transfer failed'),
  })

  const columns: ColumnDef<Transfer, unknown>[] = [
    { accessorKey: 'id', header: 'Reference' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.type.replace('_', ' ')}</span>,
    },
    { accessorKey: 'fromAccount', header: 'From' },
    { accessorKey: 'toAccount', header: 'To' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatNaira(row.original.amount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ]

  const onTabChange = (tab: string) => {
    const type = tab as TransferType
    setActiveTab(type)
    setValue('type', type)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transfer Center" description="Own account, interbank, and bulk payment transfers" />

      {canTransfer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiate Transfer</CardTitle>
            <CardDescription>Select transfer type and enter details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList>
                <TabsTrigger value="own_account">Own Account</TabsTrigger>
                <TabsTrigger value="interbank">Interbank</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Payment</TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="mt-4 space-y-4">
                <input type="hidden" {...register('type')} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>From Account (NUBAN)</Label>
                    <Input placeholder="0123456789" {...register('fromAccount')} />
                    {errors.fromAccount && <p className="text-sm text-destructive">{errors.fromAccount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{transferType === 'bulk' ? 'Batch Name' : 'To Account (NUBAN)'}</Label>
                    <Input placeholder={transferType === 'bulk' ? 'Salary Processing' : '0987654321'} {...register('toAccount')} />
                    {errors.toAccount && <p className="text-sm text-destructive">{errors.toAccount.message}</p>}
                  </div>
                  {transferType === 'interbank' && (
                    <div className="space-y-2">
                      <Label>Destination Bank</Label>
                      <Select onValueChange={(v) => setValue('toBank', v)}>
                        <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input type="number" {...register('amount')} />
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                  </div>
                  {transferType === 'bulk' && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Input placeholder="e.g. Salary Processing — 45 recipients" {...register('description')} />
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Processing...' : 'Initiate Transfer'}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Transfers</h2>
        {isLoading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !data?.data.length ? (
          <EmptyState title="No transfers yet" />
        ) : (
          <DataTable columns={columns} data={data.data} />
        )}
      </div>
    </div>
  )
}
