import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { MembershipRole } from '@setsuzoku/shared';
import { UserPlus, Shield, Trash2, Mail, Briefcase } from 'lucide-react';

interface MemberItem {
  membershipId: string;
  role: MembershipRole;
  title?: string | null;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
}

export const TeamPage: React.FC = () => {
  const { currentOrg, currentRole } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<MembershipRole>(MembershipRole.EMPLOYEE);
  const [inviteTitle, setInviteTitle] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<MemberItem[]>('/members');
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);

    try {
      await apiRequest('/members/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          fullName: inviteName,
          role: inviteRole,
          title: inviteTitle || undefined,
        }),
      });

      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteTitle('');
      setInviteRole(MembershipRole.EMPLOYEE);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: MembershipRole) => {
    try {
      await apiRequest(`/members/${membershipId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      await fetchMembers();
    } catch (err: any) {
      console.warn('Failed to update role on API:', err);
    }
  };

  const handleRemove = async (membershipId: string, memberName: string) => {
    try {
      await apiRequest(`/members/${membershipId}`, {
        method: 'DELETE',
      });
      await fetchMembers();
    } catch (err: any) {
      console.warn('Failed to remove member on API:', err);
    }
  };

  const getRoleBadgeVariant = (role: MembershipRole) => {
    switch (role) {
      case MembershipRole.ORGANIZATION_OWNER:
        return 'navy';
      case MembershipRole.ADMIN:
        return 'teal';
      case MembershipRole.MANAGER:
        return 'warning';
      case MembershipRole.FINANCE:
        return 'success';
      case MembershipRole.CLIENT:
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const canManageRoles =
    currentRole === MembershipRole.SUPER_ADMIN ||
    currentRole === MembershipRole.ORGANIZATION_OWNER;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Team & RBAC Management</h1>
          <p className="text-xs text-brand-muted mt-1">
            Manage organization members, assign roles and control access permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={() => setIsInviteOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Members Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-brand-muted">
            Loading organization roster...
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-muted">
            No team members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.membershipId} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-xs">
                          {m.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-brand-text">{m.user.fullName}</div>
                          <div className="text-[11px] text-brand-muted">{m.user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getRoleBadgeVariant(m.role)} size="sm">
                        {m.role.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-brand-text">
                      {m.title || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-brand-muted">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManageRoles && m.role !== MembershipRole.ORGANIZATION_OWNER ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={m.role}
                            onChange={(e) =>
                              handleRoleChange(m.membershipId, e.target.value as MembershipRole)
                            }
                            className="text-xs px-2 py-1 bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                          >
                            <option value={MembershipRole.ADMIN}>Admin</option>
                            <option value={MembershipRole.MANAGER}>Manager</option>
                            <option value={MembershipRole.EMPLOYEE}>Employee</option>
                            <option value={MembershipRole.FINANCE}>Finance</option>
                            <option value={MembershipRole.CLIENT}>Client</option>
                          </select>

                          <button
                            onClick={() => handleRemove(m.membershipId, m.user.fullName)}
                            title="Remove member"
                            className="p-1 text-gray-400 hover:text-brand-error hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-brand-muted italic">Owner Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Colleague"
        subtitle={`Add team member to ${currentOrg?.name}`}
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="John Smith"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="john@agency.com"
          />

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Role & Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MembershipRole)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value={MembershipRole.EMPLOYEE}>Employee (Tasks, Deliverables)</option>
              <option value={MembershipRole.MANAGER}>Manager (Projects, Department Tasks)</option>
              <option value={MembershipRole.FINANCE}>Finance (Quotations, Invoices, Payments)</option>
              <option value={MembershipRole.ADMIN}>Admin (Operations, Team, Reports)</option>
            </select>
          </div>

          <Input
            label="Job Title"
            value={inviteTitle}
            onChange={(e) => setInviteTitle(e.target.value)}
            placeholder="e.g. Lead Video Editor / Project Manager"
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isInviting}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

