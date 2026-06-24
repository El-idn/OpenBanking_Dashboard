import type { Transaction } from '@/types'

const banks = ['GTBank', 'Access Bank', 'UBA', 'Zenith', 'First Bank', 'Moniepoint', 'PalmPay', 'Opay']
const channels: Transaction['channel'][] = ['mobile_app', 'ussd', 'web', 'api', 'pos']
const statuses: Transaction['status'][] = ['success', 'success', 'success', 'pending', 'failed', 'reversed']

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const customerNames = [
  { id: 'usr-cust-001', name: 'Adebayo Johnson' },
  { id: 'usr-cust-002', name: 'Grace Okoro' },
  { id: 'usr-cust-003', name: 'Musa Ibrahim' },
  { id: 'usr-cust-004', name: 'Ngozi Eze' },
  { id: 'usr-cust-005', name: 'Tunde Bakare' },
  { id: 'usr-cust-006', name: 'Amina Yusuf' },
]

export const transactions: Transaction[] = Array.from({ length: 48 }, (_, i) => {
  const customer = customerNames[i % customerNames.length]
  const status = statuses[i % statuses.length]
  return {
    id: `TXN-${938200 + i}`,
    sessionId: `SES-${100000 + i}`,
    customerId: customer.id,
    customerName: customer.name,
    amount: [5000, 15000, 50000, 120000, 250000, 950000, 1500000][i % 7],
    bank: banks[i % banks.length],
    status,
    channel: channels[i % channels.length],
    date: daysAgo(i % 14),
  }
})
