"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseRepository = void 0;
const shared_1 = require("@setsuzoku/shared");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Robust Database Repository supporting high-speed in-memory transactional storage
 * with full relational integrity, uniqueness checks, and multi-tenancy scoping.
 */
class DatabaseRepository {
    users = new Map();
    organizations = new Map();
    memberships = new Map();
    refreshTokens = new Map();
    auditLogs = new Map();
    leads = new Map();
    leadActivities = new Map();
    clients = new Map();
    quotations = new Map();
    quotationItems = new Map();
    projects = new Map();
    milestones = new Map();
    tasks = new Map();
    subtasks = new Map();
    taskComments = new Map();
    deliverables = new Map();
    deliverableVersions = new Map();
    approvals = new Map();
    invoices = new Map();
    invoiceItems = new Map();
    payments = new Map();
    paymentWebhookEvents = new Map();
    notifications = new Map();
    files = new Map();
    constructor() {
        this.seedDefaultData();
    }
    clear() {
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
    seedDefaultData() {
        const adminUser = {
            id: 'user_admin_001',
            email: 'info@setsuzoku.in',
            passwordHash: '$2a$10$qFB9SofDky4hVJ8m18HnTuq4yta1TB3LQQDDhHgvVlVIX4NTh08Ge', // Password123!
            fullName: 'Setsuzoku Admin',
            phone: '+91 99999 00000',
            avatarUrl: null,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(adminUser.id, adminUser);
        const demoOrg = {
            id: 'org_demo_001',
            name: 'Setsuzoku Media Labs',
            slug: 'setsuzoku-media-labs',
            logoUrl: '/setsuzoku-logo.png',
            businessEmail: 'info@setsuzoku.in',
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
        const ownerMem = {
            id: 'mem_admin_001',
            organizationId: demoOrg.id,
            userId: adminUser.id,
            role: shared_1.MembershipRole.ORGANIZATION_OWNER,
            isActive: true,
            title: 'Managing Director',
            joinedAt: new Date(),
            updatedAt: new Date(),
        };
        this.memberships.set(ownerMem.id, ownerMem);
        const demoClient = {
            id: 'client_demo_001',
            organizationId: demoOrg.id,
            name: 'Aditya Sen',
            company: 'Swiggy Brand Studio',
            email: 'aditya.sen@swiggy.in',
            phone: '+91 98450 12890',
            billingAddress: 'Tower D, IBC Knowledge Park, Bannerghatta Road, Bengaluru',
            taxId: '29AABCS1429B1Z',
            category: 'ENTERPRISE',
            notes: 'Quarterly brand commercial video production retainer',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.clients.set(demoClient.id, demoClient);
        const demoProj = {
            id: 'proj_demo_001',
            organizationId: demoOrg.id,
            clientId: demoClient.id,
            managerId: adminUser.id,
            name: 'Commercial Video Post-Production Master',
            code: 'PRJ-2026-01',
            description: 'Main commercial TVC 45s, 3 digital cutdowns, color grading, sound design and Prores 4444 master delivery.',
            status: shared_1.ProjectStatus.ACTIVE,
            priority: shared_1.Priority.HIGH,
            budget: 186400,
            startDate: new Date(Date.now() - 20 * 86400000),
            deadline: new Date(Date.now() + 10 * 86400000),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.projects.set(demoProj.id, demoProj);
        const demoTask = {
            id: 'task_demo_001',
            projectId: demoProj.id,
            assignedToId: adminUser.id,
            title: 'Deliver Prores 4444 master to Swiggy post team',
            description: 'Export DCI-P3 and Rec.709 clean feeds with 5.1 and stereo audio stems.',
            status: shared_1.TaskStatus.IN_PROGRESS,
            priority: shared_1.Priority.HIGH,
            dueDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.tasks.set(demoTask.id, demoTask);
        const demoInv = {
            id: 'inv_demo_001',
            organizationId: demoOrg.id,
            clientId: demoClient.id,
            projectId: demoProj.id,
            invoiceNumber: 'INV-2026-0142',
            status: shared_1.InvoiceStatus.OVERDUE,
            subtotal: 158000,
            discountAmount: 0,
            taxAmount: 28400,
            totalAmount: 186400,
            amountPaid: 0,
            balanceDue: 186400,
            currency: 'INR',
            paymentTerms: 'Payment due within 14 days of invoice date.',
            issuedDate: new Date(Date.now() - 18 * 86400000),
            dueDate: new Date(Date.now() - 4 * 86400000),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.invoices.set(demoInv.id, demoInv);
        const demoItem = {
            id: 'item_demo_001',
            invoiceId: demoInv.id,
            serviceName: 'Commercial Video Post-Production & Color Grading',
            description: 'Master 45s TVC color grade, sound design, dialogue mastering, and delivery.',
            quantity: 1,
            unitPrice: 158000,
            totalPrice: 158000,
        };
        this.invoiceItems.set(demoItem.id, demoItem);
        // --- Additional Realistic Indian Clients ---
        const client2 = {
            id: 'client_demo_002',
            organizationId: demoOrg.id,
            name: 'Rohan Deshmukh',
            company: 'Tata Consumer Products',
            email: 'rohan.deshmukh@tataconsumer.com',
            phone: '+91 98200 55123',
            billingAddress: 'Bombay House, Homi Mody Street, Fort, Mumbai',
            taxId: '27AABCT8811A1Z',
            category: 'ENTERPRISE',
            notes: 'Packaging 3D CGI and digital campaign assets',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.clients.set(client2.id, client2);
        const client3 = {
            id: 'client_demo_003',
            organizationId: demoOrg.id,
            name: 'Rahul Sharma',
            company: 'Ather Energy Creative',
            email: 'rahul.sharma@atherenergy.com',
            phone: '+91 99800 22331',
            billingAddress: 'IBC Knowledge Park, Bannerghatta Road, Bengaluru',
            taxId: '29AAACA7722M1Z',
            category: 'ENTERPRISE',
            notes: 'Electric scooter launch campaign & 3D key visual renders',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.clients.set(client3.id, client3);
        // --- Demo Leads in all pipeline stages ---
        const lead1 = {
            id: 'lead_demo_001',
            organizationId: demoOrg.id,
            title: 'Commercial Video Post-Production Master',
            contactName: 'Aditya Sen',
            email: 'aditya.sen@swiggy.in',
            phone: '+91 98450 12890',
            companyName: 'Swiggy Brand Studio',
            source: 'Direct Inquiry',
            status: shared_1.LeadStatus.WON,
            priority: shared_1.Priority.HIGH,
            estimatedBudget: 186400,
            serviceRequired: 'Commercial Video & Post-Production',
            tags: ['Video', 'Post-Production'],
            notes: 'Successfully won and converted to active project PRJ-2026-01.',
            createdAt: new Date(Date.now() - 25 * 86400000),
            updatedAt: new Date(),
        };
        this.leads.set(lead1.id, lead1);
        const lead2 = {
            id: 'lead_demo_002',
            organizationId: demoOrg.id,
            title: 'Packaging 3D Render & Motion Graphics',
            contactName: 'Rohan Deshmukh',
            email: 'rohan.deshmukh@tataconsumer.com',
            phone: '+91 98200 55123',
            companyName: 'Tata Consumer Products',
            source: 'Referral',
            status: shared_1.LeadStatus.PROPOSAL_SENT,
            priority: shared_1.Priority.HIGH,
            estimatedBudget: 425000,
            serviceRequired: '3D CGI & Motion Graphics',
            tags: ['CGI', 'Packaging'],
            notes: 'Quotation QT-2026-0084 sent; pending brand team sign-off.',
            createdAt: new Date(Date.now() - 5 * 86400000),
            updatedAt: new Date(Date.now() - 5 * 86400000),
        };
        this.leads.set(lead2.id, lead2);
        const lead3 = {
            id: 'lead_demo_003',
            organizationId: demoOrg.id,
            title: 'Sound Design Master Cutdown v2',
            contactName: 'Karan Singhal',
            email: 'karan@cult.fit',
            companyName: 'Cult.fit Media',
            source: 'Partner Inquiry',
            status: shared_1.LeadStatus.PROPOSAL_SENT,
            priority: shared_1.Priority.MEDIUM,
            estimatedBudget: 112000,
            serviceRequired: 'Audio Mixing & Sound Design',
            tags: ['Audio', 'Cutdowns'],
            notes: 'Quotation QT-2026-0091 sent 2 days ago.',
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 2 * 86400000),
        };
        this.leads.set(lead3.id, lead3);
        const lead4 = {
            id: 'lead_demo_004',
            organizationId: demoOrg.id,
            title: 'Nirvana Ion Campaign Key Visuals & Master',
            contactName: 'Aman Gupta',
            email: 'aman@boat-lifestyle.com',
            companyName: 'boAt Lifestyle',
            source: 'Direct Pitch',
            status: shared_1.LeadStatus.NEGOTIATION,
            priority: shared_1.Priority.URGENT,
            estimatedBudget: 180000,
            serviceRequired: 'Key Visuals & CGI',
            tags: ['Audio', 'Product Visuals'],
            notes: 'Final scope alignment with marketing VP.',
            createdAt: new Date(Date.now() - 10 * 86400000),
            updatedAt: new Date(),
        };
        this.leads.set(lead4.id, lead4);
        const lead5 = {
            id: 'lead_demo_005',
            organizationId: demoOrg.id,
            title: 'Quick Commerce Launch Film',
            contactName: 'Devika Nair',
            email: 'devika.nair@zepto.in',
            companyName: 'Zepto Creative Labs',
            source: 'Inbound Web Portal',
            status: shared_1.LeadStatus.NEW,
            priority: shared_1.Priority.MEDIUM,
            estimatedBudget: 280000,
            serviceRequired: 'Digital Video Campaign',
            tags: ['Commercial', 'Digital'],
            notes: 'Inquiry received via web portal; no activity in 9 days.',
            createdAt: new Date(Date.now() - 9 * 86400000),
            updatedAt: new Date(Date.now() - 9 * 86400000),
        };
        this.leads.set(lead5.id, lead5);
        // --- Demo Quotations ---
        const quote1 = {
            id: 'quote_demo_001',
            organizationId: demoOrg.id,
            clientId: demoClient.id,
            createdById: adminUser.id,
            quoteNumber: 'QTN-2026-001',
            status: shared_1.QuotationStatus.ACCEPTED,
            subtotal: 250000,
            discountAmount: 0,
            taxAmount: 45000,
            totalAmount: 295000,
            currency: 'INR',
            validUntil: new Date(Date.now() + 30 * 86400000),
            notes: 'Includes cloud hosting setup and 90-day post-launch warranty.',
            paymentTerms: '50% upon contract signing, 50% upon milestone deliverables.',
            createdAt: new Date(Date.now() - 25 * 86400000),
            updatedAt: new Date(),
        };
        this.quotations.set(quote1.id, quote1);
        const quoteItem1 = {
            id: 'qitem_demo_001',
            quotationId: quote1.id,
            serviceName: 'Commercial TVC Post-Production & Color Grading',
            description: 'Master 45s TVC cut, dialogue clean-up, and Dolby 5.1 stereo mixdown',
            quantity: 1,
            unitPrice: 150000,
            totalPrice: 150000,
        };
        this.quotationItems.set(quoteItem1.id, quoteItem1);
        const quoteItem2 = {
            id: 'qitem_demo_002',
            quotationId: quote1.id,
            serviceName: 'Digital Cutdowns & Deliverable Formatting',
            description: '9:16 vertical and 1:1 square master cutdowns for YouTube, Meta and OTT',
            quantity: 1,
            unitPrice: 100000,
            totalPrice: 100000,
        };
        this.quotationItems.set(quoteItem2.id, quoteItem2);
        // --- Quotations Awaiting Client Reply ---
        const quote2 = {
            id: 'quote_demo_002',
            organizationId: demoOrg.id,
            clientId: client2.id,
            createdById: adminUser.id,
            quoteNumber: 'QT-2026-0084',
            status: shared_1.QuotationStatus.SENT,
            subtotal: 360169,
            discountAmount: 0,
            taxAmount: 64831,
            totalAmount: 425000,
            currency: 'INR',
            validUntil: new Date(Date.now() + 25 * 86400000),
            notes: 'Himalayan Packaging 3D CGI Render, high-res lighting passes and motion reveal.',
            paymentTerms: '50% upon contract signing, 50% upon final master asset sign-off.',
            createdAt: new Date(Date.now() - 5 * 86400000),
            updatedAt: new Date(Date.now() - 5 * 86400000),
        };
        this.quotations.set(quote2.id, quote2);
        const quote3 = {
            id: 'quote_demo_003',
            organizationId: demoOrg.id,
            clientId: client3.id,
            createdById: adminUser.id,
            quoteNumber: 'QT-2026-0091',
            status: shared_1.QuotationStatus.SENT,
            subtotal: 94915,
            discountAmount: 0,
            taxAmount: 17085,
            totalAmount: 112000,
            currency: 'INR',
            validUntil: new Date(Date.now() + 20 * 86400000),
            notes: 'Sound Design Master Cutdown v2 and Dolby Atmos stems.',
            paymentTerms: '100% on delivery.',
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(Date.now() - 2 * 86400000),
        };
        this.quotations.set(quote3.id, quote3);
        // --- Additional Demo Projects ---
        const proj2 = {
            id: 'proj_demo_002',
            organizationId: demoOrg.id,
            clientId: client3.id,
            managerId: adminUser.id,
            name: 'Apex 450 Launch Film & CGI Render',
            code: 'PRJ-2026-02',
            description: 'Electric scooter launch commercial, 3D mechanical explosive breakdown, and high-speed motion CGI.',
            status: shared_1.ProjectStatus.ACTIVE,
            priority: shared_1.Priority.HIGH,
            budget: 342750,
            startDate: new Date(Date.now() - 10 * 86400000),
            deadline: new Date(Date.now() + 20 * 86400000),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.projects.set(proj2.id, proj2);
        // --- Demo Deliverables & Versions ---
        const deliv1 = {
            id: 'deliv_demo_001',
            projectId: demoProj.id,
            title: 'Commercial TVC Master Cut 02',
            description: 'Full color grade (DaVinci Resolve) with stereo stems.',
            currentStatus: shared_1.DeliverableStatus.APPROVED,
            currentVersion: 2,
            createdAt: new Date(Date.now() - 15 * 86400000),
            updatedAt: new Date(),
        };
        this.deliverables.set(deliv1.id, deliv1);
        const delivVer1 = {
            id: 'dver_demo_001',
            deliverableId: deliv1.id,
            versionNumber: 2,
            fileName: 'swiggy_tvc_master_v2.mov',
            storageKey: 'deliv/proj_001/swiggy_tvc_v2.mov',
            fileSize: 480000000,
            fileMimeType: 'video/quicktime',
            changelogNotes: 'Approved by Swiggy brand lead Aditya Sen.',
            submittedAt: new Date(Date.now() - 5 * 86400000),
        };
        this.deliverableVersions.set(delivVer1.id, delivVer1);
        const deliv2 = {
            id: 'deliv_demo_002',
            projectId: proj2.id,
            title: 'Apex 450 Launch Film - Cut 03',
            description: 'Color graded v1.3 with CGI sound design pass.',
            currentStatus: shared_1.DeliverableStatus.PENDING_CLIENT_APPROVAL,
            currentVersion: 1,
            createdAt: new Date(Date.now() - 2 * 86400000),
            updatedAt: new Date(),
        };
        this.deliverables.set(deliv2.id, deliv2);
        const delivVer2 = {
            id: 'dver_demo_002',
            deliverableId: deliv2.id,
            versionNumber: 1,
            fileName: 'ather_launch_cut03_graded.mov',
            storageKey: 'deliv/proj_002/ather_cut03.mov',
            fileSize: 620000000,
            fileMimeType: 'video/quicktime',
            changelogNotes: 'Submitted for client sign-off by Rahul Sharma.',
            submittedAt: new Date(Date.now() - 2 * 86400000),
        };
        this.deliverableVersions.set(delivVer2.id, delivVer2);
        // --- Additional Demo Invoices & Payments ---
        const inv2 = {
            id: 'inv_demo_002',
            organizationId: demoOrg.id,
            clientId: client3.id,
            projectId: proj2.id,
            invoiceNumber: 'INV-2026-0139',
            status: shared_1.InvoiceStatus.ISSUED,
            subtotal: 290466,
            discountAmount: 0,
            taxAmount: 52284,
            totalAmount: 342750,
            amountPaid: 0,
            balanceDue: 342750,
            currency: 'INR',
            paymentTerms: 'Payment due within 14 days of invoice date.',
            issuedDate: new Date(Date.now() - 4 * 86400000),
            dueDate: new Date(Date.now() + 10 * 86400000),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.invoices.set(inv2.id, inv2);
        const payment1 = {
            id: 'pay_demo_001',
            organizationId: demoOrg.id,
            invoiceId: demoInv.id,
            amount: 100000,
            currency: 'INR',
            method: shared_1.PaymentMethod.BANK_TRANSFER,
            status: shared_1.PaymentStatus.VERIFIED,
            isManual: true,
            transactionRef: 'NEFT-HDFC-99182377',
            receiptNumber: 'RCP-2026-081',
            notes: 'Initial mobilization advance received via wire transfer.',
            recordedById: adminUser.id,
            verifiedAt: new Date(),
            createdAt: new Date(Date.now() - 3 * 86400000),
        };
        this.payments.set(payment1.id, payment1);
    }
    // --- Users ---
    async findUserByEmail(email) {
        const normalized = email.toLowerCase().trim();
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === normalized) {
                return { ...user };
            }
        }
        return null;
    }
    async findUserById(id) {
        const user = this.users.get(id);
        return user ? { ...user } : null;
    }
    async createUser(data) {
        const existing = await this.findUserByEmail(data.email);
        if (existing) {
            throw new Error('A user with this email address already exists');
        }
        const id = crypto_1.default.randomUUID();
        const user = {
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
    async findOrgById(id) {
        const org = this.organizations.get(id);
        return org ? { ...org } : null;
    }
    async findOrgBySlug(slug) {
        for (const org of this.organizations.values()) {
            if (org.slug === slug) {
                return { ...org };
            }
        }
        return null;
    }
    async createOrganization(data) {
        const baseSlug = (data.slug || data.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        let slug = baseSlug || 'org';
        let counter = 1;
        while (await this.findOrgBySlug(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
        const id = crypto_1.default.randomUUID();
        const org = {
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
    async updateOrganization(id, data) {
        const org = await this.findOrgById(id);
        if (!org) {
            throw new Error('Organization not found');
        }
        const updated = {
            ...org,
            ...data,
            updatedAt: new Date(),
        };
        this.organizations.set(id, updated);
        return { ...updated };
    }
    // --- Memberships ---
    async createMembership(data) {
        const existing = await this.findMembership(data.organizationId, data.userId);
        if (existing) {
            throw new Error('User is already a member of this organization');
        }
        const id = crypto_1.default.randomUUID();
        const membership = {
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
    async findMembership(organizationId, userId) {
        for (const mem of this.memberships.values()) {
            if (mem.organizationId === organizationId && mem.userId === userId && mem.isActive) {
                return { ...mem };
            }
        }
        return null;
    }
    async findMembershipById(id) {
        const mem = this.memberships.get(id);
        return mem ? { ...mem } : null;
    }
    async getUserMemberships(userId) {
        const results = [];
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
    async getOrgMembers(organizationId) {
        const results = [];
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
    async updateMembershipRole(membershipId, newRole) {
        const mem = await this.findMembershipById(membershipId);
        if (!mem) {
            throw new Error('Membership not found');
        }
        const updated = {
            ...mem,
            role: newRole,
            updatedAt: new Date(),
        };
        this.memberships.set(membershipId, updated);
        return { ...updated };
    }
    async deactivateMembership(membershipId) {
        const mem = await this.findMembershipById(membershipId);
        if (!mem) {
            throw new Error('Membership not found');
        }
        mem.isActive = false;
        mem.updatedAt = new Date();
        this.memberships.set(membershipId, mem);
    }
    // --- Audit Logs ---
    async logAudit(data) {
        const id = crypto_1.default.randomUUID();
        const log = {
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
    async createLead(data) {
        const id = crypto_1.default.randomUUID();
        const lead = {
            id,
            organizationId: data.organizationId,
            title: data.title,
            contactName: data.contactName,
            email: data.email.toLowerCase().trim(),
            phone: data.phone || null,
            companyName: data.companyName || null,
            source: data.source || 'Website',
            status: data.status || shared_1.LeadStatus.NEW,
            priority: data.priority || shared_1.Priority.MEDIUM,
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
    async findLeadById(id) {
        const lead = this.leads.get(id);
        return lead ? { ...lead } : null;
    }
    async getLeads(organizationId, filters) {
        const list = [];
        const searchLower = filters?.search?.toLowerCase().trim();
        for (const lead of this.leads.values()) {
            if (lead.organizationId !== organizationId)
                continue;
            if (filters?.status && lead.status !== filters.status)
                continue;
            if (filters?.assignedToId && lead.assignedToId !== filters.assignedToId)
                continue;
            if (searchLower) {
                const matches = lead.title.toLowerCase().includes(searchLower) ||
                    lead.contactName.toLowerCase().includes(searchLower) ||
                    lead.email.toLowerCase().includes(searchLower) ||
                    (lead.companyName && lead.companyName.toLowerCase().includes(searchLower));
                if (!matches)
                    continue;
            }
            list.push({ ...lead });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async updateLead(id, data) {
        const lead = await this.findLeadById(id);
        if (!lead)
            throw new Error('Lead not found');
        const updated = {
            ...lead,
            ...data,
            updatedAt: new Date(),
        };
        this.leads.set(id, updated);
        return { ...updated };
    }
    async addLeadActivity(data) {
        const id = crypto_1.default.randomUUID();
        const activity = {
            id,
            leadId: data.leadId,
            activityType: data.activityType,
            description: data.description,
            createdAt: new Date(),
        };
        this.leadActivities.set(id, activity);
        return { ...activity };
    }
    async getLeadActivities(leadId) {
        const list = [];
        for (const act of this.leadActivities.values()) {
            if (act.leadId === leadId) {
                list.push({ ...act });
            }
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // --- Clients ---
    async createClient(data) {
        const id = crypto_1.default.randomUUID();
        const client = {
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
    async findClientById(id) {
        const client = this.clients.get(id);
        return client ? { ...client } : null;
    }
    async findClientByEmail(organizationId, email) {
        const normalized = email.toLowerCase().trim();
        for (const client of this.clients.values()) {
            if (client.organizationId === organizationId && client.email.toLowerCase() === normalized) {
                return { ...client };
            }
        }
        return null;
    }
    async getClients(organizationId, search) {
        const list = [];
        const searchLower = search?.toLowerCase().trim();
        for (const client of this.clients.values()) {
            if (client.organizationId !== organizationId)
                continue;
            if (searchLower) {
                const matches = client.name.toLowerCase().includes(searchLower) ||
                    client.email.toLowerCase().includes(searchLower) ||
                    (client.company && client.company.toLowerCase().includes(searchLower));
                if (!matches)
                    continue;
            }
            list.push({ ...client });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async updateClient(id, data) {
        const client = await this.findClientById(id);
        if (!client)
            throw new Error('Client not found');
        const updated = {
            ...client,
            ...data,
            updatedAt: new Date(),
        };
        this.clients.set(id, updated);
        return { ...updated };
    }
    // --- Quotations ---
    async createQuotation(data, items) {
        const id = crypto_1.default.randomUUID();
        const quotation = {
            id,
            organizationId: data.organizationId,
            clientId: data.clientId,
            createdById: data.createdById,
            quoteNumber: data.quoteNumber,
            status: shared_1.QuotationStatus.DRAFT,
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
        const savedItems = [];
        for (const item of items) {
            const itemId = crypto_1.default.randomUUID();
            const quoteItem = {
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
    async findQuotationById(id) {
        const quotation = this.quotations.get(id);
        if (!quotation)
            return null;
        const items = [];
        for (const item of this.quotationItems.values()) {
            if (item.quotationId === id) {
                items.push({ ...item });
            }
        }
        return { quotation: { ...quotation }, items };
    }
    async getQuotations(organizationId, filters) {
        const list = [];
        for (const quotation of this.quotations.values()) {
            if (quotation.organizationId !== organizationId)
                continue;
            if (filters?.clientId && quotation.clientId !== filters.clientId)
                continue;
            if (filters?.status && quotation.status !== filters.status)
                continue;
            const items = [];
            for (const item of this.quotationItems.values()) {
                if (item.quotationId === quotation.id) {
                    items.push({ ...item });
                }
            }
            list.push({ quotation: { ...quotation }, items });
        }
        return list.sort((a, b) => b.quotation.createdAt.getTime() - a.quotation.createdAt.getTime());
    }
    async updateQuotationStatus(id, status) {
        const existing = this.quotations.get(id);
        if (!existing)
            throw new Error('Quotation not found');
        const updated = {
            ...existing,
            status,
            updatedAt: new Date(),
        };
        this.quotations.set(id, updated);
        return { ...updated };
    }
    // --- Projects ---
    async createProject(data) {
        const id = crypto_1.default.randomUUID();
        const code = data.code ||
            `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const project = {
            id,
            organizationId: data.organizationId,
            clientId: data.clientId,
            managerId: data.managerId || null,
            name: data.name,
            code,
            description: data.description || null,
            status: shared_1.ProjectStatus.PLANNING,
            priority: data.priority || shared_1.Priority.MEDIUM,
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
    async findProjectById(id) {
        const proj = this.projects.get(id);
        return proj ? { ...proj } : null;
    }
    async getProjects(organizationId, filters) {
        const list = [];
        for (const proj of this.projects.values()) {
            if (proj.organizationId !== organizationId)
                continue;
            if (filters?.clientId && proj.clientId !== filters.clientId)
                continue;
            if (filters?.status && proj.status !== filters.status)
                continue;
            if (filters?.managerId && proj.managerId !== filters.managerId)
                continue;
            list.push({ ...proj });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async updateProject(id, data) {
        const existing = await this.findProjectById(id);
        if (!existing)
            throw new Error('Project not found');
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        };
        this.projects.set(id, updated);
        return { ...updated };
    }
    // --- Milestones ---
    async createMilestone(data) {
        const id = crypto_1.default.randomUUID();
        const milestone = {
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
    async getMilestonesByProject(projectId) {
        const list = [];
        for (const m of this.milestones.values()) {
            if (m.projectId === projectId)
                list.push({ ...m });
        }
        return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    async updateMilestone(id, data) {
        const m = this.milestones.get(id);
        if (!m)
            throw new Error('Milestone not found');
        const updated = {
            ...m,
            ...data,
            completedAt: data.isCompleted ? new Date() : m.completedAt,
            updatedAt: new Date(),
        };
        this.milestones.set(id, updated);
        return { ...updated };
    }
    // --- Tasks ---
    async createTask(data) {
        const id = crypto_1.default.randomUUID();
        const task = {
            id,
            projectId: data.projectId,
            milestoneId: data.milestoneId || null,
            assignedToId: data.assignedToId || null,
            title: data.title,
            description: data.description || null,
            status: shared_1.TaskStatus.TODO,
            priority: data.priority || shared_1.Priority.MEDIUM,
            dueDate: data.dueDate || null,
            completedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.tasks.set(id, task);
        return { ...task };
    }
    async findTaskById(id) {
        const t = this.tasks.get(id);
        return t ? { ...t } : null;
    }
    async getTasks(organizationId, filters) {
        const list = [];
        for (const task of this.tasks.values()) {
            const proj = this.projects.get(task.projectId);
            if (!proj || proj.organizationId !== organizationId)
                continue;
            if (filters?.projectId && task.projectId !== filters.projectId)
                continue;
            if (filters?.assignedToId && task.assignedToId !== filters.assignedToId)
                continue;
            if (filters?.status && task.status !== filters.status)
                continue;
            list.push({ ...task });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async updateTask(id, data) {
        const task = await this.findTaskById(id);
        if (!task)
            throw new Error('Task not found');
        const updated = {
            ...task,
            ...data,
            completedAt: data.status === shared_1.TaskStatus.COMPLETED ? new Date() : task.completedAt,
            updatedAt: new Date(),
        };
        this.tasks.set(id, updated);
        return { ...updated };
    }
    async addSubtask(taskId, title) {
        const id = crypto_1.default.randomUUID();
        const subtask = {
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
    async getSubtasks(taskId) {
        const list = [];
        for (const st of this.subtasks.values()) {
            if (st.taskId === taskId)
                list.push({ ...st });
        }
        return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    async toggleSubtask(id) {
        const st = this.subtasks.get(id);
        if (!st)
            throw new Error('Subtask not found');
        st.isCompleted = !st.isCompleted;
        st.completedAt = st.isCompleted ? new Date() : null;
        this.subtasks.set(id, st);
        return { ...st };
    }
    async addTaskComment(data) {
        const id = crypto_1.default.randomUUID();
        const comment = {
            id,
            taskId: data.taskId,
            userId: data.userId,
            content: data.content,
            createdAt: new Date(),
        };
        this.taskComments.set(id, comment);
        return { ...comment };
    }
    async getTaskComments(taskId) {
        const list = [];
        for (const c of this.taskComments.values()) {
            if (c.taskId === taskId)
                list.push({ ...c });
        }
        return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    // --- Deliverables & Approvals ---
    async createDeliverable(data) {
        const id = crypto_1.default.randomUUID();
        const deliverable = {
            id,
            projectId: data.projectId,
            title: data.title,
            description: data.description || null,
            currentStatus: shared_1.DeliverableStatus.DRAFT,
            currentVersion: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.deliverables.set(id, deliverable);
        return { ...deliverable };
    }
    async findDeliverableById(id) {
        const d = this.deliverables.get(id);
        return d ? { ...d } : null;
    }
    async getDeliverablesByProject(projectId) {
        const list = [];
        for (const d of this.deliverables.values()) {
            if (d.projectId === projectId)
                list.push({ ...d });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async submitDeliverableVersion(data) {
        const deliv = await this.findDeliverableById(data.deliverableId);
        if (!deliv)
            throw new Error('Deliverable not found');
        const nextVersion = deliv.currentVersion + 1;
        const versionId = crypto_1.default.randomUUID();
        const versionRecord = {
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
        deliv.currentStatus = shared_1.DeliverableStatus.PENDING_CLIENT_APPROVAL;
        deliv.updatedAt = new Date();
        this.deliverables.set(deliv.id, deliv);
        return { ...versionRecord };
    }
    async getDeliverableVersions(deliverableId) {
        const list = [];
        for (const v of this.deliverableVersions.values()) {
            if (v.deliverableId === deliverableId)
                list.push({ ...v });
        }
        return list.sort((a, b) => b.versionNumber - a.versionNumber);
    }
    async recordApprovalDecision(data) {
        const version = this.deliverableVersions.get(data.deliverableVersionId);
        if (!version)
            throw new Error('Deliverable version not found');
        const deliv = this.deliverables.get(version.deliverableId);
        if (!deliv)
            throw new Error('Deliverable not found');
        const id = crypto_1.default.randomUUID();
        const approval = {
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
        if (data.decision === shared_1.ApprovalDecision.APPROVED) {
            deliv.currentStatus = shared_1.DeliverableStatus.APPROVED;
        }
        else if (data.decision === shared_1.ApprovalDecision.REVISION_REQUESTED) {
            deliv.currentStatus = shared_1.DeliverableStatus.REVISION_REQUESTED;
        }
        deliv.updatedAt = new Date();
        this.deliverables.set(deliv.id, deliv);
        return { ...approval };
    }
    async getApprovalHistory(deliverableVersionId) {
        const list = [];
        for (const a of this.approvals.values()) {
            if (a.deliverableVersionId === deliverableVersionId)
                list.push({ ...a });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // --- Invoices & Financial Ledger ---
    generateNextInvoiceNumber(organizationId) {
        const year = new Date().getFullYear();
        let count = 0;
        for (const inv of this.invoices.values()) {
            if (inv.organizationId === organizationId)
                count++;
        }
        return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async createInvoice(data) {
        const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
        const invoiceId = crypto_1.default.randomUUID();
        const invoiceNumber = data.invoiceNumber || this.generateNextInvoiceNumber(data.organizationId);
        // Verify invoice number uniqueness within organization
        for (const existing of this.invoices.values()) {
            if (existing.organizationId === data.organizationId && existing.invoiceNumber === invoiceNumber) {
                throw new Error(`Invoice number ${invoiceNumber} already exists in this organization`);
            }
        }
        let subtotal = 0;
        const createdItems = [];
        for (const item of data.items) {
            const itemId = crypto_1.default.randomUUID();
            const totalPrice = round2(item.quantity * item.unitPrice);
            subtotal = round2(subtotal + totalPrice);
            const itemRecord = {
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
        const invoiceRecord = {
            id: invoiceId,
            organizationId: data.organizationId,
            clientId: data.clientId,
            projectId: data.projectId || null,
            invoiceNumber,
            status: shared_1.InvoiceStatus.ISSUED,
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
    async findInvoiceById(id) {
        const inv = this.invoices.get(id);
        return inv ? { ...inv } : null;
    }
    async getInvoices(organizationId, filter) {
        const list = [];
        for (const inv of this.invoices.values()) {
            if (inv.organizationId !== organizationId)
                continue;
            if (filter?.clientId && inv.clientId !== filter.clientId)
                continue;
            if (filter?.status && inv.status !== filter.status)
                continue;
            if (filter?.projectId && inv.projectId !== filter.projectId)
                continue;
            list.push({ ...inv });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getInvoiceItems(invoiceId) {
        const list = [];
        for (const item of this.invoiceItems.values()) {
            if (item.invoiceId === invoiceId)
                list.push({ ...item });
        }
        return list;
    }
    async updateInvoice(id, updates) {
        const inv = this.invoices.get(id);
        if (!inv)
            throw new Error('Invoice not found');
        const updated = {
            ...inv,
            ...updates,
            updatedAt: new Date(),
        };
        this.invoices.set(id, updated);
        return { ...updated };
    }
    async deleteInvoice(id) {
        const inv = this.invoices.get(id);
        if (!inv)
            return false;
        // Delete associated line items
        for (const [itemId, item] of this.invoiceItems.entries()) {
            if (item.invoiceId === id)
                this.invoiceItems.delete(itemId);
        }
        this.invoices.delete(id);
        return true;
    }
    // --- Payments ---
    async recordPayment(data) {
        const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
        const inv = this.invoices.get(data.invoiceId);
        if (!inv)
            throw new Error('Invoice not found');
        if (inv.organizationId !== data.organizationId)
            throw new Error('Tenant mismatch on payment');
        const id = crypto_1.default.randomUUID();
        const status = data.status || shared_1.PaymentStatus.VERIFIED;
        const amount = round2(data.amount);
        const payment = {
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
            verifiedAt: status === shared_1.PaymentStatus.VERIFIED ? new Date() : null,
            recordedById: data.recordedById || null,
            createdAt: new Date(),
        };
        this.payments.set(id, payment);
        // If verified, adjust invoice ledger
        if (status === shared_1.PaymentStatus.VERIFIED) {
            let totalVerified = 0;
            for (const p of this.payments.values()) {
                if (p.invoiceId === inv.id && p.status === shared_1.PaymentStatus.VERIFIED) {
                    totalVerified = round2(totalVerified + p.amount);
                }
            }
            inv.amountPaid = totalVerified;
            inv.balanceDue = round2(Math.max(0, inv.totalAmount - inv.amountPaid));
            if (inv.balanceDue <= 0.005) {
                inv.status = shared_1.InvoiceStatus.PAID;
            }
            else if (inv.amountPaid > 0) {
                inv.status = shared_1.InvoiceStatus.PARTIALLY_PAID;
            }
            inv.updatedAt = new Date();
            this.invoices.set(inv.id, inv);
        }
        return { ...payment };
    }
    async findPaymentById(id) {
        const p = this.payments.get(id);
        return p ? { ...p } : null;
    }
    async getPayments(organizationId, filter) {
        const list = [];
        for (const p of this.payments.values()) {
            if (p.organizationId !== organizationId)
                continue;
            if (filter?.invoiceId && p.invoiceId !== filter.invoiceId)
                continue;
            if (filter?.status && p.status !== filter.status)
                continue;
            list.push({ ...p });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getPaymentsByInvoice(invoiceId) {
        const list = [];
        for (const p of this.payments.values()) {
            if (p.invoiceId === invoiceId)
                list.push({ ...p });
        }
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // --- Payment Webhook Events ---
    async recordPaymentWebhookEvent(data) {
        if (this.paymentWebhookEvents.has(data.eventId)) {
            throw new Error(`Webhook event ${data.eventId} already processed (idempotency guard)`);
        }
        const id = crypto_1.default.randomUUID();
        const eventRecord = {
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
    async findWebhookEvent(eventId) {
        const ev = this.paymentWebhookEvents.get(eventId);
        return ev ? { ...ev } : null;
    }
    // --- Business Overview Intelligence ---
    async getBusinessOverview(organizationId) {
        const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
        let totalRevenue = 0;
        for (const p of this.payments.values()) {
            if (p.organizationId === organizationId && p.status === shared_1.PaymentStatus.VERIFIED) {
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
            if (inv.organizationId === organizationId && inv.status !== shared_1.InvoiceStatus.CANCELLED) {
                totalInvoiced = round2(totalInvoiced + inv.totalAmount);
                outstandingBalance = round2(outstandingBalance + inv.balanceDue);
                if (inv.balanceDue > 0) {
                    const due = new Date(inv.dueDate);
                    const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 0) {
                        current = round2(current + inv.balanceDue);
                    }
                    else if (diffDays <= 30) {
                        current = round2(current + inv.balanceDue);
                    }
                    else if (diffDays <= 60) {
                        overdue30 = round2(overdue30 + inv.balanceDue);
                    }
                    else {
                        overdue60 = round2(overdue60 + inv.balanceDue);
                    }
                }
            }
        }
        let activeProjectsCount = 0;
        for (const pr of this.projects.values()) {
            if (pr.organizationId === organizationId &&
                (pr.status === shared_1.ProjectStatus.ACTIVE ||
                    pr.status === shared_1.ProjectStatus.PLANNING ||
                    pr.status === shared_1.ProjectStatus.REVIEW)) {
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
                if (l.status === shared_1.LeadStatus.WON)
                    wonLeads++;
                else if (l.status === shared_1.LeadStatus.LOST)
                    lostLeads++;
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
exports.DatabaseRepository = DatabaseRepository;
exports.db = new DatabaseRepository();
