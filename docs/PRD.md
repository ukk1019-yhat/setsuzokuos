# SETSUZOKU OS - Product Requirements Document (PRD)
**Version:** 1.0.0 | **Status:** Approved Architecture Draft | **Author:** Senior Software Architect & Product Strategist  
**Tagline:** *From First Inquiry to Final Payment*

---

## 1. Executive Summary & Product Vision

### 1.1 The Problem
Small and medium-sized service businesses (digital agencies, creative studios, IT firms, video production houses, consultancies) suffer from fragmented tool sprawl. A typical agency uses 5–8 disparate tools:
- Disconnected online forms for lead intake
- Generic boards and standalone tools for task tracking
- External cloud folders for client deliverables and feedback
- Ad-hoc chat and email channels for client communication and revisions
- Standalone proposal software for quotations
- Disjointed accounting tools and portals for billing and payments

**Consequences:**
- Leads slip through cracks (average 27% lead decay rate).
- Revision scope creep due to unstructured feedback across email/chat.
- Deliverables are delivered without verified upfront or milestone payments.
- Disconnected invoicing leads to delayed cash flow and uncollected receivables.

### 1.2 The Solution: SETSUZOKU OS
SETSUZOKU OS is a unified multi-tenant SaaS operating system connecting the entire customer lifecycle into a single audit-trailed workflow:

$$\text{Inquiry} \longrightarrow \text{Lead} \longrightarrow \text{Client} \longrightarrow \text{Quotation} \longrightarrow \text{Project} \longrightarrow \text{Tasks} \longrightarrow \text{Deliverable} \longrightarrow \text{Client Approval} \longrightarrow \text{Invoice} \longrightarrow \text{Verified Payment} \longrightarrow \text{Completion}$$

### 1.3 Target Audience & Ideal Customer Profile (ICP)
1. **Digital Marketing & Growth Agencies** (5–50 employees)
2. **Video Editing & Creative Production Studios** (3–30 employees)
3. **Web & Mobile App Development Companies** (5–100 employees)
4. **Brand Design & Creative Studios** (2–25 employees)
5. **IT Services & Managed Service Providers** (10–100 employees)
6. **B2B Strategy & Technology Consultancies** (5–40 employees)

---

## 2. Brand Identity & Design System

### 2.1 Brand Ethos
- **Design Philosophy:** Premium enterprise SaaS. Clean, structured, intentional, and high-performance. Avoid frivolous animations or generic AI-dashboard fluff.
- **Tone:** Authoritative, reliable, modern, and transparent.

### 2.2 Color Token System
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--primary` | `#142B3A` | Deep Navy: Brand header, primary buttons, active state |
| `--primary-hover`| `#0F212D` | Darker Navy hover state |
| `--secondary` | `#13A89E` | Vibrant Teal: Accents, CTAs, conversion points |
| `--secondary-hover`|`#0E8B83` | Teal hover state |
| `--background` | `#F7F9FB` | Soft cool background for reduced eye fatigue |
| `--surface` | `#FFFFFF` | Cards, modals, sidebars, data tables |
| `--text-primary` | `#172B3A` | Headings, high-emphasis text |
| `--text-muted` | `#718096` | Subtitles, metadata, table column headers |
| `--border` | `#E2E8F0` | Subtle structural division |
| `--success` | `#16865A` | Paid invoices, approved deliverables, won leads |
| `--warning` | `#D69E2E` | Overdue tasks, expiring quotations, on-hold items |
| `--error` | `#DC5151` | Failed payments, rejected revisions, overdue invoices |

---

## 3. Multi-Tenancy & Security Architecture

### 3.1 Tenant Isolation
- **Model:** Shared database with discriminator column (`organizationId`) backed by Foreign Key constraints and indexed for fast retrieval.
- **Tenant Context Enforcement:** Every API request executes within a verified tenant context. Tenant ID is extracted from authenticated session/JWT and validated against the `Membership` table. Client-supplied `organizationId` query/body parameters are strictly cross-checked against user memberships.
- **Defense in Depth:** NestJS / Express middleware injects `currentTenantId` into the request lifecycle. Prisma client extensions / repository patterns automatically enforce `where: { organizationId }` on all multi-tenant queries.

### 3.2 Authentication & Authorization
- **Password Security:** Argon2id hashing with recommended memory/time cost parameters (or high-round bcrypt).
- **Session / Token Strategy:** Dual-token JWT architecture (Short-lived 15m Access Token + 7d HttpOnly Refresh Token with automatic token rotation and revocation list).
- **RBAC (Role-Based Access Control):**
  - `SUPER_ADMIN`: Cross-platform maintenance (internal).
  - `ORGANIZATION_OWNER`: Full billing, organization settings, team management, all modules.
  - `ADMIN`: Operational business management, employee/customer admin, projects, reports.
  - `MANAGER`: Departmental oversight, project creation, task delegation, deliverable review.
  - `EMPLOYEE`: Assigned tasks, deliverable uploads, work logs.
  - `FINANCE`: Quotations, invoices, payments, revenue reports.
  - `CLIENT`: Scoped Client Portal access strictly limited to their own projects, quotations, invoices, deliverables, and approval workflows.

