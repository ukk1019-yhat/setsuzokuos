# SETSUZOKU OS - Frontend Route Structure & Component Hierarchy
**Framework:** React 18+ | **Build Tool:** Vite | **Styling:** Tailwind CSS + shadcn/ui Design Tokens

---

## 1. Application Layout Shells

The frontend application is partitioned into three distinct layout trees:

```
┌────────────────────────────────────────────────────────┐
│                   Setsuzoku OS Shell                   │
├─────────────────────┬──────────────────┬───────────────┤
│    AuthLayout       │ DashboardLayout  │  PortalLayout │
│ (Public & Onboard)  │ (Internal Team)  │ (Client-Only) │
└─────────────────────┴──────────────────┴───────────────┘
```

1. **`AuthLayout`**: Centered, distraction-free shell with SETSUZOKU OS branding. Used for Login, Registration, Password Reset, and Organization Onboarding wizard.
2. **`DashboardLayout`**: Collapsible enterprise sidebar with brand header `#142B3A`, top navigation bar (Global Search, Organization Switcher, Notification Bell, User Avatar menu), and scrollable content area.
3. **`PortalLayout`**: Streamlined client portal header, breadcrumbs, project switcher, deliverable approval cards, and invoice payment modals.

---

## 2. Frontend Route Structure

```
/                                       -> Redirect to /dashboard or /login
├── /login                              -> User Login (email + password)
├── /register                           -> User Registration
├── /forgot-password                    -> Password Reset Request
├── /reset-password/:token              -> Set New Password
├── /onboarding                         -> Multi-step Organization Setup Wizard
│
├── /dashboard                          -> Main Executive Overview (KPIs, Activity, Tasks)
│
├── /leads                              -> Lead Management
│   ├── /leads/kanban                   -> Kanban Pipeline View
│   ├── /leads/list                     -> Data Table View with Filters
│   └── /leads/:id                      -> Lead Detail Dossier & Activity Log
│
├── /clients                            -> Client Directory
│   ├── /clients                        -> Client Table & Segmentation
│   └── /clients/:id                    -> 360° Client Profile (Projects, Invoices, Notes)
│
├── /quotations                         -> Quotations & Proposals
│   ├── /quotations                     -> Quotation List & Status Badges
│   ├── /quotations/new                 -> Quotation Builder
│   └── /quotations/:id                 -> Quotation View, PDF preview, Revision History
│
├── /projects                           -> Project Operations
│   ├── /projects                       -> Project Grid / Kanban
│   ├── /projects/new                   -> Project Initiation
│   └── /projects/:id                   -> Project Dashboard (Tasks, Milestones, Files)
│
├── /tasks                              -> Task Operations
│   ├── /tasks                          -> Filtered Task Views (My Tasks, Overdue, Project)
│   └── /tasks/:id                      -> Task Drawer / Detail Dialog
│
├── /approvals                          -> Deliverable Approvals Queue
│   ├── /approvals                      -> Internal & Client Pending Queue
│   └── /approvals/:deliverableId       -> Version Comparison & Review Interface
│
├── /invoices                           -> Financial Management
│   ├── /invoices                       -> Invoice Directory & Aging Indicators
│   ├── /invoices/new                   -> Invoice Generator
│   └── /invoices/:id                   -> Invoice Viewer & Payment Recording
│
├── /payments                           -> Payment Ledger & Reconciliation
│   └── /payments                       -> Verified vs Manual Transactions Table
│
├── /team                               -> Team & Access Management
│   ├── /team                           -> Member List & Role Badges
│   └── /team/invite                    -> Invite Colleague Dialog
│
├── /reports                            -> Business Intelligence
│   ├── /reports/overview               -> Executive Revenue & Conversion Metrics
│   └── /reports/leads                  -> Channel Performance & Sales Velocity
│
├── /settings                           -> Organization & Account Settings
│   ├── /settings/organization          -> Business Details, Currency, Tax Info, Logo
│   ├── /settings/members               -> Roles & Permissions Matrix
│   └── /settings/profile               -> Personal Info, Password, Sessions
│
└── /portal                             -> Dedicated Client Portal (Client Role Only)
    ├── /portal/dashboard               -> Client Active Projects & Pending Actions
    ├── /portal/projects/:id            -> Deliverables & Reference Files
    ├── /portal/approvals/:id           -> Approve or Request Revision Interface
    └── /portal/invoices/:id            -> View & Pay Invoice via Razorpay / Bank Transfer
```

---

## 3. UI Component Hierarchy

```
App
├── QueryClientProvider (TanStack Query)
├── AuthProvider (User, Session, Token Management)
├── OrganizationProvider (Current Organization Context & Switcher)
└── RouterProvider
    ├── <AuthLayout>
    │   ├── LoginForm
    │   ├── RegisterForm
    │   └── OnboardingWizard
    │       ├── Step1: BusinessIdentity (Name, Logo, Description)
    │       ├── Step2: Localization (Currency, Timezone, Address)
    │       └── Step3: FinancialSettings (Tax/GST, Billing Email)
    │
    ├── <DashboardLayout>
    │   ├── SidebarNav
    │   │   ├── BrandHeader (Setsuzoku OS Logo)
    │   │   ├── NavItem (Icon, Label, Badge, Active Indicator)
    │   │   └── OrgSwitcherDropdown
    │   ├── Topbar
    │   │   ├── GlobalSearchInput
    │   │   ├── NotificationDropdown
    │   │   └── UserProfileDropdown
    │   └── MainContentArea
    │       ├── PageHeader (Breadcrumbs, Title, Actions)
    │       ├── MetricCard (Value, Label, Delta, Trend)
    │       ├── DataTable (Sorting, Pagination, Column Filtering)
    │       ├── KanbanBoard (Draggable Column, KanbanCard)
    │       ├── QuotationBuilder (LineItemsTable, TaxDiscountSummary)
    │       ├── TaskModal (SubtaskChecklist, CommentTimeline)
    │       ├── ApprovalReviewCard (VersionSelector, DiffViewer, ActionButtons)
    │       └── StatusBadge (Variant: Success, Warning, Error, Neutral)
    │
    └── <PortalLayout>
        ├── ClientHeader
        ├── ActiveDeliverablesList
        ├── RevisionFeedbackForm
        └── PaymentModal (Razorpay SDK wrapper)
```

