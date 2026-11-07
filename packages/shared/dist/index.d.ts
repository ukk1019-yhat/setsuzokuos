/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import { z } from 'zod';
export declare enum MembershipRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ORGANIZATION_OWNER = "ORGANIZATION_OWNER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    EMPLOYEE = "EMPLOYEE",
    FINANCE = "FINANCE",
    CLIENT = "CLIENT"
}
export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    QUALIFIED = "QUALIFIED",
    PROPOSAL_SENT = "PROPOSAL_SENT",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST"
}
export declare enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum QuotationStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    VIEWED = "VIEWED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export declare enum LeadActivityType {
    NOTE = "NOTE",
    CALL = "CALL",
    EMAIL = "EMAIL",
    STATUS_CHANGE = "STATUS_CHANGE"
}
export declare enum ProjectStatus {
    DRAFT = "DRAFT",
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    REVIEW = "REVIEW",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    COMPLETED = "COMPLETED",
    BLOCKED = "BLOCKED"
}
export declare enum DeliverableStatus {
    DRAFT = "DRAFT",
    INTERNAL_REVIEW = "INTERNAL_REVIEW",
    PENDING_CLIENT_APPROVAL = "PENDING_CLIENT_APPROVAL",
    APPROVED = "APPROVED",
    REVISION_REQUESTED = "REVISION_REQUESTED"
}
export declare enum ApprovalDecision {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REVISION_REQUESTED = "REVISION_REQUESTED"
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    ISSUED = "ISSUED",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    RAZORPAY = "RAZORPAY",
    BANK_TRANSFER = "BANK_TRANSFER",
    UPI = "UPI",
    CASH = "CASH",
    OTHER_MANUAL = "OTHER_MANUAL"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare const ROLE_PERMISSIONS: Record<MembershipRole, string[]>;
export declare function hasPermission(role: MembershipRole, requiredPermission: string): boolean;
export declare const RegisterSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    organizationName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    organizationName?: string | undefined;
}, {
    fullName: string;
    email: string;
    password: string;
    organizationName?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const CreateOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    country: z.ZodDefault<z.ZodString>;
    businessEmail: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    taxNumber: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    currency: string;
    timezone: string;
    country: string;
    businessEmail?: string | undefined;
    phone?: string | undefined;
    taxNumber?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    currency?: string | undefined;
    timezone?: string | undefined;
    country?: string | undefined;
    businessEmail?: string | undefined;
    phone?: string | undefined;
    taxNumber?: string | undefined;
    description?: string | undefined;
}>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export declare const UpdateOrganizationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    businessEmail: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    taxNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    country?: string | undefined;
    businessEmail?: string | undefined;
    phone?: string | undefined;
    taxNumber?: string | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    country?: string | undefined;
    businessEmail?: string | undefined;
    phone?: string | undefined;
    taxNumber?: string | undefined;
    description?: string | undefined;
}>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export declare const InviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    fullName: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof MembershipRole>>;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    role: MembershipRole;
    title?: string | undefined;
}, {
    fullName: string;
    email: string;
    role?: MembershipRole | undefined;
    title?: string | undefined;
}>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export declare const UpdateMemberRoleSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof MembershipRole>;
}, "strip", z.ZodTypeAny, {
    role: MembershipRole;
}, {
    role: MembershipRole;
}>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export declare const CreateLeadSchema: z.ZodObject<{
    title: z.ZodString;
    contactName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    companyName: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    source: z.ZodDefault<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof LeadStatus>>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof Priority>>;
    estimatedBudget: z.ZodOptional<z.ZodNumber>;
    expectedClose: z.ZodOptional<z.ZodString>;
    serviceRequired: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assignedToId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    title: string;
    contactName: string;
    source: string;
    priority: Priority;
    tags: string[];
    status?: LeadStatus | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    estimatedBudget?: number | undefined;
    expectedClose?: string | undefined;
    serviceRequired?: string | undefined;
    notes?: string | undefined;
    assignedToId?: string | undefined;
}, {
    email: string;
    title: string;
    contactName: string;
    status?: LeadStatus | undefined;
    phone?: string | undefined;
    companyName?: string | undefined;
    source?: string | undefined;
    priority?: Priority | undefined;
    estimatedBudget?: number | undefined;
    expectedClose?: string | undefined;
    serviceRequired?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    assignedToId?: string | undefined;
}>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export declare const UpdateLeadSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    companyName: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof Priority>>>;
    estimatedBudget: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    expectedClose: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    serviceRequired: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    assignedToId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof LeadStatus>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    status?: LeadStatus | undefined;
    phone?: string | undefined;
    title?: string | undefined;
    contactName?: string | undefined;
    companyName?: string | undefined;
    source?: string | undefined;
    priority?: Priority | undefined;
    estimatedBudget?: number | undefined;
    expectedClose?: string | undefined;
    serviceRequired?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    assignedToId?: string | undefined;
}, {
    email?: string | undefined;
    status?: LeadStatus | undefined;
    phone?: string | undefined;
    title?: string | undefined;
    contactName?: string | undefined;
    companyName?: string | undefined;
    source?: string | undefined;
    priority?: Priority | undefined;
    estimatedBudget?: number | undefined;
    expectedClose?: string | undefined;
    serviceRequired?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    assignedToId?: string | undefined;
}>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export declare const PublicLeadIntakeSchema: z.ZodObject<{
    organizationSlug: z.ZodString;
    title: z.ZodString;
    contactName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    serviceRequired: z.ZodOptional<z.ZodString>;
    estimatedBudget: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    title: string;
    contactName: string;
    organizationSlug: string;
    phone?: string | undefined;
    companyName?: string | undefined;
    estimatedBudget?: number | undefined;
    serviceRequired?: string | undefined;
}, {
    email: string;
    title: string;
    contactName: string;
    organizationSlug: string;
    phone?: string | undefined;
    companyName?: string | undefined;
    estimatedBudget?: number | undefined;
    serviceRequired?: string | undefined;
}>;
export type PublicLeadIntakeInput = z.infer<typeof PublicLeadIntakeSchema>;
export declare const CreateLeadActivitySchema: z.ZodObject<{
    activityType: z.ZodNativeEnum<typeof LeadActivityType>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    activityType: LeadActivityType;
}, {
    description: string;
    activityType: LeadActivityType;
}>;
export type CreateLeadActivityInput = z.infer<typeof CreateLeadActivitySchema>;
export declare const ConvertLeadToClientSchema: z.ZodObject<{
    billingAddress: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    category: z.ZodDefault<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category: string;
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
}, {
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
    category?: string | undefined;
}>;
export type ConvertLeadToClientInput = z.infer<typeof ConvertLeadToClientSchema>;
export declare const CreateClientSchema: z.ZodObject<{
    name: z.ZodString;
    company: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    email: z.ZodString;
    phone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    billingAddress: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    taxId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    category: z.ZodDefault<z.ZodString>;
    notes: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    name: string;
    category: string;
    phone?: string | undefined;
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
    company?: string | undefined;
}, {
    email: string;
    name: string;
    phone?: string | undefined;
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
    category?: string | undefined;
    company?: string | undefined;
}>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export declare const UpdateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    billingAddress: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    taxId: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    category: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    notes: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
    category?: string | undefined;
    company?: string | undefined;
}, {
    email?: string | undefined;
    name?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
    billingAddress?: string | undefined;
    taxId?: string | undefined;
    category?: string | undefined;
    company?: string | undefined;
}>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export declare const QuotationItemInputSchema: z.ZodObject<{
    serviceName: z.ZodString;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    quantity: z.ZodDefault<z.ZodNumber>;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    serviceName: string;
    quantity: number;
    unitPrice: number;
    description?: string | undefined;
}, {
    serviceName: string;
    unitPrice: number;
    description?: string | undefined;
    quantity?: number | undefined;
}>;
export type QuotationItemInput = z.infer<typeof QuotationItemInputSchema>;
export declare const CreateQuotationSchema: z.ZodObject<{
    clientId: z.ZodString;
    quoteNumber: z.ZodOptional<z.ZodString>;
    validUntil: z.ZodString;
    paymentTerms: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    discountAmount: z.ZodDefault<z.ZodNumber>;
    taxAmount: z.ZodDefault<z.ZodNumber>;
    items: z.ZodArray<z.ZodObject<{
        serviceName: z.ZodString;
        description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        quantity: z.ZodDefault<z.ZodNumber>;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }, {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    validUntil: string;
    discountAmount: number;
    taxAmount: number;
    items: {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }[];
    notes?: string | undefined;
    quoteNumber?: string | undefined;
    paymentTerms?: string | undefined;
}, {
    clientId: string;
    validUntil: string;
    items: {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }[];
    notes?: string | undefined;
    quoteNumber?: string | undefined;
    paymentTerms?: string | undefined;
    discountAmount?: number | undefined;
    taxAmount?: number | undefined;
}>;
export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;
export declare const UpdateQuotationSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    quoteNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    validUntil: z.ZodOptional<z.ZodString>;
    paymentTerms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    discountAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    taxAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        serviceName: z.ZodString;
        description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        quantity: z.ZodDefault<z.ZodNumber>;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }, {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }>, "many">>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof QuotationStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: QuotationStatus | undefined;
    notes?: string | undefined;
    clientId?: string | undefined;
    quoteNumber?: string | undefined;
    validUntil?: string | undefined;
    paymentTerms?: string | undefined;
    discountAmount?: number | undefined;
    taxAmount?: number | undefined;
    items?: {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }[] | undefined;
}, {
    status?: QuotationStatus | undefined;
    notes?: string | undefined;
    clientId?: string | undefined;
    quoteNumber?: string | undefined;
    validUntil?: string | undefined;
    paymentTerms?: string | undefined;
    discountAmount?: number | undefined;
    taxAmount?: number | undefined;
    items?: {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }[] | undefined;
}>;
export type UpdateQuotationInput = z.infer<typeof UpdateQuotationSchema>;
export declare const CreateProjectSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    clientId: z.ZodString;
    managerId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    budget: z.ZodDefault<z.ZodNumber>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof Priority>>;
    startDate: z.ZodOptional<z.ZodString>;
    deadline: z.ZodOptional<z.ZodString>;
    relatedQuotationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: Priority;
    clientId: string;
    budget: number;
    code?: string | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    relatedQuotationId?: string | undefined;
}, {
    name: string;
    clientId: string;
    code?: string | undefined;
    description?: string | undefined;
    priority?: Priority | undefined;
    managerId?: string | undefined;
    budget?: number | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    relatedQuotationId?: string | undefined;
}>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export declare const UpdateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    clientId: z.ZodOptional<z.ZodString>;
    managerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    budget: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof Priority>>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    deadline: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    relatedQuotationId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProjectStatus>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    priority?: Priority | undefined;
    clientId?: string | undefined;
    managerId?: string | undefined;
    budget?: number | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    relatedQuotationId?: string | undefined;
}, {
    code?: string | undefined;
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    priority?: Priority | undefined;
    clientId?: string | undefined;
    managerId?: string | undefined;
    budget?: number | undefined;
    startDate?: string | undefined;
    deadline?: string | undefined;
    relatedQuotationId?: string | undefined;
}>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export declare const ConvertQuotationToProjectSchema: z.ZodObject<{
    quotationId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    managerId: z.ZodOptional<z.ZodString>;
    deadline: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    quotationId: string;
    name?: string | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    deadline?: string | undefined;
}, {
    quotationId: string;
    name?: string | undefined;
    description?: string | undefined;
    managerId?: string | undefined;
    deadline?: string | undefined;
}>;
export type ConvertQuotationToProjectInput = z.infer<typeof ConvertQuotationToProjectSchema>;
export declare const CreateMilestoneSchema: z.ZodObject<{
    projectId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    projectId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    dueDate?: string | undefined;
}>;
export type CreateMilestoneInput = z.infer<typeof CreateMilestoneSchema>;
export declare const UpdateMilestoneSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isCompleted: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    dueDate?: string | undefined;
    isCompleted?: boolean | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    projectId?: string | undefined;
    dueDate?: string | undefined;
    isCompleted?: boolean | undefined;
}>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
export declare const CreateTaskSchema: z.ZodObject<{
    projectId: z.ZodString;
    milestoneId: z.ZodOptional<z.ZodString>;
    assignedToId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof Priority>>;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    priority: Priority;
    projectId: string;
    description?: string | undefined;
    assignedToId?: string | undefined;
    dueDate?: string | undefined;
    milestoneId?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
    priority?: Priority | undefined;
    assignedToId?: string | undefined;
    dueDate?: string | undefined;
    milestoneId?: string | undefined;
}>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export declare const UpdateTaskSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    milestoneId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    assignedToId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof Priority>>>;
    dueDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: TaskStatus | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: Priority | undefined;
    assignedToId?: string | undefined;
    projectId?: string | undefined;
    dueDate?: string | undefined;
    milestoneId?: string | undefined;
}, {
    status?: TaskStatus | undefined;
    description?: string | undefined;
    title?: string | undefined;
    priority?: Priority | undefined;
    assignedToId?: string | undefined;
    projectId?: string | undefined;
    dueDate?: string | undefined;
    milestoneId?: string | undefined;
}>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export declare const CreateTaskCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type CreateTaskCommentInput = z.infer<typeof CreateTaskCommentSchema>;
export declare const CreateSubtaskSchema: z.ZodObject<{
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
}, {
    title: string;
}>;
export type CreateSubtaskInput = z.infer<typeof CreateSubtaskSchema>;
export declare const CreateDeliverableSchema: z.ZodObject<{
    projectId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    projectId: string;
    description?: string | undefined;
}, {
    title: string;
    projectId: string;
    description?: string | undefined;
}>;
export type CreateDeliverableInput = z.infer<typeof CreateDeliverableSchema>;
export declare const SubmitDeliverableVersionSchema: z.ZodObject<{
    deliverableId: z.ZodString;
    storageKey: z.ZodString;
    fileName: z.ZodString;
    fileSize: z.ZodNumber;
    fileMimeType: z.ZodString;
    changelogNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    deliverableId: string;
    storageKey: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    changelogNotes?: string | undefined;
}, {
    deliverableId: string;
    storageKey: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    changelogNotes?: string | undefined;
}>;
export type SubmitDeliverableVersionInput = z.infer<typeof SubmitDeliverableVersionSchema>;
export declare const DecideApprovalSchema: z.ZodObject<{
    decision: z.ZodNativeEnum<typeof ApprovalDecision>;
    comments: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    decision: ApprovalDecision;
    comments?: string | undefined;
}, {
    decision: ApprovalDecision;
    comments?: string | undefined;
}>;
export type DecideApprovalInput = z.infer<typeof DecideApprovalSchema>;
export declare const InvoiceItemInputSchema: z.ZodObject<{
    serviceName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    unitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    serviceName: string;
    quantity: number;
    unitPrice: number;
    description?: string | undefined;
}, {
    serviceName: string;
    unitPrice: number;
    description?: string | undefined;
    quantity?: number | undefined;
}>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;
export declare const CreateInvoiceSchema: z.ZodObject<{
    clientId: z.ZodString;
    projectId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    invoiceNumber: z.ZodOptional<z.ZodString>;
    issuedDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
    discountAmount: z.ZodDefault<z.ZodNumber>;
    taxAmount: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    paymentTerms: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        serviceName: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        quantity: z.ZodDefault<z.ZodNumber>;
        unitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }, {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    currency: string;
    clientId: string;
    discountAmount: number;
    taxAmount: number;
    items: {
        serviceName: string;
        quantity: number;
        unitPrice: number;
        description?: string | undefined;
    }[];
    dueDate: string;
    notes?: string | undefined;
    paymentTerms?: string | undefined;
    projectId?: string | null | undefined;
    invoiceNumber?: string | undefined;
    issuedDate?: string | undefined;
}, {
    clientId: string;
    items: {
        serviceName: string;
        unitPrice: number;
        description?: string | undefined;
        quantity?: number | undefined;
    }[];
    dueDate: string;
    currency?: string | undefined;
    notes?: string | undefined;
    paymentTerms?: string | undefined;
    discountAmount?: number | undefined;
    taxAmount?: number | undefined;
    projectId?: string | null | undefined;
    invoiceNumber?: string | undefined;
    issuedDate?: string | undefined;
}>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export declare const UpdateInvoiceSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof InvoiceStatus>>;
    dueDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    paymentTerms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: InvoiceStatus | undefined;
    notes?: string | undefined;
    paymentTerms?: string | undefined;
    dueDate?: string | undefined;
}, {
    status?: InvoiceStatus | undefined;
    notes?: string | undefined;
    paymentTerms?: string | undefined;
    dueDate?: string | undefined;
}>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export declare const RecordPaymentSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    method: z.ZodNativeEnum<typeof PaymentMethod>;
    transactionRef: z.ZodOptional<z.ZodString>;
    receiptNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    isManual: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    isManual: boolean;
    notes?: string | undefined;
    transactionRef?: string | undefined;
    receiptNumber?: string | undefined;
}, {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    currency?: string | undefined;
    notes?: string | undefined;
    transactionRef?: string | undefined;
    receiptNumber?: string | undefined;
    isManual?: boolean | undefined;
}>;
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
export declare const RazorpayCreateOrderSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    invoiceId: string;
    amount?: number | undefined;
}, {
    invoiceId: string;
    amount?: number | undefined;
}>;
export type RazorpayCreateOrderInput = z.infer<typeof RazorpayCreateOrderSchema>;
export declare const RazorpayWebhookSchema: z.ZodObject<{
    event: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    event: string;
    payload: Record<string, any>;
}, {
    event: string;
    payload: Record<string, any>;
}>;
export type RazorpayWebhookInput = z.infer<typeof RazorpayWebhookSchema>;
export declare const CreateFileSchema: z.ZodObject<{
    projectId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    category: z.ZodDefault<z.ZodString>;
    originalName: z.ZodString;
    storageKey: z.ZodString;
    mimeType: z.ZodString;
    sizeBytes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: string;
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    projectId?: string | null | undefined;
}, {
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    category?: string | undefined;
    projectId?: string | null | undefined;
}>;
export type CreateFileInput = z.infer<typeof CreateFileSchema>;
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
export interface NotificationDto {
    id: string;
    organizationId: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string | null;
    isRead: boolean;
    createdAt: string;
}
export interface FileRecordDto {
    id: string;
    organizationId: string;
    projectId?: string | null;
    projectName?: string | null;
    category: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    downloadUrl: string;
    uploadedById?: string | null;
    createdAt: string;
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
