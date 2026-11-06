"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const db_1 = require("../../storage/db");
const invoices_service_1 = require("../invoices/invoices.service");
const payments_service_1 = require("../payments/payments.service");
class ReportsService {
    async getBusinessOverview(organizationId) {
        const metrics = await db_1.db.getBusinessOverview(organizationId);
        const recentInvoices = (await invoices_service_1.invoicesService.getInvoices(organizationId)).slice(0, 5);
        const recentPayments = (await payments_service_1.paymentsService.getPayments(organizationId)).slice(0, 5);
        return {
            ...metrics,
            recentInvoices,
            recentPayments,
        };
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
