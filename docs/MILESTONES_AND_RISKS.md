# SETSUZOKU OS - Development Milestones & Technical Risks
**Version:** 1.0.0 | **Author:** Lead Systems Architect

---

## 1. Development Milestones & Phasing

```
[Phase 1] ───► [Phase 2] ───► [Phase 3] ───► [Phase 4] ───► [Phase 5]
Core Foundation CRM & Sales   Project &     Finances &    Automation &
& Multi-Tenant   (Leads,       Client Portal Payments      Business
Auth / RBAC      Clients,      (Tasks &      (Invoices,    Intelligence
(Active Phase)   Quotes)       Approvals)    Razorpay)
```

### Phase 1: Core Foundation & Multi-Tenant RBAC (Current Target)
- [x] Comprehensive PRD, Architecture, ERD, API specs & UI design tokens.
- [ ] Monorepo workspace configuration (`apps/api`, `apps/web`, `packages/database`, `packages/shared`).
- [ ] Complete Prisma Schema with PostgreSQL models, relational constraints, and Decimal fields.
- [ ] Backend: Auth module (Argon2id/bcrypt, JWT access/refresh token lifecycle), Organization module (creation, switching, onboarding), Members & RBAC guards.
- [ ] Frontend: Enterprise UI shell (Navbar, Sidebar, Theme tokens #142B3A / #13A89E), Auth pages (Register, Login), Organization Onboarding flow, Team/RBAC overview.
- [ ] Comprehensive test suite verifying Auth, Tenant Isolation, and RBAC guards.

### Phase 2: CRM & Sales Lifecycle
- [ ] Lead Management Kanban + Public lead intake webhook.
- [ ] Lead-to-Client conversion logic with preservation of history.
- [ ] Quotation builder with decimal calculations, PDF generation, and client acceptance.

### Phase 3: Project Execution & Client Portal
- [ ] Project initiation from accepted quotation.
- [ ] Milestone & Task management with assignee tracking and comments.
- [ ] Deliverable submission and multi-version client approval workflow.
- [ ] Secure Client Portal view isolated from internal data.

### Phase 4: Financial Engine & Invoicing
- [ ] Invoicing engine with sequential numbering, tax rates, and discount math.
- [ ] Razorpay integration with verified cryptographic HMAC SHA-256 webhooks.
- [ ] Manual payment recording with audit trail.

### Phase 5: Event Automation & Business Intelligence
- [ ] Idempotent background automation engine.
- [ ] Real-time operational BI dashboard with non-sample revenue and pipeline metrics.

---

## 2. Technical Risks & Mitigation Strategies

| Risk Category | Specific Risk Description | Impact | Mitigation Strategy |
| :--- | :--- | :---: | :--- |
| **Data Isolation** | Cross-tenant data leakage if an endpoint omits `organizationId` filter. | Critical | Implement Prisma query extension middleware that automatically enforces `where: { organizationId }` on all tenant-scoped tables; comprehensive multi-tenant test suites. |
| **Financial Accuracy** | JavaScript floating-point arithmetic causing precision inaccuracies in tax or line-item subtotals. | High | Store all currency amounts as PostgreSQL `DECIMAL(12, 2)`; compute in application code using `decimal.js` or fixed integer cents/paise. |
| **Payment Integrity** | Trusting client-side checkout redirection for payment confirmation, leading to unverified orders. | Critical | Payments are marked `PAID` exclusively via verified server-to-server webhook signatures (HMAC SHA-256) or explicit authorized manual recording. |
| **State Duplication** | Automation rules firing multiple times for the same trigger (e.g., duplicate invoices or email alerts). | Medium | Unique idempotency keys (`trigger_event_id`) stored in `AutomationExecution` table with DB unique constraint. |
| **File Security** | Unauthorized access to confidential client deliverables or contract PDFs. | High | Deliverables stored in private S3 buckets; downloads served via short-lived (15 min) presigned URLs generated after verifying client authorization. |
| **Windows Sandbox Environment** | Docker daemon or local PostgreSQL server not active on developer's local machine during local build/test. | Medium | Architect Prisma with dual database connection compatibility: PostgreSQL provider for production, and SQLite / test adapter for isolated local test runs without external network dependencies. |

