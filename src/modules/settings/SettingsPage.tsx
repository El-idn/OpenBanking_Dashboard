import { useQuery } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatRole } from '@/lib/format'
import type { UserRole } from '@/types'

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['permission-matrix'],
    queryFn: api.getPermissionMatrix,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform configuration and role-based access control" />

      <Card>
        <CardHeader>
          <CardTitle>RBAC Permission Matrix</CardTitle>
          <CardDescription>
            Role-based access control across all platform modules. Use the header role switcher to demo different views.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : isError || !data ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Permission</th>
                    {data.roles.map((role: UserRole) => (
                      <th key={role} className="text-center py-3 px-3 font-medium text-muted-foreground min-w-[100px]">
                        {formatRole(role)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.permissions.map((perm) => (
                    <tr key={perm.key} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{perm.label}</td>
                      {data.roles.map((role: UserRole) => (
                        <td key={role} className="text-center py-3 px-3">
                          {perm.access[role] ? (
                            <Check className="h-4 w-4 text-success mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
