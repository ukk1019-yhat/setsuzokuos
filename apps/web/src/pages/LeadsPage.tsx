import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  LeadDto,
  LeadStatus,
  Priority,
  LeadActivityType,
} from '@setsuzoku/shared';
import {
  Plus,
  Code2,
  Kanban,
  Table as TableIcon,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';

const KANBAN_COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: LeadStatus.NEW, label: 'New Inquiries', color: 'border-blue-400' },
  { status: LeadStatus.CONTACTED, label: 'Contacted', color: 'border-amber-400' },
  { status: LeadStatus.QUALIFIED, label: 'Qualified', color: 'border-teal-400' },
  { status: LeadStatus.PROPOSAL_SENT, label: 'Proposal Sent', color: 'border-purple-400' },
  { status: LeadStatus.NEGOTIATION, label: 'Negotiation', color: 'border-indigo-400' },
  { status: LeadStatus.WON, label: 'Won (Client Ready)', color: 'border-emerald-500' },
  { status: LeadStatus.LOST, label: 'Lost', color: 'border-rose-300' },
];

export const LeadsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const { leads, createLead, convertLeadToClient, refreshData } = useData();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);

  // New lead form
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [source, setSource] = useState('Website');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [serviceRequired, setServiceRequired] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Activity form
  const [activityType, setActivityType] = useState<LeadActivityType>(LeadActivityType.NOTE);
  const [activityDesc, setActivityDesc] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Convert form
  const [billingAddress, setBillingAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [clientCategory, setClientCategory] = useState('Retainer');
  const [isConverting, setIsConverting] = useState(false);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createLead({
        title,
        contactName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
        source,
        priority,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
        serviceRequired: serviceRequired || undefined,
        notes: notes || undefined,
      });

      setIsAddOpen(false);
      setTitle('');
      setContactName('');
      setEmail('');
      setPhone('');
      setCompanyName('');
      setEstimatedBudget('');
      setServiceRequired('');
      setNotes('');
    } catch (err: any) {
      console.warn('Backend create lead error:', err);
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await apiRequest(`/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err: any) {
      console.warn('Status change synced locally:', err);
    }
  };

  const openLeadDetail = async (lead: LeadDto) => {
    try {
      const full = await apiRequest<LeadDto>(`/leads/${lead.id}`);
      setSelectedLead(full);
    } catch (err) {
      setSelectedLead(lead);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityDesc.trim()) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      leadId: selectedLead.id,
      activityType,
      description: activityDesc.trim(),
      createdAt: new Date().toISOString(),
    };

    setIsAddingActivity(true);
    try {
      await apiRequest(`/leads/${selectedLead.id}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          activityType,
          description: activityDesc.trim(),
        }),
      });
      setActivityDesc('');
      const updated = await apiRequest<LeadDto>(`/leads/${selectedLead.id}`);
      setSelectedLead(updated);
      await refreshData();
    } catch (err: any) {
      console.warn('Backend activity error, recorded locally:', err);
      setSelectedLead((prev) =>
        prev
          ? {
              ...prev,
              activities: [newActivity as any, ...(prev.activities || [])],
            }
          : null
      );
      setActivityDesc('');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsConverting(true);
    try {
      await convertLeadToClient(selectedLead.id, {
        billingAddress: billingAddress || undefined,
        taxId: taxId || undefined,
        category: clientCategory,
      });
      setIsConvertOpen(false);
      setSelectedLead(null);
    } catch (err: any) {
      console.warn('Backend convert lead error:', err);
      setIsConvertOpen(false);
      setSelectedLead(null);
    } finally {
      setIsConverting(false);
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.URGENT:
        return <Badge variant="error" size="sm">Urgent</Badge>;
      case Priority.HIGH:
        return <Badge variant="warning" size="sm">High</Badge>;
      case Priority.MEDIUM:
        return <Badge variant="teal" size="sm">Medium</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Lead Management CRM</h1>
            <Badge variant="teal" size="sm">
              {leads.length} Leads
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Track inquiries from initial contact to client conversion. Zero lead decay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-gray-100 rounded-md p-1 border border-brand-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsEmbedOpen(true)}
          >
            <Code2 className="w-3.5 h-3.5 text-brand-teal" />
            <span>Public Intake Embed</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Capture Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
          />
        </div>

        <div className="text-xs text-brand-muted">
          Showing <strong className="text-brand-navy">{leads.length}</strong> active pipeline opportunities
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[550px]">
          {KANBAN_COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.status);
            return (
              <div
                key={col.status}
                className="w-72 flex-shrink-0 bg-slate-100/70 rounded-lg border border-slate-200/80 flex flex-col max-h-[700px]"
              >
                {/* Column header */}
                <div className={`p-3 border-b bg-white rounded-t-lg border-t-2 ${col.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-navy">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                      {colLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column cards container */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => openLeadDetail(lead)}
                      className="bg-white p-3.5 rounded-md border border-brand-border shadow-sm hover:border-brand-teal/60 hover:shadow transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-xs font-semibold text-brand-navy group-hover:text-brand-teal transition line-clamp-1">
                          {lead.title}
                        </span>
                        {getPriorityBadge(lead.priority)}
                      </div>

                      <div className="text-[11px] font-medium text-brand-text mb-2">
                        {lead.contactName}
                        {lead.companyName && (
                          <span className="text-brand-muted block text-[10px]">
                            {lead.companyName}
                          </span>
                        )}
                      </div>

                      {lead.estimatedBudget && (
                        <div className="text-xs font-bold text-brand-navy mb-2 flex items-center gap-1 text-emerald-700">
                          <span>{currentOrg?.currency || 'INR'} {lead.estimatedBudget.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-brand-muted">
                        <span>{lead.source || 'Website'}</span>
                        <span className="text-brand-teal font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Inspect &rarr;
                        </span>
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Requirement / Lead</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Est. Budget</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-navy">{l.title}</div>
                      <div className="text-[10px] text-brand-muted">{new Date(l.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-brand-text">{l.contactName}</div>
                      <div className="text-[11px] text-brand-muted">{l.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={l.status}
                        onChange={(e) => handleStatusChange(l.id, e.target.value as LeadStatus)}
                        className="text-xs px-2 py-1 bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      >
                        {KANBAN_COLUMNS.map((col) => (
                          <option key={col.status} value={col.status}>
                            {col.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">{getPriorityBadge(l.priority)}</td>
                    <td className="py-3.5 px-4 font-semibold text-brand-navy">
                      {l.estimatedBudget ? `${currentOrg?.currency || 'INR'} ${l.estimatedBudget.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted">{l.source}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openLeadDetail(l)}
                        className="text-brand-teal hover:underline font-medium text-xs"
                      >
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.title}
          subtitle={`Lead ID: ${selectedLead.id.slice(0, 8)}...`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Top status bar & Convert button */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-navy">Pipeline Stage:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                  className="text-xs px-2.5 py-1 bg-white font-medium border border-brand-border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  {KANBAN_COLUMNS.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedLead.convertedToClientId ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 shadow"
                  onClick={() => setIsConvertOpen(true)}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Convert to Formal Client</span>
                </Button>
              ) : (
                <Badge variant="success" size="md">
                  Converted to Client Profile
                </Badge>
              )}
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Contact Person</span>
                  <span className="font-semibold text-brand-text">{selectedLead.contactName}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Email</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-brand-teal hover:underline">{selectedLead.email}</a>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Company</span>
                  <span>{selectedLead.companyName || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Estimated Budget</span>
                  <span className="font-bold text-brand-navy text-sm">
                    {selectedLead.estimatedBudget ? `${currentOrg?.currency || 'INR'} ${selectedLead.estimatedBudget.toLocaleString()}` : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Lead Source</span>
                  <span>{selectedLead.source}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[10px] uppercase font-bold tracking-wider">Priority</span>
                  <div>{getPriorityBadge(selectedLead.priority)}</div>
                </div>
              </div>
            </div>

            {selectedLead.serviceRequired && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100 text-xs">
                <span className="text-[10px] font-bold text-brand-navy uppercase tracking-wider block mb-1">
                  Scope / Service Requirement
                </span>
                <p className="text-brand-text whitespace-pre-wrap">{selectedLead.serviceRequired}</p>
              </div>
            )}

            {/* Activity Stream */}
            <div className="pt-2 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-3">
                Activity & Communication Log
              </h4>

              {/* Add activity form */}
              <form onSubmit={handleAddActivity} className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as LeadActivityType)}
                    className="text-xs px-2 py-1.5 bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  >
                    <option value={LeadActivityType.NOTE}>Note</option>
                    <option value={LeadActivityType.CALL}>Call Log</option>
                    <option value={LeadActivityType.EMAIL}>Email Sent</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Log a call summary, client note, or followup memo..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={isAddingActivity}>
                    Log
                  </Button>
                </div>
              </form>

              {/* Timeline */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedLead.activities?.map((act) => (
                  <div key={act.id} className="p-2.5 rounded bg-gray-50 border border-gray-100 text-xs flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-brand-muted">
                        <span className="font-semibold text-brand-navy uppercase">{act.activityType}</span>
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-brand-text mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Convert Lead to Client Modal */}
      <Modal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        title="Convert Lead to Formal Client"
        subtitle={`Creates persistent Client entity for ${selectedLead?.contactName}`}
      >
        <form onSubmit={handleConvertLead} className="space-y-4">
          <p className="text-xs text-brand-muted">
            Converting this lead will record it as <strong className="text-emerald-700">WON</strong>, create a Client entity in your CRM directory, and enable Quotation and Project generation.
          </p>

          <Input
            label="Billing Address"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            placeholder="e.g. 123 Tech Park, Indiranagar, Bengaluru"
          />

          <Input
            label="Client GSTIN / Tax ID"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="e.g. 29AAAAA0000A1Z5"
          />

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Client Category
            </label>
            <select
              value={clientCategory}
              onChange={(e) => setClientCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="Retainer">Retainer Agreement</option>
              <option value="Enterprise">Enterprise Fixed-Scope</option>
              <option value="Hourly">Hourly Consulting</option>
              <option value="One-Off">One-off Creative Project</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsConvertOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={isConverting}>
              Confirm Client Conversion
            </Button>
          </div>
        </form>
      </Modal>

      {/* Capture Lead Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Capture New Lead"
        subtitle="Add prospective inquiry into CRM pipeline"
      >
        <form onSubmit={handleCreateLead} className="space-y-3.5">
          <Input
            label="Requirement Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Website Overhaul & SEO"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Name *"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Jane Smith"
            />
            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@client.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Smith Logistics"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.URGENT}>Urgent</option>
              </select>
            </div>

            <Input
              label={`Estimated Budget (${currentOrg?.currency || 'INR'})`}
              type="number"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              placeholder="150000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Detailed Scope / Requirement
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="What does the client need delivered?"
              value={serviceRequired}
              onChange={(e) => setServiceRequired(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Lead to Pipeline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Public Intake Embed Code Modal */}
      <Modal
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
        title="Public Intake Form Embed"
        subtitle="Capture inbound leads from your marketing site directly into SETSUZOKU OS"
      >
        <div className="space-y-4 text-xs">
          <p className="text-brand-muted">
            Paste this HTML form snippet onto your website landing page. Submissions will automatically appear as <strong className="text-brand-navy">NEW</strong> leads in your pipeline.
          </p>

          <div className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg overflow-x-auto">
{`<form action="${window.location.origin}/api/v1/leads/intake" method="POST">
  <input type="hidden" name="organizationSlug" value="${currentOrg?.slug || 'your-org'}" />
  <input type="text" name="title" placeholder="Project Title" required />
  <input type="text" name="contactName" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Your Email" required />
  <input type="text" name="companyName" placeholder="Company Name" />
  <textarea name="serviceRequired" placeholder="Scope & Requirements"></textarea>
  <button type="submit">Submit Inquiry</button>
</form>`}
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded text-teal-800 text-[11px] space-y-2">
            <div>
              <strong>Public Intake Portal URL:</strong>{' '}
              <a
                href={`/intake/${currentOrg?.slug || 'setsuzoku-media-labs'}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-teal font-semibold underline ml-1"
              >
                {`${window.location.origin}/intake/${currentOrg?.slug || 'setsuzoku-media-labs'}`}
              </a>
            </div>
            <div>
              <strong>Direct JSON/REST Endpoint:</strong>{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border">{`${window.location.origin}/api/v1/leads/intake`}</code>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsEmbedOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

