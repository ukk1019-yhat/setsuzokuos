import { db } from '../../storage/db';
import { ProjectDto, QuotationDto, InvoiceDto } from '@setsuzoku/shared';
import { projectsService } from '../projects/projects.service';
import { quotationsService } from '../quotations/quotations.service';
import { invoicesService } from '../invoices/invoices.service';

export class ClientPortalService {
  private async findClientByEmail(organizationId: string, email: string) {
    return db.findClientByEmail(organizationId, email);
  }

  public async getClientDashboard(organizationId: string, userEmail: string) {
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

    const allProjects = await projectsService.getProjects(organizationId, { clientId: client.id });
    const allQuotations = await quotationsService.getQuotations(organizationId, { clientId: client.id });
    const allInvoices = await invoicesService.getInvoices(organizationId, { clientId: client.id });

    // Find pending deliverables requiring client sign-off
    const pendingApprovals = [];
    for (const proj of allProjects) {
      const fullProj = await projectsService.getProjectById(organizationId, proj.id);
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

export const clientPortalService = new ClientPortalService();

