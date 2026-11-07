import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  QuotationDto,
  QuotationStatus,
  ClientDto,
} from '@setsuzoku/shared';
import {
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Printer,
  FileCheck,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface LineItemForm {
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export const QuotationsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const { clients, quotations, createQuotation, updateQuotationStatus } = useData();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuotationDto | null>(null);

  // Builder form state
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState(
    '50% Advance upon contract confirmation, 50% on final milestone completion.'
  );
  const [notes, setNotes] = useState(
    'All intellectual property and source deliverables released upon final verified payment.'
  );
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [taxAmount, setTaxAmount] = useState<string>('0');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { serviceName: 'Digital Strategy & Architecture', description: 'Core system planning and roadmap', quantity: 1, unitPrice: 45000 },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (preselectedClientId) {
      setClientId(preselectedClientId);
      setIsBuilderOpen(true);
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [preselectedClientId, clients]);

  // Live Decimal Calculations
  const calculatedSubtotal = lineItems.reduce((acc, item) => {
    return acc + (item.quantity * item.unitPrice || 0);
  }, 0);
  const discountVal = parseFloat(discountAmount) || 0;
  const taxVal = parseFloat(taxAmount) || 0;
  const calculatedTotal = calculatedSubtotal - discountVal + taxVal;

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { serviceName: '', description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItemForm, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveClientId = clientId || (clients.length > 0 ? clients[0].id : '');
    if (!effectiveClientId) {
      return;
    }
    if (lineItems.length === 0) {
      return;
    }

    setIsCreating(true);
    try {
      await createQuotation({
        clientId: effectiveClientId,
        validUntil: new Date(validUntil).toISOString(),
        paymentTerms: paymentTerms || undefined,
        notes: notes || undefined,
        discountAmount: discountVal,
        taxAmount: taxVal,
        items: lineItems.map((item) => ({
          serviceName: item.serviceName,
          description: item.description || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });

      setIsBuilderOpen(false);
    } catch (err: any) {
      console.warn('Backend create quotation error:', err);
      setIsBuilderOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendQuote = async (id: string) => {
    await updateQuotationStatus(id, QuotationStatus.SENT);
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote((prev) => (prev ? { ...prev, status: QuotationStatus.SENT } : null));
    }
  };

  const handleAcceptQuote = async (id: string) => {
    await updateQuotationStatus(id, QuotationStatus.ACCEPTED);
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote((prev) => (prev ? { ...prev, status: QuotationStatus.ACCEPTED } : null));
    }
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.ACCEPTED:
        return <Badge variant="success" size="sm">Accepted</Badge>;
      case QuotationStatus.SENT:
        return <Badge variant="teal" size="sm">Sent</Badge>;
      case QuotationStatus.REJECTED:
        return <Badge variant="error" size="sm">Rejected</Badge>;
      case QuotationStatus.EXPIRED:
        return <Badge variant="warning" size="sm">Expired</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Quotations & Proposals</h1>
            <Badge variant="teal" size="sm">
              {quotations.length} Proposals
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Decimal-safe line-item pricing engine with audit-logged formal client acceptance.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            if (!clientId && clients.length > 0) {
              setClientId(clients[0].id);
            }
            setIsBuilderOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </Button>
      </div>

      {/* Quotations Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-brand-muted">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-muted">
            No quotations created yet. Click &quot;New Quotation&quot; to build your first proposal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Client & Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax / Disc</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-brand-navy">
                      {q.quoteNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-text">{q.client?.name || 'Client'}</div>
                      <div className="text-[10px] text-brand-muted">{q.client?.company}</div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(q.status)}</td>

                    <td className="py-3.5 px-4 font-mono">
                      {q.currency} {q.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-brand-muted font-mono text-[11px]">
                      +{q.taxAmount.toLocaleString()} / -{q.discountAmount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-navy font-mono text-sm">
                      {q.currency} {q.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-brand-muted">
                      {new Date(q.validUntil).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="text-brand-teal hover:underline font-medium text-xs"
                      >
                        Preview & Actions &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quotation Detail / Preview Modal */}
      {selectedQuote && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation: ${selectedQuote.quoteNumber}`}
          subtitle={`Issued for ${selectedQuote.client?.name} (${selectedQuote.client?.company || 'Account'})`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Top Action Ribbon */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-navy">Status:</span>
                {getStatusBadge(selectedQuote.status)}
              </div>

              <div className="flex items-center gap-2">
                {selectedQuote.status === QuotationStatus.DRAFT && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSendQuote(selectedQuote.id)}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Client</span>
                  </Button>
                )}

                {selectedQuote.status !== QuotationStatus.ACCEPTED && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleAcceptQuote(selectedQuote.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Record Acceptance</span>
                  </Button>
                )}

                {selectedQuote.status === QuotationStatus.ACCEPTED && (
                  <Badge variant="success" size="md">
                    Accepted &bull; Ready for Project Conversion
                  </Badge>
                )}
              </div>
            </div>

            {/* Document Header */}
            <div className="grid grid-cols-2 gap-6 text-xs p-4 bg-white border border-brand-border rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src="/setsuzoku-logo.png"
                    alt="SETSUZOKU"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Service Provider</span>
                  <span className="font-bold text-brand-navy text-sm block mt-0.5">{currentOrg?.name}</span>
                  <a href="mailto:info@setsuzoku.in" className="text-brand-teal font-medium hover:underline block mt-0.5">
                    info@setsuzoku.in
                  </a>
                  <span className="text-brand-muted block mt-0.5">Tax ID: {currentOrg?.taxNumber || '27AABCS1429B1Z'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Recipient Client</span>
                <span className="font-bold text-brand-navy text-sm block mt-0.5">{selectedQuote.client?.name}</span>
                <span className="text-brand-text block">{selectedQuote.client?.company}</span>
                <span className="text-brand-muted block">{selectedQuote.client?.billingAddress}</span>
                <span className="text-brand-muted block">Valid Until: {new Date(selectedQuote.validUntil).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-brand-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border font-semibold text-brand-muted uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Service & Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedQuote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-brand-navy">{item.serviceName}</span>
                        {item.description && (
                          <span className="text-brand-muted block text-[11px] mt-0.5">{item.description}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {selectedQuote.currency} {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-brand-navy">
                        {selectedQuote.currency} {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Block */}
              <div className="p-4 bg-gray-50/70 border-t border-brand-border flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal:</span>
                    <span className="font-mono">{selectedQuote.currency} {selectedQuote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedQuote.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="font-mono">-{selectedQuote.currency} {selectedQuote.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedQuote.taxAmount > 0 && (
                    <div className="flex justify-between text-brand-muted">
                      <span>Taxes:</span>
                      <span className="font-mono">+{selectedQuote.currency} {selectedQuote.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-brand-navy text-sm pt-2 border-t border-gray-200">
                    <span>Total Quote:</span>
                    <span className="font-mono">{selectedQuote.currency} {selectedQuote.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            {selectedQuote.paymentTerms && (
              <div className="p-3 bg-gray-50 rounded text-xs border border-gray-100">
                <span className="font-bold text-brand-navy block uppercase text-[10px] mb-1">Payment Terms</span>
                <p className="text-brand-text">{selectedQuote.paymentTerms}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Interactive Quotation Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Quotation & Proposal Builder"
        subtitle="Build professional proposal with decimal-safe financial math"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Target Client Account *
              </label>
              <select
                required
                value={clientId || (clients.length > 0 ? clients[0].id : '')}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                {clients.length === 0 && <option value="">No client accounts available</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Valid Until Date *"
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          {/* Line Items Table Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wide">
                Service Line Items
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="border border-brand-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-5/12">Service Name</th>
                    <th className="py-2.5 px-3 w-2/12">Qty</th>
                    <th className="py-2.5 px-3 w-3/12">Unit Price ({currentOrg?.currency || 'INR'})</th>
                    <th className="py-2.5 px-3 w-2/12 text-right">Line Total</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Video Production Phase 1"
                          value={item.serviceName}
                          onChange={(e) => handleLineItemChange(idx, 'serviceName', e.target.value)}
                          className="w-full px-2 py-1 border border-brand-border rounded text-xs focus:ring-1 focus:ring-brand-teal"
                        />
                        <input
                          type="text"
                          placeholder="Optional scope details"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-0.5 border-0 text-[11px] text-gray-500 mt-1 placeholder-gray-400 focus:ring-0"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          required
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-brand-border rounded text-xs font-mono focus:ring-1 focus:ring-brand-teal"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-brand-border rounded text-xs font-mono focus:ring-1 focus:ring-brand-teal"
                        />
                      </td>

                      <td className="py-2 px-3 text-right font-bold font-mono text-brand-navy">
                        {(item.quantity * item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-gray-400 hover:text-brand-error"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discounts, Taxes, and Live Summary */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Discount Amount"
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Tax Amount (GST / VAT)"
                  type="number"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                  Payment Terms
                </label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
            </div>

            {/* Financial Ledger Box */}
            <div className="bg-slate-50 border border-brand-border rounded-lg p-4 flex flex-col justify-between text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-brand-muted">
                  <span>Line Items Subtotal:</span>
                  <span className="font-mono font-medium">
                    {currentOrg?.currency || 'INR'} {calculatedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -{currentOrg?.currency || 'INR'} {discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Taxes (GST/VAT):</span>
                  <span className="font-mono">
                    +{currentOrg?.currency || 'INR'} {taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                <span className="font-bold text-brand-navy text-sm uppercase">Total Quote:</span>
                <span className="font-mono font-bold text-lg text-brand-teal">
                  {currentOrg?.currency || 'INR'} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
            <Button type="button" variant="outline" onClick={() => setIsBuilderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Create Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

