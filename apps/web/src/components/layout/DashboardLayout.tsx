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
  LogOut,
  Bell,
  Search,
  Layers,
  PlusCircle,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, currentOrg, currentRole, organizations, switchOrganization, logout } = useAuth();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
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
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0F212D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold shadow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">
                SETSUZOKU OS
              </span>
              <span className="text-[10px] text-brand-teal font-medium uppercase tracking-wider block">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Organization Switcher Bar */}
        <div className="px-4 py-3 border-b border-slate-800 relative">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-md transition"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
              <span className="truncate">{currentOrg?.name || 'Select Organization'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute top-14 left-4 right-4 bg-white rounded-md shadow-xl border border-brand-border py-1 z-30">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-brand-muted tracking-wider border-b border-gray-100">
                Switch Organization
              </div>
              {organizations.map((orgItem) => (
                <button
                  key={orgItem.organization.id}
                  onClick={() => {
                    switchOrganization(orgItem.organization.id);
                    setOrgDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 ${
                    currentOrg?.id === orgItem.organization.id ? 'bg-teal-50/50 font-semibold text-brand-navy' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{orgItem.organization.name}</span>
                  <span className="text-[10px] text-brand-muted capitalize">{orgItem.role.replace('_', ' ')}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    navigate('/onboarding');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-brand-teal font-medium hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Organization</span>
                </button>
              </div>
            </div>
          )}
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
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <span className="block text-xs font-medium text-white truncate">{user?.fullName}</span>
              <span className="block text-[10px] text-slate-400 capitalize truncate">
                {currentRole?.replace('_', ' ').toLowerCase() || 'Member'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8 flex-shrink-0 shadow-sm">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search leads, projects, clients, invoices..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal focus:bg-white transition"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {currentOrg && (
              <Badge variant="teal" size="md">
                {currentOrg.currency} &bull; {currentOrg.country}
              </Badge>
            )}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-md transition">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-teal absolute top-1.5 right-1.5" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-xs text-brand-muted">
              Role: <strong className="text-brand-text font-semibold">{currentRole}</strong>
            </span>
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

