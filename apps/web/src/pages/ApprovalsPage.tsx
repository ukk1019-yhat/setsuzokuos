import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  DeliverableStatus,
  ApprovalDecision,
} from '@setsuzoku/shared';
import {
  ShieldCheck,
  FileCheck,
  Upload,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  FileText,
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { currentOrg, currentRole } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload revision modal
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [fileName, setFileName] = useState('');
  const [changelogNotes, setChangelogNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const data = await apiRequest<any[]>('/deliverables/approvals/queue');
      setQueue(data);
    } catch (err) {
      console.error('Failed to load approvals queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentOrg]);

  const handleUploadRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await apiRequest('/deliverables/versions', {
        method: 'POST',
        body: JSON.stringify({
          deliverableId: selectedItem.deliverableId,
          storageKey: `s3://deliverables/${selectedItem.projectId}/${fileName}`,
          fileName,
          fileSize: 104857600, // 100MB
          fileMimeType: 'application/octet-stream',
          changelogNotes,
        }),
      });

      setIsRevisionOpen(false);
      setFileName('');
      setChangelogNotes('');
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Failed to submit revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: DeliverableStatus) => {
    switch (status) {
      case DeliverableStatus.APPROVED:
        return <Badge variant="success" size="sm">Approved</Badge>;
      case DeliverableStatus.REVISION_REQUESTED:
        return <Badge variant="error" size="sm">Revision Requested</Badge>;
      case DeliverableStatus.PENDING_CLIENT_APPROVAL:
        return <Badge variant="warning" size="sm">Pending Client Approval</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Deliverable Approvals Workflow</h1>
            <Badge variant="teal" size="sm">
              {queue.length} Active Items
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Formal client sign-off audit trail with multi-version deliverable history. Never overwrite approved assets.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-brand-muted">Loading review queue...</div>
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-muted italic">
            No active deliverables currently in review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Deliverable Title</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Latest Asset</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queue.map((item) => (
                  <tr key={item.deliverableId} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-navy">{item.deliverableTitle}</div>
                      {item.changelogNotes && (
                        <div className="text-[11px] text-brand-muted line-clamp-1 italic">
                          &ldquo;{item.changelogNotes}&rdquo;
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-brand-text">
                      {item.projectName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-brand-navy">
                        v{item.latestVersionNumber}.0
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-text">
                      {item.fileName}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.currentStatus)}
                    </td>

                    <td className="py-3.5 px-4 text-brand-muted">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[11px]"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsRevisionOpen(true);
                        }}
                      >
                        <Upload className="w-3 h-3 text-brand-teal" />
                        <span>Upload Revision</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Submit Revision Modal */}
      {selectedItem && (
        <Modal
          isOpen={isRevisionOpen}
          onClose={() => setIsRevisionOpen(false)}
          title={`Upload Revision for ${selectedItem.deliverableTitle}`}
          subtitle={`Current version: v${selectedItem.latestVersionNumber}.0 -> Incrementing to v${selectedItem.latestVersionNumber + 1}.0`}
        >
          <form onSubmit={handleUploadRevision} className="space-y-4">
            <p className="text-xs text-brand-muted">
              Submitting a new revision preserves the historical version and puts the deliverable back into <strong className="text-brand-navy">Pending Client Approval</strong> stage.
            </p>

            <Input
              label="Asset File Name *"
              required
              placeholder="e.g. Master_ColorGraded_v2.mov"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Changelog & Revision Notes *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe changes made in this revision..."
                value={changelogNotes}
                onChange={(e) => setChangelogNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRevisionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Revision
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

