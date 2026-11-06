"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersService = exports.MembersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class MembersService {
    async getMembers(organizationId) {
        const list = await db_1.db.getOrgMembers(organizationId);
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
    async inviteMember(organizationId, invitedByUserId, input) {
        let user = await db_1.db.findUserByEmail(input.email);
        if (!user) {
            // Auto-provision user account with temporary password
            const tempPasswordHash = await bcryptjs_1.default.hash('SetsuzokuTemp2026!', 10);
            user = await db_1.db.createUser({
                email: input.email,
                fullName: input.fullName,
                passwordHash: tempPasswordHash,
                isEmailVerified: false,
            });
        }
        const existingMem = await db_1.db.findMembership(organizationId, user.id);
        if (existingMem) {
            const err = new Error('User is already an active member of this organization');
            err.statusCode = 409;
            err.code = 'ALREADY_MEMBER';
            throw err;
        }
        const membership = await db_1.db.createMembership({
            organizationId,
            userId: user.id,
            role: input.role,
            title: input.title,
        });
        await db_1.db.logAudit({
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
    async updateRole(organizationId, currentUserId, membershipId, newRole) {
        const targetMem = await db_1.db.findMembershipById(membershipId);
        if (!targetMem || targetMem.organizationId !== organizationId) {
            const err = new Error('Member not found in this organization');
            err.statusCode = 404;
            err.code = 'MEMBER_NOT_FOUND';
            throw err;
        }
        // Safety: Prevent removing or demoting an owner if they are the sole owner
        if (targetMem.role === shared_1.MembershipRole.ORGANIZATION_OWNER && newRole !== shared_1.MembershipRole.ORGANIZATION_OWNER) {
            const allMembers = await db_1.db.getOrgMembers(organizationId);
            const owners = allMembers.filter((m) => m.membership.role === shared_1.MembershipRole.ORGANIZATION_OWNER);
            if (owners.length <= 1) {
                const err = new Error('Cannot demote the sole organization owner. Assign another owner first.');
                err.statusCode = 400;
                err.code = 'CANNOT_DEMOTE_SOLE_OWNER';
                throw err;
            }
        }
        const updated = await db_1.db.updateMembershipRole(membershipId, newRole);
        await db_1.db.logAudit({
            organizationId,
            userId: currentUserId,
            action: 'MEMBER_ROLE_UPDATED',
            resource: 'Membership',
            resourceId: membershipId,
            diff: { oldRole: targetMem.role, newRole },
        });
        return updated;
    }
    async removeMember(organizationId, currentUserId, membershipId) {
        const targetMem = await db_1.db.findMembershipById(membershipId);
        if (!targetMem || targetMem.organizationId !== organizationId) {
            const err = new Error('Member not found in this organization');
            err.statusCode = 404;
            err.code = 'MEMBER_NOT_FOUND';
            throw err;
        }
        if (targetMem.role === shared_1.MembershipRole.ORGANIZATION_OWNER) {
            const err = new Error('Organization owners cannot be removed.');
            err.statusCode = 400;
            err.code = 'CANNOT_REMOVE_OWNER';
            throw err;
        }
        await db_1.db.deactivateMembership(membershipId);
        await db_1.db.logAudit({
            organizationId,
            userId: currentUserId,
            action: 'MEMBER_REMOVED',
            resource: 'Membership',
            resourceId: membershipId,
        });
    }
}
exports.MembersService = MembersService;
exports.membersService = new MembersService();
