import { db } from '../../storage/db';
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  MembershipRole,
  OrganizationDto,
} from '@setsuzoku/shared';

export class OrganizationService {
  public async create(userId: string, input: CreateOrganizationInput): Promise<OrganizationDto> {
    const org = await db.createOrganization({
      name: input.name,
      currency: input.currency,
      timezone: input.timezone,
      country: input.country,
      businessEmail: input.businessEmail,
      phone: input.phone,
      taxNumber: input.taxNumber,
      description: input.description,
    });

    await db.createMembership({
      organizationId: org.id,
      userId,
      role: MembershipRole.ORGANIZATION_OWNER,
      title: 'Founder & Owner',
    });

    await db.logAudit({
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

  public async getById(organizationId: string): Promise<OrganizationDto> {
    const org = await db.findOrgById(organizationId);
    if (!org) {
      const err: any = new Error('Organization not found');
      err.statusCode = 404;
      err.code = 'ORG_NOT_FOUND';
      throw err;
    }
    return {
      ...org,
      createdAt: org.createdAt.toISOString(),
    };
  }

  public async getBySlug(slug: string): Promise<Partial<OrganizationDto>> {
    const org = await db.findOrgBySlug(slug);
    if (!org) {
      const err: any = new Error('Organization not found');
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

  public async update(
    organizationId: string,
    userId: string,
    input: UpdateOrganizationInput
  ): Promise<OrganizationDto> {
    const existing = await db.findOrgById(organizationId);
    if (!existing) {
      const err: any = new Error('Organization not found');
      err.statusCode = 404;
      err.code = 'ORG_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateOrganization(organizationId, input);

    await db.logAudit({
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

  public async getUserOrganizations(userId: string) {
    const memberships = await db.getUserMemberships(userId);
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

export const organizationService = new OrganizationService();

