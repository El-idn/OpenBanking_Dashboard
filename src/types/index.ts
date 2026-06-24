export type UserRole = 'customer' | 'admin' | 'compliance' | 'auditor'

export type UserStatus = 'active' | 'inactive' | 'suspended'
export type NinStatus = 'verified' | 'pending' | 'unverified'
export type KycTier = 'tier1' | 'tier2' | 'tier3'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
  bvn: string
  ninStatus: NinStatus
  kycTier: KycTier
  status: UserStatus
  dateJoined: string
}

export type AccountType = 'savings' | 'current' | 'wallet'
export type AccountStatus = 'active' | 'frozen'

export interface Account {
  id: string
  customerId: string
  customerName: string
  nuban: string
  name: string
  type: AccountType
  balance: number
  status: AccountStatus
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'reversed'
export type TransactionChannel = 'mobile_app' | 'ussd' | 'web' | 'api' | 'pos'

export interface Transaction {
  id: string
  sessionId: string
  customerId: string
  customerName: string
  amount: number
  bank: string
  status: TransactionStatus
  channel: TransactionChannel
  date: string
}

export type ConsentStatus = 'active' | 'revoked' | 'expired'

export interface Consent {
  id: string
  customerId: string
  customerName: string
  provider: string
  scopes: string[]
  grantedAt: string
  expiresAt: string
  status: ConsentStatus
}

export interface AuditEvent {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  entityType: string
  entityId: string
  details?: string
}

export interface DashboardMetrics {
  totalDeposits: number
  todayTransactions: number
  activeCustomers: number
  failedTransfers: number
  fraudAlerts: number
  openBankingConsents: number
  transactionVolume: { date: string; amount: number; count: number }[]
  transferSuccessRate: { status: string; count: number }[]
  recentTransactions: Transaction[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface AuthResponse {
  token: string
  user: User
  requiresMfa: boolean
}

export interface CustomerProfile extends User {
  accounts: Account[]
  consents: Consent[]
  auditHistory: AuditEvent[]
}

export type FraudRiskLevel = 'low' | 'medium' | 'high'
export type FraudAlertStatus = 'open' | 'investigating' | 'approved' | 'flagged'

export interface FraudAlert {
  id: string
  customerId: string
  customerName: string
  transactionId: string
  amount: number
  riskLevel: FraudRiskLevel
  riskScore: number
  status: FraudAlertStatus
  reason: string
  createdAt: string
  devices: string[]
  ipHistory: string[]
  previousFlags: number
  velocityCount: number
  geoLocation: string
}

export type ServiceStatus = 'healthy' | 'degraded' | 'offline'

export interface ServiceHealth {
  name: string
  status: ServiceStatus
  latencyMs: number
  uptime: number
}

export interface ApiMetrics {
  requestsPerMinute: number
  avgLatencyMs: number
  errorRate: number
  successRate: number
  latencyHistory: { time: string; latency: number }[]
  errorHistory: { time: string; errors: number }[]
  services: ServiceHealth[]
  endpointUsage: { endpoint: string; requests: number; errorRate: number; avgLatency: number }[]
}

export type TransferType = 'own_account' | 'interbank' | 'bulk'
export type TransferStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface Transfer {
  id: string
  customerId: string
  customerName: string
  type: TransferType
  fromAccount: string
  toAccount: string
  toBank?: string
  amount: number
  reference: string
  status: TransferStatus
  createdAt: string
  description?: string
}

export type ReportType =
  | 'daily_settlement'
  | 'transfer_failure'
  | 'revenue'
  | 'agent_activity'
  | 'kyc_compliance'
  | 'fraud_investigation'

export interface Report {
  id: string
  type: ReportType
  title: string
  description: string
  generatedAt: string
  period: string
  status: 'ready' | 'generating'
}

export type NotificationType = 'payment' | 'security' | 'fraud' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface PermissionMatrix {
  roles: UserRole[]
  permissions: { key: string; label: string; access: Record<UserRole, boolean> }[]
}
