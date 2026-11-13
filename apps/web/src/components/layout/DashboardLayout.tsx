import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
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
  Eye,
  Menu,
  X,
} from 'lucide-react';
import { MembershipRole } from '@setsuzoku/shared';
import { Logo } from '../common/Logo';

export const DashboardLayout: React.FC = () => {
  const { user, currentOrg, currentRole, switchRole, logout } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewsStats, setViewsStats] = useState<{
    totalViews: number;
    uniqueVisitors: number;
  } | null>(() => {
    try {
      const cached = localStorage.getItem('setsuzoku_website_views_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed?.totalViews === 'number') return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });
  const hasRecordedViewRef = useRef(false);

  // Close mobile sidebar drawer on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (hasRecordedViewRef.current) return;
    hasRecordedViewRef.current = true;

    const recordWebsiteView = async () => {
      let visitorId = '';
      try {
        visitorId = localStorage.getItem('setsuzoku_visitor_id') || '';
        if (!visitorId) {
          visitorId =
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem('setsuzoku_visitor_id', visitorId);
        }
      } catch {
        visitorId = '';
      }

      try {
        const stats = await apiRequest<{ totalViews: number; uniqueVisitors: number }>(
          '/analytics/views',
          {
            method: 'POST',
            body: JSON.stringify(visitorId ? { visitorId } : {}),
          }
        );
        if (stats && typeof stats.totalViews === 'number') {
          setViewsStats(stats);
          try {
            localStorage.setItem('setsuzoku_website_views_cache', JSON.stringify(stats));
          } catch {
            // ignore storage errors
          }
        }
      } catch {
        // Fallback when running offline without API
        try {
          const cached = localStorage.getItem('setsuzoku_website_views_cache');
          const prev = cached ? JSON.parse(cached) : null;
          const fallbackStats = {
            totalViews: (typeof prev?.totalViews === 'number' ? prev.totalViews : 0) + 1,
            uniqueVisitors: typeof prev?.uniqueVisitors === 'number' && prev.uniqueVisitors > 0 ? prev.uniqueVisitors : 1,
          };
          setViewsStats(fallbackStats);
          localStorage.setItem('setsuzoku_website_views_cache', JSON.stringify(fallbackStats));
        } catch {
          // ignore storage errors
        }
      }
    };

    recordWebsiteView();
  }, []);

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

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
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
                onClick={onNavigate}
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

      {/* Support direct address, website & copyright */}
      <div className="px-3 py-2 border-t border-brand-sidebar-border bg-[#0E1013] text-[10px] text-brand-sidebar-text space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span>Website:</span>
          <a
            href="https://setsuzoku.info"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white font-mono text-[11px] transition inline-flex items-center gap-1"
          >
            setsuzoku.info
            <ExternalLink className="w-2.5 h-2.5 opacity-60" strokeWidth={1.75} />
          </a>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span>Support:</span>
          <a
            href="mailto:info@setsuzoku.in"
            className="hover:text-white font-mono text-[11px] transition"
          >
            info@setsuzoku.in
          </a>
        </div>
        <div className="text-[10px] text-slate-500 pt-0.5 truncate border-t border-white/5">
          &copy; 2026 Setsuzoku Media Labs. All rights reserved.
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-brand-sidebar z-50 flex flex-col border-r border-brand-sidebar-border shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-brand-sidebar-border flex-shrink-0">
          <Logo variant="sidebar" />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 text-brand-sidebar-text hover:text-white rounded transition"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderSidebarContent(() => setMobileSidebarOpen(false))}
      </aside>

      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-60 bg-brand-sidebar flex-col flex-shrink-0 border-r border-brand-sidebar-border select-none">
        <div className="h-14 flex items-center px-4 border-b border-brand-sidebar-border flex-shrink-0">
          <Logo variant="sidebar" />
        </div>
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-3 sm:px-4 md:px-6 flex-shrink-0 gap-2">
          {/* Left: Mobile hamburger + search bar + badges */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded focus:outline-none transition flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative hidden md:block w-44 lg:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search leads, projects, clients..."
                className="w-full pl-8 pr-3 py-1 text-[13px] bg-brand-bg border border-brand-border rounded focus:outline-none focus:border-brand-accent focus:bg-white transition"
              />
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-amber-300/80 bg-amber-50 text-[10px] sm:text-[11px] font-medium text-amber-900 select-none whitespace-nowrap"
              title="Demonstration environment with preloaded production workflows"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>Demo product</span>
            </div>

            <div
              data-testid="website-views-badge"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-brand-border bg-brand-bg text-[10px] sm:text-[11px] font-medium text-brand-text select-none tabular-nums whitespace-nowrap"
              title={
                viewsStats
                  ? `${viewsStats.totalViews.toLocaleString('en-IN')} total website views (${viewsStats.uniqueVisitors.toLocaleString('en-IN')} unique visitors)`
                  : 'Total website views'
              }
            >
              <Eye className="w-3.5 h-3.5 text-brand-accent" strokeWidth={1.75} />
              <span>
                {viewsStats !== null
                  ? `${viewsStats.totalViews.toLocaleString('en-IN')} ${
                      viewsStats.totalViews === 1 ? 'view' : 'views'
                    }`
                  : '— views'}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <a
              href="https://setsuzoku.info"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-[12px] text-brand-muted hover:text-brand-text font-medium items-center gap-1.5 px-2.5 py-1 rounded border border-brand-border bg-white hover:bg-gray-50 transition"
              title="Visit main corporate website (setsuzoku.info)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-muted" strokeWidth={1.75} />
              <span>setsuzoku.info</span>
            </a>

            <a
              href="mailto:info@setsuzoku.in"
              className="hidden md:flex text-[12px] text-brand-muted hover:text-brand-text font-medium items-center gap-1.5 px-2.5 py-1 rounded border border-brand-border bg-white hover:bg-gray-50 transition"
              title="Contact enterprise support"
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
                <div className="absolute right-0 top-10 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded shadow-lg border border-brand-border py-2 z-50">
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
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-brand-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
