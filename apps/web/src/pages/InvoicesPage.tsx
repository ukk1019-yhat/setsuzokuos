import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { InvoiceDto, ClientDto, InvoiceStatus, PaymentMethod } from '@setsuzoku/shared';
import { apiRequest } from '../api/client';

export const InvoicesPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const { invoices, clients, createInvoice, recordPayment } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceDto | null>(null);

  // New Invoice Form State
  const [newClientId, setNewClientId] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [newDiscount, setNewDiscount] = useState(0);
  const [newTax, setNewTax] = useState(0);
  const [newNotes, setNewNotes] = useState('');
  const [newTerms, setNewTerms] = useState('Payment due within 14 days of invoice date.');
  const [lineItems, setLineItems] = useState<
    Array<{ serviceName: string; description: string; quantity: number; unitPrice: number }>
  >([{ serviceName: '', description: '', quantity: 1, unitPrice: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (clients.length > 0 && !newClientId) {
      setNewClientId(clients[0].id);
    }
  }, [clients]);

  // Calculations for summary metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const outstanding = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const overdueCount = invoices.filter(
    (inv) => inv.status === InvoiceStatus.OVERDUE || (inv.balanceDue > 0 && new Date(inv.dueDate) < new Date())
  ).length;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      inv.status === statusFilter ||
      (statusFilter === 'OVERDUE' && inv.balanceDue > 0 && new Date(inv.dueDate) < new Date());

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(query) ||
      (inv.client?.name && inv.client.name.toLowerCase().includes(query)) ||
      (inv.project?.name && inv.project.name.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  // Calculate live totals for new invoice modal
  const newSubtotal = lineItems.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0), 0);
  const newTotal = Math.max(0, newSubtotal - (newDiscount || 0) + (newTax || 0));

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { serviceName: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineItemChange = (
    index: number,
    field: 'serviceName' | 'description' | 'quantity' | 'unitPrice',
    val: any
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const effectiveClientId = newClientId || (clients.length > 0 ? clients[0].id : '');
    if (!effectiveClientId) {
      setErrorMsg('Please select a client');
      return;
    }
    if (lineItems.some((it) => !it.serviceName.trim() || it.quantity <= 0)) {
      setErrorMsg('All line items must have a service name and quantity greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvoice({
        clientId: effectiveClientId,
        dueDate: new Date(newDueDate).toISOString(),
        currency: currentOrg?.currency || 'INR',
        discountAmount: Number(newDiscount) || 0,
        taxAmount: Number(newTax) || 0,
        subtotal: lineItems.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.unitPrice) || 0), 0),
        notes: newNotes,
        paymentTerms: newTerms,
        items: lineItems.map((it) => ({
          serviceName: it.serviceName,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.quantity) * Number(it.unitPrice),
        })),
      });

      setShowCreateModal(false);
      // Reset form
      setNewClientId('');
      setLineItems([{ serviceName: '', description: '', quantity: 1, unitPrice: 0 }]);
      setNewDiscount(0);
      setNewTax(0);
      setNewNotes('');
    } catch (err: any) {
      console.warn('Backend create invoice handled:', err);
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (inv: InvoiceDto) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setPaymentMethod(PaymentMethod.BANK_TRANSFER);
    setTransactionRef('');
    setReceiptNumber(`RCP-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('');
    setErrorMsg(null);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await recordPayment(selectedInvoice.id, {
        amount: Number(paymentAmount),
        currency: selectedInvoice.currency,
        method: paymentMethod,
        transactionRef: transactionRef || undefined,
        receiptNumber: receiptNumber || undefined,
        notes: paymentNotes || undefined,
      });

      setShowPaymentModal(false);
      setSelectedInvoice(null);
    } catch (err: any) {
      console.warn('Backend record payment handled:', err);
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreview = async (inv: InvoiceDto) => {
    try {
      const data = await apiRequest<InvoiceDto>(`/invoices/${inv.id}`);
      setPreviewInvoice(data || inv);
    } catch (err) {
      setPreviewInvoice(inv);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Invoices & Billing</h1>
          <p className="text-sm text-brand-muted">
            Manage sequential invoices, track real balances, and record verified customer payments.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-teal rounded-lg shadow-sm hover:opacity-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Total Invoiced</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-navy">
            {currentOrg?.currency} {totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-brand-muted mt-1 block">{invoices.length} total generated</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Total Collected</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {currentOrg?.currency} {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 mt-1 block">Verified cash in ledger</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Outstanding Balance</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {currentOrg?.currency} {outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-amber-600 mt-1 block">Uncollected receivables</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Overdue Alerts</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600">{overdueCount}</p>
          <span className="text-xs text-rose-500 mt-1 block">Invoices past due date</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search invoice # or client..."
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-brand-muted">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
            <h3 className="text-sm font-semibold text-brand-navy">No Invoices Found</h3>
            <p className="text-xs text-brand-muted mt-1">
              Create an invoice for your clients to start tracking receivables.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Balance Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => {
                  const isPastDue = inv.balanceDue > 0 && new Date(inv.dueDate) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-navy">{inv.client?.name || 'Unknown Client'}</div>
                        <div className="text-[11px] text-brand-muted">{inv.client?.company || inv.client?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={isPastDue ? 'text-rose-600 font-semibold' : ''}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                        {isPastDue && <span className="text-[10px] text-rose-500 font-medium">Overdue</span>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-brand-navy">
                        {inv.currency} {inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-semibold">
                        {inv.currency} {inv.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {inv.balanceDue > 0 ? (
                          <span className="text-amber-600">
                            {inv.currency} {inv.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-400">Settled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                            inv.status === InvoiceStatus.PAID
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === InvoiceStatus.PARTIALLY_PAID
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isPastDue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openPreview(inv)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          View
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                          >
                            Record Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-brand-navy">Create Professional Invoice</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client *</label>
                  <select
                    value={newClientId || (clients.length > 0 ? clients[0].id : '')}
                    onChange={(e) => setNewClientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    {clients.length === 0 && <option value="">No client accounts available</option>}
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Services & Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-semibold text-brand-teal hover:underline inline-flex items-center gap-1"
                  >
                    + Add Item
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Service / Deliverable title"
                        value={item.serviceName}
                        onChange={(e) => handleLineItemChange(idx, 'serviceName', e.target.value)}
                        required
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                        className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-right focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                        className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-right focus:outline-none"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Line item total:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {currentOrg?.currency} {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentOrg?.currency} {newSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Discount Amount (-)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-right font-mono"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tax / GST Amount (+)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTax}
                    onChange={(e) => setNewTax(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 bg-white border border-slate-200 rounded text-right font-mono"
                  />
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-brand-navy">
                  <span>Net Total Due</span>
                  <span className="font-mono text-emerald-700">
                    {currentOrg?.currency} {newTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-teal text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-brand-navy">Record Verified Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-bold text-brand-navy">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billed:</span>
                  <span className="font-mono font-semibold">
                    {selectedInvoice.currency} {selectedInvoice.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-amber-700">
                    {selectedInvoice.currency} {selectedInvoice.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Record *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono font-bold text-brand-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Wire / NEFT / RTGS</option>
                  <option value={PaymentMethod.UPI}>UPI (Google Pay / PhonePe / PayTM)</option>
                  <option value={PaymentMethod.RAZORPAY}>Razorpay Verified Gateway</option>
                  <option value={PaymentMethod.CASH}>Cash / Cheque</option>
                  <option value={PaymentMethod.OTHER_MANUAL}>Other Manual</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / UTR #</label>
                <input
                  type="text"
                  placeholder="e.g. UTR123456789 or UPI-TXN-ID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Number</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || paymentAmount <= 0}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW DRAWER */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[92vh] overflow-y-auto">
            {/* Header Document */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src="/setsuzoku-logo.png"
                    alt="SETSUZOKU"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-brand-teal tracking-widest uppercase">SETSUZOKU MEDIA LABS</div>
                  <h2 className="text-2xl font-black text-brand-navy mt-0.5">INVOICE</h2>
                  <div className="text-xs text-brand-muted mt-0.5 font-mono">{previewInvoice.invoiceNumber}</div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    previewInvoice.status === InvoiceStatus.PAID
                      ? 'bg-emerald-100 text-emerald-800'
                      : previewInvoice.status === InvoiceStatus.PARTIALLY_PAID
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {previewInvoice.status}
                </span>
                <div className="text-xs text-slate-500 mt-2">
                  Issued: {new Date(previewInvoice.issuedDate).toLocaleDateString()}
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  Due: {new Date(previewInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="py-5 border-b border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-bold text-brand-navy text-sm mt-1">{previewInvoice.client?.name}</div>
                <div className="text-slate-600">{previewInvoice.client?.company}</div>
                <div className="text-slate-500">{previewInvoice.client?.email}</div>
                {previewInvoice.client?.billingAddress && (
                  <div className="text-slate-500 mt-1">{previewInvoice.client.billingAddress}</div>
                )}
                {previewInvoice.client?.taxId && (
                  <div className="text-[11px] font-mono text-slate-600 mt-1">Tax ID: {previewInvoice.client.taxId}</div>
                )}
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Issued By:</span>
                <div className="font-bold text-brand-navy text-sm mt-1">{currentOrg?.name}</div>
                <a href="mailto:info@setsuzoku.in" className="text-brand-teal font-medium hover:underline block">
                  info@setsuzoku.in
                </a>
                <div className="text-slate-500 text-[11px] mt-0.5">Tax ID / GSTIN: {currentOrg?.taxNumber || '27AABCS1429B1Z'}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewInvoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-slate-800">{item.serviceName}</div>
                        {item.description && <div className="text-[11px] text-slate-500">{item.description}</div>}
                      </td>
                      <td className="py-3 text-right font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">
                        {previewInvoice.currency} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-800">
                        {previewInvoice.currency} {item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{previewInvoice.currency} {previewInvoice.subtotal.toFixed(2)}</span>
              </div>
              {previewInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">-{previewInvoice.currency} {previewInvoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {previewInvoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax / VAT:</span>
                  <span className="font-mono">+{previewInvoice.currency} {previewInvoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-brand-navy pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="font-mono">{previewInvoice.currency} {previewInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Total Paid:</span>
                <span className="font-mono">{previewInvoice.currency} {previewInvoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-amber-700 pt-1">
                <span>Balance Due:</span>
                <span className="font-mono">{previewInvoice.currency} {previewInvoice.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Payments History */}
            {previewInvoice.payments && previewInvoice.payments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Payment History</h4>
                <div className="space-y-1.5">
                  {previewInvoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-brand-navy">{p.method}</span>
                        {p.transactionRef && (
                          <span className="text-[11px] text-slate-500 font-mono ml-2">Ref: {p.transactionRef}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-600">
                          +{p.currency} {p.amount.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Footer Terms & Direct Support */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
              <span>{previewInvoice.paymentTerms || 'Payment terms: Due within 14 days of invoice.'}</span>
              <span>Billing Support: <a href="mailto:info@setsuzoku.in" className="text-brand-teal font-semibold hover:underline">info@setsuzoku.in</a></span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
              {previewInvoice.balanceDue > 0 && (
                <button
                  onClick={() => {
                    const inv = previewInvoice;
                    setPreviewInvoice(null);
                    openPaymentModal(inv);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

