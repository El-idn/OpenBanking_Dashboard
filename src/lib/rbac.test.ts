import { describe, expect, it } from 'vitest'
import { canAccessRoute, canWriteAccounts, getNavItemsForRole } from '@/lib/rbac'

describe('rbac', () => {
  it('allows admin to access customers', () => {
    expect(canAccessRoute('admin', '/customers')).toBe(true)
  })

  it('denies customer access to customers list', () => {
    expect(canAccessRoute('customer', '/customers')).toBe(false)
  })

  it('returns correct nav items for customer role', () => {
    const items = getNavItemsForRole('customer')
    expect(items.some((i) => i.href === '/customers')).toBe(false)
    expect(items.some((i) => i.href === '/accounts')).toBe(true)
  })

  it('returns fraud nav for compliance role', () => {
    const items = getNavItemsForRole('compliance')
    expect(items.some((i) => i.href === '/fraud')).toBe(true)
    expect(items.some((i) => i.href === '/monitoring')).toBe(false)
  })

  it('returns monitoring nav for admin only', () => {
    const items = getNavItemsForRole('admin')
    expect(items.some((i) => i.href === '/monitoring')).toBe(true)
  })

  it('only admin can write accounts', () => {
    expect(canWriteAccounts('admin')).toBe(true)
    expect(canWriteAccounts('compliance')).toBe(false)
  })
})
