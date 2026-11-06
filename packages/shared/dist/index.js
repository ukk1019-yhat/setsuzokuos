"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFileSchema = exports.RazorpayWebhookSchema = exports.RazorpayCreateOrderSchema = exports.RecordPaymentSchema = exports.UpdateInvoiceSchema = exports.CreateInvoiceSchema = exports.InvoiceItemInputSchema = exports.DecideApprovalSchema = exports.SubmitDeliverableVersionSchema = exports.CreateDeliverableSchema = exports.CreateSubtaskSchema = exports.CreateTaskCommentSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.UpdateMilestoneSchema = exports.CreateMilestoneSchema = exports.ConvertQuotationToProjectSchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.UpdateQuotationSchema = exports.CreateQuotationSchema = exports.QuotationItemInputSchema = exports.UpdateClientSchema = exports.CreateClientSchema = exports.ConvertLeadToClientSchema = exports.CreateLeadActivitySchema = exports.PublicLeadIntakeSchema = exports.UpdateLeadSchema = exports.CreateLeadSchema = exports.UpdateMemberRoleSchema = exports.InviteMemberSchema = exports.UpdateOrganizationSchema = exports.CreateOrganizationSchema = exports.LoginSchema = exports.RegisterSchema = exports.ROLE_PERMISSIONS = exports.PaymentStatus = exports.PaymentMethod = exports.InvoiceStatus = exports.ApprovalDecision = exports.DeliverableStatus = exports.TaskStatus = exports.ProjectStatus = exports.LeadActivityType = exports.QuotationStatus = exports.Priority = exports.LeadStatus = exports.MembershipRole = void 0;
exports.hasPermission = hasPermission;
const zod_1 = require("zod");
// ==========================================
// 1. RBAC ROLES & PERMISSIONS
// ==========================================
var MembershipRole;
(function (MembershipRole) {
    MembershipRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    MembershipRole["ORGANIZATION_OWNER"] = "ORGANIZATION_OWNER";
    MembershipRole["ADMIN"] = "ADMIN";
    MembershipRole["MANAGER"] = "MANAGER";
    MembershipRole["EMPLOYEE"] = "EMPLOYEE";
    MembershipRole["FINANCE"] = "FINANCE";
    MembershipRole["CLIENT"] = "CLIENT";
})(MembershipRole || (exports.MembershipRole = MembershipRole = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["QUALIFIED"] = "QUALIFIED";
    LeadStatus["PROPOSAL_SENT"] = "PROPOSAL_SENT";
    LeadStatus["NEGOTIATION"] = "NEGOTIATION";
    LeadStatus["WON"] = "WON";
    LeadStatus["LOST"] = "LOST";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (exports.Priority = Priority = {}));
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "DRAFT";
    QuotationStatus["SENT"] = "SENT";
    QuotationStatus["VIEWED"] = "VIEWED";
    QuotationStatus["ACCEPTED"] = "ACCEPTED";
    QuotationStatus["REJECTED"] = "REJECTED";
    QuotationStatus["EXPIRED"] = "EXPIRED";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
var LeadActivityType;
(function (LeadActivityType) {
    LeadActivityType["NOTE"] = "NOTE";
    LeadActivityType["CALL"] = "CALL";
    LeadActivityType["EMAIL"] = "EMAIL";
    LeadActivityType["STATUS_CHANGE"] = "STATUS_CHANGE";
})(LeadActivityType || (exports.LeadActivityType = LeadActivityType = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["DRAFT"] = "DRAFT";
    ProjectStatus["PLANNING"] = "PLANNING";
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["REVIEW"] = "REVIEW";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["IN_REVIEW"] = "IN_REVIEW";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["BLOCKED"] = "BLOCKED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var DeliverableStatus;
(function (DeliverableStatus) {
    DeliverableStatus["DRAFT"] = "DRAFT";
    DeliverableStatus["INTERNAL_REVIEW"] = "INTERNAL_REVIEW";
    DeliverableStatus["PENDING_CLIENT_APPROVAL"] = "PENDING_CLIENT_APPROVAL";
    DeliverableStatus["APPROVED"] = "APPROVED";
    DeliverableStatus["REVISION_REQUESTED"] = "REVISION_REQUESTED";
})(DeliverableStatus || (exports.DeliverableStatus = DeliverableStatus = {}));
var ApprovalDecision;
(function (ApprovalDecision) {
    ApprovalDecision["PENDING"] = "PENDING";
    ApprovalDecision["APPROVED"] = "APPROVED";
    ApprovalDecision["REVISION_REQUESTED"] = "REVISION_REQUESTED";
})(ApprovalDecision || (exports.ApprovalDecision = ApprovalDecision = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["ISSUED"] = "ISSUED";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["RAZORPAY"] = "RAZORPAY";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["OTHER_MANUAL"] = "OTHER_MANUAL";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["VERIFIED"] = "VERIFIED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
exports.ROLE_PERMISSIONS = {
    [MembershipRole.SUPER_ADMIN]: ['*'],
    [MembershipRole.ORGANIZATION_OWNER]: [
        '*',
    ],
    [MembershipRole.ADMIN]: [
        'org:settings:update',
        'members:invite',
        'leads:read',
        'leads:write',
        'leads:convert',
        'clients:manage',
        'quotations:create',
        'quotations:send',
        'projects:create',
        'projects:manage',
        'projects:view',
        'tasks:create',
        'tasks:manage',
        'tasks:view',
        'tasks:update',
        'deliverables:submit',
        'deliverables:review',
        'invoices:create',
        'invoices:manage',
        'invoices:view',
        'payments:record',
        'payments:view',
        'reports:view',
    ],
    [MembershipRole.MANAGER]: [
        'leads:read',
        'leads:write',
        'clients:manage',
        'projects:create',
        'projects:manage',
        'projects:view',
        'tasks:create',
        'tasks:manage',
        'tasks:view',
        'tasks:update',
        'deliverables:submit',
        'deliverables:review',
        'invoices:view',
        'payments:view',
        'reports:view',
    ],
    [MembershipRole.EMPLOYEE]: [
        'leads:read',
        'projects:view',
        'tasks:view',
        'tasks:update',
        'deliverables:submit',
    ],
    [MembershipRole.FINANCE]: [
        'clients:manage',
        'quotations:create',
        'quotations:send',
        'invoices:create',
        'invoices:manage',
        'invoices:view',
        'payments:record',
        'payments:view',
        'reports:view',
    ],
    [MembershipRole.CLIENT]: [
        'portal:access',
        'projects:view:own',
        'quotations:view:own',
        'quotations:accept:own',
        'deliverables:approve:own',
        'invoices:view:own',
        'payments:initiate:own',
    ],
};
function hasPermission(role, requiredPermission) {
    const permissions = exports.ROLE_PERMISSIONS[role] || [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
}
// ==========================================
// 2. VALIDATION SCHEMAS
// ==========================================
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    organizationName: zod_1.z.string().min(2, 'Organization name must be at least 2 characters').optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.CreateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Business name must be at least 2 characters').max(100),
    currency: zod_1.z.string().min(3).max(3).default('INR'),
    timezone: zod_1.z.string().default('Asia/Kolkata'),
    country: zod_1.z.string().default('IN'),
    businessEmail: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    taxNumber: zod_1.z.string().optional(),
    description: zod_1.z.string().max(500).optional(),
});
exports.UpdateOrganizationSchema = exports.CreateOrganizationSchema.partial();
exports.InviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    fullName: zod_1.z.string().min(2, 'Full name is required'),
    role: zod_1.z.nativeEnum(MembershipRole).default(MembershipRole.EMPLOYEE),
    title: zod_1.z.string().max(100).optional(),
});
exports.UpdateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(MembershipRole),
});
// CRM & LEADS SCHEMAS
exports.CreateLeadSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title or requirement headline is required').max(150),
    contactName: zod_1.z.string().min(2, 'Contact name is required').max(100),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    companyName: zod_1.z.string().optional().or(zod_1.z.literal('')),
    source: zod_1.z.string().default('Website'),
    status: zod_1.z.nativeEnum(LeadStatus).optional(),
    priority: zod_1.z.nativeEnum(Priority).default(Priority.MEDIUM),
    estimatedBudget: zod_1.z.number().nonnegative().optional(),
    expectedClose: zod_1.z.string().optional(),
    serviceRequired: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    assignedToId: zod_1.z.string().optional(),
});
exports.UpdateLeadSchema = exports.CreateLeadSchema.partial().extend({
    status: zod_1.z.nativeEnum(LeadStatus).optional(),
});
exports.PublicLeadIntakeSchema = zod_1.z.object({
    organizationSlug: zod_1.z.string().min(1, 'Organization identifier is required'),
    title: zod_1.z.string().min(2, 'Requirement title is required'),
    contactName: zod_1.z.string().min(2, 'Contact name is required'),
    email: zod_1.z.string().email('Valid email address is required'),
    phone: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    serviceRequired: zod_1.z.string().optional(),
    estimatedBudget: zod_1.z.number().optional(),
});
exports.CreateLeadActivitySchema = zod_1.z.object({
    activityType: zod_1.z.nativeEnum(LeadActivityType),
    description: zod_1.z.string().min(1, 'Activity notes or description required'),
});
exports.ConvertLeadToClientSchema = zod_1.z.object({
    billingAddress: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
    category: zod_1.z.string().default('Standard'),
    notes: zod_1.z.string().optional(),
});
// CLIENT CRM SCHEMAS
exports.CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Client name is required').max(100),
    company: zod_1.z.string().optional().or(zod_1.z.literal('')),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    billingAddress: zod_1.z.string().optional().or(zod_1.z.literal('')),
    taxId: zod_1.z.string().optional().or(zod_1.z.literal('')),
    category: zod_1.z.string().default('Retainer'),
    notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.UpdateClientSchema = exports.CreateClientSchema.partial();
