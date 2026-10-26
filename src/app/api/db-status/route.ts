import { NextResponse } from "next/server";
import { getDatabaseCutoverStatus } from "@/lib/prisma";
import { getPhase1State } from "@/server/store/phase1-store";

export async function GET() {
  const cutoverStatus = await getDatabaseCutoverStatus();
  const store = getPhase1State();

  return NextResponse.json({
    system: "Vensure Enterprise Procurement Management System",
    stage: "Stage 2 — Prisma Database Seed & PostgreSQL Cutover Ready",
    database: cutoverStatus,
    seedMetrics: {
      organizations: store.organizations.length,
      branches: store.branches.length,
      departmentsAndBudgets: store.departments.length,
      costCenters: store.costCenters.length,
      users: store.users.length,
      procurementMethods: store.procurementMethods.length,
      procurementPlans: store.procurementPlans.length,
      purchaseRequisitions: store.purchaseRequisitions.length,
      suppliers: store.suppliers.length,
      rfqs: store.rfqs.length,
      contracts: store.contracts.length,
      purchaseOrders: store.purchaseOrders.length,
      goodsReceipts: store.goodsReceipts.length,
      purchaseReturns: store.purchaseReturns.length,
      supplierInvoices: store.supplierInvoices.length,
      documentTemplates: store.documentTemplates.length,
      procurementAlerts: store.procurementAlerts.length,
      enterpriseIntegrations: store.enterpriseIntegrations.length,
    },
  });
}
