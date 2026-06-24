import type { Consent } from '@/types'

export let consents: Consent[] = [
  {
    id: 'cns-001',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    provider: 'Paystack',
    scopes: ['Read Account Information', 'Initiate Payments'],
    grantedAt: '2025-12-06',
    expiresAt: '2026-12-06',
    status: 'active',
  },
  {
    id: 'cns-002',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    provider: 'Flutterwave',
    scopes: ['Read Account Information'],
    grantedAt: '2025-10-15',
    expiresAt: '2026-10-15',
    status: 'active',
  },
  {
    id: 'cns-003',
    customerId: 'usr-cust-002',
    customerName: 'Grace Okoro',
    provider: 'Mono',
    scopes: ['Read Account Information', 'Read Transaction History'],
    grantedAt: '2025-08-20',
    expiresAt: '2026-08-20',
    status: 'active',
  },
  {
    id: 'cns-004',
    customerId: 'usr-cust-003',
    customerName: 'Musa Ibrahim',
    provider: 'Okra',
    scopes: ['Read Account Information', 'Initiate Payments', 'Read Balance'],
    grantedAt: '2025-06-12',
    expiresAt: '2026-06-12',
    status: 'active',
  },
  {
    id: 'cns-005',
    customerId: 'usr-cust-004',
    customerName: 'Ngozi Eze',
    provider: 'Paystack',
    scopes: ['Read Account Information'],
    grantedAt: '2024-12-01',
    expiresAt: '2025-12-01',
    status: 'expired',
  },
  {
    id: 'cns-006',
    customerId: 'usr-cust-006',
    customerName: 'Amina Yusuf',
    provider: 'OnePipe',
    scopes: ['Read Account Information', 'Initiate Payments'],
    grantedAt: '2025-11-01',
    expiresAt: '2026-11-01',
    status: 'active',
  },
]

export function revokeConsent(id: string) {
  const idx = consents.findIndex((c) => c.id === id)
  if (idx >= 0) consents[idx] = { ...consents[idx], status: 'revoked' }
  return consents[idx]
}
