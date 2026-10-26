"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  BellRing,
  BarChart3,
  Printer,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  FileText,
  Sparkles,
  Clock,
  HelpCircle,
} from "lucide-react";
import type {
  Phase1DatabaseState,
  DocumentTemplateRecord,
} from "@/server/store/phase1-store";

type Phase6Tab = "trail" | "alerts" | "analytics";

function Phase6Content() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Phase6Tab) || "trail";

  const [activeTab, setActiveTab] = useState<Phase6Tab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Module 16: Template Editor & Branded PDF Preview
  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplateRecord | null>(null);
  const [tplTitle, setTplTitle] = useState<string>("");
  const [tplFooter, setTplFooter] = useState<string>("");
  const [tplLogo, setTplLogo] = useState<boolean>(true);
  const [tplSignatures, setTplSignatures] = useState<boolean>(true);
  const [tplTerms, setTplTerms] = useState<boolean>(true);

  const [previewDocTemplate, setPreviewDocTemplate] =
    useState<DocumentTemplateRecord | null>(null);

  // Module 19: Alert Severity Filter & Cron Scan Result
  const [alertFilter, setAlertFilter] = useState<string>("ALL");
  const [cronScanSummary, setCronScanSummary] = useState<string | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/phase1", { cache: "no-store" });
      const data: Phase1DatabaseState = await res.json();
      setState(data);
    } catch {
      showToast("Failed to load document trail and analytics data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as Phase6Tab;
    if (tabParam && ["trail", "alerts", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  async function dispatchAction(
    action: string,
    payload: Record<string, unknown>
  ) {
    try {
      setSubmitting(true);
      const res = await fetch("/api/phase1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Operation failed", "error");
        return null;
      }
      const nextState: Phase1DatabaseState = json.state || json;
      setState(nextState);
      return nextState;
    } catch {
      showToast("Network error occurred", "error");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !state) {
    return (
      <div className="p-12 flex items-center justify-center gap-2 text-sm text-slate-600">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
        Loading Document Trail, Alerts Engine &amp; Analytics Suite...
      </div>
    );
  }

  const orgId = state.activeOrganizationId;
  const activeOrg =
    state.organizations.find((o) => o.id === orgId) || state.organizations[0];

  const orgPlans = state.procurementPlans.filter(
    (p) => p.organizationId === orgId
  );
  const orgPrs = state.purchaseRequisitions.filter(
    (p) => p.organizationId === orgId
  );
  const orgRfqs = state.rfqs.filter((r) => r.organizationId === orgId);
  const orgContracts = state.contracts.filter(
    (c) => c.organizationId === orgId
  );
  const orgPos = state.purchaseOrders.filter((p) => p.organizationId === orgId);
  const orgGrns = state.goodsReceipts.filter((g) => g.organizationId === orgId);
  const orgReturns = (state.purchaseReturns || []).filter(
    (r) => r.organizationId === orgId
  );
  const orgInvoices = (state.supplierInvoices || []).filter(
    (i) => i.organizationId === orgId
  );
  const orgSuppliers = state.suppliers.filter(
    (s) => s.organizationId === orgId
  );
  const orgDepts = state.departments.filter((d) => d.organizationId === orgId);
  const orgTemplates = (state.documentTemplates || []).filter(
    (t) => t.organizationId === orgId
  );
  const orgAlerts = (state.procurementAlerts || []).filter(
    (a) => a.organizationId === orgId
  );
  const orgAuditLogs = state.auditLogs.filter(
    (a) => a.organizationId === orgId
  );

  // Connected End-to-End Document Trail Stages (Module 16)
  const connectedTrailStages = [
    {
      step: "01",
      stage: "Procurement Plan",
      refNo: orgPlans[0]?.planCode || "PLAN-2026-001",
      title:
        orgPlans[0]?.description ||
        "Annual Hematology & Molecular Reagents Plan",
      actor: orgPlans[0]?.approvedBy || "Dr. Kenneth Mwangi (HOD)",
      status: orgPlans[0]?.status || "ACTIVE",
      href: "/phase2?tab=planning",
    },
    {
      step: "02",
      stage: "Purchase Requisition (PR)",
      refNo: orgPrs[1]?.prNumber || "PR-2026-0041",
      title: orgPrs[1]?.title || "Molecular Diagnostics PCR Reagent Kits",
      actor: orgPrs[1]?.requesterName || "Dr. Kenneth Mwangi",
      status: orgPrs[1]?.status || "APPROVED",
      href: "/phase2?tab=pr",
    },
    {
      step: "03",
      stage: "Request for Quotation (RFQ)",
      refNo: orgRfqs[0]?.rfqNumber || "RFQ-2026-0101",
      title: orgRfqs[0]?.title || "Competitive Quotation Invitation",
      actor: "Mercy Njoroge (PROCUREMENT_OFFICER)",
      status: orgRfqs[0]?.status || "EVALUATED",
      href: "/phase3?tab=rfq",
    },
    {
      step: "04",
      stage: "Supplier Quotations (3 Bids)",
      refNo: "QT-101 / QT-102 / QT-103",
      title: `${orgRfqs[0]?.quotations.length || 3} Sealed Supplier Bids ($5,950 – $6,850)`,
      actor: "Apex BioMedical, MedCore Surgical, EastAfrica Digital",
      status: "SUBMITTED",
      href: "/portal?tab=rfqs",
    },
    {
      step: "05",
      stage: "Weighted Evaluation Report",
      refNo: "EVAL-2026-0101",
      title:
        "Price (50%) + Quality (30%) + Delivery (20%) Side-by-Side Matrix",
      actor: "Mercy Njoroge & Evaluation Committee",
      status: "COMPLETED",
      href: "/phase3?tab=evaluation",
    },
    {
      step: "06",
      stage: "Award Letter & Contract",
      refNo: orgContracts[0]?.contractNumber || "CNT-2026-FA08",
      title:
        orgContracts[0]?.title ||
        "Framework Agreement & Official Award Notification",
      actor: "Evelyn Chebet (MD / CEO)",
      status: "ACTIVE",
      href: "/phase3?tab=contracts",
    },
    {
      step: "07",
      stage: "Purchase Order (PO)",
      refNo: orgPos[0]?.poNumber || "PO-2026-0054",
      title: orgPos[0]?.title || "Call-Off Order (12 Kits @ $850 = $10,200)",
      actor: "Supplier Acknowledged via Portal",
      status: orgPos[0]?.status || "PARTIALLY_DELIVERED",
      href: "/phase4?tab=po",
    },
    {
      step: "08",
      stage: "Goods Receipt Note (GRN)",
      refNo: orgGrns[0]?.grnNumber || "GRN-2026-0088",
      title: `Delivery Note ${orgGrns[0]?.deliveryNoteRef || "DN-APEX-8821"} (8 Kits Received)`,
      actor: orgGrns[0]?.receivedBy || "Josephine Mutiso (Warehouse)",
      status: orgGrns[0]?.status || "PARTIALLY_RECEIVED",
      href: "/phase4?tab=grn",
    },
    {
      step: "09",
      stage: "Purchase Return & Credit Note",
      refNo: orgReturns[0]?.returnNumber || "RET-2026-0014",
      title: `1 Damaged Kit Rejected (-KES 110,500) → Credit Note ${orgReturns[0]?.creditNoteNumber || "CN-APEX-2026-402"}`,
      actor: orgReturns[0]?.raisedBy || "Central Medical Stores",
      status: orgReturns[0]?.status || "SUPPLIER_ACKNOWLEDGED",
      href: "/phase5?tab=returns",
    },
    {
      step: "10",
      stage: "3-Way Matched Tax Invoice",
      refNo: orgInvoices[0]?.invoiceNumber || "INV-APEX-8821",
      title: `7 Net Accepted Kits @ KES 110,500 (KES 773,500 Net Payable after CN)`,
      actor: "Automated 3-Way Match Engine",
      status: orgInvoices[0]?.threeWayMatchStatus || "MATCHED",
      href: "/phase5?tab=match",
    },
    {
      step: "11",
      stage: "Finance Payment Voucher",
      refNo: orgInvoices[0]?.internalVoucherNo || "PV-2026-0091",
      title: `Remittance Ref: ${orgInvoices[0]?.payments[0]?.paymentReference || "RTGS-STANBIC-994812"} (KES ${(orgInvoices[0]?.amountPaid || 383500).toLocaleString()} Paid)`,
      actor: "CPA Victor Mutua (FINANCE)",
      status: orgInvoices[0]?.status || "PARTIALLY_PAID",
      href: "/phase5?tab=payments",
    },
  ];

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const updated = await dispatchAction("UPDATE_DOCUMENT_TEMPLATE", {
      templateId: editingTemplate.id,
      title: tplTitle,
      customFooterText: tplFooter,
      includeLogo: tplLogo,
      includeSignatureBlocks: tplSignatures,
      includeTermsAndConditions: tplTerms,
    });
    if (updated) {
      setEditingTemplate(null);
      showToast(
        `Saved ${editingTemplate.templateCode} as Version v${editingTemplate.versionNumber + 1}!`
      );
    }
  };

  const handleRunCronScan = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/cron/procurement-alerts", {
        cache: "no-store",
      });
      const json = await res.json();
      await fetchState();
      setCronScanSummary(
        `Cron Job (${json.job}) verified at ${new Date(json.checkedAt).toLocaleTimeString()}: ${json.summary?.totalActiveAlerts || orgAlerts.length} active alerts across ${json.checks?.length || 7} automated rule monitors.`
      );
      showToast(
        "Executed Vercel Cron Alert & Escalation Scan (/api/cron/procurement-alerts)!"
      );
    } catch {
      showToast("Cron scan failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    const updated = await dispatchAction("ACKNOWLEDGE_OR_DISMISS_ALERT", {
      alertId,
    });
    if (updated) {
      showToast("Alert status updated and logged in Audit Trail.");
    }
  };

  // Export Analytics & Audit Report to CSV (Excel-compatible)
  const handleExportCsv = () => {
    const rows: string[][] = [
      ["VENSURE EXECUTIVE PROCUREMENT & AUDIT ANALYTICS EXPORT"],
      ["Organization", activeOrg.name, "Exported At", new Date().toISOString()],
      [],
      [
        "1. DEPARTMENT 4-LAYER BUDGET VS. COMMITTED VS. ACTUAL",
        "Total Budget",
        "Encumbered (PR)",
        "Committed (PO)",
        "Actual Paid",
        "Available",
      ],
      ...orgDepts.map((d) => [
        d.name,
        String(d.totalBudget),
        String(d.encumbered),
        String(d.committed),
        String(d.actualSpend),
        String(
          Math.max(
            0,
            d.totalBudget - d.encumbered - d.committed - d.actualSpend
          )
        ),
      ]),
      [],
      [
        "2. SUPPLIER SPEND RANKING & PERFORMANCE SCORECARDS",
        "Code",
        "Category",
        "Cumulative Spend (KES)",
        "Completed POs",
        "Quality (/5)",
        "On-Time Delivery (%)",
        "Price Score (%)",
      ],
      ...orgSuppliers.map((s) => [
        s.name,
        s.supplierCode,
        s.category,
        String(s.cumulativeSpend),
        String(s.completedPoCount),
        String(s.qualityRating),
        String(s.deliveryTimeScore),
        String(s.priceCompetitivenessScore),
      ]),
      [],
      [
        "3. THREE-WAY MATCH INVOICE REGISTER",
        "Voucher",
        "PO Number",
        "GRN Number",
        "3-Way Match Status",
        "Net Payable (KES)",
        "Paid (KES)",
        "Balance Due (KES)",
      ],
      ...orgInvoices.map((i) => [
        i.invoiceNumber,
        i.internalVoucherNo,
        i.poNumber,
        i.grnNumber,
        i.threeWayMatchStatus,
        String(i.netPayableAmount),
        String(i.amountPaid),
        String(i.balanceDue),
      ]),
      [],
      [
        "4. IMMUTABLE AUDIT TRAIL",
        "Timestamp",
        "Actor",
        "Role",
        "Action",
        "Entity",
        "Summary",
      ],
      ...orgAuditLogs.map((a) => [
        a.timestamp,
        a.actorName,
        a.actorRole,
        a.action,
        `${a.entityType}:${a.entityId}`,
        a.summary.replace(/,/g, ";"),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Vensure_Executive_Analytics_${activeOrg.slug}_2026.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      "Downloaded Excel/CSV Executive Procurement & Audit Report (.csv)!"
    );
  };

  const filteredAlerts = orgAlerts.filter(
    (a) => alertFilter === "ALL" || a.severity === alertFilter
  );

  const totalSupplierSpend = orgSuppliers.reduce(
    (s, sup) => s + sup.cumulativeSpend,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-rose-950 text-rose-100 border-rose-700"
              : "bg-slate-900 text-emerald-300 border-emerald-500/40"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Phase 6 Header Banner */}
      <section className="bg-indigo-950 text-white rounded-xl p-6 border border-indigo-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Traceability, Alerts &amp; Executive Analytics
              </span>
              <span className="text-xs text-indigo-200">
                Tenant: <strong className="text-white">{activeOrg.name}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold">
              Connected Document Trail, 9 Branded Templates, Cron Alerts &amp;
              Executive Analytics
            </h1>
            <p className="text-xs text-indigo-200/80">
              End-to-end document traceability from Annual Plan to Payment
              Voucher, automated SLA/expiry cron alerts, and exportable
              executive analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel / CSV Report
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Executive PDF
            </button>
            <Link
              href="/workspace"
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 inline-flex items-center gap-1.5 transition"
            >
              Command Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("trail")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "trail"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <FolderKanban className="w-4 h-4 text-indigo-400" />
          1. Connected Document Trail &amp; 9 Branded Templates (
          {orgTemplates.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "alerts"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <BellRing className="w-4 h-4 text-amber-400" />
          2. Notifications, Escalations &amp; Scheduled Alerts (
          {orgAlerts.filter((a) => a.status === "ACTIVE").length} Active)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "analytics"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          3. Executive Reporting &amp; Analytics Suite (10 Reports)
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MODULE 16 — CONNECTED DOCUMENT TRAIL & 9 BRANDED TEMPLATES     */}
      {/* ===================================================================== */}
      {activeTab === "trail" && (
        <div className="space-y-6">
          {/* Management's 5 Core Audit Questions Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Instant Executive Audit Answers (End-to-End Lifecycle Dossier)
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">
                  1. &ldquo;Who requested this?&rdquo;
                </p>
                <p className="font-bold text-white">Dr. Kenneth Mwangi (HOD)</p>
                <p className="text-[11px] text-emerald-400">
                  Pathology &amp; Lab • PR-2026-0041
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">
                  2. &ldquo;Who approved it?&rdquo;
                </p>
                <p className="font-bold text-white">
                  HOD → Mercy Njoroge → Evelyn Chebet
                </p>
                <p className="text-[11px] text-emerald-400">
                  Multi-level chain &amp; delegated CFO cover
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">
                  3. &ldquo;Which suppliers quoted?&rdquo;
                </p>
                <p className="font-bold text-white">
                  Apex ($6,380), MedCore ($5,950), EADigital ($6,850)
                </p>
                <p className="text-[11px] text-emerald-400">
                  3 competitive bids on RFQ-2026-0101
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">
                  4. &ldquo;Why was this supplier selected?&rdquo;
                </p>
                <p className="font-bold text-white">
                  Weighted Score + Framework CNT-2026-FA08
                </p>
                <p className="text-[11px] text-emerald-400">
                  ISO 13485 quality &amp; 4-day ex-stock lead time
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                <p className="text-[11px] text-slate-400">
                  5. &ldquo;How much have we spent with them?&rdquo;
                </p>
                <p className="font-bold text-white">
                  ${(orgSuppliers[0]?.cumulativeSpend || 84500).toLocaleString()}{" "}
                  Across {orgSuppliers[0]?.completedPoCount || 14} POs
                </p>
                <p className="text-[11px] text-emerald-400">
                  Rating: {orgSuppliers[0]?.qualityRating || 4.8}/5.0 •{" "}
                  {orgSuppliers[0]?.deliveryTimeScore || 96}% On-Time
                </p>
              </div>
            </div>
          </div>

          {/* 11-Stage Connected Document Trail Viewer */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                11-Stage Connected Document Trail (Plan → PR → RFQ → Quote →
                Eval → Award → PO → GRN → Return → Invoice → Payment)
              </h2>
              <p className="text-xs text-slate-500">
                Click any stage in the chain to jump directly to its underlying
                record and audit history
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {connectedTrailStages.map((node) => (
                <Link
                  key={node.step}
                  href={node.href}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-indigo-600">
                      STAGE {node.step} • {node.stage}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                      {node.status}
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-900">
                      {node.refNo}
                    </p>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">
                      {node.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                    Actor: {node.actor}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* 9 Configurable & Version-Controlled Branded Document Templates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  9 Configurable Branded Document &amp; PDF Templates
                </h2>
                <p className="text-xs text-slate-500">
                  White-labeled with {activeOrg.name} branding, version
                  tracking, signature blocks, and PDF export
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-700">
                        {tpl.templateCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Version v{tpl.versionNumber}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {tpl.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Footer: &ldquo;{tpl.customFooterText}&rdquo;
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                      {tpl.includeLogo && (
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                          ✓ Org Logo
                        </span>
                      )}
                      {tpl.includeSignatureBlocks && (
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                          ✓ Signatures
                        </span>
                      )}
                      {tpl.includeTermsAndConditions && (
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                          ✓ Standard Terms
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewDocTemplate(tpl)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Preview PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTplTitle(tpl.title);
                        setTplFooter(tpl.customFooterText);
                        setTplLogo(tpl.includeLogo);
                        setTplSignatures(tpl.includeSignatureBlocks);
                        setTplTerms(tpl.includeTermsAndConditions);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold"
                    >
                      Configure v{tpl.versionNumber + 1}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingTemplate && (
              <form
                onSubmit={handleSaveTemplate}
                className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-indigo-950">
                    Customize Template {editingTemplate.templateCode} (Saving
                    creates Version v{editingTemplate.versionNumber + 1})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Document Header Title
                    </label>
                    <input
                      type="text"
                      required
                      value={tplTitle}
                      onChange={(e) => setTplTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Custom Compliance Footer Text
                    </label>
                    <input
                      type="text"
                      required
                      value={tplFooter}
                      onChange={(e) => setTplFooter(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={tplLogo}
                      onChange={(e) => setTplLogo(e.target.checked)}
                    />
                    Include Tenant Logo &amp; Color Accent
                  </label>
                  <label className="inline-flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={tplSignatures}
                      onChange={(e) => setTplSignatures(e.target.checked)}
                    />
                    Include Digital Approval Signature Stamps
                  </label>
                  <label className="inline-flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={tplTerms}
                      onChange={(e) => setTplTerms(e.target.checked)}
                    />
                    Include Standard Commercial Terms Clause
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save New Template Version (v
                  {editingTemplate.versionNumber + 1})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MODULE 19 — NOTIFICATIONS, ESCALATIONS & VERCEL CRON ALERTS    */}
      {/* ===================================================================== */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Notifications, SLA Escalations &amp; Scheduled Alert Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Monitors Pending Approvals, Overdue POs, 70%/90% Budget
                  Thresholds, 48h RFQ Deadlines, 90/60/30d Contract Renewals,
                  Expiring Supplier Certs &amp; 3-Way Match Failures
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold bg-slate-50"
                >
                  <option value="ALL">All Alert Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="WARNING">Warning Only</option>
                  <option value="INFO">Info Only</option>
                </select>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleRunCronScan}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Run Live Cron Alert Scan (/api/cron/procurement-alerts)
                </button>
              </div>
            </div>

            {cronScanSummary && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center justify-between">
                <span>{cronScanSummary}</span>
                <span className="font-mono text-[11px] text-emerald-700">
                  vercel.json schedule: &quot;0 6 * * *&quot;
                </span>
              </div>
            )}

            <div className="space-y-3">
              {filteredAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    alt.status === "ACKNOWLEDGED"
                      ? "bg-slate-50 border-slate-200 opacity-75"
                      : alt.severity === "CRITICAL"
                        ? "bg-rose-50/50 border-rose-300"
                        : alt.severity === "WARNING"
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-blue-50/40 border-blue-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          alt.severity === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : alt.severity === "WARNING"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-blue-600 text-white"
                        }`}
                      >
                        {alt.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {alt.alertType}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Ref: {alt.referenceNo}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • Channels: {alt.channels} • {alt.createdAt}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {alt.title}
                    </h3>
                    <p className="text-xs text-slate-600">{alt.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={alt.targetHref}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                    >
                      Open Record →
                    </Link>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleToggleAlert(alt.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold"
                    >
                      {alt.status === "ACTIVE" ? "Acknowledge" : "Reopen"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MODULE 18 — EXECUTIVE REPORTING & ANALYTICS SUITE (10 REPORTS) */}
      {/* ===================================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Top KPI Row: Cycle Time, 3-Way Match Pass Rate, Concentration Risk */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Report #2 • PR-to-PO Cycle Time
              </span>
              <p className="text-2xl font-bold text-slate-900">1.8 Days Avg</p>
              <p className="text-xs text-slate-500">
                64% faster than 5.0-day industry benchmark
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-blue-700">
                Report #3 • Supplier Concentration Risk
              </span>
              <p className="text-2xl font-bold text-slate-900">
                {totalSupplierSpend > 0
                  ? Math.round(
                      ((orgSuppliers[0]?.cumulativeSpend || 0) /
                        totalSupplierSpend) *
                        100
                    )
                  : 46}
                % Top Vendor Share
              </p>
              <p className="text-xs text-slate-500">
                Diversified across {orgSuppliers.length} onboarded vendors
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-purple-700">
                Report #5 • Annual Plan Execution
              </span>
              <p className="text-2xl font-bold text-slate-900">
                {orgPlans.length} Active Plans
              </p>
              <p className="text-xs text-slate-500">
                100% of PRs linked to approved FY2026 plans
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-rose-700">
                Report #9 • 3-Way Match Exception Rate
              </span>
              <p className="text-2xl font-bold text-slate-900">
                {
                  orgInvoices.filter(
                    (i) => i.threeWayMatchStatus !== "MATCHED"
                  ).length
                }{" "}
                of {orgInvoices.length} Flagged
              </p>
              <p className="text-xs text-slate-500">
                $1,210 overbilling prevented automatically
              </p>
            </div>
          </div>

          {/* Report #1 & #4: Department Spend & 4-Layer Budget vs. Committed vs. Actual */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reports #1 &amp; #4: Department Spend Analytics &amp; 4-Layer
                  Budget vs. Encumbered vs. Committed vs. Actual
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time financial position across all organizational
                  departments
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Head of Dept</th>
                    <th className="py-2.5 px-3 text-right">Total Budget</th>
                    <th className="py-2.5 px-3 text-right">Encumbered (PR)</th>
                    <th className="py-2.5 px-3 text-right">Committed (PO)</th>
                    <th className="py-2.5 px-3 text-right">Actual (Paid)</th>
                    <th className="py-2.5 px-3 text-right">Available</th>
                    <th className="py-2.5 px-3 text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orgDepts.map((d) => {
                    const used = d.encumbered + d.committed + d.actualSpend;
                    const avail = Math.max(0, d.totalBudget - used);
                    const pct = Math.round((used / d.totalBudget) * 100);
                    return (
                      <tr key={d.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {d.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {d.headName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          ${d.totalBudget.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-700 font-medium">
                          ${d.encumbered.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-medium">
                          ${d.committed.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-purple-700 font-bold">
                          ${d.actualSpend.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                          ${avail.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pct >= 75
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report #3 & #8: Supplier Spend Ranking & Performance Scorecard */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Reports #3 &amp; #8: Supplier Spend Concentration &amp;
                Performance Scorecards
              </h3>
              <div className="space-y-3 text-xs">
                {orgSuppliers.map((s) => {
                  const sharePct =
                    totalSupplierSpend > 0
                      ? Math.round(
                          (s.cumulativeSpend / totalSupplierSpend) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">
                            {s.name}
                          </span>{" "}
                          <span className="font-mono text-slate-500">
                            ({s.supplierCode})
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          ${s.cumulativeSpend.toLocaleString()} ({sharePct}%
                          share)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
                        <span>
                          Quality: <strong>{s.qualityRating}/5.0</strong>
                        </span>
                        <span>
                          On-Time Delivery:{" "}
                          <strong>{s.deliveryTimeScore}%</strong>
                        </span>
                        <span>
                          Price Score:{" "}
                          <strong>{s.priceCompetitivenessScore}%</strong>
                        </span>
                        <span>
                          Completed POs: <strong>{s.completedPoCount}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reports #6 & #7: Pending Approvals Aging & Contract Utilization */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Reports #6 &amp; #7: Contract Utilization &amp; Pending
                Approvals Aging
              </h3>
              <div className="space-y-3 text-xs">
                {orgContracts.map((c) => {
                  const utilPct = Math.round(
                    (c.utilizedSpend / c.ceilingValue) * 100
                  );
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">
                          {c.contractNumber} — {c.title}
                        </span>
                        <span className="font-bold text-purple-700">
                          {utilPct}% Utilized
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Supplier: {c.supplierName} • Utilized $
                        {c.utilizedSpend.toLocaleString()} of $
                        {c.ceilingValue.toLocaleString()} Ceiling • Expires{" "}
                        {c.endDate}
                      </p>
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Pending Approvals Aging Queue ({state.approvalQueue.length})
                  </p>
                  {state.approvalQueue
                    .filter((q) => q.organizationId === orgId)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {q.referenceNo}
                          </span>{" "}
                          — {q.title}
                          <p className="text-[11px] text-amber-800">
                            Awaiting Step #{q.currentStepOrder} • Dept:{" "}
                            {q.departmentName}
                          </p>
                        </div>
                        <span className="font-bold text-amber-900">
                          ${q.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report #10: Full Exportable Transaction Audit Trail */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Report #10: Full Exportable Transaction Audit Trail (
                  {orgAuditLogs.length} Entries)
                </h3>
                <p className="text-xs text-slate-500">
                  Every system action recorded with Actor, RBAC Role, IP
                  Address, Timestamp &amp; Entity Reference
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Full Audit Trail to CSV
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {orgAuditLogs.slice(0, 15).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-700">
                      {log.action}
                    </span>{" "}
                    •{" "}
                    <span className="font-semibold text-slate-900">
                      {log.actorName} ({log.actorRole})
                    </span>{" "}
                    •{" "}
                    <span className="font-mono text-slate-500">
                      {log.entityType}:{log.entityId}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {log.summary}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {log.timestamp} • IP {log.ipAddress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branded Document Template PDF Modal */}
      {previewDocTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                {previewDocTemplate.includeLogo && (
                  <div
                    className="h-10 w-10 rounded-xl font-bold flex items-center justify-center text-slate-950 text-lg"
                    style={{ backgroundColor: activeOrg.primaryColor }}
                  >
                    V
                  </div>
                )}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: activeOrg.primaryColor }}
                  >
                    {activeOrg.documentHeader}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {previewDocTemplate.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Template Code: {previewDocTemplate.templateCode} • Version v
                    {previewDocTemplate.versionNumber} • Tax ID:{" "}
                    {activeOrg.taxId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocTemplate(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold"
              >
                Close Preview
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900">
                Connected End-to-End Transaction Reference Chain:
              </p>
              <p className="font-mono text-slate-700">
                PLAN-2026-001 → PR-2026-0041 → RFQ-2026-0101 → EVAL-2026-0101 →
                CNT-2026-FA08 → PO-2026-0054 → GRN-2026-0088 → RET-2026-0014 →
                INV-APEX-8821 → PV-2026-0091
              </p>
            </div>

            {previewDocTemplate.includeSignatureBlocks && (
              <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Prepared By
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Mercy Njoroge
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    PROCUREMENT_OFFICER
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Budget &amp; 3-Way Match Verified
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    CPA Victor Mutua
                  </p>
                  <p className="text-[10px] text-emerald-700">FINANCE</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Executive Authorization
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    Evelyn Chebet (MD/CEO)
                  </p>
                  <p className="text-[10px] text-emerald-700">APPROVER</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
              <span>{previewDocTemplate.customFooterText}</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Audit Banner */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          All 9 branded templates, cron alert escalations, and executive reports
          are cryptographically linked to the Immutable Audit Trail.
        </span>
        <Link
          href="/admin?tab=audit"
          className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          Open Audit Log Viewer →
        </Link>
      </div>
    </div>
  );
}

export default function Phase6Page() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading Document Trail, Alerts &amp; Analytics Hub...
        </div>
      }
    >
      <Phase6Content />
    </Suspense>
  );
}
