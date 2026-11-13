import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatINR, formatRelativeDays } from '../utils/format';
import {
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Phone,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ChevronRight,
  Check,
  Eye,
} from 'lucide-react';

interface ActionItem {
  id: string;
  type: 'INVOICE_OVERDUE' | 'QUOTE_AWAITING' | 'APPROVAL_PENDING' | 'TASK_DUE' | 'STALE_LEAD';
  typeLabel: string;
  badgeVariant: 'error' | 'warning' | 'accent' | 'neutral';
  client: string;
  subject: string;
  amount: number;
  date: string;
  dueText: string;
  actionLabel: string;
  targetUrl: string;
  clientContact?: string;
}

export const DashboardOverviewPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<ActionItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Realistic seed action queue for an Indian media production agency
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: 'act_001',
      type: 'INVOICE_OVERDUE',
      typeLabel: 'Overdue invoice',
      badgeVariant: 'error',
      client: 'Swiggy Brand Studio',
      subject: 'Commercial Video Post-Production Master (INV-2026-0142)',
      amount: 186400,
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      dueText: '4d overdue',
      actionLabel: 'Send reminder',
      targetUrl: '/invoices',
      clientContact: 'finance@swiggy.in',
    },
    {
      id: 'act_002',
      type: 'QUOTE_AWAITING',
      typeLabel: 'Awaiting reply',
      badgeVariant: 'warning',
      client: 'Tata Consumer Products',
      subject: 'Packaging 3D Render & Motion Graphics (QT-2026-0084)',
      amount: 425000,
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      dueText: 'Sent 5d ago',
      actionLabel: 'Follow up',
      targetUrl: '/quotations',
      clientContact: 'media.procurement@tataconsumer.com',
    },
    {
      id: 'act_003',
      type: 'QUOTE_AWAITING',
      typeLabel: 'Awaiting reply',
      badgeVariant: 'warning',
      client: 'Cult.fit Media',
      subject: 'Sound Design Master Cutdown v2 (QT-2026-0091)',
      amount: 112000,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      dueText: 'Sent 2d ago',
      actionLabel: 'Follow up',
      targetUrl: '/quotations',
      clientContact: 'karan@cult.fit',
    },
    {
      id: 'act_004',
      type: 'APPROVAL_PENDING',
      typeLabel: 'Sign-off needed',
      badgeVariant: 'accent',
      client: 'Ather Energy Creative',
      subject: 'Apex 450 Launch Film - Cut 03 (Color Graded v1.3)',
      amount: 342750,
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      dueText: 'Awaiting review (2d)',
      actionLabel: 'Review asset',
      targetUrl: '/approvals',
      clientContact: 'rahul.sharma@atherenergy.com',
    },
    {
      id: 'act_005',
      type: 'TASK_DUE',
      typeLabel: 'Task due today',
      badgeVariant: 'neutral',
      client: 'boAt Lifestyle',
      subject: 'Deliver Prores 4444 master to boAt digital team',
      amount: 94500,
      date: new Date().toISOString(),
      dueText: 'Due today',
      actionLabel: 'Mark done',
      targetUrl: '/tasks',
    },
    {
      id: 'act_006',
      type: 'STALE_LEAD',
      typeLabel: 'Stale lead',
      badgeVariant: 'neutral',
      client: 'Zepto Creative Labs',
      subject: 'Quick Commerce Launch Film (Est. ₹2,80,000)',
      amount: 280000,
      date: new Date(Date.now() - 9 * 86400000).toISOString(),
      dueText: '9d inactive',
      actionLabel: 'Call lead',
      targetUrl: '/leads',
      clientContact: '+91 98200 44112',
    },
  ]);

  // Six-stage pipeline strip
  const pipelineStages = [
    {
      id: 'inquiry',
      name: 'Inquiry',
      count: 5,
      totalValue: 870000,
      stuckCount: 1,
      isStuckStage: false,
      to: '/leads',
    },
    {
      id: 'quotation',
      name: 'Quotation',
      count: 3,
      totalValue: 832000,
      stuckCount: 2,
      isStuckStage: true, // Most stuck items: 2 quotes awaiting reply > 48h
      stuckReason: '2 awaiting reply',
      to: '/quotations',
    },
    {
      id: 'project',
      name: 'Project',
      count: 2,
      totalValue: 692750,
      stuckCount: 0,
      isStuckStage: false,
      to: '/projects',
    },
    {
      id: 'deliverable',
      name: 'Deliverable',
      count: 2,
      totalValue: 342750,
      stuckCount: 1,
      isStuckStage: false,
      to: '/approvals',
    },
    {
      id: 'invoice',
      name: 'Invoice',
      count: 2,
      totalValue: 529150,
      stuckCount: 1,
      isStuckStage: false,
      stuckReason: '1 overdue',
      to: '/invoices',
    },
    {
      id: 'payment',
      name: 'Payment',
      count: 1,
      totalValue: 100000,
      stuckCount: 0,
      isStuckStage: false,
      to: '/payments',
    },
  ];

  // Exactly two summary numbers
  const totalUncollectedReceivables = 529150;
  const totalActionItemsCount = actionItems.length;

  const filteredItems = actionItems.filter((it) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'INVOICE') return it.type === 'INVOICE_OVERDUE';
    if (selectedFilter === 'QUOTES') return it.type === 'QUOTE_AWAITING';
    if (selectedFilter === 'APPROVALS') return it.type === 'APPROVAL_PENDING';
    if (selectedFilter === 'TASKS') return it.type === 'TASK_DUE';
    if (selectedFilter === 'LEADS') return it.type === 'STALE_LEAD';
    return true;
  });

  const handleAction = (item: ActionItem) => {
    setActiveModalItem(item);
  };

  const confirmAction = () => {
    if (!activeModalItem) return;
    setIsProcessing(true);
    setTimeout(() => {
      setActionItems((prev) => prev.filter((i) => i.id !== activeModalItem.id));
      setActionSuccessMsg(`Completed action for ${activeModalItem.client}`);
      setIsProcessing(false);
      setActiveModalItem(null);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar: Headline & Maximum Two Summary Numbers */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <h1 className="text-lg font-bold text-brand-text tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            {currentOrg?.name || 'Setsuzoku Media Labs'} &bull; Production Desk
          </p>
        </div>

        {/* Exactly two summary numbers */}
        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-brand-border pt-1 sm:pt-0">
          <div className="pt-1 sm:pt-0">
            <div className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">
              Uncollected receivables
            </div>
            <div className="text-lg sm:text-xl font-bold text-brand-text tabular-nums font-mono mt-0.5">
              {formatINR(totalUncollectedReceivables)}
            </div>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-8">
            <div className="text-[11px] font-medium text-brand-muted uppercase tracking-wider">
              Action items
            </div>
            <div className="text-lg sm:text-xl font-bold text-brand-text tabular-nums font-mono mt-0.5">
              {totalActionItemsCount}{' '}
              <span className="text-xs font-normal text-brand-muted font-sans">requiring action</span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-[11px] text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: THE ACTION QUEUE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-brand-text">Action queue</h2>
            <span className="px-1.5 py-0.2 rounded bg-gray-100 text-brand-text text-[11px] font-mono font-medium">
              {filteredItems.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[12px]">
            {[
              { key: 'ALL', label: `All (${actionItems.length})` },
              {
                key: 'INVOICE',
                label: `Invoices (${actionItems.filter((i) => i.type === 'INVOICE_OVERDUE').length})`,
              },
              {
                key: 'QUOTES',
                label: `Quotes (${actionItems.filter((i) => i.type === 'QUOTE_AWAITING').length})`,
              },
              {
                key: 'APPROVALS',
                label: `Approvals (${actionItems.filter((i) => i.type === 'APPROVAL_PENDING').length})`,
              },
              {
                key: 'TASKS',
                label: `Tasks (${actionItems.filter((i) => i.type === 'TASK_DUE').length})`,
              },
              {
                key: 'LEADS',
                label: `Leads (${actionItems.filter((i) => i.type === 'STALE_LEAD').length})`,
              },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`px-2.5 py-1 rounded text-xs transition font-medium ${
                  selectedFilter === f.key
                    ? 'bg-brand-accent text-white'
                    : 'text-brand-muted hover:text-brand-text hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dense 36px Action Queue Table */}
        <div className="bg-white rounded border border-brand-border overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-brand-muted space-y-2">
              <p>No pending action items in this queue.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFilter('ALL')}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="h-9 border-b border-brand-border bg-gray-50/80 text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    <th className="py-2 px-3 w-32">Type</th>
                    <th className="py-2 px-3 w-48">Client</th>
                    <th className="py-2 px-3">Subject / Details</th>
                    <th className="py-2 px-3 text-right w-28">Amount</th>
                    <th className="py-2 px-3 text-right w-36">Age / Status</th>
                    <th className="py-2 px-3 text-right w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="h-9 hover:bg-gray-50/80 transition-colors duration-100"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Badge variant={item.badgeVariant} size="sm">
                          {item.typeLabel}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-semibold text-brand-text whitespace-nowrap">
                        {item.client}
                      </td>
                      <td className="py-2 px-3 text-brand-muted truncate max-w-xs sm:max-w-md">
                        {item.subject}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-brand-text font-medium whitespace-nowrap">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-2 px-3 text-right text-xs whitespace-nowrap">
                        <span
                          className={
                            item.type === 'INVOICE_OVERDUE'
                              ? 'text-brand-error font-medium font-mono'
                              : 'text-brand-muted font-mono'
                          }
                        >
                          {item.dueText}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <Button
                          variant={item.type === 'INVOICE_OVERDUE' ? 'primary' : 'outline'}
                          size="xs"
                          onClick={() => handleAction(item)}
                        >
                          {item.actionLabel}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: PIPELINE STRIP */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-brand-text">Pipeline</h2>
            <p className="text-[11px] text-brand-muted">
              Select a stage to inspect active records &bull; Highlighted stage indicates bottlenecks
            </p>
          </div>
          <span className="text-[11px] font-mono text-brand-muted">
            Total active pipeline: {formatINR(3364650)}
          </span>
        </div>

        {/* 6-Stage Horizontal Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => (
            <button
              key={stage.id}
              onClick={() => navigate(stage.to)}
              className={`p-3 rounded text-left transition relative border ${
                stage.isStuckStage
                  ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/50'
                  : 'bg-white border-brand-border hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-brand-muted">
                <span>
                  {idx + 1}. {stage.name}
                </span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </div>

              <div className="mt-2 text-base font-bold text-brand-text tabular-nums font-mono">
                {formatINR(stage.totalValue)}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs text-brand-muted font-mono">
                <span>{stage.count} items</span>
                {stage.stuckCount > 0 && (
                  <span
                    className={`text-[10px] font-semibold ${
                      stage.isStuckStage ? 'text-amber-800' : 'text-brand-error'
                    }`}
                  >
                    {stage.stuckReason || `${stage.stuckCount} stuck`}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Execution Modal */}
      {activeModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModalItem(null)}
          title={activeModalItem.actionLabel}
          subtitle={`${activeModalItem.client} — ${activeModalItem.subject}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded border border-brand-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-brand-muted">Account:</span>
                <span className="font-semibold text-brand-text">{activeModalItem.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Target Amount:</span>
                <span className="font-mono font-bold text-brand-text">
                  {formatINR(activeModalItem.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Contact Info:</span>
                <span className="font-mono text-brand-text">
                  {activeModalItem.clientContact || 'Primary Producer Desk'}
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed">
              Confirming this will mark the item resolved in your action queue and trigger the
              automated workflow for {activeModalItem.client}.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalItem(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={confirmAction}
              >
                Confirm {activeModalItem.actionLabel}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
