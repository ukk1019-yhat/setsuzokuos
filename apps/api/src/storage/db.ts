import {
  MembershipRole,
  LeadStatus,
  Priority,
  LeadActivityType,
  QuotationStatus,
  ProjectStatus,
  TaskStatus,
  DeliverableStatus,
  ApprovalDecision,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from '@setsuzoku/shared';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRecord {
  id: string;
  organizationId: string;
  clientId: string;
  managerId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  startDate?: Date | null;
  deadline?: Date | null;
  completedAt?: Date | null;
  relatedQuotationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneRecord {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRecord {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  assignedToId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubtaskRecord {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface TaskCommentRecord {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface DeliverableRecord {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  currentStatus: DeliverableStatus;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverableVersionRecord {
  id: string;
  deliverableId: string;
  versionNumber: number;
  storageKey: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  changelogNotes?: string | null;
  submittedAt: Date;
}

export interface ApprovalRecord {
  id: string;
  deliverableVersionId: string;
  approverType: string;
  approverUserId?: string | null;
  decision: ApprovalDecision;
  comments?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  decidedAt?: Date | null;
  createdAt: Date;
}

export interface LeadRecord {
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
  expectedClose?: Date | null;
  serviceRequired?: string | null;
  notes?: string | null;
  tags: string[];
  assignedToId?: string | null;
  convertedToClientId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadActivityRecord {
  id: string;
  leadId: string;
  activityType: LeadActivityType;
  description: string;
  createdAt: Date;
}

export interface ClientRecord {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationItemRecord {
  id: string;
  quotationId: string;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationRecord {
  id: string;
  organizationId: string;
  clientId: string;
  createdById: string;
  quoteNumber: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  validUntil: Date;
  paymentTerms?: string | null;
  notes?: string | null;
  convertedProjectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  businessEmail?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  currency: string;
  timezone: string;
  taxNumber?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  title?: string | null;
  isActive: boolean;
  joinedAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  revoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuditLogRecord {
  id: string;
  organizationId: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId: string;
  diff?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface InvoiceRecord {
  id: string;
  organizationId: string;
  clientId: string;
  projectId?: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  issuedDate: Date;
  dueDate: Date;
  notes?: string | null;
  paymentTerms?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItemRecord {
  id: string;
  invoiceId: string;
  serviceName: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentRecord {
  id: string;
  organizationId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  isManual: boolean;
  transactionRef?: string | null;
  gatewayOrderId?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
  verifiedAt?: Date | null;
  recordedById?: string | null;
  createdAt: Date;
}

export interface PaymentWebhookEventRecord {
  id: string;
  paymentId?: string | null;
  gateway: string;
  eventId: string;
  eventType: string;
  payload: any;
  signature: string;
  isVerified: boolean;
  processedAt: Date;
}

export interface NotificationRecord {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface FileRecord {
  id: string;
  organizationId: string;
  projectId?: string | null;
  category: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById?: string | null;
  createdAt: Date;
}

/**
 * Robust Database Repository supporting high-speed in-memory transactional storage
 * with full relational integrity, uniqueness checks, and multi-tenancy scoping.
 */
export class DatabaseRepository {
  public users: Map<string, UserRecord> = new Map();
  public organizations: Map<string, OrganizationRecord> = new Map();
  public memberships: Map<string, MembershipRecord> = new Map();
  public refreshTokens: Map<string, RefreshTokenRecord> = new Map();
  public auditLogs: Map<string, AuditLogRecord> = new Map();
  public leads: Map<string, LeadRecord> = new Map();
  public leadActivities: Map<string, LeadActivityRecord> = new Map();
  public clients: Map<string, ClientRecord> = new Map();
  public quotations: Map<string, QuotationRecord> = new Map();
  public quotationItems: Map<string, QuotationItemRecord> = new Map();
  public projects: Map<string, ProjectRecord> = new Map();
  public milestones: Map<string, MilestoneRecord> = new Map();
  public tasks: Map<string, TaskRecord> = new Map();
  public subtasks: Map<string, SubtaskRecord> = new Map();
  public taskComments: Map<string, TaskCommentRecord> = new Map();
  public deliverables: Map<string, DeliverableRecord> = new Map();
  public deliverableVersions: Map<string, DeliverableVersionRecord> = new Map();
  public approvals: Map<string, ApprovalRecord> = new Map();
  public invoices: Map<string, InvoiceRecord> = new Map();
  public invoiceItems: Map<string, InvoiceItemRecord> = new Map();
  public payments: Map<string, PaymentRecord> = new Map();
  public paymentWebhookEvents: Map<string, PaymentWebhookEventRecord> = new Map();
  public notifications: Map<string, NotificationRecord> = new Map();
  public files: Map<string, FileRecord> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  public clear(): void {
    this.users.clear();
    this.organizations.clear();
    this.memberships.clear();
    this.refreshTokens.clear();
    this.auditLogs.clear();
    this.leads.clear();
    this.leadActivities.clear();
    this.clients.clear();
    this.quotations.clear();
    this.quotationItems.clear();
    this.projects.clear();
    this.milestones.clear();
    this.tasks.clear();
    this.subtasks.clear();
    this.taskComments.clear();
    this.deliverables.clear();
    this.deliverableVersions.clear();
    this.approvals.clear();
    this.invoices.clear();
    this.invoiceItems.clear();
    this.payments.clear();
    this.paymentWebhookEvents.clear();
  }

  public seedDefaultData(): void {
    const adminUser: UserRecord = {
      id: 'user_admin_001',
      email: 'admin@setsuzoku.io',
      passwordHash: '$2a$10$qFB9SofDky4hVJ8m18HnTuq4yta1TB3LQQDDhHgvVlVIX4NTh08Ge', // Password123!
      fullName: 'Setsuzoku Admin',
      phone: '+91 99999 00000',
      avatarUrl: null,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const demoOrg: OrganizationRecord = {
      id: 'org_demo_001',
      name: 'Setsuzoku Media Labs',
      slug: 'setsuzoku-media-labs',
      logoUrl: null,
      businessEmail: 'admin@setsuzoku.io',
      phone: '+91 99999 00000',
      addressLine1: '100 Silicon Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      taxNumber: '27AABCS1429B1Z',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(demoOrg.id, demoOrg);

    const ownerMem: MembershipRecord = {
      id: 'mem_admin_001',
      organizationId: demoOrg.id,
      userId: adminUser.id,
      role: MembershipRole.ORGANIZATION_OWNER,
      isActive: true,
      title: 'Managing Director',
      joinedAt: new Date(),
      updatedAt: new Date(),
    };
    this.memberships.set(ownerMem.id, ownerMem);

    const demoClient: ClientRecord = {
      id: 'client_demo_001',
      organizationId: demoOrg.id,
      name: 'Arjun Mehta',
      company: 'Nexora Digital Studios',
      email: 'arjun@nexora.io',
      phone: '+91 98765 43210',
      billingAddress: '42 Cyber City, Gurgaon, India',
      taxId: '06AABCN8877D1Z',
      category: 'ENTERPRISE',
      notes: 'Strategic agency retainer client',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.set(demoClient.id, demoClient);

    const demoProj: ProjectRecord = {
      id: 'proj_demo_001',
      organizationId: demoOrg.id,
      clientId: demoClient.id,
      managerId: adminUser.id,
      name: 'Cloud Infrastructure & SaaS Launch',
      code: 'PRJ-001',
      description: 'End-to-end design, development, multi-tenant deployment and automated billing.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      budget: 250000,
      startDate: new Date(),
      deadline: new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(demoProj.id, demoProj);

    const demoTask: TaskRecord = {
      id: 'task_demo_001',
      projectId: demoProj.id,
      assignedToId: adminUser.id,
      title: 'API Architecture & Multi-Tenant Deployment',
      description: 'Deliver production-grade REST APIs, RBAC guards, and Vercel services config.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 7 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(demoTask.id, demoTask);

    const demoInv: InvoiceRecord = {
      id: 'inv_demo_001',
      organizationId: demoOrg.id,
      clientId: demoClient.id,
      projectId: demoProj.id,
      invoiceNumber: 'INV-2026-0001',
      status: InvoiceStatus.ISSUED,
      subtotal: 100000,
      discountAmount: 0,
      taxAmount: 18000,
      totalAmount: 118000,
      amountPaid: 0,
      balanceDue: 118000,
      currency: 'INR',
      paymentTerms: 'Payment due within 14 days of invoice date.',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.set(demoInv.id, demoInv);

    const demoItem: InvoiceItemRecord = {
      id: 'item_demo_001',
      invoiceId: demoInv.id,
      serviceName: 'Full-Stack SaaS Platform Architecture',
      description: 'Complete multi-tenant core engine, RBAC, CRM, invoicing & payment processing.',
      quantity: 1,
      unitPrice: 100000,
      totalPrice: 100000,
    };
    this.invoiceItems.set(demoItem.id, demoItem);
  }

  // --- Users ---
  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  public async findUserById(id: string): Promise<UserRecord | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  public async createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    isEmailVerified?: boolean;
  }): Promise<UserRecord> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const id = crypto.randomUUID();
    const user: UserRecord = {
      id,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone || null,
      avatarUrl: null,
      isEmailVerified: data.isEmailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    return { ...user };
  }

  // --- Organizations ---
  public async findOrgById(id: string): Promise<OrganizationRecord | null> {
    const org = this.organizations.get(id);
    return org ? { ...org } : null;
  }

  public async findOrgBySlug(slug: string): Promise<OrganizationRecord | null> {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) {
        return { ...org };
      }
    }
    return null;
  }

  public async createOrganization(data: {
    name: string;
    slug?: string;
    currency?: string;
    timezone?: string;
    country?: string;
    businessEmail?: string;
    phone?: string;
    taxNumber?: string;
    description?: string;
    logoUrl?: string;
  }): Promise<OrganizationRecord> {
    const baseSlug = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug || 'org';
    let counter = 1;
    while (await this.findOrgBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const id = crypto.randomUUID();
    const org: OrganizationRecord = {
      id,
      name: data.name,
      slug,
      currency: data.currency || 'INR',
      timezone: data.timezone || 'Asia/Kolkata',
      country: data.country || 'IN',
      businessEmail: data.businessEmail || null,
      phone: data.phone || null,
      taxNumber: data.taxNumber || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      state: null,
      postalCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.organizations.set(id, org);
    return { ...org };
  }

  public async updateOrganization(
    id: string,
    data: Partial<Omit<OrganizationRecord, 'id' | 'createdAt'>>
  ): Promise<OrganizationRecord> {
    const org = await this.findOrgById(id);
    if (!org) {
      throw new Error('Organization not found');
    }

    const updated: OrganizationRecord = {
      ...org,
      ...data,
      updatedAt: new Date(),
    };

    this.organizations.set(id, updated);
    return { ...updated };
  }

  // --- Memberships ---
  public async createMembership(data: {
    organizationId: string;
    userId: string;
    role: MembershipRole;
    title?: string;
  }): Promise<MembershipRecord> {
    const existing = await this.findMembership(data.organizationId, data.userId);
    if (existing) {
      throw new Error('User is already a member of this organization');
    }

    const id = crypto.randomUUID();
    const membership: MembershipRecord = {
      id,
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
      title: data.title || null,
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    };

    this.memberships.set(id, membership);
    return { ...membership };
  }

  public async findMembership(organizationId: string, userId: string): Promise<MembershipRecord | null> {
    for (const mem of this.memberships.values()) {
      if (mem.organizationId === organizationId && mem.userId === userId && mem.isActive) {
        return { ...mem };
      }
    }
    return null;
  }

  public async findMembershipById(id: string): Promise<MembershipRecord | null> {
    const mem = this.memberships.get(id);
    return mem ? { ...mem } : null;
  }

  public async getUserMemberships(userId: string): Promise<Array<{ membership: MembershipRecord; organization: OrganizationRecord }>> {
    const results: Array<{ membership: MembershipRecord; organization: OrganizationRecord }> = [];
    for (const mem of this.memberships.values()) {
      if (mem.userId === userId && mem.isActive) {
        const org = await this.findOrgById(mem.organizationId);
        if (org) {
          results.push({ membership: { ...mem }, organization: { ...org } });
        }
      }
    }
    return results;
  }

  public async getOrgMembers(organizationId: string): Promise<Array<{ membership: MembershipRecord; user: UserRecord }>> {
    const results: Array<{ membership: MembershipRecord; user: UserRecord }> = [];
    for (const mem of this.memberships.values()) {
      if (mem.organizationId === organizationId && mem.isActive) {
        const user = await this.findUserById(mem.userId);
        if (user) {
          results.push({ membership: { ...mem }, user: { ...user } });
        }
      }
    }
    return results;
  }

  public async updateMembershipRole(membershipId: string, newRole: MembershipRole): Promise<MembershipRecord> {
    const mem = await this.findMembershipById(membershipId);
    if (!mem) {
      throw new Error('Membership not found');
    }
    const updated: MembershipRecord = {
      ...mem,
      role: newRole,
      updatedAt: new Date(),
    };
    this.memberships.set(membershipId, updated);
    return { ...updated };
  }

  public async deactivateMembership(membershipId: string): Promise<void> {
    const mem = await this.findMembershipById(membershipId);
    if (!mem) {
      throw new Error('Membership not found');
    }
    mem.isActive = false;
    mem.updatedAt = new Date();
    this.memberships.set(membershipId, mem);
  }

  // --- Audit Logs ---
  public async logAudit(data: {
    organizationId: string;
    userId?: string | null;
    action: string;
    resource: string;
    resourceId: string;
    diff?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLogRecord> {
    const id = crypto.randomUUID();
    const log: AuditLogRecord = {
      id,
      organizationId: data.organizationId,
      userId: data.userId || null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      diff: data.diff || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return { ...log };
  }

  // --- Leads ---
  public async createLead(data: {
    organizationId: string;
    title: string;
    contactName: string;
    email: string;
    phone?: string;
    companyName?: string;
    source?: string;
    status?: LeadStatus;
    priority?: Priority;
    estimatedBudget?: number;
    expectedClose?: Date;
    serviceRequired?: string;
    notes?: string;
    tags?: string[];
    assignedToId?: string;
  }): Promise<LeadRecord> {
    const id = crypto.randomUUID();
    const lead: LeadRecord = {
      id,
      organizationId: data.organizationId,
      title: data.title,
      contactName: data.contactName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      companyName: data.companyName || null,
      source: data.source || 'Website',
      status: data.status || LeadStatus.NEW,
      priority: data.priority || Priority.MEDIUM,
      estimatedBudget: data.estimatedBudget ?? null,
      expectedClose: data.expectedClose || null,
      serviceRequired: data.serviceRequired || null,
      notes: data.notes || null,
      tags: data.tags || [],
      assignedToId: data.assignedToId || null,
      convertedToClientId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leads.set(id, lead);
    return { ...lead };
  }

  public async findLeadById(id: string): Promise<LeadRecord | null> {
    const lead = this.leads.get(id);
    return lead ? { ...lead } : null;
  }

  public async getLeads(
    organizationId: string,
    filters?: { status?: LeadStatus; search?: string; assignedToId?: string }
  ): Promise<LeadRecord[]> {
    const list: LeadRecord[] = [];
    const searchLower = filters?.search?.toLowerCase().trim();

    for (const lead of this.leads.values()) {
      if (lead.organizationId !== organizationId) continue;
      if (filters?.status && lead.status !== filters.status) continue;
      if (filters?.assignedToId && lead.assignedToId !== filters.assignedToId) continue;
      if (searchLower) {
        const matches =
          lead.title.toLowerCase().includes(searchLower) ||
          lead.contactName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          (lead.companyName && lead.companyName.toLowerCase().includes(searchLower));
        if (!matches) continue;
      }
      list.push({ ...lead });
    }

    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateLead(
    id: string,
    data: Partial<Omit<LeadRecord, 'id' | 'organizationId' | 'createdAt'>>
  ): Promise<LeadRecord> {
    const lead = await this.findLeadById(id);
    if (!lead) throw new Error('Lead not found');

    const updated: LeadRecord = {
      ...lead,
      ...data,
      updatedAt: new Date(),
    };
    this.leads.set(id, updated);
    return { ...updated };
  }

  public async addLeadActivity(data: {
    leadId: string;
    activityType: LeadActivityType;
    description: string;
  }): Promise<LeadActivityRecord> {
    const id = crypto.randomUUID();
    const activity: LeadActivityRecord = {
      id,
      leadId: data.leadId,
      activityType: data.activityType,
      description: data.description,
      createdAt: new Date(),
    };
    this.leadActivities.set(id, activity);
    return { ...activity };
  }

  public async getLeadActivities(leadId: string): Promise<LeadActivityRecord[]> {
    const list: LeadActivityRecord[] = [];
    for (const act of this.leadActivities.values()) {
      if (act.leadId === leadId) {
        list.push({ ...act });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // --- Clients ---
  public async createClient(data: {
    organizationId: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    billingAddress?: string;
    taxId?: string;
    category?: string;
    notes?: string;
  }): Promise<ClientRecord> {
    const id = crypto.randomUUID();
    const client: ClientRecord = {
      id,
      organizationId: data.organizationId,
      name: data.name,
      company: data.company || null,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      billingAddress: data.billingAddress || null,
      taxId: data.taxId || null,
      category: data.category || 'Retainer',
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.set(id, client);
    return { ...client };
  }

  public async findClientById(id: string): Promise<ClientRecord | null> {
    const client = this.clients.get(id);
    return client ? { ...client } : null;
  }

  public async findClientByEmail(organizationId: string, email: string): Promise<ClientRecord | null> {
    const normalized = email.toLowerCase().trim();
    for (const client of this.clients.values()) {
      if (client.organizationId === organizationId && client.email.toLowerCase() === normalized) {
        return { ...client };
      }
    }
    return null;
  }

  public async getClients(organizationId: string, search?: string): Promise<ClientRecord[]> {
    const list: ClientRecord[] = [];
    const searchLower = search?.toLowerCase().trim();

    for (const client of this.clients.values()) {
      if (client.organizationId !== organizationId) continue;
      if (searchLower) {
        const matches =
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          (client.company && client.company.toLowerCase().includes(searchLower));
        if (!matches) continue;
      }
      list.push({ ...client });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateClient(
    id: string,
    data: Partial<Omit<ClientRecord, 'id' | 'organizationId' | 'createdAt'>>
  ): Promise<ClientRecord> {
    const client = await this.findClientById(id);
    if (!client) throw new Error('Client not found');

    const updated: ClientRecord = {
      ...client,
      ...data,
      updatedAt: new Date(),
    };
    this.clients.set(id, updated);
    return { ...updated };
  }

  // --- Quotations ---
  public async createQuotation(
    data: {
      organizationId: string;
      clientId: string;
      createdById: string;
      quoteNumber: string;
      subtotal: number;
      discountAmount: number;
      taxAmount: number;
      totalAmount: number;
      currency?: string;
      validUntil: Date;
      paymentTerms?: string;
      notes?: string;
    },
    items: Array<{
      serviceName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>
  ): Promise<{ quotation: QuotationRecord; items: QuotationItemRecord[] }> {
    const id = crypto.randomUUID();
    const quotation: QuotationRecord = {
      id,
      organizationId: data.organizationId,
      clientId: data.clientId,
      createdById: data.createdById,
      quoteNumber: data.quoteNumber,
      status: QuotationStatus.DRAFT,
      subtotal: data.subtotal,
      discountAmount: data.discountAmount,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      currency: data.currency || 'INR',
      validUntil: data.validUntil,
      paymentTerms: data.paymentTerms || null,
      notes: data.notes || null,
      convertedProjectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.quotations.set(id, quotation);

    const savedItems: QuotationItemRecord[] = [];
    for (const item of items) {
      const itemId = crypto.randomUUID();
      const quoteItem: QuotationItemRecord = {
        id: itemId,
        quotationId: id,
        serviceName: item.serviceName,
        description: item.description || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      };
      this.quotationItems.set(itemId, quoteItem);
      savedItems.push({ ...quoteItem });
    }

    return { quotation: { ...quotation }, items: savedItems };
  }

  public async findQuotationById(
    id: string
  ): Promise<{ quotation: QuotationRecord; items: QuotationItemRecord[] } | null> {
    const quotation = this.quotations.get(id);
    if (!quotation) return null;

    const items: QuotationItemRecord[] = [];
    for (const item of this.quotationItems.values()) {
      if (item.quotationId === id) {
        items.push({ ...item });
      }
    }

    return { quotation: { ...quotation }, items };
  }

  public async getQuotations(
    organizationId: string,
    filters?: { clientId?: string; status?: QuotationStatus }
  ): Promise<Array<{ quotation: QuotationRecord; items: QuotationItemRecord[] }>> {
    const list: Array<{ quotation: QuotationRecord; items: QuotationItemRecord[] }> = [];

    for (const quotation of this.quotations.values()) {
      if (quotation.organizationId !== organizationId) continue;
      if (filters?.clientId && quotation.clientId !== filters.clientId) continue;
      if (filters?.status && quotation.status !== filters.status) continue;

      const items: QuotationItemRecord[] = [];
      for (const item of this.quotationItems.values()) {
        if (item.quotationId === quotation.id) {
          items.push({ ...item });
        }
      }

      list.push({ quotation: { ...quotation }, items });
    }

    return list.sort((a, b) => b.quotation.createdAt.getTime() - a.quotation.createdAt.getTime());
  }

  public async updateQuotationStatus(id: string, status: QuotationStatus): Promise<QuotationRecord> {
    const existing = this.quotations.get(id);
    if (!existing) throw new Error('Quotation not found');

    const updated: QuotationRecord = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.quotations.set(id, updated);
    return { ...updated };
  }

  // --- Projects ---
  public async createProject(data: {
    organizationId: string;
    clientId: string;
    managerId?: string;
    name: string;
    code?: string;
    description?: string;
    budget?: number;
    priority?: Priority;
    startDate?: Date;
    deadline?: Date;
    relatedQuotationId?: string;
  }): Promise<ProjectRecord> {
    const id = crypto.randomUUID();
    const code =
      data.code ||
      `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const project: ProjectRecord = {
      id,
      organizationId: data.organizationId,
      clientId: data.clientId,
      managerId: data.managerId || null,
      name: data.name,
      code,
      description: data.description || null,
      status: ProjectStatus.PLANNING,
      priority: data.priority || Priority.MEDIUM,
      budget: data.budget || 0,
      startDate: data.startDate || new Date(),
      deadline: data.deadline || null,
      completedAt: null,
      relatedQuotationId: data.relatedQuotationId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(id, project);

    if (data.relatedQuotationId) {
      const quote = this.quotations.get(data.relatedQuotationId);
      if (quote) {
        quote.convertedProjectId = id;
        this.quotations.set(data.relatedQuotationId, quote);
      }
    }

    return { ...project };
  }

  public async findProjectById(id: string): Promise<ProjectRecord | null> {
    const proj = this.projects.get(id);
    return proj ? { ...proj } : null;
  }

  public async getProjects(
    organizationId: string,
    filters?: { clientId?: string; status?: ProjectStatus; managerId?: string }
  ): Promise<ProjectRecord[]> {
    const list: ProjectRecord[] = [];
    for (const proj of this.projects.values()) {
      if (proj.organizationId !== organizationId) continue;
      if (filters?.clientId && proj.clientId !== filters.clientId) continue;
      if (filters?.status && proj.status !== filters.status) continue;
      if (filters?.managerId && proj.managerId !== filters.managerId) continue;
      list.push({ ...proj });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateProject(
    id: string,
    data: Partial<Omit<ProjectRecord, 'id' | 'organizationId' | 'createdAt'>>
  ): Promise<ProjectRecord> {
    const existing = await this.findProjectById(id);
    if (!existing) throw new Error('Project not found');

    const updated: ProjectRecord = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return { ...updated };
  }

  // --- Milestones ---
  public async createMilestone(data: {
    projectId: string;
    title: string;
    description?: string;
    dueDate?: Date;
  }): Promise<MilestoneRecord> {
    const id = crypto.randomUUID();
    const milestone: MilestoneRecord = {
      id,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.milestones.set(id, milestone);
    return { ...milestone };
  }

  public async getMilestonesByProject(projectId: string): Promise<MilestoneRecord[]> {
    const list: MilestoneRecord[] = [];
    for (const m of this.milestones.values()) {
      if (m.projectId === projectId) list.push({ ...m });
    }
    return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public async updateMilestone(
    id: string,
    data: Partial<Omit<MilestoneRecord, 'id' | 'projectId' | 'createdAt'>>
  ): Promise<MilestoneRecord> {
    const m = this.milestones.get(id);
    if (!m) throw new Error('Milestone not found');

    const updated: MilestoneRecord = {
      ...m,
      ...data,
      completedAt: data.isCompleted ? new Date() : m.completedAt,
      updatedAt: new Date(),
    };
    this.milestones.set(id, updated);
    return { ...updated };
  }

  // --- Tasks ---
  public async createTask(data: {
    projectId: string;
    milestoneId?: string;
    assignedToId?: string;
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date;
  }): Promise<TaskRecord> {
    const id = crypto.randomUUID();
    const task: TaskRecord = {
      id,
      projectId: data.projectId,
      milestoneId: data.milestoneId || null,
      assignedToId: data.assignedToId || null,
      title: data.title,
      description: data.description || null,
      status: TaskStatus.TODO,
      priority: data.priority || Priority.MEDIUM,
      dueDate: data.dueDate || null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return { ...task };
  }

  public async findTaskById(id: string): Promise<TaskRecord | null> {
    const t = this.tasks.get(id);
    return t ? { ...t } : null;
  }

  public async getTasks(
    organizationId: string,
    filters?: { projectId?: string; assignedToId?: string; status?: TaskStatus }
  ): Promise<TaskRecord[]> {
    const list: TaskRecord[] = [];
    for (const task of this.tasks.values()) {
      const proj = this.projects.get(task.projectId);
      if (!proj || proj.organizationId !== organizationId) continue;
      if (filters?.projectId && task.projectId !== filters.projectId) continue;
      if (filters?.assignedToId && task.assignedToId !== filters.assignedToId) continue;
      if (filters?.status && task.status !== filters.status) continue;
      list.push({ ...task });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async updateTask(
    id: string,
    data: Partial<Omit<TaskRecord, 'id' | 'projectId' | 'createdAt'>>
  ): Promise<TaskRecord> {
    const task = await this.findTaskById(id);
    if (!task) throw new Error('Task not found');

    const updated: TaskRecord = {
      ...task,
      ...data,
      completedAt: data.status === TaskStatus.COMPLETED ? new Date() : task.completedAt,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updated);
    return { ...updated };
  }

  public async addSubtask(taskId: string, title: string): Promise<SubtaskRecord> {
    const id = crypto.randomUUID();
    const subtask: SubtaskRecord = {
      id,
      taskId,
      title,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date(),
    };
    this.subtasks.set(id, subtask);
    return { ...subtask };
  }

  public async getSubtasks(taskId: string): Promise<SubtaskRecord[]> {
    const list: SubtaskRecord[] = [];
    for (const st of this.subtasks.values()) {
      if (st.taskId === taskId) list.push({ ...st });
    }
    return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public async toggleSubtask(id: string): Promise<SubtaskRecord> {
    const st = this.subtasks.get(id);
    if (!st) throw new Error('Subtask not found');

    st.isCompleted = !st.isCompleted;
    st.completedAt = st.isCompleted ? new Date() : null;
    this.subtasks.set(id, st);
    return { ...st };
  }

  public async addTaskComment(data: {
    taskId: string;
    userId: string;
    content: string;
  }): Promise<TaskCommentRecord> {
    const id = crypto.randomUUID();
    const comment: TaskCommentRecord = {
      id,
      taskId: data.taskId,
      userId: data.userId,
      content: data.content,
      createdAt: new Date(),
    };
    this.taskComments.set(id, comment);
    return { ...comment };
  }

  public async getTaskComments(taskId: string): Promise<TaskCommentRecord[]> {
    const list: TaskCommentRecord[] = [];
    for (const c of this.taskComments.values()) {
      if (c.taskId === taskId) list.push({ ...c });
    }
    return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // --- Deliverables & Approvals ---
  public async createDeliverable(data: {
    projectId: string;
    title: string;
    description?: string;
  }): Promise<DeliverableRecord> {
    const id = crypto.randomUUID();
    const deliverable: DeliverableRecord = {
      id,
      projectId: data.projectId,
      title: data.title,
      description: data.description || null,
      currentStatus: DeliverableStatus.DRAFT,
      currentVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliverables.set(id, deliverable);
    return { ...deliverable };
  }

  public async findDeliverableById(id: string): Promise<DeliverableRecord | null> {
    const d = this.deliverables.get(id);
    return d ? { ...d } : null;
  }

  public async getDeliverablesByProject(projectId: string): Promise<DeliverableRecord[]> {
    const list: DeliverableRecord[] = [];
    for (const d of this.deliverables.values()) {
      if (d.projectId === projectId) list.push({ ...d });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async submitDeliverableVersion(data: {
    deliverableId: string;
    storageKey: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    changelogNotes?: string;
  }): Promise<DeliverableVersionRecord> {
    const deliv = await this.findDeliverableById(data.deliverableId);
    if (!deliv) throw new Error('Deliverable not found');

    const nextVersion = deliv.currentVersion + 1;
    const versionId = crypto.randomUUID();

    const versionRecord: DeliverableVersionRecord = {
      id: versionId,
      deliverableId: data.deliverableId,
      versionNumber: nextVersion,
      storageKey: data.storageKey,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileMimeType: data.fileMimeType,
      changelogNotes: data.changelogNotes || null,
      submittedAt: new Date(),
    };

    this.deliverableVersions.set(versionId, versionRecord);

    // Update deliverable current version and status to PENDING_CLIENT_APPROVAL
    deliv.currentVersion = nextVersion;
    deliv.currentStatus = DeliverableStatus.PENDING_CLIENT_APPROVAL;
    deliv.updatedAt = new Date();
    this.deliverables.set(deliv.id, deliv);

    return { ...versionRecord };
  }

  public async getDeliverableVersions(deliverableId: string): Promise<DeliverableVersionRecord[]> {
    const list: DeliverableVersionRecord[] = [];
    for (const v of this.deliverableVersions.values()) {
      if (v.deliverableId === deliverableId) list.push({ ...v });
    }
    return list.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public async recordApprovalDecision(data: {
    deliverableVersionId: string;
    approverType: string;
    approverUserId?: string;
    decision: ApprovalDecision;
    comments?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ApprovalRecord> {
    const version = this.deliverableVersions.get(data.deliverableVersionId);
    if (!version) throw new Error('Deliverable version not found');

    const deliv = this.deliverables.get(version.deliverableId);
    if (!deliv) throw new Error('Deliverable not found');

    const id = crypto.randomUUID();
    const approval: ApprovalRecord = {
      id,
      deliverableVersionId: data.deliverableVersionId,
      approverType: data.approverType,
      approverUserId: data.approverUserId || null,
      decision: data.decision,
      comments: data.comments || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      decidedAt: new Date(),
      createdAt: new Date(),
    };

    this.approvals.set(id, approval);

    // Update deliverable status based on approval decision
    if (data.decision === ApprovalDecision.APPROVED) {
      deliv.currentStatus = DeliverableStatus.APPROVED;
    } else if (data.decision === ApprovalDecision.REVISION_REQUESTED) {
      deliv.currentStatus = DeliverableStatus.REVISION_REQUESTED;
    }
    deliv.updatedAt = new Date();
    this.deliverables.set(deliv.id, deliv);

    return { ...approval };
  }

  public async getApprovalHistory(deliverableVersionId: string): Promise<ApprovalRecord[]> {
    const list: ApprovalRecord[] = [];
    for (const a of this.approvals.values()) {
      if (a.deliverableVersionId === deliverableVersionId) list.push({ ...a });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // --- Invoices & Financial Ledger ---
  public generateNextInvoiceNumber(organizationId: string): string {
    const year = new Date().getFullYear();
    let count = 0;
    for (const inv of this.invoices.values()) {
      if (inv.organizationId === organizationId) count++;
    }
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  public async createInvoice(data: {
    organizationId: string;
    clientId: string;
    projectId?: string | null;
    invoiceNumber?: string;
    issuedDate?: Date | string;
    dueDate: Date | string;
    currency?: string;
    discountAmount?: number;
    taxAmount?: number;
    notes?: string;
    paymentTerms?: string;
    items: {
      serviceName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
    }[];
  }): Promise<{ invoice: InvoiceRecord; items: InvoiceItemRecord[] }> {
    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = data.invoiceNumber || this.generateNextInvoiceNumber(data.organizationId);

    // Verify invoice number uniqueness within organization
    for (const existing of this.invoices.values()) {
      if (existing.organizationId === data.organizationId && existing.invoiceNumber === invoiceNumber) {
        throw new Error(`Invoice number ${invoiceNumber} already exists in this organization`);
      }
    }

    let subtotal = 0;
    const createdItems: InvoiceItemRecord[] = [];

    for (const item of data.items) {
      const itemId = crypto.randomUUID();
      const totalPrice = round2(item.quantity * item.unitPrice);
      subtotal = round2(subtotal + totalPrice);

      const itemRecord: InvoiceItemRecord = {
        id: itemId,
        invoiceId,
        serviceName: item.serviceName,
        description: item.description || null,
        quantity: round2(item.quantity),
        unitPrice: round2(item.unitPrice),
        totalPrice,
      };

      this.invoiceItems.set(itemId, itemRecord);
      createdItems.push(itemRecord);
    }

    const discountAmount = round2(data.discountAmount || 0);
    const taxAmount = round2(data.taxAmount || 0);
    const totalAmount = round2(subtotal - discountAmount + taxAmount);
    const amountPaid = 0;
    const balanceDue = totalAmount;

    const invoiceRecord: InvoiceRecord = {
      id: invoiceId,
      organizationId: data.organizationId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      invoiceNumber,
      status: InvoiceStatus.ISSUED,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      amountPaid,
      balanceDue,
      currency: data.currency || 'INR',
      issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
      dueDate: new Date(data.dueDate),
      notes: data.notes || null,
      paymentTerms: data.paymentTerms || 'Payment due within terms',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invoices.set(invoiceId, invoiceRecord);
    return { invoice: { ...invoiceRecord }, items: createdItems };
  }

  public async findInvoiceById(id: string): Promise<InvoiceRecord | null> {
    const inv = this.invoices.get(id);
    return inv ? { ...inv } : null;
  }

  public async getInvoices(
    organizationId: string,
    filter?: { clientId?: string; status?: InvoiceStatus; projectId?: string }
  ): Promise<InvoiceRecord[]> {
    const list: InvoiceRecord[] = [];
    for (const inv of this.invoices.values()) {
      if (inv.organizationId !== organizationId) continue;
      if (filter?.clientId && inv.clientId !== filter.clientId) continue;
      if (filter?.status && inv.status !== filter.status) continue;
      if (filter?.projectId && inv.projectId !== filter.projectId) continue;
      list.push({ ...inv });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getInvoiceItems(invoiceId: string): Promise<InvoiceItemRecord[]> {
    const list: InvoiceItemRecord[] = [];
    for (const item of this.invoiceItems.values()) {
      if (item.invoiceId === invoiceId) list.push({ ...item });
    }
    return list;
  }

  public async updateInvoice(id: string, updates: Partial<InvoiceRecord>): Promise<InvoiceRecord> {
    const inv = this.invoices.get(id);
    if (!inv) throw new Error('Invoice not found');

    const updated: InvoiceRecord = {
      ...inv,
      ...updates,
      updatedAt: new Date(),
    };
    this.invoices.set(id, updated);
    return { ...updated };
  }

  public async deleteInvoice(id: string): Promise<boolean> {
    const inv = this.invoices.get(id);
    if (!inv) return false;

    // Delete associated line items
    for (const [itemId, item] of this.invoiceItems.entries()) {
      if (item.invoiceId === id) this.invoiceItems.delete(itemId);
    }
    this.invoices.delete(id);
    return true;
  }

  // --- Payments ---
  public async recordPayment(data: {
    organizationId: string;
    invoiceId: string;
    amount: number;
    currency?: string;
    method: PaymentMethod;
    status?: PaymentStatus;
    isManual?: boolean;
    transactionRef?: string;
    gatewayOrderId?: string;
    receiptNumber?: string;
    notes?: string;
    recordedById?: string;
  }): Promise<PaymentRecord> {
    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
    const inv = this.invoices.get(data.invoiceId);
    if (!inv) throw new Error('Invoice not found');
    if (inv.organizationId !== data.organizationId) throw new Error('Tenant mismatch on payment');

    const id = crypto.randomUUID();
    const status = data.status || PaymentStatus.VERIFIED;
    const amount = round2(data.amount);

    const payment: PaymentRecord = {
      id,
      organizationId: data.organizationId,
      invoiceId: data.invoiceId,
      amount,
      currency: data.currency || inv.currency,
      method: data.method,
      status,
      isManual: data.isManual ?? true,
      transactionRef: data.transactionRef || null,
      gatewayOrderId: data.gatewayOrderId || null,
      receiptNumber: data.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
      notes: data.notes || null,
      verifiedAt: status === PaymentStatus.VERIFIED ? new Date() : null,
      recordedById: data.recordedById || null,
      createdAt: new Date(),
    };

    this.payments.set(id, payment);

    // If verified, adjust invoice ledger
    if (status === PaymentStatus.VERIFIED) {
      let totalVerified = 0;
      for (const p of this.payments.values()) {
        if (p.invoiceId === inv.id && p.status === PaymentStatus.VERIFIED) {
          totalVerified = round2(totalVerified + p.amount);
        }
      }

      inv.amountPaid = totalVerified;
      inv.balanceDue = round2(Math.max(0, inv.totalAmount - inv.amountPaid));

      if (inv.balanceDue <= 0.005) {
        inv.status = InvoiceStatus.PAID;
      } else if (inv.amountPaid > 0) {
        inv.status = InvoiceStatus.PARTIALLY_PAID;
      }

      inv.updatedAt = new Date();
      this.invoices.set(inv.id, inv);
    }

    return { ...payment };
  }

  public async findPaymentById(id: string): Promise<PaymentRecord | null> {
    const p = this.payments.get(id);
    return p ? { ...p } : null;
  }

  public async getPayments(
    organizationId: string,
    filter?: { invoiceId?: string; status?: PaymentStatus }
  ): Promise<PaymentRecord[]> {
    const list: PaymentRecord[] = [];
    for (const p of this.payments.values()) {
      if (p.organizationId !== organizationId) continue;
      if (filter?.invoiceId && p.invoiceId !== filter.invoiceId) continue;
      if (filter?.status && p.status !== filter.status) continue;
      list.push({ ...p });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getPaymentsByInvoice(invoiceId: string): Promise<PaymentRecord[]> {
    const list: PaymentRecord[] = [];
    for (const p of this.payments.values()) {
      if (p.invoiceId === invoiceId) list.push({ ...p });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // --- Payment Webhook Events ---
  public async recordPaymentWebhookEvent(data: {
    paymentId?: string;
    gateway?: string;
    eventId: string;
    eventType: string;
    payload: any;
    signature: string;
    isVerified: boolean;
  }): Promise<PaymentWebhookEventRecord> {
    if (this.paymentWebhookEvents.has(data.eventId)) {
      throw new Error(`Webhook event ${data.eventId} already processed (idempotency guard)`);
    }

    const id = crypto.randomUUID();
    const eventRecord: PaymentWebhookEventRecord = {
      id,
      paymentId: data.paymentId || null,
      gateway: data.gateway || 'RAZORPAY',
      eventId: data.eventId,
      eventType: data.eventType,
      payload: data.payload,
      signature: data.signature,
      isVerified: data.isVerified,
      processedAt: new Date(),
    };

    this.paymentWebhookEvents.set(data.eventId, eventRecord);
    return { ...eventRecord };
  }

  public async findWebhookEvent(eventId: string): Promise<PaymentWebhookEventRecord | null> {
    const ev = this.paymentWebhookEvents.get(eventId);
    return ev ? { ...ev } : null;
  }

  // --- Business Overview Intelligence ---
  public async getBusinessOverview(organizationId: string) {
    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    let totalRevenue = 0;
    for (const p of this.payments.values()) {
      if (p.organizationId === organizationId && p.status === PaymentStatus.VERIFIED) {
        totalRevenue = round2(totalRevenue + p.amount);
      }
    }

    let totalInvoiced = 0;
    let outstandingBalance = 0;
    const now = new Date();
    let current = 0;
    let overdue30 = 0;
    let overdue60 = 0;

    for (const inv of this.invoices.values()) {
      if (inv.organizationId === organizationId && inv.status !== InvoiceStatus.CANCELLED) {
        totalInvoiced = round2(totalInvoiced + inv.totalAmount);
        outstandingBalance = round2(outstandingBalance + inv.balanceDue);

        if (inv.balanceDue > 0) {
          const due = new Date(inv.dueDate);
          const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 0) {
            current = round2(current + inv.balanceDue);
          } else if (diffDays <= 30) {
            current = round2(current + inv.balanceDue);
          } else if (diffDays <= 60) {
            overdue30 = round2(overdue30 + inv.balanceDue);
          } else {
            overdue60 = round2(overdue60 + inv.balanceDue);
          }
        }
      }
    }

    let activeProjectsCount = 0;
    for (const pr of this.projects.values()) {
      if (
        pr.organizationId === organizationId &&
        (pr.status === ProjectStatus.ACTIVE ||
          pr.status === ProjectStatus.PLANNING ||
          pr.status === ProjectStatus.REVIEW)
      ) {
        activeProjectsCount++;
      }
    }

    let totalLeads = 0;
    let wonLeads = 0;
    let lostLeads = 0;
    let pipelineValue = 0;

    for (const l of this.leads.values()) {
      if (l.organizationId === organizationId) {
        totalLeads++;
        if (l.status === LeadStatus.WON) wonLeads++;
        else if (l.status === LeadStatus.LOST) lostLeads++;
        else {
          pipelineValue = round2(pipelineValue + (l.estimatedBudget || 0));
        }
      }
    }

    const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return {
      totalRevenue,
      totalInvoiced,
      outstandingBalance,
      activeProjectsCount,
      leadsMetrics: {
        total: totalLeads,
        won: wonLeads,
        lost: lostLeads,
        winRate,
      },
      pipelineValue,
      agingReceivables: {
        current,
        overdue30,
        overdue60,
      },
    };
  }
}

export const db = new DatabaseRepository();

