"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Receipt,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  FileText,
  Printer,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CalendarClock,
  SlidersHorizontal,
} from "lucide-react";
import type {
  Phase1DatabaseState,
  PurchaseReturnRecord,
  SupplierInvoiceRecord,
} from "@/server/store/phase1-store";
import { formatCurrency } from "@/lib/utils";

type Phase5Tab = "returns" | "match" | "payments";

const RETURN_STATUS_STEPS: Array<PurchaseReturnRecord["status"]> = [
  "RAISED",
  "APPROVED",
  "DISPATCHED_TO_SUPPLIER",
  "SUPPLIER_ACKNOWLEDGED",
  "RESOLVED",
];

function Phase5Content() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Phase5Tab) || "match";

  const [activeTab, setActiveTab] = useState<Phase5Tab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Module 14: Raise Purchase Return form state
  const [selectedGrnId, setSelectedGrnId] = useState<string>("");
  const [returnedQty, setReturnedQty] = useState<string>("1");
  const [reasonCode, setReasonCode] = useState<
    "DAMAGED" | "WRONG_SPECIFICATION" | "EXPIRED_SHORT_DATED" | "QUALITY_DEFECT"
  >("DAMAGED");
  const [resolutionType, setResolutionType] = useState<
    "CREDIT_NOTE_ADJUSTMENT" | "REPLACEMENT_DELIVERY"
  >("CREDIT_NOTE_ADJUSTMENT");
  const [creditNoteNumber, setCreditNoteNumber] =
    useState<string>("CN-APEX-2026-410");
  const [reasonNotes, setReasonNotes] = useState<string>(
    "Outer thermal seal punctured on arrival; rejected during cold-chain inspection."
  );

  // Module 15: Submit Supplier Invoice & Run 3-Way Match form state
  const [invoicePoId, setInvoicePoId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] =
    useState<string>("INV-APEX-2026-904");
  const [invoicedQty, setInvoicedQty] = useState<string>("7");
  const [invoicedUnitPrice, setInvoicedUnitPrice] = useState<string>("850");
  const [creditNoteDeduction, setCreditNoteDeduction] = useState<string>("0");
  const [taxPercentage, setTaxPercentage] = useState<string>("0");

  // Exception Resolution modal/drawer state
  const [resolvingInvoiceId, setResolvingInvoiceId] = useState<string | null>(
    null
  );
  const [resolutionMode, setResolutionMode] = useState<
    "ADJUST_TO_GRN_AND_PO" | "OVERRIDE_WITH_JUSTIFICATION"
  >("ADJUST_TO_GRN_AND_PO");
  const [exceptionNote, setExceptionNote] = useState<string>(
    "Verified with supplier and warehouse GRN-2026-0088: adjusted billed quantity to 7 net accepted kits at PO unit rate of $850."
  );

  // Payment execution form state
  const [activePaymentInvoiceId, setActivePaymentInvoiceId] = useState<
    string | null
  >(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("3000");
  const [paymentMethod, setPaymentMethod] = useState<
    "EFT_RTGS" | "SWIFT_WIRE" | "MPESA_B2B" | "CHEQUE"
  >("EFT_RTGS");
  const [paymentReference, setPaymentReference] = useState<string>(
    "RTGS-STANBIC-2026-7781"
  );
  const [scheduledDate, setScheduledDate] = useState<string>("2026-10-25");

  // Branded PDF Preview Modals
  const [previewReturnPdf, setPreviewReturnPdf] =
    useState<PurchaseReturnRecord | null>(null);
  const [previewVoucherPdf, setPreviewVoucherPdf] =
    useState<SupplierInvoiceRecord | null>(null);

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

      const orgGrns = (data.goodsReceipts || []).filter(
        (g) => g.organizationId === data.activeOrganizationId
      );
      if (orgGrns.length > 0 && !selectedGrnId) {
        setSelectedGrnId(orgGrns[0].id);
      }

      const orgPos = (data.purchaseOrders || []).filter(
        (p) => p.organizationId === data.activeOrganizationId
      );
      if (orgPos.length > 0 && !invoicePoId) {
        setInvoicePoId(orgPos[0].id);
      }
    } catch {
      showToast("Failed to load accounts payable state", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedGrnId, invoicePoId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as Phase5Tab;
    if (tabParam && ["returns", "match", "payments"].includes(tabParam)) {
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
        showToast(json.error || "Action failed", "error");
        return null;
      }
      const nextState: Phase1DatabaseState = json.state || json;
      setState(nextState);
      return nextState;
    } catch {
      showToast("Network error while saving changes", "error");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !state) {
    return (
      <div className="p-12 flex items-center justify-center text-sm text-slate-600 gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
        Loading Purchase Returns, 3-Way Match &amp; Invoice Payments...
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ||
    state.organizations[0];
  const orgDepartments = state.departments.filter(
    (d) => d.organizationId === state.activeOrganizationId
  );
  const orgPos = state.purchaseOrders.filter(
    (p) => p.organizationId === state.activeOrganizationId
  );
  const orgGrns = state.goodsReceipts.filter(
    (g) => g.organizationId === state.activeOrganizationId
  );
  const orgReturns = (state.purchaseReturns || []).filter(
    (r) => r.organizationId === state.activeOrganizationId
  );
  const orgInvoices = (state.supplierInvoices || []).filter(
    (i) => i.organizationId === state.activeOrganizationId
  );

  const mismatchedInvoicesCount = orgInvoices.filter(
    (i) => i.threeWayMatchStatus !== "MATCHED"
  ).length;

  const handleRaiseReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await dispatchAction("RAISE_PURCHASE_RETURN", {
      grnId: selectedGrnId,
      returnedQty: Number(returnedQty),
      reasonCode,
      resolutionType,
      creditNoteNumber:
        resolutionType === "CREDIT_NOTE_ADJUSTMENT"
          ? creditNoteNumber
          : undefined,
      reasonNotes,
    });
    if (updated) {
      showToast(
        "Purchase Return raised against GRN and logged in Supplier Scorecard!"
      );
    }
  };

  const handleAdvanceReturnStatus = async (ret: PurchaseReturnRecord) => {
    const idx = RETURN_STATUS_STEPS.indexOf(ret.status);
    const nextStatus =
      idx < RETURN_STATUS_STEPS.length - 1
        ? RETURN_STATUS_STEPS[idx + 1]
        : "RESOLVED";

    const updated = await dispatchAction("ADVANCE_PURCHASE_RETURN_STATUS", {
      returnId: ret.id,
      nextStatus,
    });
    if (updated) {
      showToast(
        `Advanced ${ret.returnNumber} to ${nextStatus}${
          ret.resolutionType === "CREDIT_NOTE_ADJUSTMENT"
            ? " & released Committed Budget!"
            : "!"
        }`
      );
    }
  };

  const handleRunThreeWayMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await dispatchAction("SUBMIT_SUPPLIER_INVOICE_3WAY_MATCH", {
      poId: invoicePoId,
      invoiceNumber,
      invoicedQty: Number(invoicedQty),
      invoicedUnitPrice: Number(invoicedUnitPrice),
      creditNoteDeduction: Number(creditNoteDeduction),
      taxPercentage: Number(taxPercentage),
    });
    if (updated) {
      const latestInv = updated.supplierInvoices[0];
      if (latestInv?.threeWayMatchStatus === "MATCHED") {
        showToast(
          `3-Way Match PASSED for ${latestInv.invoiceNumber} — Cleared for Finance Payment!`
        );
      } else {
        showToast(
          `3-Way Match MISMATCH FLAGGED (${latestInv?.threeWayMatchStatus}) on ${latestInv?.invoiceNumber}!`,
          "error"
        );
      }
      setInvoiceNumber(
        `INV-APEX-2026-${Math.floor(100 + Math.random() * 899)}`
      );
    }
  };

  const handleResolveException = async (invoiceId: string) => {
    const updated = await dispatchAction("RESOLVE_3WAY_MATCH_EXCEPTION", {
      invoiceId,
      resolutionMode,
      exceptionResolutionNote: exceptionNote,
    });
    if (updated) {
      setResolvingInvoiceId(null);
      showToast(
        "3-Way Match exception resolved and approved for Finance payment!"
      );
    }
  };

  const handlePaymentAction = async (
    invoiceId: string,
    paymentAction: "SCHEDULE" | "RECORD_PAYMENT"
  ) => {
    const updated = await dispatchAction("SCHEDULE_OR_RECORD_INVOICE_PAYMENT", {
      invoiceId,
      paymentAction,
      scheduledPaymentDate: scheduledDate,
      paymentAmount: Number(paymentAmount),
      paymentMethod,
      paymentReference,
    });
    if (updated) {
      setActivePaymentInvoiceId(null);
      showToast(
        paymentAction === "SCHEDULE"
          ? `Payment scheduled for ${scheduledDate}.`
          : `Payment of KES ${Number(paymentAmount).toLocaleString()} executed! Budget transitioned from Committed (PO) → Actual Spend.`
      );
    }
  };

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

      {/* Phase 5 Header Banner */}
      <section className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Accounts Payable &amp; 3-Way Match
              </span>
              <span className="text-xs text-slate-400">
                Tenant: <strong className="text-white">{activeOrg.name}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold">
              Purchase Returns, Automated 3-Way Matching (PO ↔ GRN ↔ Invoice)
              &amp; Finance Payments
            </h1>
            <p className="text-xs text-slate-400">
              Raise GRN return notes with auto-budget release, verify line-by-line
              PO/GRN/Invoice tolerances, resolve exceptions, and transition
              Committed PO funds into Actual Spend.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/phase4"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              ← Purchase Orders &amp; GRNs
            </Link>
            <Link
              href="/portal?tab=history"
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              Supplier Portal View
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <p className="text-[11px] text-slate-400">
              Purchase Returns &amp; Credit Notes
            </p>
            <p className="text-lg font-bold text-white mt-0.5">
              {orgReturns.length} Active (
              $
              {orgReturns
                .reduce((s, r) => s + r.returnAmount, 0)
                .toLocaleString()}
              )
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <p className="text-[11px] text-slate-400">
              3-Way Match Exceptions Flagged
            </p>
            <p className="text-lg font-bold text-rose-400 mt-0.5">
              {mismatchedInvoicesCount} Disputed Invoice(s)
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <p className="text-[11px] text-slate-400">
              Total Invoiced Net Payable
            </p>
            <p className="text-lg font-bold text-amber-300 mt-0.5">
              $
              {orgInvoices
                .reduce((s, i) => s + i.netPayableAmount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
            <p className="text-[11px] text-slate-400">
              Settled / Actual Paid Spend
            </p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              $
              {orgInvoices
                .reduce((s, i) => s + i.amountPaid, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("returns")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "returns"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          1. Purchase Returns &amp; Rejections ({orgReturns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("match")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "match"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Scale className="w-4 h-4 text-amber-400" />
          2. Automated 3-Way Matching Engine (PO ↔ GRN ↔ Invoice)
          {mismatchedInvoicesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {mismatchedInvoicesCount} Exception
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === "payments"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
          3. Finance Payment Vouchers &amp; 4-Layer Budget Transition
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PURCHASE RETURNS & REJECTIONS                                  */}
      {/* ===================================================================== */}
      {activeTab === "returns" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Purchase Returns &amp; Rejections Register
                </h2>
                <p className="text-xs text-slate-500">
                  Track damaged, wrong-spec, or short-dated items returned from
                  a GRN through `Raised → Approved → Dispatched → Acknowledged
                  → Resolved`
                </p>
              </div>

              {orgReturns.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No purchase returns recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {orgReturns.map((ret) => (
                    <div
                      key={ret.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {ret.returnNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {ret.reasonCode}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                              {ret.status}
                            </span>
                            {ret.budgetReleased && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Committed Budget Auto-Released
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                            {ret.description} ({ret.sku})
                          </h3>
                          <p className="text-xs text-slate-600">
                            Supplier: <strong>{ret.supplierName}</strong> •
                            Source GRN:{" "}
                            <span className="font-mono">{ret.grnNumber}</span> •
                            PO: <span className="font-mono">{ret.poNumber}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-rose-700">
                            -${ret.returnAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {ret.returnedQty} {ret.unitOfMeasure} @ $
                            {ret.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                        <p className="text-slate-700">
                          <strong>Inspection Rejection Note:</strong>{" "}
                          {ret.reasonNotes}
                        </p>
                        <p className="text-slate-600">
                          <strong>Resolution Mode:</strong>{" "}
                          {ret.resolutionType === "CREDIT_NOTE_ADJUSTMENT" ? (
                            <span className="text-emerald-700 font-semibold">
                              Credit Note Adjustment (
                              {ret.creditNoteNumber || "Pending CN"})
                            </span>
                          ) : (
                            <span className="text-blue-700 font-semibold">
                              Replacement Delivery Requested
                            </span>
                          )}{" "}
                          • Raised by {ret.raisedBy} on {ret.createdAt}
                        </p>
                      </div>

                      {/* 5-Stage Return Workflow Stepper */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {RETURN_STATUS_STEPS.map((step, i) => {
                          const currentIndex = RETURN_STATUS_STEPS.indexOf(
                            ret.status
                          );
                          const isCompleted = i <= currentIndex;
                          return (
                            <div
                              key={step}
                              className={`p-2 rounded text-center text-[10px] font-semibold border ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-white text-slate-400 border-slate-200"
                              }`}
                            >
                              {i + 1}. {step.replace(/_/g, " ")}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPreviewReturnPdf(ret)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          View Return / Debit Note PDF
                        </button>

                        {ret.status !== "RESOLVED" && (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleAdvanceReturnStatus(ret)}
                            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            Advance Return Workflow →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Form: Raise Purchase Return from GRN */}
          <div>
            <form
              onSubmit={handleRaiseReturn}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 sticky top-20"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Raise Purchase Return from GRN
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reject defective/damaged items and request replacement or
                  Credit Note adjustment
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Source Warehouse GRN
                  </label>
                  <select
                    value={selectedGrnId}
                    onChange={(e) => setSelectedGrnId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {orgGrns.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.grnNumber} (PO: {g.poNumber} — {g.supplierName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Quantity Returned
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={returnedQty}
                      onChange={(e) => setReturnedQty(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Rejection Reason Code
                    </label>
                    <select
                      value={reasonCode}
                      onChange={(e) =>
                        setReasonCode(
                          e.target.value as typeof reasonCode
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="DAMAGED">Damaged in Transit</option>
                      <option value="WRONG_SPECIFICATION">
                        Wrong Specification
                      </option>
                      <option value="EXPIRED_SHORT_DATED">
                        Expired / Short-Dated
                      </option>
                      <option value="QUALITY_DEFECT">
                        Quality / Lab Failure
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Resolution Path
                  </label>
                  <select
                    value={resolutionType}
                    onChange={(e) =>
                      setResolutionType(
                        e.target.value as typeof resolutionType
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="CREDIT_NOTE_ADJUSTMENT">
                      Credit Note Adjustment (Auto-Releases Committed Budget)
                    </option>
                    <option value="REPLACEMENT_DELIVERY">
                      Replacement Physical Delivery
                    </option>
                  </select>
                </div>

                {resolutionType === "CREDIT_NOTE_ADJUSTMENT" && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Credit Note Reference
                    </label>
                    <input
                      type="text"
                      value={creditNoteNumber}
                      onChange={(e) => setCreditNoteNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Detailed Inspection / Rejection Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reasonNotes}
                    onChange={(e) => setReasonNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || orgGrns.length === 0}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
              >
                Raise Official Purchase Return Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MODULE 15 — AUTOMATED 3-WAY MATCHING ENGINE                     */}
      {/* ===================================================================== */}
      {activeTab === "match" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Automated 3-Way Matching Matrix (PO ↔ GRN ↔ Invoice)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Every supplier invoice is automatically verified line-by-line
                    against Purchase Order prices and Warehouse GRN net accepted
                    quantities (received minus returns)
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {orgInvoices.map((inv) => {
                  const isMatched = inv.threeWayMatchStatus === "MATCHED";
                  const qtyDiff = inv.invoicedQty - inv.grnAcceptedQty;
                  const priceDiff = inv.invoicedUnitPrice - inv.poUnitPrice;

                  return (
                    <div
                      key={inv.id}
                      className={`p-5 rounded-xl border space-y-4 ${
                        isMatched
                          ? "bg-emerald-50/30 border-emerald-200"
                          : "bg-rose-50/40 border-rose-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {inv.invoiceNumber}
                            </span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {inv.internalVoucherNo}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isMatched
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                              }`}
                            >
                              3-WAY: {inv.threeWayMatchStatus}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white">
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Supplier: <strong>{inv.supplierName}</strong> •
                            Item: <strong>{inv.description}</strong> ({inv.sku})
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            Net Payable: ${inv.netPayableAmount.toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Credit Note Deducted: -$
                            {inv.creditNoteDeduction.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* 3-Column Side-by-Side Comparison Matrix */}
                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        {/* Column 1: Purchase Order */}
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            1. Purchase Order ({inv.poNumber})
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Ordered Qty:</span>
                            <span className="font-semibold">
                              {inv.poOrderedQty} {inv.unitOfMeasure}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Contract Unit Price:
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(inv.poUnitPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Warehouse GRN Net Accepted */}
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                            2. Warehouse GRN ({inv.grnNumber})
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Net Accepted Qty:
                            </span>
                            <span className="font-bold text-emerald-700">
                              {inv.grnAcceptedQty} {inv.unitOfMeasure}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            (Received Qty minus Rejected/Returned items)
                          </p>
                        </div>

                        {/* Column 3: Supplier Invoice */}
                        <div
                          className={`p-3.5 rounded-lg border space-y-1 ${
                            isMatched
                              ? "bg-white border-emerald-300"
                              : "bg-rose-50 border-rose-300"
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                            3. Supplier Invoice ({inv.invoiceNumber})
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Billed Qty:</span>
                            <span
                              className={`font-bold ${
                                qtyDiff === 0
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {inv.invoicedQty} {inv.unitOfMeasure}{" "}
                              {qtyDiff !== 0 &&
                                `(${qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff} var)`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Billed Unit Price:
                            </span>
                            <span
                              className={`font-bold ${
                                Math.abs(priceDiff) < 0.01
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {formatCurrency(inv.invoicedUnitPrice)}{" "}
                              {Math.abs(priceDiff) >= 0.01 &&
                                `(${priceDiff > 0 ? `+${formatCurrency(priceDiff)}` : `-${formatCurrency(Math.abs(priceDiff))}`})`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Exception Resolution Banner or Audit Note */}
                      {!isMatched ? (
                        <div className="p-4 rounded-xl bg-white border border-rose-300 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Payment Blocked: 3-Way Match Discrepancy Detected
                              ({inv.threeWayMatchStatus})
                            </div>
                            {resolvingInvoiceId !== inv.id && (
                              <button
                                type="button"
                                onClick={() => setResolvingInvoiceId(inv.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                              >
                                Resolve Exception
                              </button>
                            )}
                          </div>

                          {resolvingInvoiceId === inv.id && (
                            <div className="space-y-3 pt-2 border-t border-rose-200 text-xs">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    Exception Resolution Action
                                  </label>
                                  <select
                                    value={resolutionMode}
                                    onChange={(e) =>
                                      setResolutionMode(
                                        e.target.value as typeof resolutionMode
                                      )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                  >
                                    <option value="ADJUST_TO_GRN_AND_PO">
                                      Adjust Invoice to GRN Net Accepted Qty (
                                      {inv.grnAcceptedQty}) &amp; PO Price ($
                                      {inv.poUnitPrice})
                                    </option>
                                    <option value="OVERRIDE_WITH_JUSTIFICATION">
                                      Approve Variance Override with Mandatory
                                      Audit Justification
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block font-semibold text-slate-700 mb-1">
                                    Mandatory Audit Resolution Note
                                  </label>
                                  <input
                                    type="text"
                                    value={exceptionNote}
                                    onChange={(e) =>
                                      setExceptionNote(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() => handleResolveException(inv.id)}
                                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                >
                                  Confirm Resolution &amp; Clear for Payment
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setResolvingInvoiceId(null)}
                                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 bg-white px-4 py-2.5 rounded-lg border border-emerald-200">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            3-Way Match Verified (PO = GRN Net Accepted =
                            Invoice).{" "}
                            {inv.exceptionResolutionNote &&
                              `Resolution Note: "${inv.exceptionResolutionNote}"`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("payments");
                              setActivePaymentInvoiceId(inv.id);
                              setPaymentAmount(String(inv.balanceDue));
                            }}
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            Proceed to Finance Payment →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Submit Invoice & Test 3-Way Match Engine */}
          <div>
            <form
              onSubmit={handleRunThreeWayMatch}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 sticky top-20"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  Log Supplier Invoice &amp; Run 3-Way Match
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test both matching invoices and overbilled quantity/price
                  exceptions
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Target Purchase Order &amp; Linked GRN
                  </label>
                  <select
                    value={invoicePoId}
                    onChange={(e) => setInvoicePoId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {orgPos.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} — {po.supplierName} (PO Rate: $
                        {po.items[0]?.unitPrice ?? 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Supplier Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Invoiced Quantity
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={invoicedQty}
                      onChange={(e) => setInvoicedQty(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Invoiced Unit Price (KES)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={invoicedUnitPrice}
                      onChange={(e) => setInvoicedUnitPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Credit Note Deduction (KES)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={creditNoteDeduction}
                      onChange={(e) => setCreditNoteDeduction(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tax / VAT (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">
                    Quick Preset Scenarios:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setInvoicedQty("7");
                        setInvoicedUnitPrice("850");
                      }}
                      className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold"
                    >
                       Fill Clean Match (7 @ $850)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInvoicedQty("10");
                        setInvoicedUnitPrice("920");
                      }}
                      className="px-2 py-1 rounded bg-rose-100 text-rose-800 font-semibold"
                    >
                      ⚠️ Simulate Overbilling (10 @ $920)
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                Verify 3-Way Match &amp; Register Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MODULE 15 — INVOICE APPROVAL, PAYMENTS & BUDGET TRANSITION     */}
      {/* ===================================================================== */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {/* Live 4-Layer Budget Transition Tracker */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  Real-Time 4-Layer Budget Transition (Committed PO → Actual
                  Paid Spend)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recording an invoice payment automatically shifts funds from
                  Committed (Open POs) into Actual Spend (Paid Invoices)
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {orgDepartments.map((dept) => {
                const available = Math.max(
                  0,
                  dept.totalBudget -
                    dept.encumbered -
                    dept.committed -
                    dept.actualSpend
                );
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <p className="font-bold text-slate-900">{dept.name}</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">
                          Total Budget
                        </span>
                        <span className="font-bold text-slate-900">
                          ${dept.totalBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-amber-50 border border-amber-200">
                        <span className="text-[10px] text-amber-800 block">
                          Encumbered (PR)
                        </span>
                        <span className="font-bold text-amber-900">
                          ${dept.encumbered.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-blue-50 border border-blue-200">
                        <span className="text-[10px] text-blue-800 block">
                          Committed (PO)
                        </span>
                        <span className="font-bold text-blue-900">
                          ${dept.committed.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-purple-50 border border-purple-200">
                        <span className="text-[10px] text-purple-800 block">
                          Actual (Paid Inv)
                        </span>
                        <span className="font-bold text-purple-900">
                          ${dept.actualSpend.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 font-semibold text-emerald-700">
                      <span>Available Uncommitted:</span>
                      <span>${available.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Finance Payment Vouchers & Settlement Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Finance Payment Vouchers, Scheduling &amp; Partial/Full
                Remittance
              </h2>
              <p className="text-xs text-slate-500">
                Only invoices that have passed 3-Way Matching or had their
                exceptions resolved can be scheduled or paid by Finance
              </p>
            </div>

            <div className="space-y-4">
              {orgInvoices.map((inv) => {
                const canPay =
                  inv.threeWayMatchStatus === "MATCHED" && inv.balanceDue > 0;
                return (
                  <div
                    key={inv.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {inv.internalVoucherNo}
                          </span>
                          <span className="font-mono text-xs text-slate-600">
                            Invoice: {inv.invoiceNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                            {inv.status}
                          </span>
                          {inv.scheduledPaymentDate && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                              <CalendarClock className="w-3 h-3" />
                              Scheduled: {inv.scheduledPaymentDate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Supplier: <strong>{inv.supplierName}</strong> • PO:{" "}
                          <span className="font-mono">{inv.poNumber}</span> •
                          GRN:{" "}
                          <span className="font-mono">{inv.grnNumber}</span> •
                          Dept: {inv.departmentName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">
                            Net Payable
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            ${inv.netPayableAmount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">
                            Amount Paid
                          </span>
                          <span className="font-bold text-sm text-emerald-700">
                            ${inv.amountPaid.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">
                            Balance Due
                          </span>
                          <span className="font-bold text-sm text-rose-700">
                            ${inv.balanceDue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Installments History */}
                    {inv.payments.length > 0 && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Executed Payment Remittances ({inv.payments.length})
                        </p>
                        {inv.payments.map((p) => (
                          <div
                            key={p.id}
                            className="flex flex-wrap items-center justify-between text-xs text-slate-700"
                          >
                            <span>
                              Ref:{" "}
                              <strong className="font-mono">
                                {p.paymentReference}
                              </strong>{" "}
                              ({p.paymentMethod}) • Signed off by {p.paidBy}
                            </span>
                            <span className="font-bold text-emerald-700">
                              ${p.amountPaid.toLocaleString()} on {p.paidAt}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPreviewVoucherPdf(inv)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Branded Payment Voucher PDF
                      </button>

                      {canPay ? (
                        activePaymentInvoiceId !== inv.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePaymentInvoiceId(inv.id);
                              setPaymentAmount(String(inv.balanceDue));
                            }}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Schedule or Record Payment ($
                            {inv.balanceDue.toLocaleString()})
                          </button>
                        ) : null
                      ) : inv.balanceDue === 0 ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Fully Settled &amp; Posted to Actual Spend
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-700">
                          Resolve 3-Way Match Exception in Tab 2 before payment
                        </span>
                      )}
                    </div>

                    {activePaymentInvoiceId === inv.id && (
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
                        <div className="grid sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Payment Amount ($ — Partial or Full)
                            </label>
                            <input
                              type="number"
                              max={inv.balanceDue}
                              min={1}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Payment Method
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) =>
                                setPaymentMethod(
                                  e.target.value as typeof paymentMethod
                                )
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            >
                              <option value="EFT_RTGS">
                                Bank EFT / RTGS Transfer
                              </option>
                              <option value="SWIFT_WIRE">
                                International SWIFT Wire
                              </option>
                              <option value="MPESA_B2B">
                                Mobile Money Corporate B2B
                              </option>
                              <option value="CHEQUE">Corporate Cheque</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Bank / Transaction Reference
                            </label>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) =>
                                setPaymentReference(e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Or Schedule Run Date
                            </label>
                            <input
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                              handlePaymentAction(inv.id, "RECORD_PAYMENT")
                            }
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                          >
                            Execute Payment Now &amp; Shift Budget to Actual
                            Spend
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() =>
                              handlePaymentAction(inv.id, "SCHEDULE")
                            }
                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                          >
                            Schedule Payment Run for {scheduledDate}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePaymentInvoiceId(null)}
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: BRANDED PURCHASE RETURN / DEBIT NOTE PDF                     */}
      {/* ===================================================================== */}
      {previewReturnPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: activeOrg.primaryColor }}
                >
                  {activeOrg.documentHeader}
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  OFFICIAL PURCHASE RETURN &amp; DEBIT NOTE
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {previewReturnPdf.returnNumber} • Linked GRN:{" "}
                  {previewReturnPdf.grnNumber} • PO:{" "}
                  {previewReturnPdf.poNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReturnPdf(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold"
              >
                Close Preview
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500">Supplier:</p>
                <p className="font-bold text-slate-900">
                  {previewReturnPdf.supplierName}
                </p>
                <p className="text-slate-500 mt-2">Department:</p>
                <p className="font-semibold text-slate-800">
                  {previewReturnPdf.departmentName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Return Status:</p>
                <p className="font-bold text-rose-700">
                  {previewReturnPdf.status}
                </p>
                <p className="text-slate-500 mt-2">Resolution Mode:</p>
                <p className="font-semibold text-slate-800">
                  {previewReturnPdf.resolutionType}{" "}
                  {previewReturnPdf.creditNoteNumber &&
                    `(${previewReturnPdf.creditNoteNumber})`}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-slate-600">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Reason</th>
                    <th className="py-2 text-right">Returned Qty</th>
                    <th className="py-2 text-right">Debit Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 font-mono">{previewReturnPdf.sku}</td>
                    <td className="py-3 font-semibold">
                      {previewReturnPdf.description}
                    </td>
                    <td className="py-3 text-rose-700 font-semibold">
                      {previewReturnPdf.reasonCode}
                    </td>
                    <td className="py-3 text-right">
                      {previewReturnPdf.returnedQty}{" "}
                      {previewReturnPdf.unitOfMeasure}
                    </td>
                    <td className="py-3 text-right font-bold">
                      {formatCurrency(previewReturnPdf.returnAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
              <strong>Warehouse Inspection Remarks:</strong>{" "}
              {previewReturnPdf.reasonNotes}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
              <span>{activeOrg.documentFooter}</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: BRANDED FINANCE PAYMENT VOUCHER & 3-WAY MATCH CERTIFICATE    */}
      {/* ===================================================================== */}
      {previewVoucherPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: activeOrg.primaryColor }}
                >
                  {activeOrg.documentHeader}
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  FINANCE PAYMENT VOUCHER &amp; 3-WAY MATCH CERTIFICATE
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Voucher: {previewVoucherPdf.internalVoucherNo} • Supplier
                  Invoice: {previewVoucherPdf.invoiceNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVoucherPdf(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold"
              >
                Close Preview
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500">Payee Supplier:</p>
                <p className="font-bold text-slate-900">
                  {previewVoucherPdf.supplierName}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Matched Documents:</p>
                <p className="font-mono font-semibold text-slate-800">
                  {previewVoucherPdf.poNumber} ↔ {previewVoucherPdf.grnNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">3-Way Match Verification:</p>
                <p className="font-bold text-emerald-700">
                  {previewVoucherPdf.threeWayMatchStatus}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Gross Invoice Subtotal ({previewVoucherPdf.invoicedQty}{" "}
                  {previewVoucherPdf.unitOfMeasure} @{" "}
                  {formatCurrency(previewVoucherPdf.invoicedUnitPrice)}):
                </span>
                <span className="font-semibold">
                  {formatCurrency(previewVoucherPdf.subtotalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Less Purchase Return Credit Note Deduction:
                </span>
                <span className="font-semibold text-rose-700">
                  -{formatCurrency(previewVoucherPdf.creditNoteDeduction)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Approved Net Payable Amount:</span>
                <span>
                  {formatCurrency(previewVoucherPdf.netPayableAmount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Paid to Date:</span>
                <span>{formatCurrency(previewVoucherPdf.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold">
                <span>Remaining Balance Due:</span>
                <span>{formatCurrency(previewVoucherPdf.balanceDue)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[11px] text-slate-500">
              <span>
                Signed Off By:{" "}
                {previewVoucherPdf.financeSignedOffBy || "Pending Finance"}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Payment Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Audit Banner */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          Every Purchase Return, 3-Way Match verification, exception override,
          and payment voucher is logged in the Immutable Audit Trail.
        </span>
        <Link
          href="/admin?tab=audit"
          className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          Inspect Full Audit Log →
        </Link>
      </div>
    </div>
  );
}

export default function Phase5Page() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading Accounts Payable Workspace...
        </div>
      }
    >
      <Phase5Content />
    </Suspense>
  );
}
