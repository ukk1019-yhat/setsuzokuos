"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const db_1 = require("../../storage/db");
const shared_1 = require("@setsuzoku/shared");
class AuthService {
    generateTokens(userId) {
        const accessToken = jsonwebtoken_1.default.sign({ userId }, env_1.ENV.JWT_SECRET, {
            expiresIn: '15m',
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.ENV.JWT_REFRESH_SECRET, {
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    mapUserDto(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt.toISOString(),
        };
    }
    async register(input) {
        const existing = await db_1.db.findUserByEmail(input.email);
        if (existing) {
            const err = new Error('A user with this email address already exists');
            err.statusCode = 409;
            err.code = 'USER_ALREADY_EXISTS';
            throw err;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(input.password, salt);
        const user = await db_1.db.createUser({
            email: input.email,
            passwordHash,
            fullName: input.fullName,
        });
        let activeOrganizationId;
        // If organization name was provided during registration, auto-create it
        if (input.organizationName) {
            const org = await db_1.db.createOrganization({
                name: input.organizationName,
                businessEmail: input.email,
            });
            await db_1.db.createMembership({
                organizationId: org.id,
                userId: user.id,
                role: shared_1.MembershipRole.ORGANIZATION_OWNER,
                title: 'Founder & Owner',
            });
            activeOrganizationId = org.id;
            await db_1.db.logAudit({
                organizationId: org.id,
                userId: user.id,
                action: 'ORGANIZATION_CREATED',
                resource: 'Organization',
                resourceId: org.id,
            });
        }
        const { accessToken } = this.generateTokens(user.id);
        const memberships = await db_1.db.getUserMemberships(user.id);
        return {
            user: this.mapUserDto(user),
            accessToken,
            organizations: memberships.map((m) => ({
                organization: {
                    ...m.organization,
                    createdAt: m.organization.createdAt.toISOString(),
                },
                role: m.membership.role,
            })),
            activeOrganizationId,
        };
    }
    async login(input) {
        const user = await db_1.db.findUserByEmail(input.email);
        if (!user) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }
        const isValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isValid) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }
        const { accessToken } = this.generateTokens(user.id);
        const memberships = await db_1.db.getUserMemberships(user.id);
        return {
            user: this.mapUserDto(user),
            accessToken,
            organizations: memberships.map((m) => ({
                organization: {
                    ...m.organization,
                    createdAt: m.organization.createdAt.toISOString(),
                },
                role: m.membership.role,
            })),
            activeOrganizationId: memberships.length > 0 ? memberships[0].organization.id : undefined,
        };
    }
    async getCurrentUser(userId) {
        const user = await db_1.db.findUserById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            err.code = 'USER_NOT_FOUND';
            throw err;
        }
        const memberships = await db_1.db.getUserMemberships(user.id);
        const { accessToken } = this.generateTokens(user.id);
        return {
            user: this.mapUserDto(user),
            accessToken,
            organizations: memberships.map((m) => ({
                organization: {
                    ...m.organization,
                    createdAt: m.organization.createdAt.toISOString(),
                },
                role: m.membership.role,
            })),
            activeOrganizationId: memberships.length > 0 ? memberships[0].organization.id : undefined,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
