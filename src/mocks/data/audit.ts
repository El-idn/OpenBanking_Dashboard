import type { AuditEvent } from '@/types'

export const auditEvents: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'usr-admin-001',
    userName: 'Chioma Adeyemi',
    userRole: 'admin',
    action: 'Account Frozen',
    entityType: 'account',
    entityId: 'acc-006',
    details: 'Fraud investigation flagged account',
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userId: 'usr-cust-002',
    userName: 'Grace Okoro',
    userRole: 'customer',
    action: 'Consent Granted',
    entityType: 'consent',
    entityId: 'cns-003',
    details: 'Granted Mono read access',
  },
  {
    id: 'aud-004',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    userId: 'usr-cust-001',
    userName: 'Adebayo Johnson',
    userRole: 'customer',
    action: 'Consent Revoked',
    entityType: 'consent',
    entityId: 'cns-001',
    details: 'Revoked Paystack access',
  },
  {
    id: 'aud-005',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    userId: 'usr-admin-001',
    userName: 'Chioma Adeyemi',
    userRole: 'admin',
    action: 'Permission Changed',
    entityType: 'user',
    entityId: 'usr-cust-005',
    details: 'Suspended customer account',
  },
  {
    id: 'aud-006',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    userId: 'usr-auditor-001',
    userName: 'Fatima Bello',
    userRole: 'auditor',
    action: 'Report Generated',
    entityType: 'report',
    entityId: 'rpt-001',
    details: 'Daily settlement report exported',
  },
  {
    id: 'aud-007',
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    userId: 'usr-compliance-001',
    userName: 'Emeka Okafor',
    userRole: 'compliance',
    action: 'Fraud Alert Flagged',
    entityType: 'fraud',
    entityId: 'frd-003',
    details: 'Escalated Tunde Bakare case for review',
  },
  {
    id: 'aud-008',
    timestamp: new Date(Date.now() - 518400000).toISOString(),
    userId: 'usr-cust-001',
    userName: 'Adebayo Johnson',
    userRole: 'customer',
    action: 'Login',
    entityType: 'auth',
    entityId: 'usr-cust-001',
    details: 'Successful login via mobile app',
  },
]

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const newEvent: AuditEvent = {
    ...event,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  auditEvents.unshift(newEvent)
  return newEvent
}
