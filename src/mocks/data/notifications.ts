import type { Notification } from '@/types'

export let notifications: Notification[] = [
  {
    id: 'ntf-001',
    type: 'fraud',
    title: 'High-risk transaction flagged',
    message: 'Musa Ibrahim — ₦950,000 transfer flagged for velocity check',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ntf-002',
    type: 'payment',
    title: 'Transfer failed',
    message: 'TXN-938212 failed — insufficient funds at beneficiary bank',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ntf-003',
    type: 'security',
    title: 'New device login detected',
    message: 'Customer Adebayo Johnson logged in from a new device in Lagos',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ntf-004',
    type: 'system',
    title: 'Transaction Service degraded',
    message: 'API latency above threshold — monitoring team notified',
    read: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'ntf-005',
    type: 'payment',
    title: 'Bulk payment processing',
    message: 'Salary batch OB-BULK-2026-001 is being processed (45 recipients)',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function markNotificationRead(id: string) {
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx >= 0) notifications[idx] = { ...notifications[idx], read: true }
  return notifications[idx]
}

export function markAllNotificationsRead() {
  for (let i = 0; i < notifications.length; i++) {
    notifications[i] = { ...notifications[i], read: true }
  }
}
