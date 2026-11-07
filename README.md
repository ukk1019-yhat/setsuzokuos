# SETSUZOKU OS (接続 OS)
> **Tagline:** *From First Inquiry to Final Payment*  
> **Corporate Website:** [https://setsuzoku.info](https://setsuzoku.info) &bull; **Live App:** [https://setsuzokuos.vercel.app](https://setsuzokuos.vercel.app)  
> **Mission:** A unified multi-tenant operating system for small and medium-sized service businesses (agencies, creative studios, IT firms, and consultancies).

---

## 1. Project Overview

SETSUZOKU OS connects the entire customer journey in an audit-trailed workflow:

$$\text{Inquiry} \longrightarrow \text{Lead} \longrightarrow \text{Client} \longrightarrow \text{Quotation} \longrightarrow \text{Project} \longrightarrow \text{Tasks} \longrightarrow \text{Deliverable} \longrightarrow \text{Approval} \longrightarrow \text{Invoice} \longrightarrow \text{Verified Payment}$$

### Key Value Propositions
- **Eliminate Tool Fragmentation:** Combines CRM, Proposals, Task Management, Client Portal, Approvals, and Invoicing into one system.
- **Decimal-Safe Financial Engine:** All currency calculations use exact `Decimal(12, 2)` arithmetic—zero floating-point inaccuracies.
- **Strict Multi-Tenant Isolation:** Row-level tenant foreign keys enforced by authentication and authorization guards.
- **Client Sign-off State Machine:** Deliverables have immutable version histories (`v1.0`, `v1.1`, `v2.0`) with logged approval decisions.

---

## 2. Monorepo Repository Structure

```
setsuzoku-os/
├── apps/
│   ├── api/                 # REST API service (Express/TypeScript, JWT, RBAC guards)
│   │   ├── src/
│   │   │   ├── config/      # Environment configuration
│   │   │   ├── middleware/  # AuthGuard, TenantGuard, RbacGuard, ErrorMiddleware
│   │   │   ├── modules/     # Auth, Organizations, Members & RBAC
│   │   │   └── storage/     # Resilient Database Repository with Prisma integration
│   │   └── tests/           # Vitest integration tests (Auth, Orgs, RBAC)
│   └── web/                 # Frontend (React 18 + Vite + Tailwind CSS + TanStack Query)
│       ├── src/
│       │   ├── api/         # Typed API Client with JWT & Tenant injection
│       │   ├── components/  # Buttons, Inputs, Cards, Badges, Modals, Shell Layouts
│       │   ├── context/     # AuthProvider & Organization Switcher state
│       │   └── pages/       # Login, Register, Onboarding, Dashboard, Team, Settings
├── packages/
│   ├── database/            # PostgreSQL Prisma schema (28 models), Migrations & Client
│   │   └── prisma/
│   │       └── schema.prisma # Full relational schema with @db.Decimal(12,2)
│   └── shared/              # Shared Zod schemas, RBAC enums, DTOs & Permissions
├── docs/
│   ├── PRD.md               # Product Requirements Document
│   ├── SYSTEM_ARCHITECTURE.md # Modular Monolith Architecture
│   ├── DATABASE_ERD.md      # Mermaid ER Diagram & Relational Rules
│   ├── API_DOCUMENTATION.md # Versioned REST Endpoints (/api/v1/...)
│   ├── FRONTEND_ARCHITECTURE.md # Route Tree & Component Hierarchy
│   ├── AUTH_AND_RBAC.md     # 7 Roles & Permission Matrix
│   └── MILESTONES_AND_RISKS.md  # 5 Development Phases & Technical Risks
└── README.md
```

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router 6, TanStack Query.
- **Backend:** Node.js, Express / NestJS architecture, TypeScript, Zod, Bcrypt / Argon2id, JWT.
- **Database:** PostgreSQL 16+, Prisma ORM 5.
- **Design Tokens:** Deep Navy (`#142B3A`), Vibrant Teal (`#13A89E`), Cool Gray (`#F7F9FB`), Surface White (`#FFFFFF`).

---

## 4. Implementation Status

### Phase 1: Foundation, Multi-Tenant Auth & RBAC
- [x] **Complete Specifications & Architecture:** PRD, ERD, API contracts, RBAC matrix, and risk mitigation documented in `/docs`.
- [x] **PostgreSQL Prisma Schema:** 28 normalized models, strict relational foreign keys, cascade policies, indexes, and `Decimal(12, 2)` monetary columns.
- [x] **Authentication Module:** User registration, password hashing, JWT generation, session retrieval (`/api/v1/auth/*`).
- [x] **Organization & Tenancy:** Business onboarding wizard, tenant-scoping guard (`X-Organization-Id`), organization switching (`/api/v1/organizations/*`).
- [x] **Role-Based Access Control (RBAC):** Seven roles (`SUPER_ADMIN`, `ORGANIZATION_OWNER`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `FINANCE`, `CLIENT`), member invitation, permission decorators, and protection against demoting or deleting sole owners.
- [x] **Responsive Enterprise Frontend:** Connected Login, Register, Multi-step Onboarding, Main Dashboard Overview, Team & RBAC Management, and Settings.

### Phase 2: CRM & Sales Lifecycle
- [x] **Lead Management System:**
  - Public web intake form embed endpoint (`POST /api/v1/leads/intake`) with organization slug resolution.
  - Interactive 7-stage Kanban pipeline (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Negotiation`, `Won`, `Lost`).
  - Data table view with live search, priority indicators, and estimated budget columns.
  - Activity history stream (calls, notes, emails, and automatic status transition logs).
  - 1-click conversion from won lead to formal Client entity preserving history and linkages.
- [x] **Customer Management (Clients):**
  - Customer profile directory with tax identification (GSTIN/EIN) and billing addresses.
  - 360° Client Dossier tracking linked quotations, active projects, and financial totals.
- [x] **Quotations & Proposals Engine:**
  - Server-side decimal-safe pricing calculations (zero floating-point errors).
  - Dynamic multi-service line item builder with quantities, unit prices, discounts, and taxes.
  - Lifecycle state machine: `DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `ACCEPTED`.
  - Audit logging of formal client acceptance.

### Phase 3: Project Execution & Client Portal (Completed)
- [x] **Project Management Operations:**
  - 1-Click spawn project from accepted quotations, auto-populating milestones & deliverables from quotation items.
  - Project code generation (`PRJ-YYYY-XXX`), budget tracking, and real-time completion percentage calculations.
  - Project detail drawer displaying milestones schedule, tasks list, and deliverable review status.
- [x] **Task Management System:**
  - Filter tabs for `All Tasks`, `My Tasks`, `In Progress`, and `Completed`.
  - Subtask checklist decomposition with interactive toggle.
  - Collaborative task discussion comment thread.
- [x] **Deliverables & Approval Workflow:**
  - Multi-version deliverable history (`v1`, `v2`, `v3`...) with changelog notes.
  - Formal client sign-off state machine (`Pending Client Approval` $\rightarrow$ `Approved` / `Revision Requested`).
  - Protection: Never overwrites approved versions without an explicit new version increment.
- [x] **Dedicated Client Portal (`/portal`):**
  - Isolated client interface displaying only the client's own projects and quotations.
  - Review cards for pending deliverables with direct "Approve" or "Request Revision" feedback actions.
- [x] **Automated Test Suite:** 27 comprehensive integration tests passing with 100% green status.

---

## 5. Getting Started & Development

### Prerequisites
- Node.js 20+ / 25+
- pnpm 11+

### Installation
```bash
# 1. Install all dependencies across the workspace
pnpm install

# 2. Build shared packages and database client
pnpm --filter @setsuzoku/shared run build
pnpm --filter @setsuzoku/database run build

# 3. Generate Prisma client
pnpm --filter @setsuzoku/database exec prisma generate --schema=prisma/schema.prisma
```

### Running Tests
```bash
pnpm --filter @setsuzoku/api run test
```

### Running the Application Locally
```bash
# Terminal 1: Start Backend API (Port 4000)
pnpm --filter @setsuzoku/api run dev

# Terminal 2: Start Frontend Web Application (Port 3000)
pnpm --filter @setsuzoku/web run dev
```

Visit `http://localhost:3000` to access the application.

---

### Official Channels
- **Main Website:** [https://setsuzoku.info](https://setsuzoku.info)
- **Production Platform:** [https://setsuzokuos.vercel.app](https://setsuzokuos.vercel.app)
- **Direct Desk:** [info@setsuzoku.in](mailto:info@setsuzoku.in)
- **Legal Entity:** Setsuzoku Media Labs Private Limited (Republic of India)
