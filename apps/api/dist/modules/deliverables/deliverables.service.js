"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverablesService = exports.DeliverablesService = void 0;
const db_1 = require("../../storage/db");
class DeliverablesService {
    async createDeliverable(organizationId, input, userId) {
        const proj = await db_1.db.findProjectById(input.projectId);
        if (!proj || proj.organizationId !== organizationId) {
            const err = new Error('Project not found');
            err.statusCode = 404;
            err.code = 'PROJECT_NOT_FOUND';
            throw err;
        }
        const deliv = await db_1.db.createDeliverable({
            projectId: input.projectId,
            title: input.title,
            description: input.description,
        });
        await db_1.db.logAudit({
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
    async submitVersion(organizationId, input, userId) {
        const deliv = await db_1.db.findDeliverableById(input.deliverableId);
        if (!deliv) {
            const err = new Error('Deliverable not found');
            err.statusCode = 404;
            err.code = 'DELIVERABLE_NOT_FOUND';
            throw err;
        }
        const proj = await db_1.db.findProjectById(deliv.projectId);
        if (!proj || proj.organizationId !== organizationId) {
            const err = new Error('Deliverable not found in this organization');
            err.statusCode = 404;
            err.code = 'DELIVERABLE_NOT_FOUND';
            throw err;
        }
        const version = await db_1.db.submitDeliverableVersion({
            deliverableId: input.deliverableId,
            storageKey: input.storageKey,
            fileName: input.fileName,
            fileSize: input.fileSize,
            fileMimeType: input.fileMimeType,
            changelogNotes: input.changelogNotes,
        });
        await db_1.db.logAudit({
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
    async decideApproval(organizationId, versionId, input, user, ipAddress, userAgent) {
        const approval = await db_1.db.recordApprovalDecision({
            deliverableVersionId: versionId,
            approverType: user.role === 'CLIENT' ? 'CLIENT' : 'MANAGER',
            approverUserId: user.id,
            decision: input.decision,
            comments: input.comments,
            ipAddress,
            userAgent,
        });
        await db_1.db.logAudit({
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
    async getApprovalsQueue(organizationId) {
        const projects = await db_1.db.getProjects(organizationId);
        const queue = [];
        for (const proj of projects) {
            const deliverables = await db_1.db.getDeliverablesByProject(proj.id);
            for (const d of deliverables) {
                const versions = await db_1.db.getDeliverableVersions(d.id);
                if (versions.length > 0) {
                    const latestVersion = versions[0];
                    const approvals = await db_1.db.getApprovalHistory(latestVersion.id);
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
exports.DeliverablesService = DeliverablesService;
exports.deliverablesService = new DeliverablesService();
