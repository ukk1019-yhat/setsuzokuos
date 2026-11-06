import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BusinessOverviewReportDto } from '@setsuzoku/shared';

export const ReportsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const [report, setReport] = useState<BusinessOverviewReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem('accessToken');
  const orgId = currentOrg?.id;

  const fetchReport = async () => {
    if (!orgId) return;
    setIsLoading(true);
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
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [orgId]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-brand-muted">Aggregating live business intelligence...</div>;
  }

  const currency = currentOrg?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Business Intelligence & Executive Analytics</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE DATA
            </span>
          </div>
          <p className="text-sm text-brand-muted">
            Real-time financial performance, sales conversion funnel, and accounts receivable aging.
          </p>
        </div>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Real-Time Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Revenue Collected</span>
          <p className="mt-1.5 text-xl font-bold text-emerald-700">
            {currency} {report?.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Actual cash received</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Total Invoiced</span>
          <p className="mt-1.5 text-xl font-bold text-brand-navy">
            {currency} {report?.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
          <span className="text-[10px] text-brand-muted font-medium">Gross billings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Outstanding Balance</span>
          <p className="mt-1.5 text-xl font-bold text-amber-700">
            {currency} {report?.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Receivables due</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Sales Win Rate</span>
          <p className="mt-1.5 text-xl font-bold text-indigo-700">
            {report?.leadsMetrics.winRate || 0}%
          </p>
          <span className="text-[10px] text-indigo-600 font-medium">{report?.leadsMetrics.won || 0} won deals</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Active Projects</span>
          <p className="mt-1.5 text-xl font-bold text-brand-navy">
            {report?.activeProjectsCount || 0}
          </p>
          <span className="text-[10px] text-brand-muted font-medium">Execution in progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Pipeline Value</span>
          <p className="mt-1.5 text-xl font-bold text-slate-800">
            {currency} {report?.pipelineValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">In CRM negotiation</span>
        </div>
      </div>

      {/* Middle Section: Aging Receivables & Sales Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable Aging Analysis */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Accounts Receivable Aging</h2>
              <p className="text-xs text-brand-muted">Breakdown of unpaid invoices by aging bracket</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-700">
              {currency} {report?.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Current (0–30 Days)</span>
                <span className="font-mono font-bold text-brand-navy">
                  {currency} {report?.agingReceivables.current.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-teal h-2.5 rounded-full"
                  style={{
                    width: report?.outstandingBalance
                      ? `${Math.min(100, (report.agingReceivables.current / report.outstandingBalance) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-amber-700">Past Due (31–60 Days)</span>
                <span className="font-mono font-bold text-amber-700">
                  {currency} {report?.agingReceivables.overdue30.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{
                    width: report?.outstandingBalance
                      ? `${Math.min(100, (report.agingReceivables.overdue30 / report.outstandingBalance) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-rose-600">Severely Overdue (60+ Days)</span>
                <span className="font-mono font-bold text-rose-600">
                  {currency} {report?.agingReceivables.overdue60.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full"
                  style={{
                    width: report?.outstandingBalance
                      ? `${Math.min(100, (report.agingReceivables.overdue60 / report.outstandingBalance) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CRM Sales Funnel Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-brand-navy">CRM Pipeline Conversion Health</h2>
              <p className="text-xs text-brand-muted">Lead progression from first inquiry to contract sign</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {report?.leadsMetrics.winRate}% Conversion
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Leads</span>
              <p className="text-2xl font-bold text-brand-navy mt-1">{report?.leadsMetrics.total || 0}</p>
              <span className="text-[10px] text-slate-400">Inbound & manual</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Won Deals</span>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{report?.leadsMetrics.won || 0}</p>
              <span className="text-[10px] text-emerald-600">Converted to clients</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Lost / Churned</span>
              <p className="text-2xl font-bold text-rose-800 mt-1">{report?.leadsMetrics.lost || 0}</p>
              <span className="text-[10px] text-rose-500">Unqualified / dropped</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Active Pipeline Value:</span>
            <span className="font-mono font-bold text-brand-navy">
              {currency} {report?.pipelineValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Invoices & Verified Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Recent Invoices</h3>
          {report?.recentInvoices && report.recentInvoices.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {report.recentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-brand-navy">{inv.invoiceNumber}</span>
                    <span className="text-slate-500 ml-2">{inv.client?.name}</span>
                    <div className="text-[10px] text-slate-400">Due {new Date(inv.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-800">
                      {inv.currency} {inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-muted">No invoices generated yet.</p>
          )}
        </div>

        {/* Recent Payments Stream */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Recent Verified Payments</h3>
          {report?.recentPayments && report.recentPayments.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {report.recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-brand-navy">{p.method}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.receiptNumber} {p.transactionRef ? `• Ref: ${p.transactionRef}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      +{p.currency} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-muted">No payments recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

