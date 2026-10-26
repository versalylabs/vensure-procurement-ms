"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Phase1DatabaseState,
  ProcurementMethodKey,
  PurchaseRequisitionRecord,
} from "@/server/store/phase1-store";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  CalendarRange,
  FileSpreadsheet,
  GitBranch,
  Plus,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  AlertTriangle,
  Sparkles,
  Printer,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type Phase2Tab = "budget" | "planning" | "methods" | "pr";

export default function Phase2Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          Loading Budgets, Plans, Methods &amp; Requisitions...
        </div>
      }
    >
      <Phase2Content />
    </Suspense>
  );
}

function Phase2Content() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Phase2Tab) || "budget";

  const [activeTab, setActiveTab] = useState<Phase2Tab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Plan Creation Form State
  const [planDeptId, setPlanDeptId] = useState("");
  const [planCategory, setPlanCategory] = useState("Laboratory Reagents");
  const [planDesc, setPlanDesc] = useState("");
  const [planBudget, setPlanBudget] = useState("20000");
  const [planQuarter, setPlanQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q4");
  const [planDate, setPlanDate] = useState("2026-11-15");
  const [planMethod, setPlanMethod] = useState<ProcurementMethodKey>("RFQ");

  // PR Creation Form State
  const [prTitle, setPrTitle] = useState("");
  const [prDeptId, setPrDeptId] = useState("");
  const [prCostCenterId, setPrCostCenterId] = useState("");
  const [prPlanId, setPrPlanId] = useState("");
  const [prCatalogId, setPrCatalogId] = useState("");
  const [prSku, setPrSku] = useState("CUSTOM-01");
  const [prItemDesc, setPrItemDesc] = useState("");
  const [prSpec, setPrSpec] = useState("");
  const [prQty, setPrQty] = useState("10");
  const [prUom, setPrUom] = useState("EA");
  const [prUnitCost, setPrUnitCost] = useState("250");
  const [prMethod, setPrMethod] = useState<ProcurementMethodKey>("RFQ");
  const [prJustification, setPrJustification] = useState("");
  const [prRequiredDate, setPrRequiredDate] = useState("2026-11-10");

  // PR Action / Revision State
  const [prActionComment, setPrActionComment] = useState<Record<string, string>>({});
  const [reviseQty, setReviseQty] = useState<Record<string, string>>({});
  const [reviseCost, setReviseCost] = useState<Record<string, string>>({});
  const [selectedPdfPr, setSelectedPdfPr] =
    useState<PurchaseRequisitionRecord | null>(null);

  // Budget Edit State
  const [budgetEdits, setBudgetEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = searchParams.get("tab") as Phase2Tab;
    if (t && ["budget", "planning", "methods", "pr"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/phase1")
      .then((r) => r.json())
      .then((data: Phase1DatabaseState) => {
        setState(data);
        setLoading(false);
      });
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  }

  async function mutate(payload: Record<string, unknown>, message: string) {
    const res = await fetch("/api/phase1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = (await res.json()) as Phase1DatabaseState;
    setState(updated);
    notify(message);
  }

  if (loading || !state) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading Procurement Planning &amp; Requisitions Engine...
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ??
    state.organizations[0];
  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) ?? state.users[0];

  const orgDepts = state.departments.filter(
    (d) => d.organizationId === activeOrg.id
  );
  const orgCostCenters = state.costCenters.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgCatalog = state.catalogItems.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgPlans = state.procurementPlans.filter(
    (p) => p.organizationId === activeOrg.id
  );
  const orgPRs = state.purchaseRequisitions.filter(
    (pr) => pr.organizationId === activeOrg.id
  );
  const methods = state.procurementMethods;

  // Linked plan check for PR Builder
  const selectedPlanObj = orgPlans.find((p) => p.id === prPlanId);
  const isMethodDeviation =
    Boolean(selectedPlanObj && selectedPlanObj.plannedMethod !== prMethod) ||
    prMethod === "SINGLE_SOURCE" ||
    prMethod === "EMERGENCY_PROCUREMENT";

  // Totals across organization budgets
  const orgTotalBudget = orgDepts.reduce((s, d) => s + d.totalBudget, 0);
  const orgEncumbered = orgDepts.reduce((s, d) => s + d.encumbered, 0);
  const orgCommitted = orgDepts.reduce((s, d) => s + d.committed, 0);
  const orgActual = orgDepts.reduce((s, d) => s + d.actualSpend, 0);
  const orgAvailable =
    orgTotalBudget - orgEncumbered - orgCommitted - orgActual;

  function handleSelectCatalogForPr(catalogId: string) {
    setPrCatalogId(catalogId);
    const found = orgCatalog.find((c) => c.id === catalogId);
    if (found) {
      setPrSku(found.sku);
      setPrItemDesc(found.name);
      setPrSpec(found.specification);
      setPrUom(found.unitOfMeasure);
      setPrUnitCost(String(found.referenceUnitCost));
      if (!prTitle) {
        setPrTitle(`${found.name} Requisition`);
      }
      if (!prPlanId) {
        setPrMethod(found.defaultMethod);
      }
    }
  }

  function handleRaisePrFromPlan(planId: string) {
    const plan = orgPlans.find((p) => p.id === planId);
    if (!plan) return;
    setPrPlanId(plan.id);
    setPrDeptId(plan.departmentId);
    setPrTitle(plan.description);
    setPrItemDesc(plan.description);
    setPrMethod(plan.plannedMethod);
    setPrUnitCost(String(plan.estimatedBudget));
    setPrQty("1");
    setPrUom("LOT");
    setActiveTab("pr");
    notify(`Pre-filled PR builder from ${plan.planCode} (${plan.plannedMethod}).`);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/40 flex items-center gap-2.5 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Budget Governance &amp; Requisitions • {activeOrg.name}
          </span>
          <h2 className="text-lg font-bold">
            Budgets, Procurement Methods, Annual Plans &amp; Purchase Requisitions
          </h2>
          <p className="text-xs text-slate-400">
            Active Session: <strong className="text-white">{activeUser.fullName}</strong> (
            <span className="text-emerald-300">{activeUser.role}</span>) • Every approval
            automatically encumbers department budgets &amp; updates plan execution.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">
              Org Available Budget
            </span>
            <strong className="text-emerald-400 text-sm">
              {formatCurrency(orgAvailable, activeOrg.baseCurrency)}
            </strong>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">
              Encumbered (Approved PRs)
            </span>
            <strong className="text-amber-300 text-sm">
              {formatCurrency(orgEncumbered, activeOrg.baseCurrency)}
            </strong>
          </div>
        </div>
      </div>

      {/* Procurement Planning Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: "budget",
            label: "1. 4-Layer Budget Control",
            icon: Wallet,
          },
          {
            id: "methods",
            label: "2. Standard Procurement Methods",
            icon: GitBranch,
          },
          {
            id: "planning",
            label: `3. Annual Procurement Plans (${orgPlans.length})`,
            icon: CalendarRange,
          },
          {
            id: "pr",
            label: `4. Purchase Requisitions (${orgPRs.length})`,
            icon: FileSpreadsheet,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as Phase2Tab)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: 4-LAYER BUDGET CONTROL & COMMITMENT
         ===================================================================== */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          {/* Organization-Wide 4-Layer Rollup */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Organization-Wide 4-Layer Financial Control
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Total Budget vs. Encumbered (PRs) vs. Committed (POs) vs. Actual Spend
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("pr")}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start"
              >
                Approve / Raise PR to Test Live Encumbrance
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">1. Total Org Budget</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {formatCurrency(orgTotalBudget)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <p className="text-xs text-amber-800">
                  2. Approved PRs (Encumbered)
                </p>
                <p className="text-xl font-bold text-amber-900 mt-1">
                  {formatCurrency(orgEncumbered)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <p className="text-xs text-blue-800">
                  3. Open POs (Committed)
                </p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatCurrency(orgCommitted)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <p className="text-xs text-purple-800">
                  4. Paid Invoices (Actual)
                </p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {formatCurrency(orgActual)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                <p className="text-xs font-semibold text-emerald-800">
                  Available Budget
                </p>
                <p className="text-xl font-bold text-emerald-900 mt-1">
                  {formatCurrency(orgAvailable)}
                </p>
              </div>
            </div>
          </div>

          {/* Department-by-Department Breakdown & Threshold Controls */}
          <div className="space-y-4">
            {orgDepts.map((dept) => {
              const used = dept.encumbered + dept.committed + dept.actualSpend;
              const available = Math.max(0, dept.totalBudget - used);
              const utilizedPct = Math.round((used / dept.totalBudget) * 100);
              const encPct = Math.min(
                100,
                Math.round((dept.encumbered / dept.totalBudget) * 100)
              );
              const comPct = Math.min(
                100,
                Math.round((dept.committed / dept.totalBudget) * 100)
              );
              const actPct = Math.min(
                100,
                Math.round((dept.actualSpend / dept.totalBudget) * 100)
              );

              const isCritical = utilizedPct >= dept.criticalThresholdPct;
              const isWarning =
                !isCritical && utilizedPct >= dept.warningThresholdPct;

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {dept.code}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {dept.name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          • HOD: {dept.headName} ({dept.fiscalPeriod})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Critical Threshold Breached ({utilizedPct}% &ge;{" "}
                          {dept.criticalThresholdPct}%)
                        </span>
                      ) : isWarning ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Threshold Warning ({utilizedPct}% &ge;{" "}
                          {dept.warningThresholdPct}%)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Healthy ({utilizedPct}% Utilized)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Segment Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
                      <div
                        style={{ width: `${actPct}%` }}
                        className="bg-purple-600 h-full"
                        title={`Actual Spend: ${formatCurrency(dept.actualSpend)}`}
                      />
                      <div
                        style={{ width: `${comPct}%` }}
                        className="bg-blue-500 h-full"
                        title={`Committed POs: ${formatCurrency(dept.committed)}`}
                      />
                      <div
                        style={{ width: `${encPct}%` }}
                        className="bg-amber-400 h-full"
                        title={`Encumbered PRs: ${formatCurrency(dept.encumbered)}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-xs bg-purple-600 inline-block" />
                          Actual Spend: <strong>{formatCurrency(dept.actualSpend)}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-xs bg-blue-500 inline-block" />
                          Committed (POs): <strong>{formatCurrency(dept.committed)}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-xs bg-amber-400 inline-block" />
                          Encumbered (PRs): <strong>{formatCurrency(dept.encumbered)}</strong>
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700">
                        Available: {formatCurrency(available)} of{" "}
                        {formatCurrency(dept.totalBudget)}
                      </span>
                    </div>
                  </div>

                  {/* Adjust Department Budget Ceiling */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Alert Thresholds: Warning @{" "}
                      <strong>{dept.warningThresholdPct}%</strong> • Critical @{" "}
                      <strong>{dept.criticalThresholdPct}%</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="New Total Budget (KES)"
                        value={budgetEdits[dept.id] ?? dept.totalBudget}
                        onChange={(e) =>
                          setBudgetEdits((prev) => ({
                            ...prev,
                            [dept.id]: e.target.value,
                          }))
                        }
                        className="w-36 px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "UPDATE_DEPARTMENT_BUDGET",
                              departmentId: dept.id,
                              totalBudget: Number(
                                budgetEdits[dept.id] ?? dept.totalBudget
                              ),
                            },
                            `Updated ${dept.name} total budget ceiling.`
                          )
                        }
                        className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium"
                      >
                        Update Budget Ceiling
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: STANDARD PROCUREMENT METHODS & CHECKLISTS
         ===================================================================== */}
      {activeTab === "methods" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Configurable Workflow &amp; Audit Rules
            </span>
            <h3 className="text-base font-bold text-slate-900">
              7 Standard Procurement Methods &amp; Mandatory Documentation Checklists
            </h3>
            <p className="text-xs text-slate-500">
              Each method dictates minimum supplier quotations, approval routing, and required document trails. Deviating from a planned method requires a mandatory audit justification note.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {methods.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400">
                        {m.method}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {m.displayName}
                      </h4>
                    </div>
                    <div className="text-right text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                        Min Quotes: {m.minQuotesRequired}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Ceiling:{" "}
                        {m.maxAmountCeiling
                          ? formatCurrency(m.maxAmountCeiling)
                          : "Unlimited"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.description}
                  </p>

                  {m.requiresMandatoryJustification && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      Mandatory Audit Justification Note Required on Selection
                    </div>
                  )}

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Document Trail Checklist
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.requiredDocuments.map((doc) => (
                        <span
                          key={doc}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium"
                        >
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Method Lifecycle Stages
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                    {m.workflowStages.map((st, idx) => (
                      <React.Fragment key={st}>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                          {st}
                        </span>
                        {idx < m.workflowStages.length - 1 && (
                          <span className="text-slate-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ANNUAL PROCUREMENT PLANNING (PLANNED VS ACTUAL)
         ===================================================================== */}
      {activeTab === "planning" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Plans List & Execution Progress */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Annual &amp; Periodic Procurement Plans
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Planned vs. Actual Execution Tracker ({orgPlans.length} Items)
                  </h3>
                </div>
              </div>

              {orgPlans.map((plan) => {
                const linkedPRs = orgPRs.filter(
                  (pr) =>
                    pr.procurementPlanId === plan.id && pr.status !== "REJECTED"
                );
                const actualRequisitioned = linkedPRs.reduce(
                  (s, p) => s + p.totalAmount,
                  0
                );
                const executionPct = Math.min(
                  100,
                  Math.round((actualRequisitioned / plan.estimatedBudget) * 100)
                );

                return (
                  <div
                    key={plan.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                            {plan.planCode}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {plan.fiscalPeriod} • {plan.expectedQuarter} (Target:{" "}
                            {plan.expectedDate})
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                            Method: {plan.plannedMethod}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              plan.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : plan.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {plan.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">
                          {plan.description}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Department: <strong>{plan.departmentName}</strong> •
                          Category: {plan.category}
                          {plan.approvedBy &&
                            ` • Approved by ${plan.approvedBy}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">Planned Budget</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(plan.estimatedBudget, plan.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Planned vs Actual Progress */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Linked PRs ({linkedPRs.length}):{" "}
                          <strong>
                            {formatCurrency(actualRequisitioned, plan.currency)}
                          </strong>{" "}
                          requisitioned of{" "}
                          {formatCurrency(plan.estimatedBudget, plan.currency)}
                        </span>
                        <span className="font-bold text-emerald-700">
                          {executionPct}% Executed
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${executionPct}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Plan Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {linkedPRs.map((lpr) => (
                          <span
                            key={lpr.id}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700"
                          >
                            🔗 {lpr.prNumber} ({formatCurrency(lpr.totalAmount)} •{" "}
                            {lpr.status})
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {plan.status === "PLANNED" && (
                          <button
                            type="button"
                            onClick={() =>
                              mutate(
                                {
                                  action: "UPDATE_PLAN_STATUS",
                                  planId: plan.id,
                                  status: "ACTIVE",
                                },
                                `Approved and activated procurement plan ${plan.planCode}.`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                          >
                            Approve &amp; Activate Plan
                          </button>
                        )}
                        {plan.status === "ACTIVE" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRaisePrFromPlan(plan.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                            >
                              Raise PR Against Plan →
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                mutate(
                                  {
                                    action: "UPDATE_PLAN_STATUS",
                                    planId: plan.id,
                                    status: "COMPLETED",
                                  },
                                  `Marked procurement plan ${plan.planCode} as COMPLETED.`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                            >
                              Mark Completed
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Annual Plan Item Form */}
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!planDesc) return;
                  mutate(
                    {
                      action: "CREATE_PROCUREMENT_PLAN",
                      departmentId: planDeptId || orgDepts[0]?.id,
                      category: planCategory,
                      description: planDesc,
                      estimatedBudget: Number(planBudget),
                      expectedQuarter: planQuarter,
                      expectedDate: planDate,
                      plannedMethod: planMethod,
                    },
                    "Created new annual procurement plan entry (Status: PLANNED)."
                  );
                  setPlanDesc("");
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 sticky top-24"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  Add Annual Procurement Plan Item
                </h3>
                <p className="text-xs text-slate-500">
                  New plan items start as <code className="font-bold">PLANNED</code> and require approval before activation.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Responsible Department
                  </label>
                  <select
                    value={planDeptId}
                    onChange={(e) => setPlanDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {orgDepts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Procurement Category
                  </label>
                  <input
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Planned Item / Project Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Annual Sterilization Autoclave Maintenance & Consumables"
                    value={planDesc}
                    onChange={(e) => setPlanDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Est. Budget (KES)
                    </label>
                    <input
                      type="number"
                      value={planBudget}
                      onChange={(e) => setPlanBudget(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Target Quarter
                    </label>
                    <select
                      value={planQuarter}
                      onChange={(e) =>
                        setPlanQuarter(
                          e.target.value as "Q1" | "Q2" | "Q3" | "Q4"
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Expected Date
                    </label>
                    <input
                      type="date"
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Planned Method
                    </label>
                    <select
                      value={planMethod}
                      onChange={(e) =>
                        setPlanMethod(e.target.value as ProcurementMethodKey)
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      {methods.map((m) => (
                        <option key={m.method} value={m.method}>
                          {m.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Procurement Plan Item
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: PURCHASE REQUISITION (PR) & PDF EXPORT
         ===================================================================== */}
      {activeTab === "pr" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: PR List, Approval Encumbrance, Revision & PDF Export */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Purchase Requisition Lifecycle
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Active &amp; Historical Requisitions ({orgPRs.length})
                  </h3>
                </div>
              </div>

              {orgPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {pr.prNumber}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Rev v{pr.revisionNumber}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            pr.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : pr.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800"
                                : pr.status === "DRAFT"
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pr.status}
                        </span>
                        {pr.budgetEncumbered && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Budget Encumbered
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {pr.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Requester: <strong>{pr.requesterName}</strong> • Dept:{" "}
                        <strong>{pr.departmentName}</strong> • Cost Center:{" "}
                        <code className="text-slate-700">
                          {pr.costCenterCode}
                        </code>{" "}
                        • Required: {pr.requiredDate}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[11px]">
                          Method: {pr.selectedMethod}
                        </span>
                        {pr.procurementPlanCode && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[11px]">
                            Linked Plan: {pr.procurementPlanCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Estimated Total</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(pr.totalAmount, pr.currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPdfPr(pr)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Branded PR PDF
                      </button>
                    </div>
                  </div>

                  {/* Method Deviation Justification Alert if present */}
                  {pr.methodDeviationJustification && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Mandatory Method Justification (Audit Record):</strong>{" "}
                      &ldquo;{pr.methodDeviationJustification}&rdquo;
                    </div>
                  )}

                  {/* Rejection Banner + Revise & Resubmit Form */}
                  {pr.status === "REJECTED" && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                      <div className="text-xs text-rose-900">
                        <strong className="block text-rose-800">
                          Mandatory Rejection Reason:
                        </strong>
                        &ldquo;{pr.rejectionReason}&rdquo;
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/70">
                        <span className="text-xs font-semibold text-rose-900">
                          Revise &amp; Resubmit:
                        </span>
                        <input
                          type="number"
                          placeholder="New Qty"
                          value={
                            reviseQty[pr.id] ??
                            String(pr.items[0]?.quantity ?? 1)
                          }
                          onChange={(e) =>
                            setReviseQty((prev) => ({
                              ...prev,
                              [pr.id]: e.target.value,
                            }))
                          }
                          className="w-24 px-2.5 py-1.5 rounded border border-rose-300 bg-white text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Unit Cost (KES)"
                          value={
                            reviseCost[pr.id] ??
                            String(pr.items[0]?.estimatedUnitCost ?? 100)
                          }
                          onChange={(e) =>
                            setReviseCost((prev) => ({
                              ...prev,
                              [pr.id]: e.target.value,
                            }))
                          }
                          className="w-28 px-2.5 py-1.5 rounded border border-rose-300 bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            mutate(
                              {
                                action: "REVISE_AND_RESUBMIT_PR",
                                prId: pr.id,
                                quantity: Number(
                                  reviseQty[pr.id] ??
                                    pr.items[0]?.quantity ??
                                    1
                                ),
                                estimatedUnitCost: Number(
                                  reviseCost[pr.id] ??
                                    pr.items[0]?.estimatedUnitCost ??
                                    100
                                ),
                              },
                              `Revised and resubmitted ${pr.prNumber} (Rev v${pr.revisionNumber + 1}).`
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Revise &amp; Resubmit (v{pr.revisionNumber + 1})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <div className="overflow-x-auto border-t border-slate-100 pt-3">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                          <th className="pb-1.5">SKU</th>
                          <th className="pb-1.5">Item &amp; Specification</th>
                          <th className="pb-1.5 text-right">Qty</th>
                          <th className="pb-1.5 text-right">Est. Unit</th>
                          <th className="pb-1.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pr.items.map((item) => (
                          <tr key={item.id} className="text-slate-700">
                            <td className="py-2 font-mono text-[11px]">
                              {item.sku}
                            </td>
                            <td className="py-2">
                              <p className="font-semibold text-slate-900">
                                {item.description}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.specification}
                              </p>
                            </td>
                            <td className="py-2 text-right font-mono">
                              {item.quantity} {item.unitOfMeasure}
                            </td>
                            <td className="py-2 text-right font-mono">
                              {formatCurrency(item.estimatedUnitCost)}
                            </td>
                            <td className="py-2 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(item.totalEstimatedCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Approve / Reject Controls if UNDER_REVIEW or DRAFT */}
                  {(pr.status === "UNDER_REVIEW" || pr.status === "DRAFT") && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-100">
                      <input
                        placeholder="Mandatory approval comment or rejection reason..."
                        value={prActionComment[pr.id] || ""}
                        onChange={(e) =>
                          setPrActionComment((prev) => ({
                            ...prev,
                            [pr.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "APPROVE_OR_REJECT_PR",
                              prId: pr.id,
                              decision: "APPROVED",
                              comment:
                                prActionComment[pr.id] ||
                                `Approved by ${activeUser.fullName}. Budget encumbered.`,
                            },
                            `Approved ${pr.prNumber} and encumbered ${formatCurrency(pr.totalAmount)} in ${pr.departmentName}!`
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Encumber Budget
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "APPROVE_OR_REJECT_PR",
                              prId: pr.id,
                              decision: "REJECTED",
                              comment:
                                prActionComment[pr.id] ||
                                "Rejected: Please review specifications and budget allocation.",
                            },
                            `Rejected ${pr.prNumber} with mandatory reason.`
                          )
                        }
                        className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column: Smart Purchase Requisition Builder */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 sticky top-24">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Raise Purchase Requisition
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    New Purchase Requisition (PR)
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Link to Active Annual Plan (Optional)
                  </label>
                  <select
                    value={prPlanId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setPrPlanId(pid);
                      const pl = orgPlans.find((p) => p.id === pid);
                      if (pl) {
                        setPrDeptId(pl.departmentId);
                        setPrMethod(pl.plannedMethod);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="">— Unplanned / Ad-Hoc Requisition —</option>
                    {orgPlans
                      .filter((p) => p.status === "ACTIVE")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.planCode}: {p.description.slice(0, 38)}... (
                          {p.plannedMethod})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={prDeptId}
                      onChange={(e) => setPrDeptId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      {orgDepts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Cost Center
                    </label>
                    <select
                      value={prCostCenterId}
                      onChange={(e) => setPrCostCenterId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      {orgCostCenters.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.code} — {cc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Requisition Title
                  </label>
                  <input
                    placeholder="e.g. Emergency ICU Ventilator Circuit Consumables"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Auto-Fill from Master Product Catalog (Optional)
                  </label>
                  <select
                    value={prCatalogId}
                    onChange={(e) => handleSelectCatalogForPr(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50"
                  >
                    <option value="">— Custom Item Entry —</option>
                    {orgCatalog.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.sku}] {c.name} (${c.referenceUnitCost}/
                        {c.unitOfMeasure})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="SKU"
                    value={prSku}
                    onChange={(e) => setPrSku(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    placeholder="Item Description"
                    value={prItemDesc}
                    onChange={(e) => setPrItemDesc(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={prQty}
                      onChange={(e) => setPrQty(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">
                      UOM
                    </label>
                    <input
                      value={prUom}
                      onChange={(e) => setPrUom(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">
                      Est. Unit (KES)
                    </label>
                    <input
                      type="number"
                      value={prUnitCost}
                      onChange={(e) => setPrUnitCost(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Procurement Method
                    </label>
                    <select
                      value={prMethod}
                      onChange={(e) =>
                        setPrMethod(e.target.value as ProcurementMethodKey)
                      }
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      {methods.map((m) => (
                        <option key={m.method} value={m.method}>
                          {m.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Required Date
                    </label>
                    <input
                      type="date"
                      value={prRequiredDate}
                      onChange={(e) => setPrRequiredDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                {/* Mandatory Audit Justification if deviating from Plan or Single-Source/Emergency */}
                {isMethodDeviation && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 space-y-1.5">
                    <label className="block text-xs font-bold text-amber-900">
                      ⚠️ Mandatory Audit Justification Note
                    </label>
                    <p className="text-[11px] text-amber-800">
                      {selectedPlanObj &&
                      selectedPlanObj.plannedMethod !== prMethod
                        ? `Selected method (${prMethod}) deviates from planned method (${selectedPlanObj.plannedMethod}).`
                        : `${prMethod} requires mandatory justification.`}
                    </p>
                    <textarea
                      rows={2}
                      placeholder="State formal justification for audit log..."
                      value={prJustification}
                      onChange={(e) => setPrJustification(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-400 bg-white"
                    />
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total Requisition Value:</span>
                  <strong className="text-base text-slate-900">
                    {formatCurrency(
                      Number(prQty || 0) * Number(prUnitCost || 0)
                    )}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!prTitle) return;
                      mutate(
                        {
                          action: "CREATE_PURCHASE_REQUISITION",
                          title: prTitle,
                          departmentId: prDeptId || orgDepts[0]?.id,
                          costCenterId: prCostCenterId || orgCostCenters[0]?.id,
                          procurementPlanId: prPlanId || undefined,
                          selectedMethod: prMethod,
                          methodDeviationJustification: prJustification,
                          sku: prSku,
                          itemDescription: prItemDesc || prTitle,
                          specification: prSpec,
                          quantity: Number(prQty),
                          unitOfMeasure: prUom,
                          estimatedUnitCost: Number(prUnitCost),
                          requiredDate: prRequiredDate,
                          submitNow: false,
                        },
                        "Saved Purchase Requisition as DRAFT."
                      );
                      setPrTitle("");
                    }}
                    className="py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!prTitle) return;
                      if (isMethodDeviation && !prJustification.trim()) {
                        notify(
                          "Mandatory Audit Justification is required when deviating from planned method or using Single-Source/Emergency!"
                        );
                        return;
                      }
                      mutate(
                        {
                          action: "CREATE_PURCHASE_REQUISITION",
                          title: prTitle,
                          departmentId: prDeptId || orgDepts[0]?.id,
                          costCenterId: prCostCenterId || orgCostCenters[0]?.id,
                          procurementPlanId: prPlanId || undefined,
                          selectedMethod: prMethod,
                          methodDeviationJustification: prJustification,
                          sku: prSku,
                          itemDescription: prItemDesc || prTitle,
                          specification: prSpec,
                          quantity: Number(prQty),
                          unitOfMeasure: prUom,
                          estimatedUnitCost: Number(prUnitCost),
                          requiredDate: prRequiredDate,
                          submitNow: true,
                        },
                        "Submitted Purchase Requisition for Approval!"
                      );
                      setPrTitle("");
                      setPrJustification("");
                    }}
                    className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Submit PR for Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BRANDED PR DOCUMENT PDF PREVIEW & PRINT MODAL
         ===================================================================== */}
      {selectedPdfPr && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Branded Document Template Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPdfPr(null)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Branded Document Header */}
            <div
              className="p-5 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ backgroundColor: activeOrg.primaryColor }}
            >
              <div>
                <h2 className="text-xl font-bold">{activeOrg.name}</h2>
                <p className="text-xs opacity-90 mt-0.5">
                  {activeOrg.documentHeader}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Tax ID: {activeOrg.taxId}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider font-bold bg-black/20 px-2.5 py-1 rounded">
                  PURCHASE REQUISITION
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {selectedPdfPr.prNumber} (Rev v{selectedPdfPr.revisionNumber})
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Department</span>
                <strong className="text-slate-900">
                  {selectedPdfPr.departmentName}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Cost Center</span>
                <strong className="text-slate-900">
                  {selectedPdfPr.costCenterCode} ({selectedPdfPr.costCenterName})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Procurement Method</span>
                <strong className="text-slate-900">
                  {selectedPdfPr.selectedMethod}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Status &amp; Budget</span>
                <strong className="text-emerald-700">
                  {selectedPdfPr.status}{" "}
                  {selectedPdfPr.budgetEncumbered ? "(Encumbered)" : ""}
                </strong>
              </div>
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Description &amp; Technical Spec</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Est. Unit Cost</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedPdfPr.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-3 font-mono">{it.sku}</td>
                      <td className="py-3">
                        <p className="font-bold text-slate-900">
                          {it.description}
                        </p>
                        <p className="text-slate-500">{it.specification}</p>
                      </td>
                      <td className="py-3 text-right font-mono">
                        {it.quantity} {it.unitOfMeasure}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {formatCurrency(it.estimatedUnitCost)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold">
                        {formatCurrency(it.totalEstimatedCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Approval History Stamp */}
            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900">
                Audited Approval Sign-Off Chain
              </h4>
              {selectedPdfPr.approvalTimeline.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                >
                  <span>
                    <strong>{a.stepName}</strong> — {a.actorName} ({a.actorRole}
                    ): &ldquo;{a.comment}&rdquo;
                  </span>
                  <span className="font-mono text-[11px]">
                    {a.decision} ({a.timestamp})
                  </span>
                </div>
              ))}
            </div>

            {/* Branded Footer */}
            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {activeOrg.documentFooter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