---

## 4. Functional Specifications by Module

### Module 01: Lead Management (CRM Pipeline)
- **Features:** Public intake embed form, manual lead entry, source tagging (Referral, Website, LinkedIn, Upwork, Cold Outreach), estimated budget, expected close date, sales owner assignment.
- **Statuses:** `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`.
- **Views:** Interactive Kanban board with drag-and-drop status transitions, tabular filter view with search, CSV export.
- **Conversion Workflow:** 1-click conversion from `WON` lead into a formal `Client` entity, retaining full activity history.

### Module 02: Customer Management (Client CRM)
- **Profile:** Company name, billing address, tax identification (GST/VAT/EIN), primary & secondary contacts, category (Enterprise, SMB, Retainer, Fixed-Scope).
- **360° Client Dossier:** Chronological activity stream, linked quotations, active projects, paid/outstanding invoices, files, and internal notes.

### Module 03: Quotations & Proposals
- **Builder:** Multi-item line builder with service description, quantity, unit price, item-level/quote-level discount, and tax rate.
- **Calculation Engine:** Pure integer or high-precision decimal math (`Decimal.js` / `@db.Decimal(12, 2)`). Zero floating-point rounding errors.
- **Lifecycle:** `DRAFT` $\rightarrow$ `SENT` $\rightarrow$ `VIEWED` $\rightarrow$ `ACCEPTED` / `REJECTED` / `EXPIRED`.
- **Action on Acceptance:** Auto-triggers Project Creation modal with pre-filled scope, budget, and milestone terms.

### Module 04 & 05: Project & Task Management
- **Project Structure:** Project code (e.g. `PRJ-2026-001`), client link, budget, milestones, manager, assigned team, status (`DRAFT`, `PLANNING`, `ACTIVE`, `ON_HOLD`, `REVIEW`, `COMPLETED`, `CANCELLED`).
- **Integrated Tasks:** Statuses (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), assignees, start/due dates, subtasks, task comments, and attachments.
- **Views:** Kanban, List, Milestones Gantt/Timeline view.

### Module 06 & 07: Client Portal & File/Deliverable Management
- **Dedicated Client Interface:** Clean, white-labeled client environment isolated from internal chatter.
- **Deliverables Hub:** File versioning (`v1.0`, `v1.1`, `v2.0`), changelog, review notes, presigned download URLs.
- **Reference Files:** Clients upload brief attachments, brand assets, and feedback documentation directly to the project.

### Module 08: Approval Workflow Engine
- **State Machine:**
  $$\text{Draft} \longrightarrow \text{Internal Review} \longrightarrow \text{Pending Client Approval} \longrightarrow \begin{cases} \text{Approved} \\ \text{Revision Requested} \end{cases}$$
- **Audit Log:** Captures approver IP, user agent, timestamp, exact deliverable version hash, and revision comment.
- **Immutability:** Approved deliverables can never be silently updated. Any new asset requires an incremental revision (`v2.0`).

### Module 09: Finance, Invoicing & Payments
- **Invoices:** Sequential numbering (`INV-YYYY-XXXX`), line items, taxes, discounts, advance payments applied, balance due.
- **Statuses:** `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`.
- **Payment Gateway:** Razorpay integration for India / international cards with cryptographic HMAC SHA256 webhook verification.
- **Manual Payments:** Bank Wire, UPI, Cash recording with reference transaction ID and audit verification badge.

### Module 10: Event-Driven Automation Engine
- **Triggers & Actions:**
  - `LEAD_CREATED` $\rightarrow$ Assign sales rep & post Slack/email alert.
  - `QUOTATION_ACCEPTED` $\rightarrow$ Spawn project template & alert project manager.
  - `DELIVERABLE_SUBMITTED` $\rightarrow$ Send approval link to client contact.
  - `PAYMENT_CONFIRMED` $\rightarrow$ Mark invoice paid & release final high-resolution files.
- **Safety:** Idempotency keys (`UUIDv7`) on all automation events to guarantee zero duplicate actions.

### Module 11: Business Intelligence & Analytics
- **Live Metrics (Non-Sample):** Total Pipeline Value, Win Rate %, Active Project Velocity, Total Billed, Cash Collected vs. Receivables Aging (0-30, 31-60, 60+ days), Team Utilization.

---

## 5. Non-Functional Requirements & Compliance
- **Performance:** P95 response time $< 120\text{ms}$ for cached reads, $< 250\text{ms}$ for transactional writes.
- **Security:** OWASP Top 10 compliance, input validation via Zod on both client and server, parameterized Prisma queries, CORS protection, rate-limiting on auth endpoints (10 req/min).
- **Data Integrity:** Strict foreign keys with cascading delete on transient child records and restricted delete on financial/audit records.

