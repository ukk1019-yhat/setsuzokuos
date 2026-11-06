import { z } from 'zod';

// ==========================================
// 1. RBAC ROLES & PERMISSIONS
// ==========================================

export enum MembershipRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORGANIZATION_OWNER = 'ORGANIZATION_OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  FINANCE = 'FINANCE',
  CLIENT = 'CLIENT',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum LeadActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  STATUS_CHANGE = 'STATUS_CHANGE',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

export enum DeliverableStatus {
  DRAFT = 'DRAFT',
  INTERNAL_REVIEW = 'INTERNAL_REVIEW',
  PENDING_CLIENT_APPROVAL = 'PENDING_CLIENT_APPROVAL',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum ApprovalDecision {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CASH = 'CASH',
  OTHER_MANUAL = 'OTHER_MANUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export const ROLE_PERMISSIONS: Record<MembershipRole, string[]> = {
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

export function hasPermission(role: MembershipRole, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes('*') || permissions.includes(requiredPermission);
}

// ==========================================
// 2. VALIDATION SCHEMAS
// ==========================================

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  currency: z.string().min(3).max(3).default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  country: z.string().default('IN'),
  businessEmail: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  description: z.string().max(500).optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.nativeEnum(MembershipRole).default(MembershipRole.EMPLOYEE),
  title: z.string().max(100).optional(),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: z.nativeEnum(MembershipRole),
});

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

// CRM & LEADS SCHEMAS
export const CreateLeadSchema = z.object({
  title: z.string().min(2, 'Title or requirement headline is required').max(150),
  contactName: z.string().min(2, 'Contact name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().or(z.literal('')),
  companyName: z.string().optional().or(z.literal('')),
  source: z.string().default('Website'),
  status: z.nativeEnum(LeadStatus).optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  estimatedBudget: z.number().nonnegative().optional(),
  expectedClose: z.string().optional(),
  serviceRequired: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  assignedToId: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  status: z.nativeEnum(LeadStatus).optional(),
});
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;

export const PublicLeadIntakeSchema = z.object({
  organizationSlug: z.string().min(1, 'Organization identifier is required'),
  title: z.string().min(2, 'Requirement title is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  serviceRequired: z.string().optional(),
  estimatedBudget: z.number().optional(),
});
export type PublicLeadIntakeInput = z.infer<typeof PublicLeadIntakeSchema>;

export const CreateLeadActivitySchema = z.object({
  activityType: z.nativeEnum(LeadActivityType),
  description: z.string().min(1, 'Activity notes or description required'),
});
export type CreateLeadActivityInput = z.infer<typeof CreateLeadActivitySchema>;

export const ConvertLeadToClientSchema = z.object({
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  category: z.string().default('Standard'),
  notes: z.string().optional(),
});
export type ConvertLeadToClientInput = z.infer<typeof ConvertLeadToClientSchema>;

// CLIENT CRM SCHEMAS
export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Client name is required').max(100),
  company: z.string().optional().or(z.literal('')),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  taxId: z.string().optional().or(z.literal('')),
  category: z.string().default('Retainer'),
  notes: z.string().optional().or(z.literal('')),
});
export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = CreateClientSchema.partial();
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

// QUOTATION SCHEMAS
export const QuotationItemInputSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  description: z.string().optional().or(z.literal('')),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.number().nonnegative('Unit price must be 0 or positive'),
});
export type QuotationItemInput = z.infer<typeof QuotationItemInputSchema>;

export const CreateQuotationSchema = z.object({
  clientId: z.string().uuid('Valid client ID is required'),
  quoteNumber: z.string().optional(),
  validUntil: z.string().min(1, 'Validity date is required'),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  items: z.array(QuotationItemInputSchema).min(1, 'Quotation must have at least one line item'),
});
export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;

export const UpdateQuotationSchema = CreateQuotationSchema.partial().extend({
  status: z.nativeEnum(QuotationStatus).optional(),
});
export type UpdateQuotationInput = z.infer<typeof UpdateQuotationSchema>;

// PROJECT SCHEMAS
export const CreateProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(150),
  code: z.string().optional(),
  clientId: z.string().uuid('Valid client ID is required'),
  managerId: z.string().uuid().optional(),
  description: z.string().optional(),
  budget: z.number().nonnegative().default(0),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  relatedQuotationId: z.string().uuid().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export const ConvertQuotationToProjectSchema = z.object({
  quotationId: z.string().uuid('Valid quotation ID is required'),
  name: z.string().optional(),
  managerId: z.string().uuid().optional(),
  deadline: z.string().optional(),
  description: z.string().optional(),
});
export type ConvertQuotationToProjectInput = z.infer<typeof ConvertQuotationToProjectSchema>;

