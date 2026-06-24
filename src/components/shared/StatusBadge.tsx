import { Badge } from '@/components/ui/badge'
import { formatStatus } from '@/lib/format'
import { cn } from '@/lib/cn'

const statusVariants: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  active: 'success',
  success: 'success',
  verified: 'success',
  pending: 'warning',
  processing: 'warning',
  frozen: 'warning',
  failed: 'destructive',
  reversed: 'destructive',
  revoked: 'destructive',
  suspended: 'destructive',
  high: 'destructive',
  expired: 'secondary',
  inactive: 'secondary',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status.toLowerCase()] ?? 'outline'
  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {formatStatus(status)}
    </Badge>
  )
}
