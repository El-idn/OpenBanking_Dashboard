import type { Account } from '@/types'

export let accounts: Account[] = [
  {
    id: 'acc-001',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    nuban: '0123456789',
    name: 'Savings',
    type: 'savings',
    balance: 450000,
    status: 'active',
  },
  {
    id: 'acc-002',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    nuban: '0987654321',
    name: 'Current',
    type: 'current',
    balance: 1200000,
    status: 'active',
  },
  {
    id: 'acc-003',
    customerId: 'usr-cust-002',
    customerName: 'Grace Okoro',
    nuban: '0234567890',
    name: 'Savings',
    type: 'savings',
    balance: 320000,
    status: 'active',
  },
  {
    id: 'acc-004',
    customerId: 'usr-cust-003',
    customerName: 'Musa Ibrahim',
    nuban: '0345678901',
    name: 'Current',
    type: 'current',
    balance: 2850000,
    status: 'active',
  },
  {
    id: 'acc-005',
    customerId: 'usr-cust-004',
    customerName: 'Ngozi Eze',
    nuban: '0456789012',
    name: 'Wallet',
    type: 'wallet',
    balance: 45000,
    status: 'active',
  },
  {
    id: 'acc-006',
    customerId: 'usr-cust-005',
    customerName: 'Tunde Bakare',
    nuban: '0567890123',
    name: 'Savings',
    type: 'savings',
    balance: 180000,
    status: 'frozen',
  },
  {
    id: 'acc-007',
    customerId: 'usr-cust-006',
    customerName: 'Amina Yusuf',
    nuban: '0678901234',
    name: 'Current',
    type: 'current',
    balance: 890000,
    status: 'active',
  },
]

export function updateAccountStatus(id: string, status: 'active' | 'frozen') {
  const idx = accounts.findIndex((a) => a.id === id)
  if (idx >= 0) accounts[idx] = { ...accounts[idx], status }
  return accounts[idx]
}
