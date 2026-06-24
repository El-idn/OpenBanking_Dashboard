import type { Transfer } from '@/types'

export let transfers: Transfer[] = [
  {
    id: 'TRF-001',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    type: 'own_account',
    fromAccount: '0123456789',
    toAccount: '0987654321',
    amount: 100000,
    reference: 'OB-REF-2026-001',
    status: 'success',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'Savings → Current',
  },
  {
    id: 'TRF-002',
    customerId: 'usr-cust-001',
    customerName: 'Adebayo Johnson',
    type: 'interbank',
    fromAccount: '0987654321',
    toAccount: '0234567890',
    toBank: 'GTBank',
    amount: 50000,
    reference: 'OB-REF-2026-002',
    status: 'success',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'TRF-003',
    customerId: 'usr-cust-003',
    customerName: 'Musa Ibrahim',
    type: 'interbank',
    fromAccount: '0345678901',
    toAccount: '0567890123',
    toBank: 'Access Bank',
    amount: 950000,
    reference: 'OB-REF-2026-003',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'TRF-004',
    customerId: 'usr-cust-006',
    customerName: 'Amina Yusuf',
    type: 'bulk',
    fromAccount: '0678901234',
    toAccount: 'Multiple',
    amount: 2500000,
    reference: 'OB-BULK-2026-001',
    status: 'processing',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    description: 'Salary Processing — 45 recipients',
  },
]

export function createTransfer(transfer: Omit<Transfer, 'id' | 'createdAt' | 'status' | 'reference'>) {
  const newTransfer: Transfer = {
    ...transfer,
    id: `TRF-${String(transfers.length + 1).padStart(3, '0')}`,
    reference: `OB-REF-2026-${String(transfers.length + 1).padStart(3, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  transfers.unshift(newTransfer)
  return newTransfer
}
