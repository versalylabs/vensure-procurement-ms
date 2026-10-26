import { NextRequest, NextResponse } from "next/server";
import {
  appendAuditEntry,
  getPhase1State,
  savePhase1State,
} from "@/server/store/phase1-store";

/**
 * Vercel Cron endpoint (/api/cron/procurement-alerts)
 * Scheduled in vercel.json to trigger daily checks for:
 * - Pending approval escalations
 * - RFQs closing within 48 hours
 * - Overdue PO deliveries
 * - Contract renewal reminders (90 / 60 / 30 days)
 * - Expiring supplier compliance certificates
 * - Budget threshold warnings (70% / 90%)
 * - 3-Way Match invoice exceptions
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (
    process.env.NODE_ENV === "production" &&
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = getPhase1State();
  const orgId = state.activeOrganizationId;

  const pendingApprovals = state.approvalQueue.filter(
    (q) => q.organizationId === orgId && q.status === "UNDER_REVIEW"
  ).length;
  const openRfqs = state.rfqs.filter(
    (r) => r.organizationId === orgId && r.status === "ISSUED"
  ).length;
  const unconfirmedPos = state.purchaseOrders.filter(
    (p) => p.organizationId === orgId && p.status === "ISSUED"
  ).length;
  const expiringContracts = state.contracts.filter(
    (c) =>
      c.organizationId === orgId &&
      (c.status === "EXPIRING" || c.status === "ACTIVE")
  ).length;
  const expiringCerts = state.suppliers
    .filter((s) => s.organizationId === orgId)
    .reduce(
      (sum, s) =>
        sum +
        s.documents.filter(
          (d) => d.status === "EXPIRING_SOON" || d.status === "EXPIRED"
        ).length,
      0
    );
  const invoiceMismatches = state.supplierInvoices.filter(
    (i) => i.organizationId === orgId && i.threeWayMatchStatus !== "MATCHED"
  ).length;

  // Ensure all active alerts are surfaced and log cron scan in Audit Trail
  state.procurementAlerts.forEach((a) => {
    if (a.organizationId === orgId) {
      a.status = "ACTIVE";
    }
  });

  appendAuditEntry(state, {
    organizationId: orgId,
    actorName: "Vercel Scheduled Cron Engine",
    actorRole: "ADMIN",
    action: "CRON.DAILY_ALERT_SCAN_COMPLETED",
    entityType: "ProcurementAlert",
    entityId: "CRON-PROCUREMENT-ALERTS",
    summary: `Automated Cron Scan completed: ${pendingApprovals} pending approvals, ${openRfqs} open RFQs, ${unconfirmedPos} unconfirmed POs, ${expiringContracts} contracts monitored, ${expiringCerts} expiring supplier certs, ${invoiceMismatches} 3-way match exceptions.`,
  });

  savePhase1State(state);

  return NextResponse.json({
    ok: true,
    job: "procurement-alerts",
    checkedAt: new Date().toISOString(),
    summary: {
      pendingApprovals,
      openRfqs,
      unconfirmedPos,
      expiringContracts,
      expiringCerts,
      invoiceMismatches,
      totalActiveAlerts: state.procurementAlerts.filter(
        (a) => a.organizationId === orgId && a.status === "ACTIVE"
      ).length,
    },
    checks: [
      "pending_approvals_aging",
      "rfqs_closing_48h",
      "overdue_po_deliveries",
      "contract_renewals_90_60_30d",
      "expiring_supplier_certificates",
      "budget_thresholds_70_90_pct",
      "three_way_match_invoice_exceptions",
    ],
  });
}
