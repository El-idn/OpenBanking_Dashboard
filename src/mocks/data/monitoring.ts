import type { ApiMetrics } from '@/types'

export const apiMetrics: ApiMetrics = {
  requestsPerMinute: 2847,
  avgLatencyMs: 142,
  errorRate: 0.8,
  successRate: 99.2,
  latencyHistory: Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - (11 - i) * 5)
    return {
      time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      latency: 120 + Math.floor(Math.random() * 60),
    }
  }),
  errorHistory: Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - (11 - i) * 5)
    return {
      time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      errors: Math.floor(Math.random() * 15) + 2,
    }
  }),
  services: [
    { name: 'Auth Service', status: 'healthy', latencyMs: 45, uptime: 99.99 },
    { name: 'Account Service', status: 'healthy', latencyMs: 82, uptime: 99.95 },
    { name: 'Transaction Service', status: 'degraded', latencyMs: 320, uptime: 98.2 },
    { name: 'Notification Service', status: 'healthy', latencyMs: 65, uptime: 99.9 },
    { name: 'Audit Service', status: 'healthy', latencyMs: 38, uptime: 99.99 },
  ],
  endpointUsage: [
    { endpoint: 'POST /v1/transfers', requests: 12450, errorRate: 1.2, avgLatency: 185 },
    { endpoint: 'GET /v1/accounts', requests: 45200, errorRate: 0.3, avgLatency: 62 },
    { endpoint: 'GET /v1/transactions', requests: 38900, errorRate: 0.5, avgLatency: 95 },
    { endpoint: 'POST /v1/consents', requests: 3200, errorRate: 0.1, avgLatency: 110 },
    { endpoint: 'POST /v1/auth/login', requests: 8900, errorRate: 2.1, avgLatency: 145 },
  ],
}
