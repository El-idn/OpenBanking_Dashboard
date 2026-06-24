import { http, HttpResponse, delay } from 'msw'
import { accounts, updateAccountStatus } from '../data/accounts'
import { addAuditEvent, auditEvents } from '../data/audit'
import { consents, revokeConsent } from '../data/consents'
import { fraudAlerts, updateFraudAlert } from '../data/fraud'
import { apiMetrics } from '../data/monitoring'
import { notifications, markNotificationRead, markAllNotificationsRead } from '../data/notifications'
import { reports } from '../data/reports'
import { transfers, createTransfer } from '../data/transfers'
import { transactions } from '../data/transactions'
import { CUSTOMERS, DEMO_USERS } from '../data/users'
import type { DashboardMetrics, PaginatedResponse, PermissionMatrix, Transfer, User } from '@/types'

const LATENCY_MIN = 200
const LATENCY_MAX = 600

async function simulateLatency() {
  const ms = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN)
  await delay(ms)
}

function maybeFail(): boolean {
  return Math.random() < 0.02
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}

function getAuthUser(request: Request): User | null {
  const userId = request.headers.get('X-User-Id')
  if (userId) {
    return CUSTOMERS.find((c) => c.id === userId) ?? Object.values(DEMO_USERS).find((u) => u.id === userId) ?? null
  }
  return null
}

let pendingMfaUser: (typeof DEMO_USERS)[string] | null = null

