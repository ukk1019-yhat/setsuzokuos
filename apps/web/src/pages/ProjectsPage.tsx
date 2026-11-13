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
  ProjectDto,
  ProjectStatus,
  Priority,
  ClientDto,
  QuotationDto,
} from '@setsuzoku/shared';
import {
  Plus,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  User,
  DollarSign,
  Search,
  ListTodo,
} from 'lucide-react';

const PROJECT_STATUSES: { status: ProjectStatus; label: string; variant: any }[] = [
  { status: ProjectStatus.PLANNING, label: 'Planning', variant: 'neutral' },
  { status: ProjectStatus.ACTIVE, label: 'Active', variant: 'teal' },
  { status: ProjectStatus.REVIEW, label: 'In Review', variant: 'warning' },
  { status: ProjectStatus.COMPLETED, label: 'Completed', variant: 'success' },
  { status: ProjectStatus.ON_HOLD, label: 'On Hold', variant: 'error' },
];

export const ProjectsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const { projects, clients, quotations, createProject, spawnProjectFromQuotation } = useData();
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSpawnQuoteOpen, setIsSpawnQuoteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(null);

  // Manual project form
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Spawn from quote form
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [customProjectName, setCustomProjectName] = useState('');

  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients]);

  useEffect(() => {
    if (quotations.length > 0 && !selectedQuoteId) {
      setSelectedQuoteId(quotations[0].id);
    }
  }, [quotations]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveClientId = clientId || (clients.length > 0 ? clients[0].id : '');
    setIsSubmitting(true);
    try {
      await createProject({
        name,
        clientId: effectiveClientId,
        budget: budget ? parseFloat(budget) : 0,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        description: description || undefined,
        priority,
      });

      setIsCreateOpen(false);
      setName('');
      setBudget('');
      setDeadline('');
      setDescription('');
    } catch (err: any) {
      console.warn('Backend create project error:', err);
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpawnFromQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveQuoteId = selectedQuoteId || (quotations.length > 0 ? quotations[0].id : '');
    if (!effectiveQuoteId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await spawnProjectFromQuotation(effectiveQuoteId, customProjectName || undefined);
      setIsSpawnQuoteOpen(false);
      setCustomProjectName('');
    } catch (err: any) {
      console.warn('Backend spawn quote error:', err);
      setIsSpawnQuoteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProjectDetail = async (id: string) => {
    try {
      const full = await apiRequest<ProjectDto>(`/projects/${id}`);
      setSelectedProject(full);
    } catch (err: any) {
      console.warn('Failed to load project details from API, using list record:', err);
      const found = projects.find((p) => p.id === id);
      if (found) setSelectedProject(found);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Project Operations</h1>
            <Badge variant="teal" size="sm">
              {projects.length} Active Workstreams
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Milestone delivery schedules, task decomposition, and client sign-off tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {quotations.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 shadow"
              onClick={() => setIsSpawnQuoteOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spawn from Accepted Quote</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-brand-muted">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="py-16 text-center">
          <FolderKanban className="w-10 h-10 text-brand-teal mx-auto mb-3 opacity-80" />
          <h3 className="text-sm font-semibold text-brand-navy">No Projects Found</h3>
          <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
            Spawn a project from an accepted quotation or create a new project manually.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="flex flex-col justify-between hover:border-brand-teal/60 hover:shadow-md transition cursor-pointer group"
            >
              <div onClick={() => openProjectDetail(proj.id)}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-brand-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    {proj.code}
                  </span>
                  <Badge variant={proj.status === 'COMPLETED' ? 'success' : proj.status === 'ACTIVE' ? 'teal' : 'neutral'} size="sm">
                    {proj.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-brand-navy group-hover:text-brand-teal transition line-clamp-1">
                  {proj.name}
                </h3>
                <span className="text-xs text-brand-muted block mt-0.5 font-medium">
                  Client: {proj.client?.name} {proj.client?.company ? `(${proj.client.company})` : ''}
                </span>

                {proj.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{proj.description}</p>
                )}

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-brand-muted font-medium">Progress</span>
                    <span className="font-bold text-brand-navy">{proj.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-teal h-full transition-all duration-300"
                      style={{ width: `${proj.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-brand-muted">
                  <span className="font-bold text-brand-navy">
                    {currentOrg?.currency || 'INR'} {proj.budget.toLocaleString()}
                  </span>
                  {proj.deadline && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(proj.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => openProjectDetail(proj.id)}
                  className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
                >
                  Manage Deliverables &rarr;
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Detail Drawer */}
      {selectedProject && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          subtitle={`Project Code: ${selectedProject.code} | Client: ${selectedProject.client?.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Top metrics bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">Budget Allocated</span>
                <span className="text-base font-bold text-brand-navy">
                  {currentOrg?.currency || 'INR'} {selectedProject.budget.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">Target Deadline</span>
                <span className="font-semibold text-brand-text block mt-0.5">
                  {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'Flexible'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider block">Completion Velocity</span>
                <span className="text-base font-bold text-brand-teal">{selectedProject.progressPercentage || 0}%</span>
              </div>
            </div>

            {/* Milestones Schedule */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-teal" /> Milestones Schedule
              </h4>
              <div className="space-y-1.5">
                {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                  selectedProject.milestones.map((m) => (
                    <div key={m.id} className="p-2.5 bg-gray-50 rounded border border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${m.isCompleted ? 'text-emerald-600' : 'text-gray-300'}`} />
                        <span className="font-semibold text-brand-navy">{m.title}</span>
                      </div>
                      <span className="text-[11px] text-brand-muted">
                        {m.dueDate ? `Due ${new Date(m.dueDate).toLocaleDateString()}` : 'Scheduled'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs text-brand-muted italic">No milestones defined.</div>
                )}
              </div>
            </div>

            {/* Deliverables Hub */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-teal" /> Deliverables & Client Approvals
              </h4>
              <div className="space-y-2">
                {selectedProject.deliverables && selectedProject.deliverables.length > 0 ? (
                  selectedProject.deliverables.map((d) => (
                    <div key={d.id} className="p-3 bg-white border border-brand-border rounded-lg shadow-sm text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-brand-navy">{d.title}</span>
                        <Badge
                          variant={
                            d.currentStatus === 'APPROVED'
                              ? 'success'
                              : d.currentStatus === 'PENDING_CLIENT_APPROVAL'
                              ? 'warning'
                              : 'teal'
                          }
                          size="sm"
                        >
                          {d.currentStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-brand-muted">
                        <span>Current Version: <strong>v{d.currentVersion}.0</strong></span>
                        <span>{d.versions?.length || 0} Revisions Submitted</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs text-brand-muted italic">No deliverables tracked yet.</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Spawn Project from Accepted Quotation Modal */}
      <Modal
        isOpen={isSpawnQuoteOpen}
        onClose={() => setIsSpawnQuoteOpen(false)}
        title="Spawn Project from Accepted Quotation"
        subtitle="1-Click conversion: ports client, budget, milestones, and deliverables automatically"
      >
        <form onSubmit={handleSpawnFromQuote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Select Accepted Quotation *
            </label>
            <select
              required
              value={selectedQuoteId}
              onChange={(e) => setSelectedQuoteId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quoteNumber} - {q.client?.name} ({q.currency} {q.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Custom Project Name"
            placeholder="e.g. Master Production Phase 1"
            value={customProjectName}
            onChange={(e) => setCustomProjectName(e.target.value)}
            helperText="Leave empty to use automatic quotation title"
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsSpawnQuoteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={isSubmitting}>
              Initiate Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Project Creation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Initiate Project Manually"
        subtitle="Set up project scope, client linkage, and budget"
      >
        <form onSubmit={handleCreateProject} className="space-y-3.5">
          <Input
            label="Project Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Brand Commercial Film"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Client *
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
              label={`Allocated Budget (${currentOrg?.currency || 'INR'})`}
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="100000"
            />
          </div>

          <Input
            label="Target Delivery Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Description & Statement of Work
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="Key project goals, milestones, and deliverable specs..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

