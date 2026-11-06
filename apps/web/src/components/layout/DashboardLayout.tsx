import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
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
  ChevronDown,
  RotateCcw,
  Bell,
  Search,
  Layers,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { MembershipRole } from '@setsuzoku/shared';
import { Logo } from '../common/Logo';

export const DashboardLayout: React.FC = () => {
  const { user, currentOrg, currentRole, switchRole, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: '1',
      title: 'New Client Inquiry',
      desc: 'Nexora Digital submitted project brief for Web Platform Architecture',
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Invoice Payment Recorded',
      desc: 'Payment of ₹1,18,000 recorded for INV-2026-0001',
      time: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Deliverable Approved',
      desc: 'UI/UX Wireframes v1.2 accepted by client Arjun Mehta',
      time: '3h ago',
      unread: false,
    },
  ]);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads CRM', to: '/leads', icon: Users },
    { label: 'Clients', to: '/clients', icon: Building2 },
    { label: 'Quotations', to: '/quotations', icon: FileSpreadsheet },
    { label: 'Projects', to: '/projects', icon: FolderKanban },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
    { label: 'Approvals', to: '/approvals', icon: ShieldCheck },
    { label: 'Invoices', to: '/invoices', icon: FileText },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Reports & BI', to: '/reports', icon: BarChart3 },
    { label: 'Client Portal', to: '/portal', icon: Layers },
    { label: 'Team & RBAC', to: '/team', icon: UserCheck },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy flex flex-col flex-shrink-0 border-r border-slate-800">
        {/* Brand header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-[#0F212D]">
          <Logo variant="sidebar" />
        </div>

        {/* Organization Showcase Bar */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 rounded-md">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
              <span className="truncate font-semibold">{currentOrg?.name}</span>
            </div>
            <span className="text-[9px] bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded font-mono font-bold">
              DEMO
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-teal text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F212D] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <span className="block text-xs font-medium text-white truncate">{user?.fullName}</span>
              <span className="block text-[10px] text-brand-teal font-medium capitalize truncate">
                {currentRole?.replace('_', ' ').toLowerCase() || 'Director'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Reset demo session"
            className="p-1.5 text-slate-400 hover:text-brand-teal hover:bg-slate-800 rounded transition flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Contact & Support Strip */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#09151D] flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-slate-400 font-medium">Support:</span>
          <a
            href="mailto:info@setsuzoku.in"
            className="text-brand-teal hover:text-white font-medium flex items-center gap-1 transition"
            title="Email Setsuzoku Support"
          >
            <Mail className="w-3 h-3" />
            <span>info@setsuzoku.in</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8 flex-shrink-0 shadow-sm">
          {/* Search bar */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads, projects, clients, invoices..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 relative">
            {/* Official Contact Mail */}
            <a
              href="mailto:info@setsuzoku.in"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-brand-border text-brand-navy hover:bg-gray-50 transition"
              title="Direct Email Contact"
            >
              <Mail className="w-3.5 h-3.5 text-brand-teal" />
              <span>info@setsuzoku.in</span>
            </a>

            {/* Quick Client Portal Link */}
            <NavLink
              to="/portal"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-brand-teal text-brand-teal hover:bg-teal-50 transition"
              title="Open Client Experience View"
            >
              <span>Client Portal</span>
              <ExternalLink className="w-3 h-3" />
            </NavLink>

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-brand-border px-2 py-1 rounded-md text-xs">
              <span className="text-brand-muted text-[11px] font-medium hidden sm:inline">Role:</span>
              <select
                value={currentRole || MembershipRole.ORGANIZATION_OWNER}
                onChange={(e) => switchRole(e.target.value as any)}
                className="bg-transparent font-semibold text-brand-navy focus:outline-none cursor-pointer text-xs"
              >
                <option value={MembershipRole.ORGANIZATION_OWNER}>Owner (Full Access)</option>
                <option value={MembershipRole.MANAGER}>Manager</option>
                <option value={MembershipRole.EMPLOYEE}>Employee</option>
                <option value={MembershipRole.FINANCE}>Finance</option>
                <option value={MembershipRole.CLIENT}>Client</option>
              </select>
            </div>

            {currentOrg && (
              <Badge variant="teal" size="sm" className="hidden sm:inline-flex">
                {currentOrg.currency}
              </Badge>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.some((n) => n.unread) && (
                  <span className="w-2 h-2 rounded-full bg-brand-teal absolute top-1.5 right-1.5" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy">Notifications</span>
                    <button
                      onClick={() =>
                        setUnreadNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                      }
                      className="text-[10px] text-brand-teal hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {unreadNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-gray-50 transition ${
                          n.unread ? 'bg-teal-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-brand-navy">{n.title}</span>
                          <span className="text-[10px] text-brand-muted">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-brand-muted leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

