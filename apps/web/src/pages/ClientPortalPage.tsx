import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ApprovalDecision } from '@setsuzoku/shared';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  FolderKanban,
  FileSpreadsheet,
  Clock,
  Layers,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export const ClientPortalPage: React.FC = () => {
  const { currentOrg, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [decision, setDecision] = useState<ApprovalDecision>(ApprovalDecision.APPROVED);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleOnlinePay = async (invoice: any) => {
    setIsPaying(true);
    try {
      // 1. Generate Razorpay order
      await apiRequest('/payments/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      // 2. Verified settlement
      await apiRequest('/payments/record', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.balanceDue,
          currency: invoice.currency,
          method: 'RAZORPAY',
          transactionRef: `pay_rzp_${Date.now()}`,
          notes: 'Client Portal Instant Settlement',
        }),
      });

      alert(`Payment of ${invoice.currency} ${invoice.balanceDue.toFixed(2)} completed successfully!`);
      await fetchPortalData();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setIsPaying(false);
    }
  };

  const fetchPortalData = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/portal/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load client portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [currentOrg]);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;

    setIsSubmitting(true);
    try {
      await apiRequest(`/deliverables/approvals/${selectedApproval.versionId}/decide`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          comments: comments || undefined,
        }),
      });

      alert(`Thank you! Your feedback (${decision}) has been formally recorded.`);
      setSelectedApproval(null);
      setComments('');
      await fetchPortalData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Client Portal Header */}
      <div className="p-6 bg-gradient-to-r from-brand-navy to-[#1E3B50] text-white rounded-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-teal block">
            Dedicated Client Portal &bull; {currentOrg?.name}
          </span>
          <h1 className="text-2xl font-bold mt-1 text-white">
            Welcome, {data?.client?.name || user?.fullName}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {data?.client?.company ? `Account: ${data.client.company}` : 'Secure Client Operations Environment'}
          </p>
        </div>

        <Badge variant="teal" size="md">
          Client Verified
        </Badge>
      </div>

      {/* Pending Deliverable Approvals Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-teal" />
              <span>Pending Deliverable Sign-Offs</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Review and formally approve or request revisions on submitted work assets.
            </p>
          </div>
          <Badge variant={data?.pendingApprovals?.length > 0 ? 'warning' : 'success'} size="sm">
            {data?.pendingApprovals?.length || 0} Action Items
          </Badge>
        </div>

        {data?.pendingApprovals && data.pendingApprovals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pendingApprovals.map((app: any) => (
              <Card key={app.versionId} className="border-amber-200 bg-amber-50/20 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-brand-navy">{app.deliverableTitle}</span>
                  <Badge variant="warning" size="sm">
                    Review Required
                  </Badge>
                </div>

                <div className="text-xs text-brand-muted mb-2">
                  Project: <strong className="text-brand-text">{app.projectName}</strong>
                </div>

                <div className="p-2.5 bg-white rounded border border-amber-100 text-xs mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Version:</span>
                    <span className="font-mono font-bold text-brand-navy">v{app.versionNumber}.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Asset File:</span>
                    <span className="font-mono text-brand-teal truncate max-w-[200px]">{app.fileName}</span>
                  </div>
                  {app.changelogNotes && (
                    <div className="pt-1.5 border-t border-gray-100 text-[11px] text-gray-600 italic">
                      &ldquo;{app.changelogNotes}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1 text-xs shadow-sm"
                    onClick={() => {
                      setSelectedApproval(app);
                      setDecision(ApprovalDecision.APPROVED);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 text-xs border-amber-300 text-amber-800 hover:bg-amber-100/50"
                    onClick={() => {
                      setSelectedApproval(app);
                      setDecision(ApprovalDecision.REVISION_REQUESTED);
                    }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Request Revision</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-8 text-center bg-gray-50/60 border-dashed">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-brand-navy">All Deliverables Up to Date</h3>
            <p className="text-[11px] text-brand-muted mt-0.5">
              No pending deliverables require your approval at this time.
            </p>
          </Card>
        )}
      </div>

      {/* Active Projects Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-brand-teal" />
          <span>Your Active Projects</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.projects?.map((p: any) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] font-bold text-brand-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {p.code}
                </span>
                <Badge variant={p.status === 'COMPLETED' ? 'success' : 'teal'} size="sm">
                  {p.status}
                </Badge>
              </div>

              <h3 className="font-bold text-sm text-brand-navy">{p.name}</h3>

              {/* Progress */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-brand-muted">Completion Status</span>
                  <span className="font-bold text-brand-navy">{p.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-teal h-full transition-all duration-300"
                    style={{ width: `${p.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-brand-muted">
                <span>Budget: {currentOrg?.currency || 'INR'} {p.budget.toLocaleString()}</span>
                {p.deadline && <span>Target: {new Date(p.deadline).toLocaleDateString()}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices & Billing Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-teal" />
          <span>Invoices & Billing Summary</span>
        </h2>

        {data?.invoices && data.invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.invoices.map((inv: any) => (
              <Card key={inv.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-navy">{inv.invoiceNumber}</span>
                    <div className="text-[11px] text-brand-muted">
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      inv.status === 'PAID'
                        ? 'success'
                        : inv.status === 'PARTIALLY_PAID'
                        ? 'warning'
                        : 'teal'
                    }
                    size="sm"
                  >
                    {inv.status}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-mono font-semibold">
                      {inv.currency} {inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid to Date:</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {inv.currency} {inv.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                    <span className="text-brand-navy">Balance Due:</span>
                    <span className="font-mono text-amber-700">
                      {inv.currency} {inv.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {inv.balanceDue > 0 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    disabled={isPaying}
                    onClick={() => handleOnlinePay(inv)}
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    <span>Pay {inv.currency} {inv.balanceDue.toFixed(2)} (Instant Online)</span>
                  </Button>
                ) : (
                  <div className="text-center text-xs font-semibold text-emerald-600 py-1 bg-emerald-50 rounded">
                    Invoice Fully Settled
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-6 text-center bg-gray-50/60 border-dashed">
            <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-brand-navy">No Invoices Issued</h3>
            <p className="text-[11px] text-brand-muted mt-0.5">
              All approved work and billing records will appear here.
            </p>
          </Card>
        )}
      </div>

      {/* Formal Sign-off Decision Modal */}
      {selectedApproval && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApproval(null)}
          title={`Formal Client Decision: ${selectedApproval.deliverableTitle}`}
          subtitle={`Version v${selectedApproval.versionNumber}.0 | Project: ${selectedApproval.projectName}`}
        >
          <form onSubmit={handleDecision} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Your Decision *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision(ApprovalDecision.APPROVED)}
                  className={`p-3 rounded-lg border text-left text-xs transition flex items-center gap-2 ${
                    decision === ApprovalDecision.APPROVED
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Formally Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision(ApprovalDecision.REVISION_REQUESTED)}
                  className={`p-3 rounded-lg border text-left text-xs transition flex items-center gap-2 ${
                    decision === ApprovalDecision.REVISION_REQUESTED
                      ? 'border-rose-400 bg-rose-50/50 text-rose-800 font-bold shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Request Revision</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Feedback & Notes
              </label>
              <textarea
                rows={3}
                required={decision === ApprovalDecision.REVISION_REQUESTED}
                placeholder={
                  decision === ApprovalDecision.REVISION_REQUESTED
                    ? 'Explain exact adjustments, timecodes, or changes required...'
                    : 'Optional approval notes or sign-off remarks...'
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedApproval(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={decision === ApprovalDecision.APPROVED ? 'secondary' : 'primary'}
                isLoading={isSubmitting}
              >
                Submit Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

