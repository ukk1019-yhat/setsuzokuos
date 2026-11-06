"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientPortalService = exports.ClientPortalService = void 0;
const db_1 = require("../../storage/db");
const projects_service_1 = require("../projects/projects.service");
const quotations_service_1 = require("../quotations/quotations.service");
const invoices_service_1 = require("../invoices/invoices.service");
class ClientPortalService {
    async findClientByEmail(organizationId, email) {
        return db_1.db.findClientByEmail(organizationId, email);
    }
    async getClientDashboard(organizationId, userEmail) {
        const client = await this.findClientByEmail(organizationId, userEmail);
        if (!client) {
            return {
                client: null,
                projects: [],
                pendingApprovals: [],
                quotations: [],
                invoices: [],
            };
        }
        const allProjects = await projects_service_1.projectsService.getProjects(organizationId, { clientId: client.id });
        const allQuotations = await quotations_service_1.quotationsService.getQuotations(organizationId, { clientId: client.id });
        const allInvoices = await invoices_service_1.invoicesService.getInvoices(organizationId, { clientId: client.id });
        // Find pending deliverables requiring client sign-off
        const pendingApprovals = [];
        for (const proj of allProjects) {
            const fullProj = await projects_service_1.projectsService.getProjectById(organizationId, proj.id);
            if (fullProj.deliverables) {
                for (const d of fullProj.deliverables) {
                    if (d.currentStatus === 'PENDING_CLIENT_APPROVAL' && d.versions && d.versions.length > 0) {
                        const latestVer = d.versions[0];
                        pendingApprovals.push({
                            deliverableId: d.id,
                            deliverableTitle: d.title,
                            projectId: proj.id,
                            projectName: proj.name,
                            versionId: latestVer.id,
                            versionNumber: latestVer.versionNumber,
                            fileName: latestVer.fileName,
                            changelogNotes: latestVer.changelogNotes,
                            submittedAt: latestVer.submittedAt,
                        });
                    }
                }
            }
        }
        return {
            client: {
                id: client.id,
                name: client.name,
                company: client.company,
                email: client.email,
            },
            projects: allProjects,
            pendingApprovals,
            quotations: allQuotations,
            invoices: allInvoices,
        };
    }
}
exports.ClientPortalService = ClientPortalService;
exports.clientPortalService = new ClientPortalService();
