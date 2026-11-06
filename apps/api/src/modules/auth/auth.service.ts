import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { db, UserRecord } from '../../storage/db';
import {
  RegisterInput,
  LoginInput,
  MembershipRole,
  AuthResponseDto,
  UserDto,
  OrganizationDto,
} from '@setsuzoku/shared';

export class AuthService {
  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, ENV.JWT_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private mapUserDto(user: UserRecord): UserDto {
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

  public async register(input: RegisterInput): Promise<AuthResponseDto> {
    const existing = await db.findUserByEmail(input.email);
    if (existing) {
      const err: any = new Error('A user with this email address already exists');
      err.statusCode = 409;
      err.code = 'USER_ALREADY_EXISTS';
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await db.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    });

    let activeOrganizationId: string | undefined;

    // If organization name was provided during registration, auto-create it
    if (input.organizationName) {
      const org = await db.createOrganization({
        name: input.organizationName,
        businessEmail: input.email,
      });

      await db.createMembership({
        organizationId: org.id,
        userId: user.id,
        role: MembershipRole.ORGANIZATION_OWNER,
        title: 'Founder & Owner',
      });

      activeOrganizationId = org.id;

      await db.logAudit({
        organizationId: org.id,
        userId: user.id,
        action: 'ORGANIZATION_CREATED',
        resource: 'Organization',
        resourceId: org.id,
      });
    }

    const { accessToken } = this.generateTokens(user.id);
    const memberships = await db.getUserMemberships(user.id);

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

  public async login(input: LoginInput): Promise<AuthResponseDto> {
    const user = await db.findUserByEmail(input.email);
    if (!user) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const { accessToken } = this.generateTokens(user.id);
    const memberships = await db.getUserMemberships(user.id);

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

  public async getCurrentUser(userId: string): Promise<AuthResponseDto> {
    const user = await db.findUserById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const memberships = await db.getUserMemberships(user.id);
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

export const authService = new AuthService();

