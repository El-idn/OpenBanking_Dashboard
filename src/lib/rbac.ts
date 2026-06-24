import type { UserRole } from '@/types'

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['customer', 'admin', 'compliance', 'auditor'] },
  { label: 'Customers', href: '/customers', icon: 'Users', roles: ['admin', 'compliance', 'auditor'] },
  { label: 'Accounts', href: '/accounts', icon: 'Wallet', roles: ['customer', 'admin', 'compliance', 'auditor'] },
  { label: 'Transfers', href: '/transfers', icon: 'Send', roles: ['customer', 'admin', 'compliance', 'auditor'] },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight', roles: ['customer', 'admin', 'compliance', 'auditor'] },
  { label: 'Consents', href: '/consents', icon: 'Shield', roles: ['customer', 'admin', 'compliance', 'auditor'] },
  { label: 'Fraud Center', href: '/fraud', icon: 'AlertTriangle', roles: ['admin', 'compliance'] },
  { label: 'Audit Logs', href: '/audit', icon: 'ScrollText', roles: ['admin', 'compliance', 'auditor'] },
  { label: 'API Monitoring', href: '/monitoring', icon: 'Activity', roles: ['admin'] },
  { label: 'Reports', href: '/reports', icon: 'FileText', roles: ['admin', 'compliance', 'auditor'] },
  { label: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
]

export function canAccessRoute(role: UserRole, path: string): boolean {
  const item = NAV_ITEMS.find((nav) => path.startsWith(nav.href))
  if (!item) return true
  return item.roles.includes(role)
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export function canWriteAccounts(role: UserRole): boolean {
  return role === 'admin'
}

export function canRevokeConsent(role: UserRole): boolean {
  return role === 'customer'
}

export function canViewAllCustomers(role: UserRole): boolean {
  return role !== 'customer'
}

export function canInvestigateFraud(role: UserRole): boolean {
  return role === 'admin' || role === 'compliance'
}

export function canInitiateTransfer(role: UserRole): boolean {
  return role === 'customer' || role === 'admin'
}
