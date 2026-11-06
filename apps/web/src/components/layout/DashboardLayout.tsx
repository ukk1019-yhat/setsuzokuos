import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  CheckSquare,
  ShieldCheck,
  FileText,
  CreditCard,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  Search,
  ExternalLink,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { MembershipRole } from '@setsuzoku/shared';
import { Logo } from '../common/Logo';

export const DashboardLayout: React.FC = () => {
  const { user, currentOrg, currentRole, switchRole, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: '1',
      title: 'Invoice overdue',
      desc: 'Swiggy Brand Studio (INV-2026-0142) balance ₹1,86,400 due 4 days ago',
      time: '4d',
      unread: true,
    },
    {
      id: '2',
      title: 'Quotation awaiting reply',
      desc: 'Tata Consumer Products (QT-2026-0084) for ₹4,25,000 sent 5 days ago',
      time: '5d',
      unread: true,
    },
    {
      id: '3',
      title: 'Deliverable sign-off',
      desc: 'Ather Energy Launch Film Cut 03 pending review by Rahul Sharma',
      time: '2d',
      unread: false,
    },
  ]);

  const navGroups = [
    {
      group: null,
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Sales',
      items: [
        { label: 'Leads', to: '/leads', icon: Users },
        { label: 'Quotations', to: '/quotations', icon: FileSpreadsheet },
        { label: 'Clients', to: '/clients', icon: Building2 },
      ],
    },
    {
      group: 'Delivery',
      items: [
        { label: 'Projects', to: '/projects', icon: FolderKanban },
        { label: 'Tasks', to: '/tasks', icon: CheckSquare },
        { label: 'Approvals', to: '/approvals', icon: ShieldCheck },
      ],
    },
    {
      group: 'Money',
      items: [
        { label: 'Invoices', to: '/invoices', icon: FileText },
        { label: 'Payments', to: '/payments', icon: CreditCard },
        { label: 'Reports', to: '/reports', icon: BarChart3 },
      ],
    },
    {
      group: 'Admin',
      items: [
        { label: 'Client portal', to: '/portal', icon: ExternalLink },
        { label: 'Team & permissions', to: '/team', icon: UserCheck },
        { label: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  const formatRoleName = (role?: MembershipRole | null) => {
    switch (role) {
      case MembershipRole.ORGANIZATION_OWNER:
        return 'Owner';
      case MembershipRole.MANAGER:
        return 'Manager';
      case MembershipRole.EMPLOYEE:
        return 'Producer';
      case MembershipRole.FINANCE:
        return 'Finance';
      case MembershipRole.CLIENT:
        return 'Client';
      default:
        return 'Owner';
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-sidebar flex flex-col flex-shrink-0 border-r border-brand-sidebar-border select-none">
        {/* Brand header - minimal without tagline */}
        <div className="h-14 flex items-center px-4 border-b border-brand-sidebar-border">
          <Logo variant="sidebar" />
        </div>

        {/* Navigation grouped */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {navGroups.map((g, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {g.group && (
                <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-brand-sidebar-text">
                  {g.group}
                </div>
              )}
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-brand-accent text-white'
                        : 'text-brand-sidebar-text hover:text-white hover:bg-brand-sidebar-hover'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 opacity-80" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-3 border-t border-brand-sidebar-border bg-[#111317] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-[#262A30] text-slate-200 flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="truncate">
              <span className="block text-[13px] font-medium text-white truncate leading-tight">
                {user?.fullName || 'Setsuzoku Admin'}
              </span>
              <span className="block text-[11px] text-brand-sidebar-text truncate">
                {formatRoleName(currentRole)}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Reset session"
            className="p-1 text-brand-sidebar-text hover:text-white rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Support direct address */}
        <div className="px-3 py-1.5 border-t border-brand-sidebar-border bg-[#0E1013] flex items-center justify-between text-[11px] text-brand-sidebar-text">
          <span>Support:</span>
          <a
            href="mailto:info@setsuzoku.in"
            className="hover:text-white font-mono text-[11px] transition"
          >
            info@setsuzoku.in
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-6 flex-shrink-0">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search leads, projects, clients, invoices..."
                className="w-full pl-8 pr-3 py-1 text-[13px] bg-brand-bg border border-brand-border rounded focus:outline-none focus:border-brand-accent focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:info@setsuzoku.in"
              className="text-[12px] text-brand-muted hover:text-brand-text font-medium flex items-center gap-1.5 px-2.5 py-1 rounded border border-brand-border bg-white hover:bg-gray-50 transition"
            >
              <Mail className="w-3.5 h-3.5 text-brand-muted" strokeWidth={1.75} />
              <span>info@setsuzoku.in</span>
            </a>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-1.5 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                {unreadNotifications.some((n) => n.unread) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent absolute top-1 right-1" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded shadow-lg border border-brand-border py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-brand-border flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-text">Notifications</span>
                    <button
                      onClick={() =>
                        setUnreadNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                      }
                      className="text-[11px] text-brand-accent hover:underline font-medium"
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {unreadNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 text-[12px] hover:bg-gray-50 transition ${
                          n.unread ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-brand-text">{n.title}</span>
                          <span className="text-[10px] text-brand-muted tabular-nums">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-brand-muted leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-brand-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
