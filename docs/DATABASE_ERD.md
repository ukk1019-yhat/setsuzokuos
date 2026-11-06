# SETSUZOKU OS - Database Entity Relationship (ER) Diagram
**Version:** 1.0.0 | **RDBMS:** PostgreSQL 16+ via Prisma ORM

---

## 1. High-Level Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    Organization ||--o{ Membership : "has"
    Organization ||--o{ Client : "owns"
    Organization ||--o{ Lead : "owns"
    Organization ||--o{ Quotation : "owns"
    Organization ||--o{ Project : "owns"
    Organization ||--o{ Invoice : "owns"
    Organization ||--o{ FileRecord : "owns"
    Organization ||--o{ AutomationRule : "configures"
    Organization ||--o{ AuditLog : "tracks"

    User ||--o{ Membership : "belongs_to"
    User ||--o{ RefreshToken : "holds"
    User ||--o{ TaskComment : "authors"
    User ||--o{ ActivityLog : "triggers"

    Membership }o--|| Role : "assigned"
    
    Client ||--o{ Project : "contracts"
    Client ||--o{ Quotation : "receives"
    Client ||--o{ Invoice : "billed_for"
    Client ||--o{ ClientPortalUser : "accesses_via"
    
    Lead ||--o{ LeadActivity : "logs"
    Lead |o--o| Client : "converts_to"

    Quotation ||--o{ QuotationItem : "contains"
    Quotation |o--o| Project : "converts_to"

    Project ||--o{ Milestone : "divided_into"
    Project ||--o{ ProjectMember : "staffed_with"
    Project ||--o{ Task : "tracks"
    Project ||--o{ Deliverable : "produces"
    Project ||--o{ Invoice : "billed_by"

    Task ||--o{ Subtask : "breaks_into"
    Task ||--o{ TaskComment : "discusses"
    
    Deliverable ||--o{ DeliverableVersion : "versions"
    DeliverableVersion ||--o{ Approval : "evaluated_by"

    Invoice ||--o{ InvoiceItem : "contains"
    Invoice ||--o{ Payment : "settled_by"
    
    Payment ||--o| PaymentWebhookEvent : "verified_by"

    Organization {
        uuid id PK
        string name
        string slug UK
        string currency
        string timezone
        string taxNumber
        timestamp createdAt
    }

    User {
        uuid id PK
        string email UK
        string passwordHash
        string fullName
        string avatarUrl
        boolean isEmailVerified
        timestamp createdAt
    }

    Membership {
        uuid id PK
        uuid organizationId FK
        uuid userId FK
        string role
        boolean isActive
        timestamp createdAt
    }

    Lead {
        uuid id PK
        uuid organizationId FK
        string title
        string contactName
        string email
        string status
        decimal estimatedBudget
        uuid assignedToId FK
    }

    Client {
        uuid id PK
        uuid organizationId FK
        string name
        string email
        string company
        string billingAddress
        string taxId
    }

    Quotation {
        uuid id PK
        uuid organizationId FK
        uuid clientId FK
        string quoteNumber UK
        string status
        decimal subtotal
        decimal taxAmount
        decimal totalAmount
        timestamp validUntil
    }

    Project {
        uuid id PK
        uuid organizationId FK
        uuid clientId FK
        string code UK
        string name
        string status
        decimal budget
        date startDate
        date deadline
    }

    Task {
        uuid id PK
        uuid projectId FK
        string title
        string status
        string priority
        uuid assignedToId FK
        timestamp dueDate
    }

    Deliverable {
        uuid id PK
        uuid projectId FK
        string title
        string currentStatus
        int currentVersion
    }

    Approval {
        uuid id PK
        uuid deliverableVersionId FK
        string approverType
        uuid approverUserId FK
        string status
        text feedbackComments
        timestamp decidedAt
    }

    Invoice {
        uuid id PK
        uuid organizationId FK
        uuid clientId FK
        uuid projectId FK
        string invoiceNumber UK
        string status
        decimal totalAmount
        decimal amountPaid
        decimal balanceDue
        date dueDate
    }

    Payment {
        uuid id PK
        uuid invoiceId FK
        uuid organizationId FK
        decimal amount
        string method
        string status
        string transactionRef
        timestamp paidAt
    }
```

---

## 2. Key Relational Integrity Constraints & Rules

1. **Strict Organization Scoping:**
   - Every primary domain model (`Client`, `Lead`, `Quotation`, `Project`, `Invoice`, `Payment`, `Deliverable`, `FileRecord`) has a non-nullable `organizationId` foreign key referencing `Organization(id)` with `onDelete: Cascade`.
2. **Immutability of Financial & Approval Logs:**
   - Invoices, Payments, Approvals, and Audit Logs cannot be deleted if referenced in active transactions.
   - Deleting a project does NOT delete historical paid invoices or completed payments (`onDelete: Restrict` or archived state).
3. **Decimal Precision:**
   - All monetary fields use PostgreSQL `DECIMAL(12, 2)` to guarantee exact accounting balances.
4. **Auditability:**
   - Every table maintains `createdAt` and `updatedAt`.
   - Modifying actions write structured JSON records to `AuditLog`.

