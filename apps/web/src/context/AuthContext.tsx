import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../api/client';
import {
  UserDto,
  OrganizationDto,
  MembershipRole,
  AuthResponseDto,
} from '@setsuzoku/shared';

const DEMO_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX2FkbWluXzAwMSIsImlhdCI6MTc5Mzk4OTI4OSwiZXhwIjoxODI1NTI1Mjg5fQ.546mN5cJR-gjybNYmwAH2vgNC35bOXR0hfaS0OaWAfc';

const DEMO_USER: UserDto = {
  id: 'user_admin_001',
  email: 'info@setsuzoku.in',
  fullName: 'Agency Director (Demo)',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
};

const DEMO_ORG: OrganizationDto = {
  id: 'org_demo_001',
  name: 'Setsuzoku Media Labs',
  slug: 'setsuzoku-media-labs',
  logoUrl: '/setsuzoku-logo.png',
  businessEmail: 'info@setsuzoku.in',
  phone: '+91 99999 00000',
  country: 'India',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  taxNumber: '27AABCS1429B1Z',
  description: 'Unified Creative Agency & Digital Engineering Studio',
  createdAt: new Date().toISOString(),
};

interface AuthContextType {
  user: UserDto | null;
  organizations: Array<{ organization: OrganizationDto; role: MembershipRole }>;
  currentOrg: OrganizationDto | null;
  currentRole: MembershipRole | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { fullName: string; email: string; password: string; organizationName?: string }) => Promise<void>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  switchRole: (role: MembershipRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always initialize with active demo credentials - zero auth blocking
  const [user, setUser] = useState<UserDto | null>(DEMO_USER);
  const [organizations, setOrganizations] = useState<
    Array<{ organization: OrganizationDto; role: MembershipRole }>
  >([{ organization: DEMO_ORG, role: MembershipRole.ORGANIZATION_OWNER }]);
  const [currentOrg, setCurrentOrg] = useState<OrganizationDto | null>(DEMO_ORG);
  const [currentRole, setCurrentRole] = useState<MembershipRole | null>(
    MembershipRole.ORGANIZATION_OWNER
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ensure tokens are immediately present in localStorage
  useEffect(() => {
    if (!localStorage.getItem('setsuzoku_access_token')) {
      localStorage.setItem('setsuzoku_access_token', DEMO_TOKEN);
      localStorage.setItem('accessToken', DEMO_TOKEN);
    }
    if (!localStorage.getItem('setsuzoku_active_org_id')) {
      localStorage.setItem('setsuzoku_active_org_id', DEMO_ORG.id);
      localStorage.setItem('activeOrgId', DEMO_ORG.id);
    }
  }, []);

  const applyAuthData = (data: AuthResponseDto) => {
    setUser(data.user);
    setOrganizations(data.organizations);
    localStorage.setItem('setsuzoku_access_token', data.accessToken);
    localStorage.setItem('accessToken', data.accessToken);

    const savedOrgId =
      localStorage.getItem('setsuzoku_active_org_id') ||
      localStorage.getItem('activeOrgId') ||
      data.activeOrganizationId;
    const match = data.organizations.find((o) => o.organization.id === savedOrgId) || data.organizations[0];

    if (match) {
      setCurrentOrg(match.organization);
      setCurrentRole(match.role);
      localStorage.setItem('setsuzoku_active_org_id', match.organization.id);
      localStorage.setItem('activeOrgId', match.organization.id);
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiRequest<AuthResponseDto>('/auth/me');
      applyAuthData(data);
    } catch {
      // In demo mode, stay logged in as demo user even if endpoint is offline
      setUser(DEMO_USER);
      setCurrentOrg(DEMO_ORG);
      setCurrentRole(MembershipRole.ORGANIZATION_OWNER);
    }
  };

  const login = async (input: { email: string; password: string }) => {
    try {
      const data = await apiRequest<AuthResponseDto>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      applyAuthData(data);
    } catch {
      setUser(DEMO_USER);
      setCurrentOrg(DEMO_ORG);
    }
  };

  const register = async (input: {
    fullName: string;
    email: string;
    password: string;
    organizationName?: string;
  }) => {
    try {
      const data = await apiRequest<AuthResponseDto>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      applyAuthData(data);
    } catch {
      setUser(DEMO_USER);
      setCurrentOrg(DEMO_ORG);
    }
  };

  const logout = () => {
    // In demo mode, simply reset to default demo director
    setUser(DEMO_USER);
    setCurrentOrg(DEMO_ORG);
    setCurrentRole(MembershipRole.ORGANIZATION_OWNER);
  };

  const switchOrganization = (orgId: string) => {
    const match = organizations.find((o) => o.organization.id === orgId);
    if (match) {
      setCurrentOrg(match.organization);
      setCurrentRole(match.role);
      localStorage.setItem('setsuzoku_active_org_id', match.organization.id);
      localStorage.setItem('activeOrgId', match.organization.id);
    }
  };

  const switchRole = (role: MembershipRole) => {
    setCurrentRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        currentRole,
        isLoading,
        login,
        register,
        logout,
        switchOrganization,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
