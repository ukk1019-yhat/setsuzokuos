import { db } from '../../storage/db';
import { BusinessOverviewReportDto } from '@setsuzoku/shared';
import { invoicesService } from '../invoices/invoices.service';
import { paymentsService } from '../payments/payments.service';

export class ReportsService {
  public async getBusinessOverview(
    organizationId: string
  ): Promise<BusinessOverviewReportDto> {
    const metrics = await db.getBusinessOverview(organizationId);
    const recentInvoices = (await invoicesService.getInvoices(organizationId)).slice(0, 5);
    const recentPayments = (await paymentsService.getPayments(organizationId)).slice(0, 5);

    return {
      ...metrics,
      recentInvoices,
      recentPayments,
    };
  }
}

export const reportsService = new ReportsService();
