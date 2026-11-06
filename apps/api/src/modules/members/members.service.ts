import bcrypt from 'bcryptjs';
import { db } from '../../storage/db';
import {
  InviteMemberInput,
  MembershipRole,
} from '@setsuzoku/shared';

export class MembersService {
  public async getMembers(organizationId: string) {
    const list = await db.getOrgMembers(organizationId);
    return list.map((item) => ({
      membershipId: item.membership.id,
      role: item.membership.role,
      title: item.membership.title,
      joinedAt: item.membership.joinedAt.toISOString(),
      user: {
        id: item.user.id,
        email: item.user.email,
        fullName: item.user.fullName,
        avatarUrl: item.user.avatarUrl,
        phone: item.user.phone,
      },
    }));
  }

  public async inviteMember(
    organizationId: string,
    invitedByUserId: string,
    input: InviteMemberInput
  ) {
    let user = await db.findUserByEmail(input.email);

    if (!user) {
      // Auto-provision user account with temporary password
      const tempPasswordHash = await bcrypt.hash('SetsuzokuTemp2026!', 10);
      user = await db.createUser({
        email: input.email,
        fullName: input.fullName,
        passwordHash: tempPasswordHash,
        isEmailVerified: false,
      });
    }

    const existingMem = await db.findMembership(organizationId, user.id);
    if (existingMem) {
      const err: any = new Error('User is already an active member of this organization');
      err.statusCode = 409;
      err.code = 'ALREADY_MEMBER';
      throw err;
    }

    const membership = await db.createMembership({
      organizationId,
      userId: user.id,
      role: input.role,
      title: input.title,
    });

    await db.logAudit({
      organizationId,
      userId: invitedByUserId,
      action: 'MEMBER_INVITED',
      resource: 'Membership',
      resourceId: membership.id,
      diff: { invitedEmail: input.email, role: input.role },
    });

    return {
      membershipId: membership.id,
      role: membership.role,
      title: membership.title,
      joinedAt: membership.joinedAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  public async updateRole(
    organizationId: string,
    currentUserId: string,
    membershipId: string,
    newRole: MembershipRole
  ) {
    const targetMem = await db.findMembershipById(membershipId);
    if (!targetMem || targetMem.organizationId !== organizationId) {
      const err: any = new Error('Member not found in this organization');
      err.statusCode = 404;
      err.code = 'MEMBER_NOT_FOUND';
      throw err;
    }

    // Safety: Prevent removing or demoting an owner if they are the sole owner
    if (targetMem.role === MembershipRole.ORGANIZATION_OWNER && newRole !== MembershipRole.ORGANIZATION_OWNER) {
      const allMembers = await db.getOrgMembers(organizationId);
      const owners = allMembers.filter((m) => m.membership.role === MembershipRole.ORGANIZATION_OWNER);
      if (owners.length <= 1) {
        const err: any = new Error('Cannot demote the sole organization owner. Assign another owner first.');
        err.statusCode = 400;
        err.code = 'CANNOT_DEMOTE_SOLE_OWNER';
        throw err;
      }
    }

    const updated = await db.updateMembershipRole(membershipId, newRole);

    await db.logAudit({
      organizationId,
      userId: currentUserId,
      action: 'MEMBER_ROLE_UPDATED',
      resource: 'Membership',
      resourceId: membershipId,
      diff: { oldRole: targetMem.role, newRole },
    });

    return updated;
  }

  public async removeMember(organizationId: string, currentUserId: string, membershipId: string) {
    const targetMem = await db.findMembershipById(membershipId);
    if (!targetMem || targetMem.organizationId !== organizationId) {
      const err: any = new Error('Member not found in this organization');
      err.statusCode = 404;
      err.code = 'MEMBER_NOT_FOUND';
      throw err;
    }

    if (targetMem.role === MembershipRole.ORGANIZATION_OWNER) {
      const err: any = new Error('Organization owners cannot be removed.');
      err.statusCode = 400;
      err.code = 'CANNOT_REMOVE_OWNER';
      throw err;
    }

    await db.deactivateMembership(membershipId);

    await db.logAudit({
      organizationId,
      userId: currentUserId,
      action: 'MEMBER_REMOVED',
      resource: 'Membership',
      resourceId: membershipId,
    });
  }
}

export const membersService = new MembersService();

