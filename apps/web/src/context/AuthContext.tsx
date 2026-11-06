import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../api/client';
import {
  UserDto,
  OrganizationDto,
  MembershipRole,
  AuthResponseDto,
} from '@setsuzoku/shared';

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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [organizations, setOrganizations] = useState<
    Array<{ organization: OrganizationDto; role: MembershipRole }>
  >([]);
  const [currentOrg, setCurrentOrg] = useState<OrganizationDto | null>(null);
  const [currentRole, setCurrentRole] = useState<MembershipRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyAuthData = (data: AuthResponseDto) => {
    setUser(data.user);
    setOrganizations(data.organizations);
    localStorage.setItem('setsuzoku_access_token', data.accessToken);

    const savedOrgId = localStorage.getItem('setsuzoku_active_org_id') || data.activeOrganizationId;
    const match = data.organizations.find((o) => o.organization.id === savedOrgId) || data.organizations[0];

    if (match) {
      setCurrentOrg(match.organization);
      setCurrentRole(match.role);
      localStorage.setItem('setsuzoku_active_org_id', match.organization.id);
    } else {
      setCurrentOrg(null);
      setCurrentRole(null);
      localStorage.removeItem('setsuzoku_active_org_id');
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('setsuzoku_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await apiRequest<AuthResponseDto>('/auth/me');
      applyAuthData(data);
    } catch (err) {
      console.error('Session restore failed:', err);
      localStorage.removeItem('setsuzoku_access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (input: { email: string; password: string }) => {
    const data = await apiRequest<AuthResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    applyAuthData(data);
  };

  const register = async (input: {
    fullName: string;
    email: string;
    password: string;
    organizationName?: string;
  }) => {
    const data = await apiRequest<AuthResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    applyAuthData(data);
  };

  const logout = () => {
    localStorage.removeItem('setsuzoku_access_token');
    localStorage.removeItem('setsuzoku_active_org_id');
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
    setCurrentRole(null);
  };

  const switchOrganization = (orgId: string) => {
    const match = organizations.find((o) => o.organization.id === orgId);
    if (match) {
      setCurrentOrg(match.organization);
      setCurrentRole(match.role);
      localStorage.setItem('setsuzoku_active_org_id', match.organization.id);
    }
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

