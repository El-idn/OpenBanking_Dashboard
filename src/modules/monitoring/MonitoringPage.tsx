import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Activity, Clock, Server, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable } from '@/components/shared/DataTable'
import { ErrorState } from '@/components/shared/EmptyState'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DashboardSkeleton } from '@/components/shared/Skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { ServiceHealth } from '@/types'

export function MonitoringPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['api-metrics'],
    queryFn: api.getApiMetrics,
    refetchInterval: 10_000,
  })

  const endpointColumns: ColumnDef<import('@/types').ApiMetrics['endpointUsage'][0], unknown>[] = [
    { accessorKey: 'endpoint', header: 'Endpoint' },
    {
      accessorKey: 'requests',
      header: 'Requests',
      cell: ({ row }) => row.original.requests.toLocaleString(),
    },
    {
      accessorKey: 'errorRate',
      header: 'Error Rate',
      cell: ({ row }) => `${row.original.errorRate}%`,
    },
    {
      accessorKey: 'avgLatency',
      header: 'Avg Latency',
      cell: ({ row }) => `${row.original.avgLatency}ms`,
    },
  ]

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title="API Monitoring" description="Microservice health and API performance metrics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Requests / Min" value={data.requestsPerMinute.toLocaleString()} icon={Zap} />
        <KpiCard title="Avg Latency" value={`${data.avgLatencyMs}ms`} icon={Clock} />
        <KpiCard title="Error Rate" value={`${data.errorRate}%`} icon={Activity} />
        <KpiCard title="Success Rate" value={`${data.successRate}%`} icon={Server} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">API Latency (60 min)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.latencyHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="ms" />
                <Tooltip formatter={(v: number) => [`${v}ms`, 'Latency']} />
                <Area type="monotone" dataKey="latency" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Error Rate (60 min)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.errorHistory}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="errors" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Service Health</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((service: ServiceHealth) => (
              <div key={service.name} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.latencyMs}ms · {service.uptime}% uptime</p>
                </div>
                <StatusBadge status={service.status === 'healthy' ? 'active' : service.status === 'degraded' ? 'pending' : 'failed'} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Endpoint Usage</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={endpointColumns} data={data.endpointUsage} />
        </CardContent>
      </Card>
    </div>
  )
}
