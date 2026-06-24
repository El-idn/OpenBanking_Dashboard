import { useQuery } from '@tanstack/react-query'
import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

const REPORT_ICONS: Record<string, string> = {
  daily_settlement: 'Daily settlement summary',
  transfer_failure: 'Failed transfer analysis',
  revenue: 'Fee and revenue breakdown',
  agent_activity: 'POS agent performance',
  kyc_compliance: 'KYC tier compliance',
  fraud_investigation: 'Fraud case summary',
}

export function ReportsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: api.getReports,
  })

  const handleDownload = (title: string) => {
    toast.success(`${title} downloaded`, { description: 'Mock CSV report generated for demo' })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Nigerian fintech compliance and operations reports" />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No reports available" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <StatusBadge status={report.status === 'ready' ? 'active' : 'pending'} />
                </div>
                <CardTitle className="text-base mt-2">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Period:</span> {report.period}</p>
                <p><span className="text-muted-foreground">Generated:</span> {formatDateTime(report.generatedAt)}</p>
                <p className="text-xs text-muted-foreground">{REPORT_ICONS[report.type]}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={report.status !== 'ready'}
                  onClick={() => handleDownload(report.title)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
