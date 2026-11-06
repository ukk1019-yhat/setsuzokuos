"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class OrganizationService {
    async create(userId, input) {
        const org = await db_1.db.createOrganization({
            name: input.name,
            currency: input.currency,
            timezone: input.timezone,
            country: input.country,
            businessEmail: input.businessEmail,
            phone: input.phone,
            taxNumber: input.taxNumber,
            description: input.description,
        });
        await db_1.db.createMembership({
            organizationId: org.id,
            userId,
            role: shared_1.MembershipRole.ORGANIZATION_OWNER,
            title: 'Founder & Owner',
        });
        await db_1.db.logAudit({
            organizationId: org.id,
            userId,
            action: 'ORGANIZATION_CREATED',
            resource: 'Organization',
            resourceId: org.id,
            diff: input,
        });
        return {
            ...org,
            createdAt: org.createdAt.toISOString(),
        };
    }
    async getById(organizationId) {
        const org = await db_1.db.findOrgById(organizationId);
        if (!org) {
            const err = new Error('Organization not found');
            err.statusCode = 404;
            err.code = 'ORG_NOT_FOUND';
            throw err;
        }
        return {
            ...org,
            createdAt: org.createdAt.toISOString(),
        };
    }
    async getBySlug(slug) {
        const org = await db_1.db.findOrgBySlug(slug);
        if (!org) {
            const err = new Error('Organization not found');
            err.statusCode = 404;
            err.code = 'ORG_NOT_FOUND';
            throw err;
        }
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            logoUrl: org.logoUrl,
            country: org.country,
            currency: org.currency,
            description: org.description,
        };
    }
    async update(organizationId, userId, input) {
        const existing = await db_1.db.findOrgById(organizationId);
        if (!existing) {
            const err = new Error('Organization not found');
            err.statusCode = 404;
            err.code = 'ORG_NOT_FOUND';
            throw err;
        }
        const updated = await db_1.db.updateOrganization(organizationId, input);
        await db_1.db.logAudit({
            organizationId,
            userId,
            action: 'ORGANIZATION_UPDATED',
            resource: 'Organization',
            resourceId: organizationId,
            diff: { before: existing, after: updated },
        });
        return {
            ...updated,
            createdAt: updated.createdAt.toISOString(),
        };
    }
    async getUserOrganizations(userId) {
        const memberships = await db_1.db.getUserMemberships(userId);
        return memberships.map((m) => ({
            organization: {
                ...m.organization,
                createdAt: m.organization.createdAt.toISOString(),
            },
            role: m.membership.role,
            joinedAt: m.membership.joinedAt.toISOString(),
        }));
    }
}
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
