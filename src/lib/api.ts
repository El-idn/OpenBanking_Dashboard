const API_BASE = '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = sessionStorage.getItem('openbank_token')
  const userId = sessionStorage.getItem('msw_current_user_id')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...options?.headers,
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(body.message ?? 'Request failed', response.status)
  }

  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: import('@/types').User; requiresMfa: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyMfa: (code: string) =>
    request<{ token: string; user: import('@/types').User }>('/auth/mfa', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  getDashboardMetrics: () => request<import('@/types').DashboardMetrics>('/dashboard/metrics'),

  getCustomers: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').User>>(`/customers?${params}`),

  getCustomer: (id: string) => request<import('@/types').CustomerProfile>(`/customers/${id}`),

  getAccounts: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').Account>>(`/accounts?${params}`),

  updateAccount: (id: string, status: 'active' | 'frozen') =>
    request<import('@/types').Account>(`/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getTransactions: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').Transaction>>(`/transactions?${params}`),

  getConsents: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').Consent>>(`/consents?${params}`),

  revokeConsent: (id: string) =>
    request<{ success: boolean }>(`/consents/${id}`, { method: 'DELETE' }),

  logAudit: (event: Omit<import('@/types').AuditEvent, 'id' | 'timestamp'>) =>
    request<import('@/types').AuditEvent>('/audit', {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  getAuditLogs: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').AuditEvent>>(`/audit?${params}`),

  getFraudAlerts: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').FraudAlert>>(`/fraud/alerts?${params}`),

  getFraudAlert: (id: string) => request<import('@/types').FraudAlert>(`/fraud/alerts/${id}`),

  updateFraudAlert: (id: string, status: import('@/types').FraudAlertStatus) =>
    request<import('@/types').FraudAlert>(`/fraud/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getApiMetrics: () => request<import('@/types').ApiMetrics>('/monitoring/metrics'),

  getTransfers: (params: URLSearchParams) =>
    request<import('@/types').PaginatedResponse<import('@/types').Transfer>>(`/transfers?${params}`),

  createTransfer: (data: Omit<import('@/types').Transfer, 'id' | 'createdAt' | 'status' | 'reference'>) =>
    request<import('@/types').Transfer>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReports: () => request<import('@/types').Report[]>('/reports'),

  getNotifications: () => request<import('@/types').Notification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<import('@/types').Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  getPermissionMatrix: () => request<import('@/types').PermissionMatrix>('/settings/permissions'),
}
