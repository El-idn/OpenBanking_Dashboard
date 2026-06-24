import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardSkeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatNaira } from '@/lib/format'

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b']

export function DashboardPage() {
  const { activeRole } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.getDashboardMetrics,
    refetchInterval: 10_000,
  })

  const { data: apiHealth } = useQuery({
    queryKey: ['api-metrics'],
    queryFn: api.getApiMetrics,
    refetchInterval: 10_000,
  })

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description={`Operational overview · ${activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : ''} view`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Total Deposits" value={formatNaira(data.totalDeposits, true)} icon={TrendingUp} />
        <KpiCard title="Today's Transactions" value={formatNaira(data.todayTransactions, true)} icon={ArrowLeftRight} />
        <KpiCard title="Active Customers" value={data.activeCustomers.toLocaleString()} icon={Users} />
        <KpiCard title="Failed Transfers" value={String(data.failedTransfers)} icon={AlertTriangle} />
        <Link to="/fraud" className="block">
          <KpiCard title="Fraud Alerts" value={String(data.fraudAlerts)} icon={Shield} subtitle="View in Fraud Center →" />
        </Link>
        <KpiCard title="Open Banking Consents" value={data.openBankingConsents.toLocaleString()} icon={Activity} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction Volume (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.transactionVolume}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.transferSuccessRate}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.transferSuccessRate.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 text-sm">
                {data.transferSuccessRate.map((item, i) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span>{item.status}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between text-sm border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{txn.id}</p>
                    <p className="text-muted-foreground text-xs">{txn.customerName} · {txn.bank}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNaira(txn.amount)}</p>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">API Health</CardTitle>
            <Link to="/monitoring" className="text-xs text-primary hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(apiHealth?.services ?? []).map((service) => (
                <div key={service.name} className="flex items-center justify-between text-sm">
                  <span>{service.name}</span>
                  <StatusBadge status={service.status === 'healthy' ? 'active' : service.status === 'degraded' ? 'pending' : 'failed'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
