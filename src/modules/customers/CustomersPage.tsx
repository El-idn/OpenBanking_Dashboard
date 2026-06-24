import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { formatDate, formatDateTime, formatKycTier, formatNaira, maskBvn } from '@/lib/format'
import type { CustomerProfile, User } from '@/types'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (search) params.set('search', search)
      return api.getCustomers(params)
    },
  })

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link to={`/customers/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'id', header: 'Customer ID' },
    {
      accessorKey: 'kycTier',
      header: 'KYC Tier',
      cell: ({ row }) => formatKycTier(row.original.kycTier),
    },
    {
      accessorKey: 'bvn',
      header: 'BVN',
      cell: ({ row }) => maskBvn(row.original.bvn),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'dateJoined',
      header: 'Date Joined',
      cell: ({ row }) => formatDate(row.original.dateJoined),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage customer profiles and KYC status" />
      <Input
        placeholder="Search by name, email, or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No customers found" description="Try adjusting your search criteria." />
      ) : (
        <DataTable columns={columns} data={data.data} />
      )}
    </div>
  )
}

export function CustomerProfilePage() {
  const { id } = useParams()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomer(id!),
    enabled: !!id,
  })

  if (isLoading) return <TableSkeleton />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        description={`Customer ID: ${data.id}`}
        actions={<StatusBadge status={data.status} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CardSection title="Personal Details">
          <DetailRow label="Email" value={data.email} />
          <DetailRow label="Phone" value={data.phone} />
          <DetailRow label="BVN" value={maskBvn(data.bvn)} />
          <DetailRow label="NIN Status" value={<StatusBadge status={data.ninStatus} />} />
          <DetailRow label="KYC Level" value={formatKycTier(data.kycTier)} />
          <DetailRow label="Date Joined" value={formatDate(data.dateJoined)} />
        </CardSection>
      </div>

      <TabsSection data={data} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function TabsSection({ data }: { data: CustomerProfile }) {
  return (
    <Tabs defaultValue="accounts">
      <TabsList>
        <TabsTrigger value="accounts">Accounts ({data.accounts.length})</TabsTrigger>
        <TabsTrigger value="consents">Consents ({data.consents.length})</TabsTrigger>
        <TabsTrigger value="audit">Audit History</TabsTrigger>
      </TabsList>
      <TabsContent value="accounts">
        <Card>
          <CardContent className="pt-6">
            {data.accounts.length === 0 ? (
              <EmptyState title="No accounts" />
            ) : (
              <div className="space-y-2">
                {data.accounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center py-2 border-b text-sm">
                    <div>
                      <p className="font-medium">{acc.name} · {acc.nuban}</p>
                      <p className="text-muted-foreground capitalize">{acc.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNaira(acc.balance)}</p>
                      <StatusBadge status={acc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="consents">
        <Card>
          <CardContent className="pt-6">
            {data.consents.length === 0 ? (
              <EmptyState title="No consents" />
            ) : (
              <div className="space-y-2">
                {data.consents.map((c) => (
                  <div key={c.id} className="flex justify-between items-center py-2 border-b text-sm">
                    <div>
                      <p className="font-medium">{c.provider}</p>
                      <p className="text-muted-foreground">{c.scopes.join(', ')}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="audit">
        <Card>
          <CardContent className="pt-6">
            {data.auditHistory.length === 0 ? (
              <EmptyState title="No audit events" />
            ) : (
              <div className="space-y-2">
                {data.auditHistory.map((e) => (
                  <div key={e.id} className="flex justify-between py-2 border-b text-sm">
                    <div>
                      <p className="font-medium">{e.action}</p>
                      <p className="text-muted-foreground">{e.details}</p>
                    </div>
                    <span className="text-muted-foreground text-xs">{formatDateTime(e.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
