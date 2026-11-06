# SETSUZOKU OS - API Endpoint Specifications
**Version:** 1.0.0 | **Protocol:** RESTful JSON | **Base URL:** `/api/v1`

---

## 1. Global Conventions & Standards

- **Authentication:** `Authorization: Bearer <access_token>`
- **Tenant Context:** `X-Organization-Id: <org_uuid>` (Mandatory for all tenant-scoped routes)
- **Standard Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```
- **Standard Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation errors detected",
    "details": [
      { "field": "email", "issue": "Invalid email format" }
    ]
  }
}
```

---

## 2. API Endpoints by Module

### 2.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user account | No | Public |
| `POST` | `/auth/login` | Login with email & password | No | Public |
| `POST` | `/auth/refresh-token` | Exchange refresh token for new access token | No (Cookie) | Public |
| `POST` | `/auth/logout` | Revoke active refresh token | Yes | Any |
| `GET` | `/auth/me` | Fetch authenticated user profile & memberships | Yes | Any |
| `POST` | `/auth/forgot-password`| Request password reset email | No | Public |
| `POST` | `/auth/reset-password` | Execute password reset via token | No | Public |

### 2.2 Organizations (`/api/v1/organizations`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/organizations` | Create initial organization during onboarding | Yes | Any verified user |
| `GET` | `/organizations/current`| Get active organization details | Yes | Member |
| `PATCH`| `/organizations/current`| Update business details, tax, currency, logo | Yes | `ORG_OWNER`, `ADMIN` |
| `GET` | `/organizations/my-orgs`| List all organizations user belongs to | Yes | Any |

### 2.3 Team Members & RBAC (`/api/v1/members`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/members` | List team members in current organization | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `POST` | `/members/invite` | Invite a new team member with specific role | Yes | `ORG_OWNER`, `ADMIN` |
| `PATCH`| `/members/:id/role`| Update member role | Yes | `ORG_OWNER` |
| `DELETE`|`/members/:id` | Deactivate/remove member from organization | Yes | `ORG_OWNER` |

### 2.4 Leads CRM (`/api/v1/leads`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/leads/intake` | Public lead capture webhook / form submission | No | Public (Rate-limited) |
| `GET` | `/leads` | List leads (supports `status`, `search`, `page`) | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER`, `EMPLOYEE` |
| `POST` | `/leads` | Create lead manually | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `GET` | `/leads/:id` | Get lead detail & activity timeline | Yes | Staff |
| `PATCH`| `/leads/:id` | Update lead status, priority, or details | Yes | Staff |
| `POST` | `/leads/:id/convert`| Convert won lead to client | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |

### 2.5 Clients (`/api/v1/clients`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/clients` | List clients with summary stats | Yes | Staff |
| `POST` | `/clients` | Create client profile | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `GET` | `/clients/:id` | Get client 360 view (projects, quotes, invoices)| Yes | Staff |
| `PATCH`| `/clients/:id` | Update client profile & billing details | Yes | `ORG_OWNER`, `ADMIN` |

### 2.6 Quotations (`/api/v1/quotations`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/quotations` | List quotations with status filter | Yes | Staff |
| `POST` | `/quotations` | Create draft quotation with line items | Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `GET` | `/quotations/:id` | Get quotation line items & breakdown | Yes | Staff / Client |
| `POST` | `/quotations/:id/send`| Send quotation to client | Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `POST` | `/quotations/:id/accept`| Record client acceptance | Yes | Client / Admin override |
| `POST` | `/quotations/:id/convert-to-project`| Spawn project from accepted quote | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |

### 2.7 Projects & Tasks (`/api/v1/projects`, `/api/v1/tasks`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/projects` | List projects (Kanban or list format) | Yes | Staff / Client (own) |
| `POST` | `/projects` | Create new project | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `GET` | `/projects/:id` | Get project detail, milestones, and tasks | Yes | Staff / Client (own) |
| `PATCH`| `/projects/:id` | Update project status, deadline, budget | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `GET` | `/tasks` | List tasks (supports `projectId`, `assignedTo`) | Yes | Staff |
| `POST` | `/tasks` | Create task | Yes | `ORG_OWNER`, `ADMIN`, `MANAGER` |
| `PATCH`| `/tasks/:id` | Update task status, priority, due date | Yes | Staff assigned |
| `POST` | `/tasks/:id/comments`| Add discussion comment | Yes | Staff assigned |

### 2.8 Deliverables & Approvals (`/api/v1/deliverables`, `/api/v1/approvals`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/deliverables` | Create deliverable item under project | Yes | Staff |
| `POST` | `/deliverables/:id/versions`| Upload new deliverable version | Yes | Staff |
| `POST` | `/approvals/:versionId/decide`| Client approval or revision request | Yes | `CLIENT`, `ADMIN` |
| `GET` | `/approvals/history/:deliverableId`| Get complete version & audit timeline | Yes | Staff / Client |

### 2.9 Invoices & Payments (`/api/v1/invoices`, `/api/v1/payments`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/invoices` | List invoices with balance and aging status | Yes | Staff / Client (own) |
| `POST` | `/invoices` | Generate invoice with tax/discount breakdown | Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `GET` | `/invoices/:id` | View invoice detail | Yes | Staff / Client |
| `POST` | `/invoices/:id/payments`| Record verified manual payment | Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `POST` | `/payments/razorpay/create-order`| Initiate Razorpay order for online payment| Yes | Client / Staff |
| `POST` | `/payments/razorpay/webhook`| Cryptographic webhook for payment capture | No | Public (HMAC Verified) |

### 2.10 Reports & Dashboard (`/api/v1/reports`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/overview`| Summary metrics (Active projects, revenue, leads)| Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `GET` | `/reports/revenue` | Monthly revenue trends and aging receivables | Yes | `ORG_OWNER`, `ADMIN`, `FINANCE` |
| `GET` | `/reports/leads` | Lead pipeline conversion rate and source distribution | Yes | `ORG_OWNER`, `ADMIN` |