// QUOTATION SCHEMAS
exports.QuotationItemInputSchema = zod_1.z.object({
    serviceName: zod_1.z.string().min(1, 'Service name is required'),
    description: zod_1.z.string().optional().or(zod_1.z.literal('')),
    quantity: zod_1.z.number().positive('Quantity must be greater than 0').default(1),
    unitPrice: zod_1.z.number().nonnegative('Unit price must be 0 or positive'),
});
exports.CreateQuotationSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Valid client ID is required'),
    quoteNumber: zod_1.z.string().optional(),
    validUntil: zod_1.z.string().min(1, 'Validity date is required'),
    paymentTerms: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    discountAmount: zod_1.z.number().nonnegative().default(0),
    taxAmount: zod_1.z.number().nonnegative().default(0),
    items: zod_1.z.array(exports.QuotationItemInputSchema).min(1, 'Quotation must have at least one line item'),
});
exports.UpdateQuotationSchema = exports.CreateQuotationSchema.partial().extend({
    status: zod_1.z.nativeEnum(QuotationStatus).optional(),
});
// PROJECT SCHEMAS
exports.CreateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Project name is required').max(150),
    code: zod_1.z.string().optional(),
    clientId: zod_1.z.string().uuid('Valid client ID is required'),
    managerId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().optional(),
    budget: zod_1.z.number().nonnegative().default(0),
    priority: zod_1.z.nativeEnum(Priority).default(Priority.MEDIUM),
    startDate: zod_1.z.string().optional(),
    deadline: zod_1.z.string().optional(),
    relatedQuotationId: zod_1.z.string().uuid().optional(),
});
exports.UpdateProjectSchema = exports.CreateProjectSchema.partial().extend({
    status: zod_1.z.nativeEnum(ProjectStatus).optional(),
});
exports.ConvertQuotationToProjectSchema = zod_1.z.object({
    quotationId: zod_1.z.string().uuid('Valid quotation ID is required'),
    name: zod_1.z.string().optional(),
    managerId: zod_1.z.string().uuid().optional(),
    deadline: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
// MILESTONES & TASKS SCHEMAS
exports.CreateMilestoneSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid('Valid project ID is required'),
    title: zod_1.z.string().min(2, 'Milestone title is required'),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().optional(),
});
exports.UpdateMilestoneSchema = exports.CreateMilestoneSchema.partial().extend({
    isCompleted: zod_1.z.boolean().optional(),
});
exports.CreateTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid('Valid project ID is required'),
    milestoneId: zod_1.z.string().uuid().optional(),
    assignedToId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(2, 'Task title is required'),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.nativeEnum(Priority).default(Priority.MEDIUM),
    dueDate: zod_1.z.string().optional(),
});
exports.UpdateTaskSchema = exports.CreateTaskSchema.partial().extend({
    status: zod_1.z.nativeEnum(TaskStatus).optional(),
});
exports.CreateTaskCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment text is required'),
});
exports.CreateSubtaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Subtask title is required'),
});
// DELIVERABLES & APPROVALS SCHEMAS
exports.CreateDeliverableSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid('Valid project ID is required'),
    title: zod_1.z.string().min(2, 'Deliverable title is required'),
    description: zod_1.z.string().optional(),
});
exports.SubmitDeliverableVersionSchema = zod_1.z.object({
    deliverableId: zod_1.z.string().uuid('Valid deliverable ID is required'),
    storageKey: zod_1.z.string().min(1, 'Storage key / path is required'),
    fileName: zod_1.z.string().min(1, 'File name is required'),
    fileSize: zod_1.z.number().positive(),
    fileMimeType: zod_1.z.string().min(1),
    changelogNotes: zod_1.z.string().optional(),
});
exports.DecideApprovalSchema = zod_1.z.object({
    decision: zod_1.z.nativeEnum(ApprovalDecision),
    comments: zod_1.z.string().optional(),
});
// INVOICE & PAYMENT SCHEMAS
exports.InvoiceItemInputSchema = zod_1.z.object({
    serviceName: zod_1.z.string().min(1, 'Service name is required'),
    description: zod_1.z.string().optional(),
    quantity: zod_1.z.number().positive('Quantity must be greater than 0').default(1),
    unitPrice: zod_1.z.number().min(0, 'Unit price must be non-negative'),
});
exports.CreateInvoiceSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Valid client ID is required'),
    projectId: zod_1.z.string().uuid().optional().nullable(),
    invoiceNumber: zod_1.z.string().optional(),
    issuedDate: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().min(1, 'Due date is required'),
    currency: zod_1.z.string().default('INR'),
    discountAmount: zod_1.z.number().min(0).default(0),
    taxAmount: zod_1.z.number().min(0).default(0),
    notes: zod_1.z.string().optional(),
    paymentTerms: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.InvoiceItemInputSchema).min(1, 'At least one line item is required'),
});
exports.UpdateInvoiceSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(InvoiceStatus).optional(),
    dueDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    paymentTerms: zod_1.z.string().optional(),
});
exports.RecordPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid('Valid invoice ID is required'),
    amount: zod_1.z.number().positive('Payment amount must be greater than 0'),
    currency: zod_1.z.string().default('INR'),
    method: zod_1.z.nativeEnum(PaymentMethod),
    transactionRef: zod_1.z.string().optional(),
    receiptNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    isManual: zod_1.z.boolean().default(true),
});
exports.RazorpayCreateOrderSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid('Valid invoice ID is required'),
    amount: zod_1.z.number().positive('Amount must be positive').optional(),
});
exports.RazorpayWebhookSchema = zod_1.z.object({
    event: zod_1.z.string(),
    payload: zod_1.z.record(zod_1.z.any()),
});
exports.CreateFileSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid().optional().nullable(),
    category: zod_1.z.string().default('GENERAL'),
    originalName: zod_1.z.string().min(1, 'Original file name is required'),
    storageKey: zod_1.z.string().min(1, 'Storage key is required'),
    mimeType: zod_1.z.string().min(1, 'Mime type is required'),
    sizeBytes: zod_1.z.number().positive('File size must be positive'),
});
