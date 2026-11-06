import { db } from '../../storage/db';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ConvertQuotationToProjectInput,
  ProjectStatus,
  ProjectDto,
} from '@setsuzoku/shared';

export class ProjectsService {
  private async formatProject(proj: any, fullDetail: boolean = false): Promise<ProjectDto> {
    const client = await db.findClientById(proj.clientId);
    const manager = proj.managerId ? await db.findUserById(proj.managerId) : null;

    let milestones = undefined;
    let tasks = undefined;
    let deliverables = undefined;
    let progressPercentage = 0;

    const allTasks = await db.getTasks(proj.organizationId, { projectId: proj.id });
    if (allTasks.length > 0) {
      const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
      progressPercentage = Math.round((completed / allTasks.length) * 100);
    }

    if (fullDetail) {
      const mList = await db.getMilestonesByProject(proj.id);
      milestones = mList.map((m) => ({
        id: m.id,
        projectId: m.projectId,
        title: m.title,
        description: m.description,
        dueDate: m.dueDate ? m.dueDate.toISOString() : null,
        isCompleted: m.isCompleted,
        completedAt: m.completedAt ? m.completedAt.toISOString() : null,
        createdAt: m.createdAt.toISOString(),
      }));

      tasks = await Promise.all(
        allTasks.map(async (t) => {
          const assignee = t.assignedToId ? await db.findUserById(t.assignedToId) : null;
          const subtasks = await db.getSubtasks(t.id);
          return {
            id: t.id,
            projectId: t.projectId,
            milestoneId: t.milestoneId,
            assignedToId: t.assignedToId,
            assignedTo: assignee ? { id: assignee.id, fullName: assignee.fullName, email: assignee.email } : null,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
            subtasks: subtasks.map((st) => ({
              id: st.id,
              taskId: st.taskId,
              title: st.title,
              isCompleted: st.isCompleted,
              completedAt: st.completedAt ? st.completedAt.toISOString() : null,
            })),
          };
        })
      );

      const dList = await db.getDeliverablesByProject(proj.id);
      deliverables = await Promise.all(
        dList.map(async (d) => {
          const versions = await db.getDeliverableVersions(d.id);
          const formattedVersions = await Promise.all(
            versions.map(async (v) => {
              const approvals = await db.getApprovalHistory(v.id);
              return {
                id: v.id,
                deliverableId: v.deliverableId,
                versionNumber: v.versionNumber,
                storageKey: v.storageKey,
                fileName: v.fileName,
                fileSize: v.fileSize,
                fileMimeType: v.fileMimeType,
                changelogNotes: v.changelogNotes,
                submittedAt: v.submittedAt.toISOString(),
                approvals: approvals.map((a) => ({
                  id: a.id,
                  deliverableVersionId: a.deliverableVersionId,
                  approverType: a.approverType,
                  approverUserId: a.approverUserId,
                  decision: a.decision,
                  comments: a.comments,
                  ipAddress: a.ipAddress,
                  decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
                  createdAt: a.createdAt.toISOString(),
                })),
              };
            })
          );
          return {
            id: d.id,
            projectId: d.projectId,
            title: d.title,
            description: d.description,
            currentStatus: d.currentStatus,
            currentVersion: d.currentVersion,
            createdAt: d.createdAt.toISOString(),
            updatedAt: d.updatedAt.toISOString(),
            versions: formattedVersions,
          };
        })
      );
    }

    return {
      ...proj,
      startDate: proj.startDate ? proj.startDate.toISOString() : null,
      deadline: proj.deadline ? proj.deadline.toISOString() : null,
      completedAt: proj.completedAt ? proj.completedAt.toISOString() : null,
      createdAt: proj.createdAt.toISOString(),
      updatedAt: proj.updatedAt.toISOString(),
      progressPercentage,
      client: client
        ? {
            ...client,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
          }
        : undefined,
      manager: manager
        ? {
            id: manager.id,
            fullName: manager.fullName,
          }
        : undefined,
      milestones,
      tasks,
      deliverables,
    };
  }

  public async getProjects(
    organizationId: string,
    filters?: { clientId?: string; status?: ProjectStatus; managerId?: string }
  ): Promise<ProjectDto[]> {
    const list = await db.getProjects(organizationId, filters);
    return Promise.all(list.map((p) => this.formatProject(p, false)));
  }

  public async getProjectById(organizationId: string, id: string): Promise<ProjectDto> {
    const proj = await db.findProjectById(id);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }
    return this.formatProject(proj, true);
  }

  public async createProject(
    organizationId: string,
    input: CreateProjectInput,
    userId: string
  ): Promise<ProjectDto> {
    const proj = await db.createProject({
      organizationId,
      clientId: input.clientId,
      managerId: input.managerId,
      name: input.name,
      code: input.code,
      description: input.description,
      budget: input.budget,
      priority: input.priority,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      relatedQuotationId: input.relatedQuotationId,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'PROJECT_CREATED',
      resource: 'Project',
      resourceId: proj.id,
      diff: input,
    });

    return this.formatProject(proj, true);
  }

  public async convertFromQuotation(
    organizationId: string,
    input: ConvertQuotationToProjectInput,
    userId: string
  ): Promise<ProjectDto> {
    const quoteData = await db.findQuotationById(input.quotationId);
    if (!quoteData || quoteData.quotation.organizationId !== organizationId) {
      const err: any = new Error('Quotation not found');
      err.statusCode = 404;
      err.code = 'QUOTATION_NOT_FOUND';
      throw err;
    }

    if (quoteData.quotation.convertedProjectId) {
      const existing = await db.findProjectById(quoteData.quotation.convertedProjectId);
      if (existing) {
        return this.formatProject(existing, true);
      }
    }

    const client = await db.findClientById(quoteData.quotation.clientId);
    const projectName = input.name || `Execution: ${quoteData.quotation.quoteNumber} (${client?.name || 'Project'})`;

    const proj = await db.createProject({
      organizationId,
      clientId: quoteData.quotation.clientId,
      managerId: input.managerId,
      name: projectName,
      description: input.description || quoteData.quotation.notes || undefined,
      budget: quoteData.quotation.totalAmount,
      startDate: new Date(),
      deadline: input.deadline ? new Date(input.deadline) : quoteData.quotation.validUntil,
      relatedQuotationId: input.quotationId,
    });

    // Automatically create initial deliverables / milestones from quotation items
    for (const item of quoteData.items) {
      await db.createMilestone({
        projectId: proj.id,
        title: item.serviceName,
        description: item.description || undefined,
      });

      await db.createDeliverable({
        projectId: proj.id,
        title: `Deliverable: ${item.serviceName}`,
        description: item.description || undefined,
      });
    }

    await db.logAudit({
      organizationId,
      userId,
      action: 'PROJECT_CONVERTED_FROM_QUOTATION',
      resource: 'Project',
      resourceId: proj.id,
      diff: { quotationId: input.quotationId, budget: proj.budget },
    });

    return this.formatProject(proj, true);
  }

  public async updateProject(
    organizationId: string,
    id: string,
    input: UpdateProjectInput,
    userId: string
  ): Promise<ProjectDto> {
    const existing = await db.findProjectById(id);
    if (!existing || existing.organizationId !== organizationId) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateProject(id, {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      completedAt: input.status === ProjectStatus.COMPLETED ? new Date() : existing.completedAt,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'PROJECT_UPDATED',
      resource: 'Project',
      resourceId: id,
      diff: { before: existing, after: updated },
    });

    return this.formatProject(updated, true);
  }
}

export const projectsService = new ProjectsService();