export const handlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as { email: string; password: string }
    const user = DEMO_USERS[body.email]
    if (!user || user.password !== body.password) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }
    const { password: _, ...safeUser } = user
    pendingMfaUser = user
    return HttpResponse.json({ token: 'pending-mfa', user: safeUser, requiresMfa: true })
  }),

  http.post('/api/v1/auth/mfa', async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as { code: string }
    if (body.code !== '123456' || !pendingMfaUser) {
      return HttpResponse.json({ message: 'Invalid verification code' }, { status: 401 })
    }
    const { password: _, ...safeUser } = pendingMfaUser
  if (typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis) {
      try {
        sessionStorage.setItem('msw_current_user_id', safeUser.id)
      } catch {
        /* MSW worker context */
      }
    }
    pendingMfaUser = null
    return HttpResponse.json({ token: `token-${safeUser.id}`, user: safeUser })
  }),

  http.get('/api/v1/dashboard/metrics', async () => {
    await simulateLatency()
    if (maybeFail()) return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })

    const today = new Date().toDateString()
    const todayTxns = transactions.filter((t) => new Date(t.date).toDateString() === today)
    const todayAmount = todayTxns.reduce((s, t) => s + t.amount, 0) || 89200000

    const volume = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const dayTxns = transactions.filter((t) => t.date.startsWith(dateStr))
      return {
        date: d.toLocaleDateString('en-NG', { weekday: 'short' }),
        amount: dayTxns.reduce((s, t) => s + t.amount, 0) || Math.floor(Math.random() * 50000000) + 10000000,
        count: dayTxns.length || Math.floor(Math.random() * 200) + 50,
      }
    })

    const successCount = transactions.filter((t) => t.status === 'success').length
    const failedCount = transactions.filter((t) => t.status === 'failed').length
    const pendingCount = transactions.filter((t) => t.status === 'pending').length

    const metrics: DashboardMetrics = {
      totalDeposits: accounts.reduce((s, a) => s + a.balance, 0) * 420,
      todayTransactions: todayAmount,
      activeCustomers: 32412,
      failedTransfers: transactions.filter((t) => t.status === 'failed').length || 47,
      fraudAlerts: 13,
      openBankingConsents: consents.filter((c) => c.status === 'active').length + 7836,
      transactionVolume: volume,
      transferSuccessRate: [
        { status: 'Success', count: successCount },
        { status: 'Failed', count: failedCount },
        { status: 'Pending', count: pendingCount },
      ],
      recentTransactions: [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    }
    return HttpResponse.json(metrics)
  }),

  http.get('/api/v1/customers', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const role = url.searchParams.get('role')

    let filtered = CUSTOMERS.filter((c) => c.role === 'customer')
    if (search) {
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.id.includes(search),
      )
    }
    if (role === 'customer') {
      const userId = url.searchParams.get('userId')
      if (userId) filtered = filtered.filter((c) => c.id === userId)
    }
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get('/api/v1/customers/:id', async ({ params }) => {
    await simulateLatency()
    const customer = CUSTOMERS.find((c) => c.id === params.id)
    if (!customer) return HttpResponse.json({ message: 'Customer not found' }, { status: 404 })
    const customerAccounts = accounts.filter((a) => a.customerId === customer.id)
    const customerConsents = consents.filter((c) => c.customerId === customer.id)
    const customerAudit = auditEvents.filter((a) => a.userId === customer.id)
    return HttpResponse.json({
      ...customer,
      accounts: customerAccounts,
      consents: customerConsents,
      auditHistory: customerAudit,
    })
  }),

  http.get('/api/v1/accounts', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const customerId = url.searchParams.get('customerId')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''

    let filtered = [...accounts]
    if (customerId) filtered = filtered.filter((a) => a.customerId === customerId)
    if (status) filtered = filtered.filter((a) => a.status === status)
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.nuban.includes(search) ||
          a.customerName.toLowerCase().includes(search) ||
          a.name.toLowerCase().includes(search),
      )
    }
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.patch('/api/v1/accounts/:id', async ({ params, request }) => {
    await simulateLatency()
    const body = (await request.json()) as { status: 'active' | 'frozen' }
    const updated = updateAccountStatus(params.id as string, body.status)
    if (!updated) return HttpResponse.json({ message: 'Account not found' }, { status: 404 })
    addAuditEvent({
      userId: 'usr-admin-001',
      userName: 'Chioma Adeyemi',
      userRole: 'admin',
      action: body.status === 'frozen' ? 'Account Frozen' : 'Account Unfrozen',
      entityType: 'account',
      entityId: updated.id,
    })
    return HttpResponse.json(updated)
  }),

  http.get('/api/v1/transactions', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const customerId = url.searchParams.get('customerId')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const minAmount = Number(url.searchParams.get('minAmount') ?? 0)
    const maxAmount = Number(url.searchParams.get('maxAmount') ?? Infinity)

    let filtered = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
    if (customerId) filtered = filtered.filter((t) => t.customerId === customerId)
    if (status) filtered = filtered.filter((t) => t.status === status)
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(search) ||
          t.customerName.toLowerCase().includes(search) ||
          t.bank.toLowerCase().includes(search) ||
          t.sessionId.toLowerCase().includes(search),
      )
    }
    filtered = filtered.filter((t) => t.amount >= minAmount && t.amount <= maxAmount)
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get('/api/v1/consents', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const customerId = url.searchParams.get('customerId')
    const status = url.searchParams.get('status')

    let filtered = [...consents]
    if (customerId) filtered = filtered.filter((c) => c.customerId === customerId)
    if (status) filtered = filtered.filter((c) => c.status === status)
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.delete('/api/v1/consents/:id', async ({ params, request }) => {
    await simulateLatency()
    const consent = revokeConsent(params.id as string)
    if (!consent) return HttpResponse.json({ message: 'Consent not found' }, { status: 404 })
    const authUser = getAuthUser(request)
    addAuditEvent({
      userId: authUser?.id ?? 'usr-cust-001',
      userName: authUser?.name ?? 'Adebayo Johnson',
      userRole: authUser?.role ?? 'customer',
      action: 'Consent Revoked',
      entityType: 'consent',
      entityId: consent.id,
      details: `Revoked ${consent.provider} access`,
    })
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/v1/audit', async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as Omit<import('@/types').AuditEvent, 'id' | 'timestamp'>
    const event = addAuditEvent(body)
    return HttpResponse.json(event)
  }),

  http.get('/api/v1/audit', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const role = url.searchParams.get('role')
    const action = url.searchParams.get('action')

    let filtered = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.userName.toLowerCase().includes(search) ||
          e.action.toLowerCase().includes(search) ||
          e.entityId.toLowerCase().includes(search) ||
          e.details?.toLowerCase().includes(search),
      )
    }
    if (role) filtered = filtered.filter((e) => e.userRole === role)
    if (action) filtered = filtered.filter((e) => e.action.toLowerCase().includes(action.toLowerCase()))
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get('/api/v1/fraud/alerts', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
    const riskLevel = url.searchParams.get('riskLevel')
    const status = url.searchParams.get('status')

    let filtered = [...fraudAlerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (riskLevel) filtered = filtered.filter((a) => a.riskLevel === riskLevel)
    if (status) filtered = filtered.filter((a) => a.status === status)
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.get('/api/v1/fraud/alerts/:id', async ({ params }) => {
    await simulateLatency()
    const alert = fraudAlerts.find((a) => a.id === params.id)
    if (!alert) return HttpResponse.json({ message: 'Alert not found' }, { status: 404 })
    return HttpResponse.json(alert)
  }),

  http.patch('/api/v1/fraud/alerts/:id', async ({ params, request }) => {
    await simulateLatency()
    const body = (await request.json()) as { status: import('@/types').FraudAlertStatus }
    const updated = updateFraudAlert(params.id as string, body.status)
    if (!updated) return HttpResponse.json({ message: 'Alert not found' }, { status: 404 })
    const authUser = getAuthUser(request)
    addAuditEvent({
      userId: authUser?.id ?? 'usr-compliance-001',
      userName: authUser?.name ?? 'Emeka Okafor',
      userRole: authUser?.role ?? 'compliance',
      action: body.status === 'approved' ? 'Fraud Alert Approved' : 'Fraud Alert Flagged',
      entityType: 'fraud',
      entityId: updated.id,
      details: `${updated.customerName} — ${updated.reason}`,
    })
    return HttpResponse.json(updated)
  }),

  http.get('/api/v1/monitoring/metrics', async () => {
    await simulateLatency()
    return HttpResponse.json(apiMetrics)
  }),

  http.get('/api/v1/transfers', async ({ request }) => {
    await simulateLatency()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20)
    const customerId = url.searchParams.get('customerId')
    const type = url.searchParams.get('type')

    let filtered = [...transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (customerId) filtered = filtered.filter((t) => t.customerId === customerId)
    if (type) filtered = filtered.filter((t) => t.type === type)
    return HttpResponse.json(paginate(filtered, page, pageSize))
  }),

  http.post('/api/v1/transfers', async ({ request }) => {
    await simulateLatency()
    const body = (await request.json()) as Omit<Transfer, 'id' | 'createdAt' | 'status' | 'reference'>
    const authUser = getAuthUser(request)
    const transfer = createTransfer({
      ...body,
      customerId: authUser?.id ?? body.customerId,
      customerName: authUser?.name ?? body.customerName,
    })
    addAuditEvent({
      userId: authUser?.id ?? 'usr-cust-001',
      userName: authUser?.name ?? 'Adebayo Johnson',
      userRole: authUser?.role ?? 'customer',
      action: 'Transfer Initiated',
      entityType: 'transfer',
      entityId: transfer.id,
      details: `${formatTransferType(transfer.type)} — ${transfer.amount}`,
    })
    return HttpResponse.json(transfer)
  }),

  http.get('/api/v1/reports', async () => {
    await simulateLatency()
    return HttpResponse.json(reports)
  }),

  http.get('/api/v1/notifications', async () => {
    await simulateLatency()
    return HttpResponse.json(notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }),

  http.patch('/api/v1/notifications/:id/read', async ({ params }) => {
    await simulateLatency()
    const n = markNotificationRead(params.id as string)
    if (!n) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(n)
  }),

  http.post('/api/v1/notifications/read-all', async () => {
    await simulateLatency()
    markAllNotificationsRead()
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/v1/settings/permissions', async () => {
    await simulateLatency()
    const matrix: PermissionMatrix = {
      roles: ['admin', 'compliance', 'auditor', 'customer'],
      permissions: [
        { key: 'dashboard', label: 'View Dashboard', access: { admin: true, compliance: true, auditor: true, customer: true } },
        { key: 'customers', label: 'Manage Customers', access: { admin: true, compliance: true, auditor: true, customer: false } },
        { key: 'accounts', label: 'Manage Accounts', access: { admin: true, compliance: false, auditor: false, customer: false } },
        { key: 'accounts_read', label: 'View Accounts', access: { admin: true, compliance: true, auditor: true, customer: true } },
        { key: 'transactions', label: 'View Transactions', access: { admin: true, compliance: true, auditor: true, customer: true } },
        { key: 'transfers', label: 'Initiate Transfers', access: { admin: false, compliance: false, auditor: false, customer: true } },
        { key: 'consents', label: 'Manage Consents', access: { admin: false, compliance: false, auditor: false, customer: true } },
        { key: 'fraud', label: 'Fraud Investigation', access: { admin: true, compliance: true, auditor: false, customer: false } },
        { key: 'audit', label: 'Audit Logs', access: { admin: true, compliance: true, auditor: true, customer: false } },
        { key: 'monitoring', label: 'API Monitoring', access: { admin: true, compliance: false, auditor: false, customer: false } },
        { key: 'reports', label: 'Generate Reports', access: { admin: true, compliance: true, auditor: true, customer: false } },
        { key: 'settings', label: 'Platform Settings', access: { admin: true, compliance: false, auditor: false, customer: false } },
      ],
    }
    return HttpResponse.json(matrix)
  }),
]

function formatTransferType(type: Transfer['type']): string {
  const labels: Record<Transfer['type'], string> = {
    own_account: 'Own Account Transfer',
    interbank: 'Interbank Transfer',
    bulk: 'Bulk Payment',
  }
  return labels[type]
}
