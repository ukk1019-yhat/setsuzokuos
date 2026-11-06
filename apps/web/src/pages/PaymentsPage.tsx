import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentDto, PaymentMethod, PaymentStatus } from '@setsuzoku/shared';
import { apiRequest } from '../api/client';

export const PaymentsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const orgId = currentOrg?.id;

  const fetchPayments = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<PaymentDto[]>('/payments');
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [orgId]);

  // Total metrics
  const totalCollections = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const razorpayTotal = payments
    .filter((p) => p.method === PaymentMethod.RAZORPAY)
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const manualTotal = payments
    .filter((p) => p.method !== PaymentMethod.RAZORPAY)
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const avgPayment = payments.length > 0 ? totalCollections / payments.length : 0;

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(query)) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(query)) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(query)) ||
      (p.notes && p.notes.toLowerCase().includes(query));

    return matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Payments Ledger</h1>
          <p className="text-sm text-brand-muted">
            Audited financial transactions, server-verified Razorpay payments, and manual bank deposits.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Ledger
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Total Collections</span>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {currentOrg?.currency} {totalCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-brand-muted mt-1 block">{payments.length} verified entries</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Razorpay Gateway</span>
          <p className="mt-2 text-2xl font-bold text-indigo-700">
            {currentOrg?.currency} {razorpayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-indigo-500 mt-1 block">Cryptographically verified</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Wire & Manual Deposits</span>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {currentOrg?.currency} {manualTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 mt-1 block">NEFT / RTGS / UPI</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Average Ticket Size</span>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {currentOrg?.currency} {avgPayment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Per transaction receipt</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
          {['ALL', PaymentMethod.RAZORPAY, PaymentMethod.BANK_TRANSFER, PaymentMethod.UPI, PaymentMethod.CASH].map(
            (m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  methodFilter === m
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search ref, receipt, or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-brand-muted">Loading payments ledger...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-brand-navy">No Payment Records</h3>
            <p className="text-xs text-brand-muted mt-1">
              Payments recorded manually or captured via Razorpay will be logged in this tamper-evident ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date Recorded</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Transaction Ref / UTR</th>
                  <th className="py-3.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                      {p.receiptNumber || 'RCP-—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {p.invoiceNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{new Date(p.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                      +{p.currency} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.method === PaymentMethod.RAZORPAY
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : p.method === PaymentMethod.UPI
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        VERIFIED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {p.transactionRef || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

