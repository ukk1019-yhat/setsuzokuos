import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  FolderKanban,
  Users,
  ShieldCheck,
  CheckSquare,
  FileText,
  CreditCard,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BusinessOverviewReportDto } from '@setsuzoku/shared';

export const DashboardOverviewPage: React.FC = () => {
  const { currentOrg, currentRole } = useAuth();
  const [report, setReport] = useState<BusinessOverviewReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('accessToken');
  const orgId = currentOrg?.id;

  useEffect(() => {
    if (!orgId) return;
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/v1/reports/overview', {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Organization-Id': orgId,
          },
        });
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, [orgId]);

  const currency = currentOrg?.currency || 'INR';

  const metrics = [
    {
      label: 'Active Projects',
      value: report ? String(report.activeProjectsCount) : '—',
      trend: 'Live client operations',
      icon: FolderKanban,
      color: 'teal',
      to: '/projects',
    },
    {
      label: 'CRM Leads',
      value: report ? String(report.leadsMetrics.total) : '—',
      trend: `${report?.leadsMetrics.won || 0} won (${report?.leadsMetrics.winRate || 0}% rate)`,
      icon: Users,
      color: 'navy',
      to: '/leads',
    },
    {
      label: 'Pipeline Potential',
      value: report ? `${currency} ${report.pipelineValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—',
      trend: 'In active negotiation',
      icon: ShieldCheck,
      color: 'warning',
      to: '/leads',
    },
    {
      label: 'Total Invoiced',
      value: report ? `${currency} ${report.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—',
      trend: 'All issued bills',
      icon: FileText,
      color: 'navy',
      to: '/invoices',
    },
    {
      label: 'Verified Collections',
      value: report ? `${currency} ${report.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—',
      trend: 'Settled via Razorpay & Wire',
      icon: CreditCard,
      color: 'success',
      to: '/payments',
    },
    {
      label: 'Outstanding Receivables',
      value: report ? `${currency} ${report.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—',
      trend: `${currency} ${report?.agingReceivables.current.toLocaleString('en-IN', { minimumFractionDigits: 0 }) || 0} current`,
      icon: CheckSquare,
      color: 'teal',
      to: '/invoices',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">
              {currentOrg?.name || 'Workspace Overview'}
            </h1>
            <Badge variant="teal" size="sm">
              Live Database
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Connected Operating System &bull; Active Role: <span className="font-semibold text-brand-text">{currentRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/leads">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Capture Lead
            </Button>
          </Link>
          <Link to="/invoices">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Connected Lifecycle Visualizer */}
      <Card className="bg-gradient-to-r from-[#142B3A] to-[#1A384C] text-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              The Setsuzoku Workflow Engine
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              From First Inquiry to Final Payment in an unbroken audit-trailed pipeline.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30 font-medium">
            Active Lifecycle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: '01. Inquiry', status: 'Active CRM' },
            { step: '02. Quotation', status: 'Decimal Safe' },
            { step: '03. Project & Tasks', status: 'Auto Spawn' },
            { step: '04. Deliverable', status: 'Multi-Version' },
            { step: '05. Client Approval', status: 'Signed' },
            { step: '06. Verified Payment', status: 'Razorpay / Wire' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-lg p-2.5 transition border border-white/10 flex flex-col items-center justify-center"
            >
              <span className="font-semibold text-slate-100">{item.step}</span>
              <span className="text-[10px] text-brand-teal mt-0.5">{item.status}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((m, idx) => (
          <Link key={idx} to={m.to} className="block group">
            <Card className="h-full transition-all group-hover:border-brand-teal/60 group-hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <span className="text-2xl font-bold text-brand-navy mt-1.5 block">
                    {m.value}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 text-brand-navy border border-brand-border group-hover:bg-teal-50 group-hover:text-brand-teal transition">
                  <m.icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-brand-muted">{m.trend}</span>
                <span className="text-brand-teal font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View module <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Activity Feed & Quick Workstream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Live Financial & Lifecycle Stream" subtitle="Real-time activity recorded in database">
            {report && (report.recentInvoices.length > 0 || report.recentPayments.length > 0) ? (
              <div className="space-y-3">
                {report.recentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 hover:bg-white hover:border-emerald-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-brand-text">
                          Verified Payment Received: {currency} {p.amount.toLocaleString()} ({p.method})
                        </p>
                        <span className="text-[10px] text-brand-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {new Date(p.createdAt).toLocaleDateString()} &bull; Ref: {p.transactionRef || p.receiptNumber}
                        </span>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      VERIFIED
                    </Badge>
                  </div>
                ))}

                {report.recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50/70 border border-gray-100 hover:bg-white hover:border-brand-border transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-teal flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-brand-text">
                          Invoice {inv.invoiceNumber} Issued to {inv.client?.name || 'Client'} ({currency} {inv.totalAmount.toLocaleString()})
                        </p>
                        <span className="text-[10px] text-brand-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Due {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'teal'} size="sm">
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-brand-muted">
                No financial activities recorded yet. Create an invoice or capture a lead to start the lifecycle stream.
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Quick Operational Actions" subtitle="Fast administrative tasks">
            <div className="space-y-2.5">
              <Link to="/invoices" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span>Manage Invoices & Aging</span>
                </Button>
              </Link>
              <Link to="/payments" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <CreditCard className="w-4 h-4 text-brand-teal" />
                  <span>View Payments Ledger</span>
                </Button>
              </Link>
              <Link to="/reports" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-teal" />
                  <span>Executive BI Analytics</span>
                </Button>
              </Link>
              <Link to="/portal" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>Client Portal & Deliverables</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
