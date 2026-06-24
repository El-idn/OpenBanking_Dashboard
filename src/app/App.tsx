import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/app/AuthProvider'
import { AppLayout } from '@/app/AppLayout'
import { AppProviders } from '@/app/providers'
import { GuestRoute, MfaRoute, ProtectedRoute } from '@/app/ProtectedRoute'
import { ThemeProvider } from '@/app/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { LoginPage, MfaPage } from '@/modules/auth/LoginPage'
import { AccountsPage } from '@/modules/accounts/AccountsPage'
import { AuditPage } from '@/modules/audit/AuditPage'
import { ConsentsPage } from '@/modules/consents/ConsentsPage'
import { CustomerProfilePage, CustomersPage } from '@/modules/customers/CustomersPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { FraudPage } from '@/modules/fraud/FraudPage'
import { MonitoringPage } from '@/modules/monitoring/MonitoringPage'
import { NotificationsPage } from '@/modules/notifications/NotificationsPage'
import { ReportsPage } from '@/modules/reports/ReportsPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import { TransactionsPage } from '@/modules/transactions/TransactionsPage'
import { TransfersPage } from '@/modules/transfers/TransfersPage'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProviders>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/mfa"
                element={
                  <MfaRoute>
                    <MfaPage />
                  </MfaRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerProfilePage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/transfers" element={<TransfersPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/consents" element={<ConsentsPage />} />
                <Route path="/fraud" element={<FraudPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/monitoring" element={<MonitoringPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AppProviders>
      </AuthProvider>
    </ThemeProvider>
  )
}
