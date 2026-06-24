# OpenBank NG

Enterprise Open Banking Operations Platform for Nigerian fintechs and digital banks.

Built with React 19, TypeScript, Vite, TanStack Query, Shadcn UI, Tailwind CSS, React Router, Recharts, and MSW.

## Features

- Executive dashboard with KPIs, charts, and real-time polling
- Customer management with KYC profiles (BVN, NIN, tiers)
- Account management with freeze/unfreeze workflows
- Transaction monitoring with search, filters, and CSV export
- Open Banking consent management with revoke flow and audit logging
- Role-based access control (Customer, Admin, Compliance Officer, Auditor)
- Dark/light mode and responsive layout

## Phase 2 Features

- **Fraud Center** — risk queue, investigation drawer, approve/flag workflow
- **Audit Logs** — searchable immutable event log with CSV export
- **API Monitoring** — latency charts, error rates, service health grid
- **Transfer Center** — own account, interbank, and bulk payment initiation
- **Reports** — settlement, revenue, KYC compliance, fraud investigation reports
- **Notifications** — bell icon with unread count, full notifications page
- **Settings** — RBAC permission matrix

## Demo Credentials

| Role | Email | Password | MFA |
|------|-------|----------|-----|
| Admin | admin@openbank.ng | password | 123456 |
| Compliance | compliance@openbank.ng | password | 123456 |
| Auditor | auditor@openbank.ng | password | 123456 |
| Customer | customer@openbank.ng | password | 123456 |

Use the **role switcher** in the header to demo different permission levels without re-logging in.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm test` — Run tests

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS v4
- **Data**: TanStack Query with MSW mock API layer
- **Tables**: TanStack Table with sorting and CSV export

All data is mocked via MSW — no live banking data or backend required. Deployable to Vercel with SPA routing configured in `vercel.json`.

## Nigerian Context

- Naira (₦) formatting
- NUBAN account numbers
- BVN masking
- Nigerian banks and fintechs (GTBank, Access, UBA, Zenith, Moniepoint, PalmPay, Opay)
- CBN Open Banking framework positioning

## License

MIT
