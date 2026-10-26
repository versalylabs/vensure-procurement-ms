"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  PackageCheck,
  ShieldCheck,
  UploadCloud,
  MessageSquareMore,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Building2,
  Award,
  Clock,
  RefreshCw,
  Truck,
  FileSignature,
  AlertTriangle,
  RotateCcw,
  Receipt,
} from "lucide-react";
import type { Phase1DatabaseState } from "@/server/store/phase1-store";
import { formatKES } from "@/lib/utils";
import { VensureIcon } from "@/components/VensureLogo";

type PortalTab = "rfqs" | "pos" | "profile" | "history";

function SupplierPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as PortalTab) || "rfqs";

  const [activeTab, setActiveTab] = useState<PortalTab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Quote submission form
  const [selectedRfqId, setSelectedRfqId] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<string>("6150");
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState<string>("5");
  const [quoteValidityDays, setQuoteValidityDays] = useState<string>("45");
  const [quoteSpecsNote, setQuoteSpecsNote] = useState<string>(
    "ISO 13485 & NIOSH N95 certified stock, immediate dispatch from Nairobi warehouse."
  );

  // Clarification question form
  const [clarificationRfqId, setClarificationRfqId] = useState<string>("");
  const [clarificationQuestion, setClarificationQuestion] = useState<string>("");

  // PO acknowledgment modal/state
  const [ackPoId, setAckPoId] = useState<string | null>(null);
  const [ackExpectedDate, setAckExpectedDate] = useState<string>("2026-10-18");
  const [ackNotes, setAckNotes] = useState<string>(
    "Order scheduled for dispatch from central warehouse. Tracking details will follow."
  );

  // Profile & Document upload form
  const [profileContactPerson, setProfileContactPerson] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [profilePhone, setProfilePhone] = useState<string>("");
  const [profileBankName, setProfileBankName] = useState<string>("");
  const [profileBankAccount, setProfileBankAccount] = useState<string>("");

  const [docType, setDocType] = useState<string>("Tax Compliance Certificate");
  const [docFileName, setDocFileName] = useState<string>(
    "Tax_Clearance_2026_Renewal.pdf"
  );
  const [docExpiryDate, setDocExpiryDate] = useState<string>("2027-04-01");

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

      const currentSupplier = (data.suppliers || []).find(
        (s) => s.id === data.activePortalSupplierId
      );
      if (currentSupplier) {
        setProfileContactPerson(currentSupplier.contactPerson);
        setProfileEmail(currentSupplier.email);
        setProfilePhone(currentSupplier.phone);
        setProfileBankName(currentSupplier.bankName);
        setProfileBankAccount(currentSupplier.bankAccountNo);
      }

      const orgRfqs = (data.rfqs || []).filter(
        (r) =>
          r.organizationId === data.activeOrganizationId &&
          r.invitedSupplierIds.includes(data.activePortalSupplierId)
      );
      if (orgRfqs.length > 0 && !selectedRfqId) {
        setSelectedRfqId(orgRfqs[0].id);
        setClarificationRfqId(orgRfqs[0].id);
      }
    } catch {
      showToast("Failed to load Supplier Portal data", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedRfqId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as PortalTab;
    if (tabParam && ["rfqs", "pos", "profile", "history"].includes(tabParam)) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          Loading External Supplier Self-Service Portal...
        </div>
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ||
    state.organizations[0];
  const orgSuppliers = state.suppliers.filter(
    (s) => s.organizationId === state.activeOrganizationId
  );
  const activeSupplier =
    orgSuppliers.find((s) => s.id === state.activePortalSupplierId) ||
    orgSuppliers[0];

  const invitedRfqs = state.rfqs.filter(
    (r) =>
      r.organizationId === state.activeOrganizationId &&
      activeSupplier &&
      r.invitedSupplierIds.includes(activeSupplier.id)
  );

  const supplierPos = state.purchaseOrders.filter(
    (po) =>
      po.organizationId === state.activeOrganizationId &&
      activeSupplier &&
      po.supplierId === activeSupplier.id
  );

  const supplierGrns = state.goodsReceipts.filter(
    (g) => activeSupplier && g.supplierId === activeSupplier.id
  );

  const supplierReturns = (state.purchaseReturns || []).filter(
    (ret) => activeSupplier && ret.supplierId === activeSupplier.id
  );

  const supplierInvoices = (state.supplierInvoices || []).filter(
    (inv) => activeSupplier && inv.supplierId === activeSupplier.id
  );

  const supplierContracts = state.contracts.filter(
    (c) => activeSupplier && c.supplierId === activeSupplier.id
  );

  const handleSwitchSupplier = async (supplierId: string) => {
    const updated = await dispatchAction("SWITCH_PORTAL_SUPPLIER", {
      supplierId,
    });
    if (updated) {
      const nextSup = updated.suppliers.find((s) => s.id === supplierId);
      if (nextSup) {
        setProfileContactPerson(nextSup.contactPerson);
        setProfileEmail(nextSup.email);
        setProfilePhone(nextSup.phone);
        setProfileBankName(nextSup.bankName);
        setProfileBankAccount(nextSup.bankAccountNo);
        showToast(`Switched portal session to ${nextSup.name}`);
      }
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || !selectedRfqId) return;
    const updated = await dispatchAction("SUBMIT_SUPPLIER_QUOTE", {
      rfqId: selectedRfqId,
      supplierId: activeSupplier.id,
      quotedAmount: Number(quoteAmount),
      leadTimeDays: Number(quoteDeliveryDays),
      validityDays: Number(quoteValidityDays),
      warrantyAndSpecsNote: quoteSpecsNote,
    });
    if (updated) {
      showToast(
        "Quotation submitted & cryptographically timestamped in RFQ evaluation matrix!"
      );
    }
  };

  const handleAskClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !activeSupplier ||
      !clarificationRfqId ||
      !clarificationQuestion.trim()
    )
      return;
    const updated = await dispatchAction("ADD_RFQ_CLARIFICATION", {
      rfqId: clarificationRfqId,
      supplierName: activeSupplier.name,
      question: clarificationQuestion,
    });
    if (updated) {
      setClarificationQuestion("");
      showToast("Clarification question sent to Procurement Officer.");
    }
  };

  const handlePoDecision = async (
    poId: string,
    decision: "ACKNOWLEDGED" | "CANCELLED"
  ) => {
    const updated = await dispatchAction("SUPPLIER_ACKNOWLEDGE_OR_REJECT_PO", {
      poId,
      decision,
      confirmedDeliveryDate: ackExpectedDate,
      supplierAckNote: ackNotes,
    });
    if (updated) {
      setAckPoId(null);
      showToast(
        decision === "ACKNOWLEDGED"
          ? "Purchase Order acknowledged and expected delivery date confirmed!"
          : "Purchase Order declined and Procurement Officer notified."
      );
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier) return;
    const updated = await dispatchAction("SUPPLIER_UPDATE_PROFILE", {
      supplierId: activeSupplier.id,
      contactPerson: profileContactPerson,
      email: profileEmail,
      phone: profilePhone,
      bankName: profileBankName,
      bankAccountNo: profileBankAccount,
    });
    if (updated) {
      showToast("Company contact and bank details updated in Vendor Registry.");
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || !docFileName.trim()) return;
    const updated = await dispatchAction("UPLOAD_SUPPLIER_DOC", {
      supplierId: activeSupplier.id,
      docType,
      fileName: docFileName,
      expiryDate: docExpiryDate,
    });
    if (updated) {
      showToast(`Uploaded ${docFileName} to Compliance Document Vault.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-full shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-rose-950 text-rose-100 border-rose-700"
              : "bg-[#1e1e2a] text-[#818cf8] border-[#5266eb]/40"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#5266eb] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Tenant Header in Mercury Alpine Dark */}
      <header className="bg-[#1e1e2a] text-[#ededf3] border-b border-[#272735] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VensureIcon size={38} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#ededf3]">
                  {activeOrg?.name} — External Supplier Portal
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5266eb]/15 text-[#818cf8] border border-[#5266eb]/30 font-semibold">
                  Verified Vendor Portal
                </span>
              </div>
              <p className="text-xs text-[#c3c3cc]">
                Self-Service RFQ Quoting • PO Acknowledgment • Compliance Document Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#272735] border border-[#272735] rounded-full px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#5266eb]" />
              <span className="text-[11px] text-[#c3c3cc]">
                Active Supplier:
              </span>
              <select
                value={activeSupplier?.id || ""}
                onChange={(e) => handleSwitchSupplier(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#ededf3] focus:outline-none"
              >
                {orgSuppliers.map((sup) => (
                  <option
                    key={sup.id}
                    value={sup.id}
                    className="bg-[#1e1e2a] text-[#ededf3]"
                  >
                    {sup.name} ({sup.supplierCode})
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/workspace"
              className="px-3.5 py-1.5 rounded-full bg-[#272735] hover:bg-[#323246] text-xs text-[#ededf3] font-medium border border-[#272735] transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Internal Suite
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-6 py-8 space-y-6 flex-1">
        {/* Supplier Identity & Scorecard Banner */}
        {activeSupplier && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {activeSupplier.approvalStatus}
                </span>
                {activeSupplier.isPreferred && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    PREFERRED VENDOR
                  </span>
                )}
                <span className="text-xs font-mono text-slate-500">
                  {activeSupplier.supplierCode} • Tax ID: {activeSupplier.taxId}
                </span>
                <span className="text-xs text-slate-500">
                  • Category: {activeSupplier.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeSupplier.name}
              </h2>
              <p className="text-xs text-slate-500">
                Contact: {activeSupplier.contactPerson} • {activeSupplier.email} •{" "}
                {activeSupplier.phone}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">Quality Rating</p>
                <p className="text-base font-bold text-emerald-700">
                  {activeSupplier.qualityRating.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">On-Time Delivery</p>
                <p className="text-base font-bold text-slate-900">
                  {activeSupplier.deliveryTimeScore}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">Invited RFQs</p>
                <p className="text-base font-bold text-blue-700">
                  {invitedRfqs.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500">Issued POs</p>
                <p className="text-base font-bold text-purple-700">
                  {supplierPos.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("rfqs")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "rfqs"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            1. Invited RFQs &amp; Quoting ({invitedRfqs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "pos"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <PackageCheck className="w-4 h-4 text-purple-400" />
            2. Issued Purchase Orders ({supplierPos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "profile"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            3. Company Profile &amp; Document Vault (
            {activeSupplier?.documents.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4 text-blue-400" />
            4. Returns, Invoices &amp; Performance History
          </button>
        </div>

        {/* TAB 1: INVITED RFQs & QUOTING */}
        {activeTab === "rfqs" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RFQs Invited to Quote
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submit or revise your commercial &amp; technical quotation
                    before the closing deadline
                  </p>
                </div>

                {invitedRfqs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No RFQs currently assigned to {activeSupplier?.name}.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {invitedRfqs.map((rfq) => {
                      const myQuote = rfq.quotations.find(
                        (q) =>
                          activeSupplier && q.supplierId === activeSupplier.id
                      );
                      return (
                        <div
                          key={rfq.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {rfq.rfqNumber}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                  {rfq.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Source PR: {rfq.prNumber}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 mt-1">
                                {rfq.title}
                              </h4>
                            </div>
                            <div className="text-right text-xs">
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Deadline: {rfq.submissionDeadline}
                              </span>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Dept: {rfq.departmentName} • Est. Budget:{" "}
                                {formatKES(rfq.estimatedBudget)}
                              </p>
                            </div>
                          </div>

                          {myQuote ? (
                            <div className="p-3 rounded-lg bg-emerald-50/90 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="font-bold text-emerald-900">
                                  Submitted Quote:
                                </span>{" "}
                                <span className="font-semibold text-emerald-800">
                                  {myQuote.currency}{" "}
                                  {myQuote.quotedAmount.toLocaleString()}
                                </span>{" "}
                                • {myQuote.leadTimeDays} days lead time •{" "}
                                {myQuote.validityDays}d validity
                                <p className="text-[11px] text-emerald-700 mt-0.5">
                                  {myQuote.warrantyAndSpecsNote}
                                </p>
                              </div>
                              {myQuote.isSelected && (
                                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold">
                                  AWARDED WINNER
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                              You have not submitted a quotation for this RFQ
                              yet. Use the form on the right to submit before{" "}
                              {rfq.submissionDeadline}.
                            </div>
                          )}

                          {/* Clarifications Log */}
                          <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <MessageSquareMore className="w-3.5 h-3.5 text-blue-600" />
                              Clarification Q&amp;A Log (
                              {rfq.clarifications.length})
                            </p>
                            {rfq.clarifications.map((c) => (
                              <div
                                key={c.id}
                                className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1"
                              >
                                <p className="font-medium text-slate-800">
                                  <span className="text-blue-700 font-semibold">
                                    Q ({c.supplierName}):
                                  </span>{" "}
                                  {c.question}
                                </p>
                                {c.response ? (
                                  <p className="text-emerald-700 pl-3 border-l-2 border-emerald-400">
                                    <span className="font-semibold">
                                      Procurement Response:
                                    </span>{" "}
                                    {c.response}
                                  </p>
                                ) : (
                                  <p className="text-amber-600 italic">
                                    Awaiting response from Procurement Officer...
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Submit Quote & Ask Clarification */}
            <div className="space-y-6">
              <form
                onSubmit={handleSubmitQuote}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Submit or Revise Quotation
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Target RFQ
                    </label>
                    <select
                      value={selectedRfqId}
                      onChange={(e) => setSelectedRfqId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {invitedRfqs.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.rfqNumber} — {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Total Quotation Amount (KES)
                    </label>
                    <input
                      type="number"
                      required
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Delivery Lead Time (Days)
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteDeliveryDays}
                        onChange={(e) => setQuoteDeliveryDays(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Quote Validity (Days)
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteValidityDays}
                        onChange={(e) => setQuoteValidityDays(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Warranty &amp; Technical Compliance Notes
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteSpecsNote}
                      onChange={(e) => setQuoteSpecsNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || invitedRfqs.length === 0}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  Submit Official Quotation
                </button>
              </form>

              <form
                onSubmit={handleAskClarification}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareMore className="w-4 h-4 text-blue-600" />
                  Submit Clarification Question
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Select RFQ
                    </label>
                    <select
                      value={clarificationRfqId}
                      onChange={(e) => setClarificationRfqId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {invitedRfqs.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.rfqNumber} — {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Technical or Commercial Question
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ask about technical tolerances, delivery schedules, or batch certifications..."
                      value={clarificationQuestion}
                      onChange={(e) => setClarificationQuestion(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || invitedRfqs.length === 0}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  Post Clarification Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: ISSUED PURCHASE ORDERS (PO ACKNOWLEDGMENT) */}
        {activeTab === "pos" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Purchase Orders Issued to {activeSupplier?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Review line items, confirm expected delivery dates, and
                  acknowledge or reject Purchase Orders
                </p>
              </div>

              {supplierPos.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No Purchase Orders have been issued to {activeSupplier?.name}{" "}
                  yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {supplierPos.map((po) => (
                    <div
                      key={po.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {po.poNumber}
                            </span>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                              {po.status}
                            </span>
                            <span className="text-xs text-slate-500">
                              Version v{po.versionNumber} • Dept:{" "}
                              {po.departmentName}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800 mt-1">
                            {po.title}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {po.currency} {po.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Requested Delivery: {po.expectedDeliveryDate}
                          </p>
                        </div>
                      </div>

                      {/* PO Line Items Table */}
                      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                              <th className="py-2 px-3">SKU</th>
                              <th className="py-2 px-3">Description</th>
                              <th className="py-2 px-3 text-right">Ordered</th>
                              <th className="py-2 px-3 text-right">
                                Delivered (GRN)
                              </th>
                              <th className="py-2 px-3 text-right">
                                Unit Price
                              </th>
                              <th className="py-2 px-3 text-right">
                                Line Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {po.items.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2 px-3 font-mono">
                                  {item.sku}
                                </td>
                                <td className="py-2 px-3 font-medium">
                                  {item.description}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {item.orderedQty} {item.unitOfMeasure}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                                  {item.receivedQty} {item.unitOfMeasure}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {po.currency}{" "}
                                  {item.unitPrice.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold">
                                  {po.currency}{" "}
                                  {item.totalPrice.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Supplier Acknowledgment Status or Action Controls */}
                      {po.status === "ISSUED" ? (
                        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-bold text-amber-900">
                              Action Required: Please Acknowledge or Decline
                              this Purchase Order
                            </p>
                            {ackPoId !== po.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAckPoId(po.id);
                                  setAckExpectedDate(po.expectedDeliveryDate);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                              >
                                Respond to PO {po.poNumber}
                              </button>
                            )}
                          </div>

                          {ackPoId === po.id && (
                            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200 text-xs">
                              <div className="space-y-2">
                                <label className="block font-semibold text-slate-800">
                                  Confirmed Expected Delivery Date
                                </label>
                                <input
                                  type="date"
                                  value={ackExpectedDate}
                                  onChange={(e) =>
                                    setAckExpectedDate(e.target.value)
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                                />
                                <label className="block font-semibold text-slate-800">
                                  Dispatch / Fulfillment Notes
                                </label>
                                <input
                                  type="text"
                                  value={ackNotes}
                                  onChange={(e) => setAckNotes(e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                                />
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() =>
                                    handlePoDecision(po.id, "ACKNOWLEDGED")
                                  }
                                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accept &amp; Acknowledge PO
                                </button>
                              </div>

                              <div className="space-y-2 border-l border-amber-200 pl-4 flex flex-col justify-between">
                                <p className="text-xs text-rose-800">
                                  If you cannot fulfill this order according to
                                  specification or schedule, you may decline it
                                  so Procurement can re-award.
                                </p>
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={() =>
                                    handlePoDecision(po.id, "CANCELLED")
                                  }
                                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold inline-flex items-center gap-1.5 self-start"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Decline Purchase Order
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-white px-4 py-2.5 rounded-lg border border-slate-200">
                          <span>
                            Confirmation Status:{" "}
                            <strong className="text-slate-900">
                              {po.status}
                            </strong>
                            {po.supplierAckNote && ` • "${po.supplierAckNote}"`}
                          </span>
                          {po.confirmedDeliveryDate && (
                            <span className="text-emerald-700 font-semibold">
                              Committed Delivery Date:{" "}
                              {po.confirmedDeliveryDate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY PROFILE, BANKING & COMPLIANCE DOCUMENT VAULT */}
        {activeTab === "profile" && activeSupplier && (
          <div className="grid lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Self-Service Company &amp; Bank Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Keep your remittance bank details and primary contact
                  information up to date
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={profileContactPerson}
                    onChange={(e) => setProfileContactPerson(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Official Remittance &amp; RFQ Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Settlement Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileBankName}
                      onChange={(e) => setProfileBankName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      required
                      value={profileBankAccount}
                      onChange={(e) => setProfileBankAccount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                Save Company &amp; Banking Profile
              </button>
            </form>

            {/* Compliance Document Vault */}
            <div className="space-y-6">
              <form
                onSubmit={handleUploadDoc}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    Upload Compliance Certificate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload renewed Tax Compliance, ISO certifications,
                    Insurance, or Trade Licenses
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="Tax Compliance Certificate">
                        Tax Compliance Certificate
                      </option>
                      <option value="Business / Trade License">
                        Business / Trade License
                      </option>
                      <option value="ISO Quality Certification">
                        ISO Quality Certification
                      </option>
                      <option value="Liability Insurance Policy">
                        Liability Insurance Policy
                      </option>
                      <option value="Prequalification Dossier">
                        Prequalification Dossier
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Document File Name
                    </label>
                    <input
                      type="text"
                      required
                      value={docFileName}
                      onChange={(e) => setDocFileName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={docExpiryDate}
                      onChange={(e) => setDocExpiryDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Upload to Compliance Vault
                </button>
              </form>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Certificates on File ({activeSupplier.documents.length})
                </h4>
                <div className="space-y-2">
                  {activeSupplier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {doc.fileName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {doc.docType} • Expires {doc.expiryDate}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.status === "VALID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : doc.status === "EXPIRING_SOON"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RETURNS, INVOICES & PERFORMANCE SCORECARD */}
        {activeTab === "history" && activeSupplier && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Supplier Performance Scorecard
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  {
                    label: "Product / Service Quality Rating",
                    display: `${activeSupplier.qualityRating.toFixed(1)} / 5.0`,
                    pct: (activeSupplier.qualityRating / 5) * 100,
                  },
                  {
                    label: "On-Time Delivery Reliability",
                    display: `${activeSupplier.deliveryTimeScore}%`,
                    pct: activeSupplier.deliveryTimeScore,
                  },
                  {
                    label: "Commercial Price Competitiveness",
                    display: `${activeSupplier.priceCompetitivenessScore}%`,
                    pct: activeSupplier.priceCompetitivenessScore,
                  },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{metric.label}</span>
                      <span className="font-bold text-emerald-700">
                        {metric.display}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${metric.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-500">Cumulative Paid Spend:</span>
                  <span className="font-bold text-slate-900">
                    {formatKES(activeSupplier.cumulativeSpend)} (
                    {activeSupplier.completedPoCount} POs)
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Purchase Returns & Credit Notes */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Purchase Returns &amp; Rejections ({supplierReturns.length})
                </h3>
                {supplierReturns.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No purchase returns logged for {activeSupplier.name}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {supplierReturns.map((ret) => (
                      <div
                        key={ret.id}
                        className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {ret.returnNumber}
                          </span>{" "}
                          • GRN: <span className="font-mono">{ret.grnNumber}</span>{" "}
                          • Returned: {ret.returnedQty} {ret.unitOfMeasure} ($
                          {ret.returnAmount.toLocaleString()})
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Reason: <strong>{ret.reasonCode}</strong> —{" "}
                            {ret.reasonNotes}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-700 border border-rose-300">
                          {ret.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Supplier Invoices & Payment Status */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Submitted Invoices &amp; 3-Way Match Status (
                  {supplierInvoices.length})
                </h3>
                {supplierInvoices.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No invoices submitted yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {supplierInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </span>{" "}
                          ({inv.internalVoucherNo}) • PO:{" "}
                          <span className="font-mono">{inv.poNumber}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Net Payable: {formatKES(inv.netPayableAmount)} • Paid:{" "}
                            {formatKES(inv.amountPaid)} • Balance Due:{" "}
                            {formatKES(inv.balanceDue)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              inv.threeWayMatchStatus === "MATCHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            3-Way: {inv.threeWayMatchStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GRNs & Contracts */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Goods Receipt Notes ({supplierGrns.length}) &amp; Contracts (
                  {supplierContracts.length})
                </h3>
                <div className="space-y-2">
                  {supplierGrns.map((grn) => (
                    <div
                      key={grn.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">
                          {grn.grnNumber}
                        </span>{" "}
                        • PO: <span className="font-mono">{grn.poNumber}</span>{" "}
                        • Delivery Note: {grn.deliveryNoteRef}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {grn.status}
                      </span>
                    </div>
                  ))}
                  {supplierContracts.map((con) => (
                    <div
                      key={con.id}
                      className="p-3 rounded-lg bg-purple-50/40 border border-purple-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <FileSignature className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                        <span className="font-mono font-bold text-slate-900">
                          {con.contractNumber}
                        </span>{" "}
                        — <span className="font-semibold">{con.title}</span>
                      </div>
                      <span className="font-bold text-purple-900">
                        Utilized: {formatKES(con.utilizedSpend)} /{" "}
                        {formatKES(con.ceilingValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            All supplier quotations, PO acknowledgments, returns, and compliance
            uploads are cryptographically timestamped in the organization&apos;s
            immutable audit log.
          </span>
        </div>
      </main>
    </div>
  );
}

export default function SupplierPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12 text-xs text-slate-500">
          Loading Supplier Portal...
        </div>
      }
    >
      <SupplierPortalContent />
    </Suspense>
  );
}