// MILESTONES & TASKS SCHEMAS
export const CreateMilestoneSchema = z.object({
  projectId: z.string().uuid('Valid project ID is required'),
  title: z.string().min(2, 'Milestone title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});
export type CreateMilestoneInput = z.infer<typeof CreateMilestoneSchema>;

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial().extend({
  isCompleted: z.boolean().optional(),
});
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;

export const CreateTaskSchema = z.object({
  projectId: z.string().uuid('Valid project ID is required'),
  milestoneId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z.nativeEnum(TaskStatus).optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const CreateTaskCommentSchema = z.object({
  content: z.string().min(1, 'Comment text is required'),
});
export type CreateTaskCommentInput = z.infer<typeof CreateTaskCommentSchema>;

export const CreateSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required'),
});
export type CreateSubtaskInput = z.infer<typeof CreateSubtaskSchema>;

// DELIVERABLES & APPROVALS SCHEMAS
export const CreateDeliverableSchema = z.object({
  projectId: z.string().uuid('Valid project ID is required'),
  title: z.string().min(2, 'Deliverable title is required'),
  description: z.string().optional(),
});
export type CreateDeliverableInput = z.infer<typeof CreateDeliverableSchema>;

export const SubmitDeliverableVersionSchema = z.object({
  deliverableId: z.string().uuid('Valid deliverable ID is required'),
  storageKey: z.string().min(1, 'Storage key / path is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive(),
  fileMimeType: z.string().min(1),
  changelogNotes: z.string().optional(),
});
export type SubmitDeliverableVersionInput = z.infer<typeof SubmitDeliverableVersionSchema>;

export const DecideApprovalSchema = z.object({
  decision: z.nativeEnum(ApprovalDecision),
  comments: z.string().optional(),
});
export type DecideApprovalInput = z.infer<typeof DecideApprovalSchema>;

// INVOICE & PAYMENT SCHEMAS
export const InvoiceItemInputSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});
export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;

export const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid('Valid client ID is required'),
  projectId: z.string().uuid().optional().nullable(),
  invoiceNumber: z.string().optional(),
  issuedDate: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().default('INR'),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  items: z.array(InvoiceItemInputSchema).min(1, 'At least one line item is required'),
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().uuid('Valid invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  currency: z.string().default('INR'),
  method: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().optional(),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  isManual: z.boolean().default(true),
});
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;

export const RazorpayCreateOrderSchema = z.object({
  invoiceId: z.string().uuid('Valid invoice ID is required'),
  amount: z.number().positive('Amount must be positive').optional(),
});
export type RazorpayCreateOrderInput = z.infer<typeof RazorpayCreateOrderSchema>;

export const RazorpayWebhookSchema = z.object({
  event: z.string(),
  payload: z.record(z.any()),
});
export type RazorpayWebhookInput = z.infer<typeof RazorpayWebhookSchema>;

// ==========================================
// 3. COMMON INTERFACES & DTOs
// ==========================================

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  country: string;
  businessEmail?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
}

export interface MembershipDto {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  title?: string | null;
  isActive: boolean;
  joinedAt: string;
  organization?: OrganizationDto;
  user?: UserDto;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  organizations: Array<{
    organization: OrganizationDto;
    role: MembershipRole;
  }>;
  activeOrganizationId?: string;
}

export interface LeadActivityDto {
  id: string;
  leadId: string;
  activityType: LeadActivityType;
  description: string;
  createdAt: string;
}

export interface LeadDto {
  id: string;
  organizationId: string;
  title: string;
  contactName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  source?: string | null;
  status: LeadStatus;
  priority: Priority;
  estimatedBudget?: number | null;
  expectedClose?: string | null;
  serviceRequired?: string | null;
  notes?: string | null;
  tags: string[];
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  convertedToClientId?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivityDto[];
}

export interface ClientDto {
  id: string;
  organizationId: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  billingAddress?: string | null;
  taxId?: string | null;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalQuotations: number;
    totalProjects: number;
    totalInvoiced: number;
  };
}

export interface QuotationItemDto {
  id: string;
  quotationId: string;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationDto {
  id: string;
  organizationId: string;
  clientId: string;
  client?: ClientDto;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
  };
  quoteNumber: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
  paymentTerms?: string | null;
  notes?: string | null;
  convertedProjectId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuotationItemDto[];
}

export interface MilestoneDto {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface SubtaskDto {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface TaskCommentDto {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
}

export interface TaskDto {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: SubtaskDto[];
  comments?: TaskCommentDto[];
}

export interface ApprovalDto {
  id: string;
  deliverableVersionId: string;
  approverType: string;
  approverUserId?: string | null;
  approverName?: string | null;
  decision: ApprovalDecision;
  comments?: string | null;
  ipAddress?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface DeliverableVersionDto {
  id: string;
  deliverableId: string;
  versionNumber: number;
  storageKey: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  changelogNotes?: string | null;
  submittedAt: string;
  approvals: ApprovalDto[];
}

export interface DeliverableDto {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  currentStatus: DeliverableStatus;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  versions?: DeliverableVersionDto[];
}

export interface ProjectDto {
  id: string;
  organizationId: string;
  clientId: string;
  client?: ClientDto;
  managerId?: string | null;
  manager?: {
    id: string;
    fullName: string;
  } | null;
  name: string;
  code: string;
  description?: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  startDate?: string | null;
  deadline?: string | null;
  completedAt?: string | null;
  relatedQuotationId?: string | null;
  progressPercentage?: number;
  createdAt: string;
  updatedAt: string;
  milestones?: MilestoneDto[];
  tasks?: TaskDto[];
  deliverables?: DeliverableDto[];
}

export interface InvoiceItemDto {
  id: string;
  invoiceId: string;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceDto {
  id: string;
  organizationId: string;
  clientId: string;
  client?: ClientDto;
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    code: string;
  } | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  notes?: string | null;
  paymentTerms?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItemDto[];
  payments?: PaymentDto[];
}

export interface PaymentDto {
  id: string;
  organizationId: string;
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  isManual: boolean;
  transactionRef?: string | null;
  gatewayOrderId?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  verifiedAt?: string | null;
  recordedById?: string | null;
  createdAt: string;
}

export interface BusinessOverviewReportDto {
  totalRevenue: number;
  totalInvoiced: number;
  outstandingBalance: number;
  activeProjectsCount: number;
  leadsMetrics: {
    total: number;
    won: number;
    lost: number;
    winRate: number;
  };
  pipelineValue: number;
  agingReceivables: {
    current: number;
    overdue30: number;
    overdue60: number;
  };
  recentInvoices: InvoiceDto[];
  recentPayments: PaymentDto[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

