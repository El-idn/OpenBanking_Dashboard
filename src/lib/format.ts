const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const compactNairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatNaira(amount: number, compact = false): string {
  return compact ? compactNairaFormatter.format(amount) : nairaFormatter.format(amount)
}

export function maskBvn(bvn: string): string {
  if (bvn.length < 4) return bvn
  return `***${bvn.slice(-4)}`
}

export function maskNuban(nuban: string): string {
  if (nuban.length < 4) return nuban
  return `${nuban.slice(0, 3)}****${nuban.slice(-4)}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatKycTier(tier: string): string {
  return tier.replace('tier', 'Tier ')
}

export function formatRole(role: string): string {
  const labels: Record<string, string> = {
    customer: 'Customer',
    admin: 'Admin',
    compliance: 'Compliance Officer',
    auditor: 'Auditor',
  }
  return labels[role] ?? role
}

export function formatChannel(channel: string): string {
  return channel
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
