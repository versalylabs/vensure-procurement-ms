"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FilePlus2,
  FileWarning,
  Filter,
  Hourglass,
  PackageSearch,
  RefreshCw,
  Scale,
  Send,
  ShieldAlert,
  Truck,
  BellRing,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import type { Phase1DatabaseState } from "@/server/store/phase1-store";

type PanelKey =
  | "new_prs"
  | "prs_awaiting"
  | "active_rfqs"
  | "rfqs_closing"
  | "quotes_eval"
  | "pos_unconfirmed"
  | "overdue_po"
  | "pending_grns"
  | "invoice_mismatch"
  | "supplier_issues";

interface DrillDownItem {
  id: string;
  refNo: string;
  title: string;
  department: string;
  meta: string;
  statusBadge: string;
  href: string;
  actionLabel: string;
}

function WorkspaceContent() {
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPanel, setSelectedPanel] =
    useState<PanelKey>("invoice_mismatch");

  // Live Module 17 Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [officerFilter, setOfficerFilter] = useState<string>("ALL");

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/phase1", { cache: "no-store" });
      const data: Phase1DatabaseState = await res.json();
      setState(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  if (loading || !state) {
    return (
      <div className="p-12 flex items-center justify-center gap-2 text-sm text-slate-600">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
        Loading Central Procurement Command Workspace...
      </div>
    );
  }

  const orgId = state.activeOrganizationId;
  const orgDepts = state.departments.filter((d) => d.organizationId === orgId);

  const matchesDept = (deptName?: string) =>
    departmentFilter === "ALL" || !deptName || deptName === departmentFilter;

  const matchesOfficer = (text?: string) =>
    officerFilter === "ALL" ||
    !text ||
    text.toLowerCase().includes(officerFilter.toLowerCase());

  // Compute live drill-down lists per panel
  const prList = state.purchaseRequisitions.filter(
    (p) =>
      p.organizationId === orgId &&
      matchesDept(p.departmentName) &&
      matchesOfficer(p.requesterName)
  );
  const rfqList = state.rfqs.filter(
    (r) => r.organizationId === orgId && matchesDept(r.departmentName)
  );
  const poList = state.purchaseOrders.filter(
    (p) => p.organizationId === orgId && matchesDept(p.departmentName)
  );
  const grnList = state.goodsReceipts.filter(
    (g) => g.organizationId === orgId && matchesDept(g.departmentName)
  );
  const invList = (state.supplierInvoices || []).filter(
    (i) => i.organizationId === orgId && matchesDept(i.departmentName)
  );
  const retList = (state.purchaseReturns || []).filter(
    (r) => r.organizationId === orgId && matchesDept(r.departmentName)
  );
  const supList = state.suppliers.filter((s) => s.organizationId === orgId);

  const drillDownMap: Record<PanelKey, DrillDownItem[]> = {
    new_prs: prList
      .filter((p) => p.status === "APPROVED" || p.status === "SUBMITTED")
      .map((p) => ({
        id: p.id,
        refNo: p.prNumber,
        title: p.title,
        department: p.departmentName,
        meta: `${formatCurrency(p.totalAmount)} • Method: ${p.selectedMethod} • Requester: ${p.requesterName}`,
        statusBadge: p.status,
        href: "/phase3?tab=rfq",
        actionLabel: "Convert PR to RFQ / PO →",
      })),
    prs_awaiting: prList
      .filter((p) => p.status === "UNDER_REVIEW" || p.status === "REJECTED")
      .map((p) => ({
        id: p.id,
        refNo: p.prNumber,
        title: p.title,
        department: p.departmentName,
        meta: `${formatCurrency(p.totalAmount)} • Revision v${p.revisionNumber}`,
        statusBadge: p.status,
        href: "/admin?tab=workflows",
        actionLabel: "Open Approval Queue →",
      })),
    active_rfqs: rfqList
      .filter((r) => r.status === "ISSUED" || r.status === "EVALUATED")
      .map((r) => ({
        id: r.id,
        refNo: r.rfqNumber,
        title: r.title,
        department: r.departmentName,
        meta: `Deadline: ${r.submissionDeadline} • ${r.quotations.length} Quotes Submitted`,
        statusBadge: r.status,
        href: "/phase3?tab=rfq",
        actionLabel: "Manage RFQ & Q&A →",
      })),
    rfqs_closing: rfqList
      .filter((r) => r.status === "ISSUED")
      .map((r) => ({
        id: r.id,
        refNo: r.rfqNumber,
        title: r.title,
        department: r.departmentName,
        meta: `Closing Soon (${r.submissionDeadline}) • Est. ${formatCurrency(r.estimatedBudget)}`,
        statusBadge: "CLOSING <48H",
        href: "/phase3?tab=rfq",
        actionLabel: "Inspect Submissions →",
      })),
    quotes_eval: rfqList
      .filter((r) => r.quotations.length > 0)
      .map((r) => ({
        id: r.id,
        refNo: r.rfqNumber,
        title: r.title,
        department: r.departmentName,
        meta: `${r.quotations.length} Supplier Quotes Ready for Weighted Matrix Comparison`,
        statusBadge: r.status,
        href: "/phase3?tab=evaluation",
        actionLabel: "Run Weighted Evaluation →",
      })),
    pos_unconfirmed: poList
      .filter((p) => p.status === "ISSUED")
      .map((p) => ({
        id: p.id,
        refNo: p.poNumber,
        title: p.title,
        department: p.departmentName,
        meta: `Supplier: ${p.supplierName} • Value: ${formatCurrency(p.totalAmount)}`,
        statusBadge: "AWAITING ACK",
        href: "/portal?tab=pos",
        actionLabel: "Acknowledge in Supplier Portal →",
      })),
    overdue_po: poList
      .filter(
        (p) =>
          p.status === "PARTIALLY_DELIVERED" || p.status === "ACKNOWLEDGED"
      )
      .map((p) => ({
        id: p.id,
        refNo: p.poNumber,
        title: p.title,
        department: p.departmentName,
        meta: `Expected Delivery: ${p.expectedDeliveryDate} • Supplier: ${p.supplierName}`,
        statusBadge: p.status,
        href: "/phase4?tab=po",
        actionLabel: "Expedite / Amend PO →",
      })),
    pending_grns: grnList.map((g) => ({
      id: g.id,
      refNo: g.grnNumber,
      title: `Delivery against ${g.poNumber} (${g.supplierName})`,
      department: g.departmentName,
      meta: `Delivery Note: ${g.deliveryNoteRef} • Received by: ${g.receivedBy}`,
      statusBadge: g.status,
      href: "/phase4?tab=grn",
      actionLabel: "Inspect Warehouse GRN →",
    })),
    invoice_mismatch: invList
      .filter((i) => i.threeWayMatchStatus !== "MATCHED")
      .map((i) => ({
        id: i.id,
        refNo: i.invoiceNumber,
        title: `${i.description} (${i.internalVoucherNo})`,
        department: i.departmentName,
        meta: `Billed ${i.invoicedQty} @ ${formatCurrency(i.invoicedUnitPrice)} vs. GRN Net Accepted ${i.grnAcceptedQty} @ PO ${formatCurrency(i.poUnitPrice)}`,
        statusBadge: i.threeWayMatchStatus,
        href: "/phase5?tab=match",
        actionLabel: "Resolve 3-Way Mismatch →",
      })),
    supplier_issues: [
      ...retList.map((r) => ({
        id: r.id,
        refNo: r.returnNumber,
        title: `Return on ${r.grnNumber}: ${r.description}`,
        department: r.departmentName,
        meta: `Reason: ${r.reasonCode} (-${formatCurrency(r.returnAmount)}) • Supplier: ${r.supplierName}`,
        statusBadge: r.status,
        href: "/phase5?tab=returns",
        actionLabel: "Manage Purchase Return →",
      })),
      ...supList
        .filter((s) => s.isBlacklisted)
        .map((s) => ({
          id: s.id,
          refNo: s.supplierCode,
          title: `Blacklisted Vendor: ${s.name}`,
          department: s.category,
          meta: s.blacklistReason || "Compliance breach",
          statusBadge: "BLACKLISTED",
          href: "/phase3?tab=suppliers",
          actionLabel: "Review Vendor Dossier →",
        })),
    ],
  };

  const panels = [
    {
      key: "new_prs" as PanelKey,
      title: "New PRs",
      description: "Approved/submitted PRs awaiting sourcing",
      count: drillDownMap.new_prs.length,
      urgency: "normal",
      icon: FilePlus2,
    },
    {
      key: "prs_awaiting" as PanelKey,
      title: "PRs Awaiting Action",
      description: "Pending multi-level approval or revision",
      count: drillDownMap.prs_awaiting.length,
      urgency: "warning",
      icon: Hourglass,
    },
    {
      key: "active_rfqs" as PanelKey,
      title: "Active RFQs",
      description: "Currently open or evaluated with suppliers",
      count: drillDownMap.active_rfqs.length,
      urgency: "normal",
      icon: Send,
    },
    {
      key: "rfqs_closing" as PanelKey,
      title: "RFQs Closing Soon",
      description: "Within 48 hours of submission deadline",
      count: drillDownMap.rfqs_closing.length,
      urgency: "critical",
      icon: Clock,
    },
    {
      key: "quotes_eval" as PanelKey,
      title: "Quotes Awaiting Evaluation",
      description: "Ready for weighted side-by-side comparison",
      count: drillDownMap.quotes_eval.length,
      urgency: "warning",
      icon: Scale,
    },
    {
      key: "pos_unconfirmed" as PanelKey,
      title: "POs Awaiting Confirmation",
      description: "Issued to supplier but not acknowledged",
      count: drillDownMap.pos_unconfirmed.length,
      urgency: "normal",
      icon: PackageSearch,
    },
    {
      key: "overdue_po" as PanelKey,
      title: "Split / Open Deliveries",
      description: "POs awaiting remaining delivery batches",
      count: drillDownMap.overdue_po.length,
      urgency: "critical",
      icon: AlertTriangle,
    },
    {
      key: "pending_grns" as PanelKey,
      title: "Warehouse GRNs",
      description: "Deliveries logged & inspected at stores",
      count: drillDownMap.pending_grns.length,
      urgency: "warning",
      icon: Truck,
    },
    {
      key: "invoice_mismatch" as PanelKey,
      title: "Invoice Mismatches",
      description: "Three-way match (PO ↔ GRN ↔ Invoice) failures",
      count: drillDownMap.invoice_mismatch.length,
      urgency: "critical",
      icon: FileWarning,
    },
    {
      key: "supplier_issues" as PanelKey,
      title: "Supplier Issues",
      description: "Purchase returns, blacklist & disputes",
      count: drillDownMap.supplier_issues.length,
      urgency: "warning",
      icon: ShieldAlert,
    },
  ].filter(
    (p) => urgencyFilter === "ALL" || p.urgency === urgencyFilter.toLowerCase()
  );

  // Selected Department or Aggregated 4-Layer Budget
  const filteredDepts =
    departmentFilter === "ALL"
      ? orgDepts
      : orgDepts.filter((d) => d.name === departmentFilter);

  const totalBudget = filteredDepts.reduce((s, d) => s + d.totalBudget, 0);
  const encumberedPRs = filteredDepts.reduce((s, d) => s + d.encumbered, 0);
  const committedPOs = filteredDepts.reduce((s, d) => s + d.committed, 0);
  const actualSpend = filteredDepts.reduce((s, d) => s + d.actualSpend, 0);
  const availableBudget = Math.max(
    0,
    totalBudget - encumberedPRs - committedPOs - actualSpend
  );
  const utilizedPct =
    totalBudget > 0
      ? Math.round(
          ((encumberedPRs + committedPOs + actualSpend) / totalBudget) * 100
        )
      : 0;

  const activeItems = drillDownMap[selectedPanel] || [];
  const activePanelMeta = panels.find((p) => p.key === selectedPanel);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Operational Filter Bar + 10 Clickable Action Panels */}
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Central Procurement Action Queue
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any panel below to inspect live transactions and jump
                straight to resolution
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 bg-slate-50 font-medium"
            >
              <option value="ALL">All Departments ({orgDepts.length})</option>
              {orgDepts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 bg-slate-50 font-medium"
            >
              <option value="ALL">All Urgency Levels</option>
              <option value="CRITICAL">Critical Urgency Only</option>
              <option value="WARNING">Warning Urgency Only</option>
              <option value="NORMAL">Routine / Normal Only</option>
            </select>

            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 bg-slate-50 font-medium"
            >
              <option value="ALL">All Procurement Officers</option>
              <option value="Mercy Njoroge">Mercy Njoroge (Procurement)</option>
              <option value="Amina Odhiambo">Dr. Amina Odhiambo (HOD)</option>
              <option value="Kenneth Mwangi">Dr. Kenneth Mwangi (Lab)</option>
              <option value="Grace Wanjiku">Grace Wanjiku (IT)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {panels.map((panel) => {
            const Icon = panel.icon;
            const isSelected = selectedPanel === panel.key;
            const badgeStyles =
              panel.urgency === "critical"
                ? "bg-rose-100 text-rose-800 border-rose-200"
                : panel.urgency === "warning"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-800 border-slate-200";

            return (
              <button
                key={panel.key}
                type="button"
                onClick={() => setSelectedPanel(panel.key)}
                className={`p-4 rounded-xl text-left border transition flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-slate-800 text-emerald-400"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyles}`}
                  >
                    {panel.count}
                  </span>
                </div>
                <div>
                  <h3
                    className={`font-semibold text-sm ${
                      isSelected ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {panel.title}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {panel.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Drill-Down Queue for the Selected Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Drill-Down Queue: {activePanelMeta?.title} (
                {activeItems.length})
              </h3>
              <p className="text-xs text-slate-500">
                {activePanelMeta?.description}
              </p>
            </div>
          </div>

          {activeItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No pending items in this queue for the current filter selection.
            </p>
          ) : (
            <div className="space-y-2">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {item.refNo}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                        {item.statusBadge}
                      </span>
                      <span className="text-slate-500">
                        • {item.department}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.meta}</p>
                  </div>

                  <Link
                    href={item.href}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shrink-0"
                  >
                    {item.actionLabel}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Real-Time 4-Layer Budget Control & Commitment Bar */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Real-Time 4-Layer Budget Encumbrance &amp; Commitment
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              {departmentFilter === "ALL"
                ? `All Departments Combined (${orgDepts.length} Departments — FY2026)`
                : `${departmentFilter} (FY2026)`}
            </h2>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            {utilizedPct}% Utilized / Committed (Threshold Alert @ 70%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Total Department Budget</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatCurrency(totalBudget)}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
            <p className="text-xs text-amber-800">Approved PRs (Encumbered)</p>
            <p className="text-lg font-bold text-amber-900 mt-1">
              {formatCurrency(encumberedPRs)}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
            <p className="text-xs text-blue-800">Open POs (Committed)</p>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {formatCurrency(committedPOs)}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-purple-50/60 border border-purple-200">
            <p className="text-xs text-purple-800">Paid Invoices (Actual)</p>
            <p className="text-lg font-bold text-purple-900 mt-1">
              {formatCurrency(actualSpend)}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300">
            <p className="text-xs font-medium text-emerald-800">
              Available Budget
            </p>
            <p className="text-lg font-bold text-emerald-900 mt-1">
              {formatCurrency(availableBudget)}
            </p>
          </div>
        </div>
      </section>

      {/* Functional Procurement Suite Directory */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Link
          href="/phase2"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-emerald-700">
            Planning &amp; PRs
          </span>
          <p className="text-xs font-bold text-slate-900">
            Budgets, Plans &amp; Requisitions
          </p>
          <p className="text-[11px] text-slate-500">
            4-Layer Budget &amp; PR Builder
          </p>
        </Link>
        <Link
          href="/phase3"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-teal-700">
            Sourcing &amp; Contracts
          </span>
          <p className="text-xs font-bold text-slate-900">
            Suppliers, RFQs &amp; Evaluation
          </p>
          <p className="text-[11px] text-slate-500">
            Weighted Matrix &amp; Contracts
          </p>
        </Link>
        <Link
          href="/phase4"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-amber-700">
            Fulfillment
          </span>
          <p className="text-xs font-bold text-slate-900">
            Purchase Orders &amp; GRNs
          </p>
          <p className="text-[11px] text-slate-500">
            PO Issuance &amp; Stores Inspection
          </p>
        </Link>
        <Link
          href="/phase5"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-rose-700">
            Accounts Payable
          </span>
          <p className="text-xs font-bold text-slate-900">
            Returns, 3-Way Match &amp; Pay
          </p>
          <p className="text-[11px] text-slate-500">
            PO ↔ GRN ↔ Invoice &amp; Vouchers
          </p>
        </Link>
        <Link
          href="/phase6"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-indigo-700">
            Intelligence
          </span>
          <p className="text-xs font-bold text-slate-900">
            Document Trail &amp; Analytics
          </p>
          <p className="text-[11px] text-slate-500">
            End-to-End Trail &amp; 10 Reports
          </p>
        </Link>
        <Link
          href="/phase7"
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 transition space-y-1 shadow-xs"
        >
          <span className="text-[10px] font-bold uppercase text-slate-700">
            Integrations
          </span>
          <p className="text-xs font-bold text-slate-900">
            ERP, Accounting &amp; SSO Hub
          </p>
          <p className="text-[11px] text-slate-500">
            QuickBooks, SAP, S3 &amp; WhatsApp
          </p>
        </Link>
      </div>
    </div>
  );
}

export default function ProcurementWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading Procurement Workspace...
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
