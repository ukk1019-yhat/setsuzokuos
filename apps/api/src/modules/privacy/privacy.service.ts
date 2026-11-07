import { db } from '../../storage/db';

export class PrivacyService {
  /**
   * India DPDP Act 2023 - Data Subject Access Request (DSAR) / Data Portability Export
   */
  public async exportUserData(userId: string) {
    const user = await db.findUserById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const memberships = await db.getUserMemberships(userId);
    const auditLogs: any[] = [];
    for (const log of db.auditLogs.values()) {
      if (log.userId === userId) {
        auditLogs.push({ ...log });
      }
    }

    // Scrub internal hash from export
    const { passwordHash, ...cleanUser } = user;

    return {
      dataSubject: cleanUser,
      memberships: memberships.map((m) => ({
        organizationName: m.organization.name,
        role: m.membership.role,
        joinedAt: m.membership.joinedAt,
      })),
      activityTrail: auditLogs,
      exportedAt: new Date().toISOString(),
      complianceNotice: 'Data export provided pursuant to the Digital Personal Data Protection (DPDP) Act, 2023.',
    };
  }

  /**
   * India DPDP Act 2023 - Right to Erasure / Data Deletion Request
   */
  public async requestDataDeletion(
    userId: string,
    reason?: string,
    ipAddress?: string
  ) {
    const user = await db.findUserById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    // Check if user is sole owner of an organization with active billing
    const memberships = await db.getUserMemberships(userId);
    const soleOwnerOrgs = memberships.filter(
      (m) => m.membership.role === 'ORGANIZATION_OWNER'
    );

    if (soleOwnerOrgs.length > 0) {
      // Must transfer ownership or close org before personal erasure
      const err: any = new Error(
        'Cannot erase data while designated as sole organization owner. Please transfer ownership or close your organization first.'
      );
      err.statusCode = 400;
      err.code = 'CANNOT_ERASE_SOLE_OWNER';
      throw err;
    }

    // Anonymize user record
    const anonymizedEmail = `deleted_${userId.substring(0, 8)}@privacy.setsuzoku.in`;
    user.fullName = '[Data Principal Erased - DPDP Act]';
    user.email = anonymizedEmail;
    user.phone = null;
    user.avatarUrl = null;
    user.updatedAt = new Date();
    db.users.set(userId, user);

    // Record immutable audit event for compliance
    if (memberships.length > 0) {
      await db.logAudit({
        organizationId: memberships[0].organization.id,
        userId: userId,
        action: 'DPDP_RIGHT_TO_ERASURE_EXECUTED',
        resource: 'User',
        resourceId: userId,
        diff: { reason: reason || 'Data Principal Requested Erasure' },
        ipAddress,
      });
    }

    return {
      success: true,
      message: 'Personal data has been anonymized and erased in accordance with Section 12 of the DPDP Act, 2023.',
      erasedAt: new Date().toISOString(),
    };
  }

  public getPrivacyPolicy() {
    return {
      version: '2026.1',
      jurisdiction: 'Republic of India',
      statutoryFramework: 'Digital Personal Data Protection (DPDP) Act, 2023',
      dataFiduciary: 'Setsuzoku Media Labs Private Limited',
      grievanceOfficer: {
        name: 'Data Protection Officer',
        email: 'info@setsuzoku.in',
        address: 'Mumbai, Maharashtra, India',
        resolutionSlaHours: 72,
      },
      purposes: [
        'Contractual execution and client deliverable sign-offs',
        'GST-compliant invoicing and audit-logged tax reporting',
        'Secure multi-tenant agency operations',
      ],
      retentionPeriod: 'Retained during active relationship + statutory 7 years for GST financial ledgers',
    };
  }
}

export const privacyService = new PrivacyService();
