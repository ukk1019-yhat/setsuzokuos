import { db } from '../../storage/db';
import {
  CreateDeliverableInput,
  SubmitDeliverableVersionInput,
  DecideApprovalInput,
  ApprovalDecision,
  DeliverableDto,
  DeliverableVersionDto,
  ApprovalDto,
} from '@setsuzoku/shared';

const ALLOWED_MEDIA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'application/pdf',
  'application/zip',
  'audio/mpeg',
  'audio/wav',
  'audio/aac',
]);

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB max for video/production deliverables

export class DeliverablesService {
  public async createDeliverable(
    organizationId: string,
    input: CreateDeliverableInput,
    userId: string
  ): Promise<DeliverableDto> {
    const proj = await db.findProjectById(input.projectId);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    const deliv = await db.createDeliverable({
      projectId: input.projectId,
      title: input.title,
      description: input.description,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'DELIVERABLE_CREATED',
      resource: 'Deliverable',
      resourceId: deliv.id,
      diff: input,
    });

    return {
      id: deliv.id,
      projectId: deliv.projectId,
      title: deliv.title,
      description: deliv.description,
      currentStatus: deliv.currentStatus,
      currentVersion: deliv.currentVersion,
      createdAt: deliv.createdAt.toISOString(),
      updatedAt: deliv.updatedAt.toISOString(),
      versions: [],
    };
  }

  public async submitVersion(
    organizationId: string,
    input: SubmitDeliverableVersionInput,
    userId: string
  ): Promise<DeliverableVersionDto> {
    const deliv = await db.findDeliverableById(input.deliverableId);
    if (!deliv) {
      const err: any = new Error('Deliverable not found');
      err.statusCode = 404;
      err.code = 'DELIVERABLE_NOT_FOUND';
      throw err;
    }

    const proj = await db.findProjectById(deliv.projectId);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Deliverable not found in this organization');
      err.statusCode = 404;
      err.code = 'DELIVERABLE_NOT_FOUND';
      throw err;
    }

    // Security Check: File upload validation (allowlist MIME, size limit, path traversal defense)
    if (!ALLOWED_MEDIA_MIME_TYPES.has(input.fileMimeType.toLowerCase())) {
      const err: any = new Error(
        `Disallowed file type: ${input.fileMimeType}. Only verified image, video, audio, PDF, and archive formats are accepted.`
      );
      err.statusCode = 400;
      err.code = 'UNSUPPORTED_MEDIA_TYPE';
      throw err;
    }

    if (input.fileSize > MAX_FILE_SIZE_BYTES) {
      const err: any = new Error(
        `File size exceeds maximum permitted limit (${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB).`
      );
      err.statusCode = 400;
      err.code = 'FILE_TOO_LARGE';
      throw err;
    }

    // Sanitize filename against directory traversal / malicious path characters
    const sanitizedFileName = input.fileName
      .replace(/^.*[\\/]/, '')
      .replace(/[\0\x00-\x1f\x7f]/g, '')
      .replace(/\.\./g, '_');

    const sanitizedStorageKey = input.storageKey
      .replace(/\.\./g, '')
      .replace(/^\/+/, '');

    const version = await db.submitDeliverableVersion({
      deliverableId: input.deliverableId,
      storageKey: sanitizedStorageKey,
      fileName: sanitizedFileName,
      fileSize: input.fileSize,
      fileMimeType: input.fileMimeType.toLowerCase(),
      changelogNotes: input.changelogNotes,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'DELIVERABLE_VERSION_SUBMITTED',
      resource: 'DeliverableVersion',
      resourceId: version.id,
      diff: { versionNumber: version.versionNumber, fileName: version.fileName },
    });

    return {
      id: version.id,
      deliverableId: version.deliverableId,
      versionNumber: version.versionNumber,
      storageKey: version.storageKey,
      fileName: version.fileName,
      fileSize: version.fileSize,
      fileMimeType: version.fileMimeType,
      changelogNotes: version.changelogNotes,
      submittedAt: version.submittedAt.toISOString(),
      approvals: [],
    };
  }

  public async decideApproval(
    organizationId: string,
    versionId: string,
    input: DecideApprovalInput,
    user: { id: string; fullName: string; role: string },
    ipAddress?: string,
    userAgent?: string
  ): Promise<ApprovalDto> {
    const approval = await db.recordApprovalDecision({
      deliverableVersionId: versionId,
      approverType: user.role === 'CLIENT' ? 'CLIENT' : 'MANAGER',
      approverUserId: user.id,
      decision: input.decision,
      comments: input.comments,
      ipAddress,
      userAgent,
    });

    await db.logAudit({
      organizationId,
      userId: user.id,
      action: 'APPROVAL_DECISION_RECORDED',
      resource: 'Approval',
      resourceId: approval.id,
      diff: { decision: input.decision, comments: input.comments },
    });

    return {
      id: approval.id,
      deliverableVersionId: approval.deliverableVersionId,
      approverType: approval.approverType,
      approverUserId: approval.approverUserId,
      approverName: user.fullName,
      decision: approval.decision,
      comments: approval.comments,
      ipAddress: approval.ipAddress,
      decidedAt: approval.decidedAt ? approval.decidedAt.toISOString() : null,
      createdAt: approval.createdAt.toISOString(),
    };
  }

  public async getApprovalsQueue(organizationId: string) {
    const projects = await db.getProjects(organizationId);
    const queue = [];

    for (const proj of projects) {
      const deliverables = await db.getDeliverablesByProject(proj.id);
      for (const d of deliverables) {
        const versions = await db.getDeliverableVersions(d.id);
        if (versions.length > 0) {
          const latestVersion = versions[0];
          const approvals = await db.getApprovalHistory(latestVersion.id);
          queue.push({
            deliverableId: d.id,
            deliverableTitle: d.title,
            projectId: proj.id,
            projectName: proj.name,
            currentStatus: d.currentStatus,
            latestVersionNumber: latestVersion.versionNumber,
            latestVersionId: latestVersion.id,
            fileName: latestVersion.fileName,
            changelogNotes: latestVersion.changelogNotes,
            submittedAt: latestVersion.submittedAt.toISOString(),
            approvalsCount: approvals.length,
          });
        }
      }
    }

    return queue;
  }
}

export const deliverablesService = new DeliverablesService();

