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
  TaskDto,
  TaskStatus,
  Priority,
  ProjectDto,
} from '@setsuzoku/shared';
import {
  Plus,
  CheckSquare,
  Clock,
  User,
  CheckCircle2,
  ListTodo,
  MessageSquare,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { currentOrg, user } = useAuth();
  const { tasks, projects, createTask, updateTaskStatus, refreshData } = useData();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'TODO' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  // Create task form
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subtask & Comment form
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveProjectId = projectId || (projects.length > 0 ? projects[0].id : '');
    if (!effectiveProjectId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        projectId: effectiveProjectId,
        title,
        description: description || undefined,
        assignedToId: assignedToId || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err: any) {
      console.warn('Backend create task error:', err);
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: `sub_${Date.now()}`,
      taskId: selectedTask.id,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setNewSubtaskTitle('');
    setSelectedTask((prev) =>
      prev ? { ...prev, subtasks: [...(prev.subtasks || []), newSubtask as any] } : null
    );

    try {
      await apiRequest(`/tasks/${selectedTask.id}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });
      await refreshData();
    } catch (err: any) {
      console.warn('Backend add subtask error, recorded locally:', err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (selectedTask) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks?.map((s) =>
                s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
              ),
            }
          : null
      );
    }
    try {
      await apiRequest(`/tasks/subtasks/${subtaskId}/toggle`, { method: 'POST' });
      await refreshData();
    } catch (err: any) {
      console.warn('Backend toggle subtask error, updated locally:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;

    const commentObj = {
      id: `comm_${Date.now()}`,
      taskId: selectedTask.id,
      userId: 'user_admin_001',
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setNewComment('');
    setSelectedTask((prev) =>
      prev ? { ...prev, comments: [...(prev.comments || []), commentObj as any] } : null
    );

    try {
      await apiRequest(`/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() }),
      });
    } catch (err: any) {
      console.warn('Backend comment error, recorded locally:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'MY') return t.assignedToId === user?.id;
    if (activeTab === 'TODO') return t.status !== TaskStatus.COMPLETED;
    if (activeTab === 'COMPLETED') return t.status === TaskStatus.COMPLETED;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Task Operations</h1>
            <Badge variant="teal" size="sm">
              {tasks.length} Assigned Tasks
            </Badge>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Departmental task execution, subtask checklists, and collaborative discussions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { key: 'ALL', label: 'All Tasks' },
          { key: 'MY', label: 'My Assigned Work' },
          { key: 'TODO', label: 'In Progress / Open' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === tab.key
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <Card>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-brand-muted">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-muted italic">
            No tasks found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-brand-border text-brand-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-navy">{t.title}</div>
                      {t.description && (
                        <div className="text-[11px] text-brand-muted line-clamp-1">{t.description}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                        className="text-xs px-2 py-1 bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                      >
                        <option value={TaskStatus.TODO}>To Do</option>
                        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                        <option value={TaskStatus.IN_REVIEW}>In Review</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.BLOCKED}>Blocked</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          t.priority === Priority.URGENT
                            ? 'error'
                            : t.priority === Priority.HIGH
                            ? 'warning'
                            : 'teal'
                        }
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-brand-text">
                      {t.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-teal" />
                          <span>{t.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-brand-muted italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-brand-muted">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTask(t)}
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
        )}
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          subtitle={`Priority: ${selectedTask.priority} | Status: ${selectedTask.status}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {selectedTask.description && (
              <p className="text-xs text-brand-text bg-gray-50 p-3 rounded border border-gray-100">
                {selectedTask.description}
              </p>
            )}

            {/* Subtasks Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-brand-teal" /> Subtasks Checklist
              </h4>

              <div className="space-y-1.5 mb-3">
                {selectedTask.subtasks?.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className="p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200 flex items-center gap-2 text-xs transition"
                  >
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => {}}
                      className="rounded text-brand-teal focus:ring-brand-teal cursor-pointer"
                    />
                    <span className={st.isCompleted ? 'line-through text-gray-400' : 'text-brand-text font-medium'}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add subtask */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a subtask step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
                <Button type="submit" variant="outline" size="sm">
                  Add Step
                </Button>
              </form>
            </div>

            {/* Task Discussion Comments */}
            <div className="pt-2 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-teal" /> Discussion Thread
              </h4>

              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {selectedTask.comments?.map((c) => (
                  <div key={c.id} className="p-2.5 rounded bg-gray-50 text-xs border border-gray-100">
                    <div className="flex justify-between text-[10px] text-brand-muted mb-0.5">
                      <span className="font-semibold text-brand-navy">{c.userName}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-brand-text">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Post comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-brand-border rounded focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
                <Button type="submit" variant="primary" size="sm">
                  Post
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Operational Task"
        subtitle="Assign work item under project"
      >
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Parent Project *
            </label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Task Title *"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Foley Sound Mix v1"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
                Assignee
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.fullName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1 uppercase tracking-wide">
              Task Scope & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-brand-border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-teal"
              placeholder="Instructions, guidelines, asset links..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

