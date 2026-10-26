"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Phase1DatabaseState,
  ProcurementMethodKey,
  RfqRecord,
} from "@/server/store/phase1-store";
import { formatCurrency } from "@/lib/utils";
import {
  Factory,
  Send,
  Scale,
  FileSignature,
  Plus,
  Star,
  Ban,
  CheckCircle2,
  FileText,
  UploadCloud,
  MessageSquareMore,
  AlertTriangle,
  Award,
  Printer,
  X,
  Sparkles,
  History,
} from "lucide-react";

type Phase3Tab = "suppliers" | "rfq" | "evaluation" | "contracts";

export default function Phase3Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          Loading Suppliers, RFQs, Evaluation &amp; Contracts...
        </div>
      }
    >
      <Phase3Content />
    </Suspense>
  );
}

function Phase3Content() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Phase3Tab) || "suppliers";

  const [activeTab, setActiveTab] = useState<Phase3Tab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Supplier Onboarding State
  const [supName, setSupName] = useState("");
  const [supCategory, setSupCategory] = useState("Medical Equipment & Supplies");
  const [supContact, setSupContact] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supPhone, setSupPhone] = useState("+254 700 123 456");
  const [supTaxId, setSupTaxId] = useState("PIN-P051992831Z");
  const [supBank, setSupBank] = useState("Stanbic Bank Corporate");
  const [supAccount, setSupAccount] = useState("010000998877");
  const [supPreferred, setSupPreferred] = useState(true);
  const [blacklistInputs, setBlacklistInputs] = useState<Record<string, string>>({});

  // Document Vault Upload State
  const [docSupplierId, setDocSupplierId] = useState("");
  const [docType, setDocType] = useState("ISO 13485 Quality Certificate");
  const [docFileName, setDocFileName] = useState("ISO13485_Renewal_2027.pdf");
  const [docExpiry, setDocExpiry] = useState("2027-12-31");

  // RFQ Creation State
  const [rfqPrId, setRfqPrId] = useState("");
  const [rfqDeadline, setRfqDeadline] = useState("2026-10-25");
  const [selectedRfqSuppliers, setSelectedRfqSuppliers] = useState<string[]>([
    "sup_1",
    "sup_2",
  ]);

  // Submit Quote State
  const [quoteRfqId, setQuoteRfqId] = useState("");
  const [quoteSupplierId, setQuoteSupplierId] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("6100");
  const [quoteLeadDays, setQuoteLeadDays] = useState("7");
  const [quoteNotes, setQuoteNotes] = useState(
    "Full specification compliance, ex-stock delivery."
  );

  // Clarification Q&A State
  const [clrRfqId, setClrRfqId] = useState("");
  const [clrSupplierName, setClrSupplierName] = useState(
    "Apex BioMedical & Diagnostics Ltd"
  );
  const [clrQuestion, setClrQuestion] = useState("");
  const [clrResponse, setClrResponse] = useState("");

  // Weighted Evaluation State (Module 8)
  const [weightPrice, setWeightPrice] = useState(40);
  const [weightLeadTime, setWeightLeadTime] = useState(20);
  const [weightQuality, setWeightQuality] = useState(25);
  const [weightPastPerf, setWeightPastPerf] = useState(15);
  const [evalJustification, setEvalJustification] = useState<
    Record<string, string>
  >({});
  const [evalOverrideReason, setEvalOverrideReason] = useState<
    Record<string, string>
  >({});

  // Contract Creation & Amendment State (Module 10)
  const [cntTitle, setCntTitle] = useState("");
  const [cntSupplierId, setCntSupplierId] = useState("");
  const [cntDeptId, setCntDeptId] = useState("");
  const [cntMethod, setCntMethod] =
    useState<ProcurementMethodKey>("FRAMEWORK_AGREEMENT");
  const [cntStartDate, setCntStartDate] = useState("2026-10-01");
  const [cntEndDate, setCntEndDate] = useState("2027-09-30");
  const [cntReminder, setCntReminder] = useState("60");
  const [cntCeiling, setCntCeiling] = useState("100000");

  const [amdCeiling, setAmdCeiling] = useState<Record<string, string>>({});
  const [amdEndDate, setAmdEndDate] = useState<Record<string, string>>({});
  const [amdSummary, setAmdSummary] = useState<Record<string, string>>({});

  // Branded PDF Preview Modals
  const [previewRfqPdf, setPreviewRfqPdf] = useState<RfqRecord | null>(null);
  const [previewEvalPdf, setPreviewEvalPdf] = useState<RfqRecord | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as Phase3Tab;
    if (
      t &&
      ["suppliers", "rfq", "evaluation", "contracts"].includes(t)
    ) {
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
        Loading Strategic Sourcing, Suppliers &amp; Contract Engine...
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ??
    state.organizations[0];
  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) ?? state.users[0];

  const orgSuppliers = state.suppliers.filter(
    (s) => s.organizationId === activeOrg.id
  );
  const orgRfqs = state.rfqs.filter((r) => r.organizationId === activeOrg.id);
  const orgContracts = state.contracts.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgDepts = state.departments.filter(
    (d) => d.organizationId === activeOrg.id
  );
  const approvedPRs = state.purchaseRequisitions.filter(
    (pr) => pr.organizationId === activeOrg.id && pr.status === "APPROVED"
  );

  // Weighted score helper for Module 8
  function computeWeightedScore(
    rfq: RfqRecord,
    quotedAmount: number,
    leadTimeDays: number,
    supplierId: string
  ): number {
    const minPrice = Math.min(...rfq.quotations.map((q) => q.quotedAmount));
    const minLead = Math.min(...rfq.quotations.map((q) => q.leadTimeDays));
    const sup = orgSuppliers.find((s) => s.id === supplierId);

    const priceScore =
      quotedAmount > 0 ? (minPrice / quotedAmount) * 100 : 80;
    const leadScore =
      leadTimeDays > 0 ? (minLead / leadTimeDays) * 100 : 80;
    const qualityScore = sup ? (sup.qualityRating / 5.0) * 100 : 85;
    const perfScore = sup ? sup.deliveryTimeScore : 85;

    const totalWeight =
      weightPrice + weightLeadTime + weightQuality + weightPastPerf || 100;

    const weighted =
      (priceScore * weightPrice +
        leadScore * weightLeadTime +
        qualityScore * weightQuality +
        perfScore * weightPastPerf) /
      totalWeight;

    return Math.round(weighted * 10) / 10;
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

      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
            Strategic Sourcing &amp; Vendor Intelligence • {activeOrg.name}
          </span>
          <h2 className="text-lg font-bold">
            Supplier Management, RFQs, Weighted Quote Comparison &amp; Contracts
          </h2>
          <p className="text-xs text-slate-400">
            Active Officer: <strong className="text-white">{activeUser.fullName}</strong> (
            <span className="text-emerald-300">{activeUser.role}</span>) • Full compliance
            vault, override alerts when cheapest quote is bypassed, and contract ceiling tracking.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">
              Verified Suppliers
            </span>
            <strong className="text-emerald-400 text-sm">
              {orgSuppliers.filter((s) => !s.isBlacklisted).length} Active /{" "}
              {orgSuppliers.filter((s) => s.isBlacklisted).length} Blacklisted
            </strong>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">
              Active Contracts Ceiling
            </span>
            <strong className="text-blue-300 text-sm">
              {formatCurrency(
                orgContracts.reduce((s, c) => s + c.ceilingValue, 0)
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Sourcing & Contracts Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: "suppliers",
            label: `1. Supplier Registry & Vault (${orgSuppliers.length})`,
            icon: Factory,
          },
          {
            id: "rfq",
            label: `2. Request for Quotation — RFQ (${orgRfqs.length})`,
            icon: Send,
          },
          {
            id: "evaluation",
            label: "3. Quote Comparison & Selection",
            icon: Scale,
          },
          {
            id: "contracts",
            label: `4. Contract Management (${orgContracts.length})`,
            icon: FileSignature,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as Phase3Tab)}
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
          TAB 1: SUPPLIER MANAGEMENT & DOCUMENT VAULT
         ===================================================================== */}
      {activeTab === "suppliers" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Supplier Registry Cards & Document Vault */}
          <div className="lg:col-span-2 space-y-4">
            {orgSuppliers.map((sup) => {
              const linkedContracts = orgContracts.filter(
                (c) => c.supplierId === sup.id
              );
              return (
                <div
                  key={sup.id}
                  className={`bg-white rounded-xl border p-5 space-y-4 ${
                    sup.isBlacklisted
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {sup.supplierCode}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {sup.category}
                        </span>
                        {sup.isPreferred && !sup.isBlacklisted && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Star className="w-3 h-3 fill-emerald-600" />
                            Preferred Supplier
                          </span>
                        )}
                        {sup.isBlacklisted && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            <Ban className="w-3 h-3" />
                            BLACKLISTED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {sup.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Contact: <strong>{sup.contactPerson}</strong> ({sup.email} •{" "}
                        {sup.phone}) • Tax ID: <code>{sup.taxId}</code>
                      </p>
                      <p className="text-xs text-slate-500">
                        Bank: <strong>{sup.bankName}</strong> (Acct:{" "}
                        <code>{sup.bankAccountNo}</code>)
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Cumulative Spend</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(sup.cumulativeSpend)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sup.completedPoCount} Completed POs •{" "}
                        {linkedContracts.length} Contracts
                      </p>
                    </div>
                  </div>

                  {/* Blacklist Reason Alert if Blacklisted */}
                  {sup.isBlacklisted && sup.blacklistReason && (
                    <div className="p-3 rounded-lg bg-rose-100/80 border border-rose-300 text-xs text-rose-900">
                      <strong>Mandatory Blacklist Audit Reason:</strong> &ldquo;
                      {sup.blacklistReason}&rdquo;
                    </div>
                  )}

                  {/* 3 Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        On-Time Delivery Score
                      </span>
                      <strong className="text-sm text-slate-900">
                        {sup.deliveryTimeScore}%
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        GRN Quality Rating
                      </span>
                      <strong className="text-sm text-slate-900">
                        {sup.qualityRating} / 5.0 ★
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        Price Competitiveness
                      </span>
                      <strong className="text-sm text-slate-900">
                        {sup.priceCompetitivenessScore}%
                      </strong>
                    </div>
                  </div>

                  {/* Document Vault per Supplier */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">
                      Supplier Compliance Document Vault ({sup.documents.length})
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {sup.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold text-slate-800 truncate">
                              {doc.docType}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {doc.fileName} • Exp: {doc.expiryDate}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              doc.status === "VALID"
                                ? "bg-emerald-100 text-emerald-800"
                                : doc.status === "EXPIRING_SOON"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred / Blacklist Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        mutate(
                          {
                            action: "TOGGLE_SUPPLIER_FLAGS",
                            supplierId: sup.id,
                            isPreferred: !sup.isPreferred,
                          },
                          `Updated Preferred status for ${sup.name}.`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700"
                    >
                      {sup.isPreferred
                        ? "Remove Preferred Flag"
                        : "★ Mark as Preferred"}
                    </button>

                    <div className="flex items-center gap-2">
                      {!sup.isBlacklisted && (
                        <input
                          placeholder="Mandatory reason to blacklist..."
                          value={blacklistInputs[sup.id] || ""}
                          onChange={(e) =>
                            setBlacklistInputs((prev) => ({
                              ...prev,
                              [sup.id]: e.target.value,
                            }))
                          }
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 w-52"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "TOGGLE_SUPPLIER_FLAGS",
                              supplierId: sup.id,
                              isBlacklisted: !sup.isBlacklisted,
                              blacklistReason:
                                blacklistInputs[sup.id] ||
                                "Quality/compliance breach recorded by Procurement.",
                            },
                            sup.isBlacklisted
                              ? `Reinstated ${sup.name}.`
                              : `Blacklisted ${sup.name} and logged audit reason.`
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          sup.isBlacklisted
                            ? "bg-emerald-600 text-white hover:bg-emerald-500"
                            : "bg-rose-600 text-white hover:bg-rose-500"
                        }`}
                      >
                        {sup.isBlacklisted
                          ? "Reinstate Supplier"
                          : "Blacklist Supplier"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Onboard Supplier & Upload Compliance Doc */}
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!supName) return;
                mutate(
                  {
                    action: "ONBOARD_SUPPLIER",
                    name: supName,
                    category: supCategory,
                    contactPerson: supContact || "Tenders Desk",
                    email: supEmail || "bids@supplier.co.ke",
                    phone: supPhone,
                    taxId: supTaxId,
                    bankName: supBank,
                    bankAccountNo: supAccount,
                    isPreferred: supPreferred,
                  },
                  `Onboarded and verified supplier ${supName}.`
                );
                setSupName("");
                setSupContact("");
                setSupEmail("");
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Onboard &amp; Verify New Supplier
              </h3>
              <input
                placeholder="Company Legal Name"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <input
                placeholder="Supply Category"
                value={supCategory}
                onChange={(e) => setSupCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Contact Person"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  placeholder="Phone"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Email Address"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  placeholder="Tax ID / PIN"
                  value={supTaxId}
                  onChange={(e) => setSupTaxId(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Bank Name"
                  value={supBank}
                  onChange={(e) => setSupBank(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  placeholder="Bank Account No."
                  value={supAccount}
                  onChange={(e) => setSupAccount(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={supPreferred}
                  onChange={(e) => setSupPreferred(e.target.checked)}
                />
                Flag as Preferred Pre-Qualified Supplier
              </label>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Onboard &amp; Approve Supplier
              </button>
            </form>

            {/* Upload Document to Supplier Vault */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  {
                    action: "UPLOAD_SUPPLIER_DOC",
                    supplierId: docSupplierId || orgSuppliers[0]?.id,
                    docType,
                    fileName: docFileName,
                    expiryDate: docExpiry,
                  },
                  "Uploaded compliance certificate to Supplier Document Vault."
                );
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Upload to Supplier Document Vault
                </h3>
              </div>
              <select
                value={docSupplierId}
                onChange={(e) => setDocSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              >
                {orgSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.supplierCode})
                  </option>
                ))}
              </select>
              <input
                placeholder="Document Type (e.g. Tax Compliance, ISO Cert)"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="File Name (.pdf)"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  type="date"
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Upload &amp; Verify Certificate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: REQUEST FOR QUOTATION (RFQ) & CLARIFICATIONS
         ===================================================================== */}
      {activeTab === "rfq" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Active & Evaluated RFQs */}
          <div className="lg:col-span-2 space-y-4">
            {orgRfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {rfq.rfqNumber}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                        From {rfq.prNumber}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {rfq.procurementMethod}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          rfq.status === "EVALUATED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {rfq.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Department: <strong>{rfq.departmentName}</strong> •
                      Submission Deadline: <strong>{rfq.submissionDeadline}</strong> •
                      Invited Suppliers: {rfq.invitedSupplierIds.length}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">PR Budget Benchmark</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(rfq.estimatedBudget, rfq.currency)}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewRfqPdf(rfq)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Branded RFQ PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("evaluation")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                      >
                        Compare Quotes ({rfq.quotations.length}) →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Received Quotations Summary */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700">
                    Submitted Supplier Quotations ({rfq.quotations.length})
                  </p>
                  {rfq.quotations.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No quotations submitted yet. Use the form on the right to record a supplier quote.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {rfq.quotations.map((q) => (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border text-xs space-y-1 ${
                            q.isSelected
                              ? "bg-emerald-50 border-emerald-400"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">
                              {q.supplierName}
                            </span>
                            {q.isSelected && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                AWARDED
                              </span>
                            )}
                          </div>
                          <p className="text-base font-bold text-slate-900">
                            {formatCurrency(q.quotedAmount, q.currency)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Lead Time: <strong>{q.leadTimeDays} days</strong> •
                            Valid: {q.validityDays}d
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clarification Q&A Log */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquareMore className="w-3.5 h-3.5 text-blue-600" />
                    Supplier Clarification Requests &amp; Responses (
                    {rfq.clarifications.length})
                  </p>
                  {rfq.clarifications.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <p className="text-slate-800">
                        <strong>Q ({c.supplierName}):</strong> &ldquo;{c.question}
                        &rdquo;{" "}
                        <span className="text-slate-400 text-[11px]">
                          ({c.askedAt})
                        </span>
                      </p>
                      {c.response && (
                        <p className="text-emerald-800 font-medium">
                          <strong>A (Procurement Team):</strong> &ldquo;
                          {c.response}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Auto-Generate RFQ from PR + Submit Quote + Log Clarification */}
          <div className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  {
                    action: "CREATE_RFQ_FROM_PR",
                    prId: rfqPrId || approvedPRs[0]?.id,
                    submissionDeadline: rfqDeadline,
                    invitedSupplierIds: selectedRfqSuppliers,
                  },
                  "Auto-generated RFQ from Approved PR and dispatched supplier invites."
                );
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Auto-Generate RFQ from Approved PR
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Approved Purchase Requisition
                </label>
                <select
                  value={rfqPrId}
                  onChange={(e) => setRfqPrId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {approvedPRs.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.prNumber} — {pr.title.slice(0, 32)}... ($
                      {pr.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Submission Deadline
                </label>
                <input
                  type="date"
                  value={rfqDeadline}
                  onChange={(e) => setRfqDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Invite Pre-Qualified Suppliers (Blacklisted Blocked)
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded border border-slate-200 bg-slate-50">
                  {orgSuppliers.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between text-xs ${
                        s.isBlacklisted
                          ? "opacity-50 line-through text-rose-700"
                          : "text-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={s.isBlacklisted}
                          checked={selectedRfqSuppliers.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRfqSuppliers((prev) => [
                                ...prev,
                                s.id,
                              ]);
                            } else {
                              setSelectedRfqSuppliers((prev) =>
                                prev.filter((id) => id !== s.id)
                              );
                            }
                          }}
                        />
                        {s.name}
                      </span>
                      {s.isBlacklisted && (
                        <span className="text-[10px] font-bold text-rose-600">
                          BLACKLISTED
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Generate &amp; Issue RFQ to Suppliers
              </button>
            </form>

            {/* Record Supplier Quotation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  {
                    action: "SUBMIT_SUPPLIER_QUOTE",
                    rfqId: quoteRfqId || orgRfqs[0]?.id,
                    supplierId:
                      quoteSupplierId ||
                      orgSuppliers.find((s) => !s.isBlacklisted)?.id,
                    quotedAmount: Number(quoteAmount),
                    leadTimeDays: Number(quoteLeadDays),
                    warrantyAndSpecsNote: quoteNotes,
                  },
                  "Recorded supplier quotation against RFQ."
                );
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Record / Simulate Supplier Quote Submission
              </h3>
              <select
                value={quoteRfqId}
                onChange={(e) => setQuoteRfqId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              >
                {orgRfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rfqNumber} — {r.title.slice(0, 34)}...
                  </option>
                ))}
              </select>
              <select
                value={quoteSupplierId}
                onChange={(e) => setQuoteSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              >
                {orgSuppliers
                  .filter((s) => !s.isBlacklisted)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.supplierCode})
                    </option>
                  ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">
                    Quoted Total (KES)
                  </label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={quoteLeadDays}
                    onChange={(e) => setQuoteLeadDays(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <input
                placeholder="Technical & Warranty Note"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Submit Supplier Quotation
              </button>
            </form>

            {/* Log Clarification Q&A */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!clrQuestion) return;
                mutate(
                  {
                    action: "ADD_RFQ_CLARIFICATION",
                    rfqId: clrRfqId || orgRfqs[0]?.id,
                    supplierName: clrSupplierName,
                    question: clrQuestion,
                    response: clrResponse,
                  },
                  "Logged RFQ clarification Q&A."
                );
                setClrQuestion("");
                setClrResponse("");
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Log Supplier Clarification Request
              </h3>
              <input
                placeholder="Supplier Name"
                value={clrSupplierName}
                onChange={(e) => setClrSupplierName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <input
                placeholder="Supplier Question..."
                value={clrQuestion}
                onChange={(e) => setClrQuestion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <input
                placeholder="Procurement Team Official Response..."
                value={clrResponse}
                onChange={(e) => setClrResponse(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                Record Clarification Q&amp;A
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: QUOTATION COMPARISON, WEIGHTED SCORING & OVERRIDE
         ===================================================================== */}
      {activeTab === "evaluation" && (
        <div className="space-y-6">
          {/* Configurable Weighted Scoring Matrix Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Configurable Weighted Scoring Engine
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Adjust Evaluation Criteria Weights (Real-Time Matrix Recalculation)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-emerald-400">
                Total Weight:{" "}
                {weightPrice + weightLeadTime + weightQuality + weightPastPerf}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-700 block">
                  1. Price Competitiveness Weight (%)
                </label>
                <input
                  type="number"
                  value={weightPrice}
                  onChange={(e) => setWeightPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-700 block">
                  2. Lead Time Speed Weight (%)
                </label>
                <input
                  type="number"
                  value={weightLeadTime}
                  onChange={(e) => setWeightLeadTime(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-700 block">
                  3. Quality Rating Weight (%)
                </label>
                <input
                  type="number"
                  value={weightQuality}
                  onChange={(e) => setWeightQuality(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-700 block">
                  4. Past Delivery Score Weight (%)
                </label>
                <input
                  type="number"
                  value={weightPastPerf}
                  onChange={(e) => setWeightPastPerf(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Tables per RFQ */}
          {orgRfqs.map((rfq) => {
            const minPrice =
              rfq.quotations.length > 0
                ? Math.min(...rfq.quotations.map((q) => q.quotedAmount))
                : 0;

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {rfq.rfqNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Linked PR: {rfq.prNumber} • Method:{" "}
                        {rfq.procurementMethod}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          rfq.status === "EVALUATED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {rfq.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewEvalPdf(rfq)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 self-start"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Export Evaluation &amp; Award Report PDF
                  </button>
                </div>

                {/* Side-by-Side Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-500">
                        <th className="py-2.5 pr-3">Supplier</th>
                        <th className="py-2.5 px-3">Quoted Price</th>
                        <th className="py-2.5 px-3">Lead Time</th>
                        <th className="py-2.5 px-3">Past Perf &amp; Quality</th>
                        <th className="py-2.5 px-3">Technical &amp; Warranty Specs</th>
                        <th className="py-2.5 px-3 text-center">
                          Weighted Score (/100)
                        </th>
                        <th className="py-2.5 pl-3 text-right">
                          Selection Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rfq.quotations.map((q) => {
                        const sup = orgSuppliers.find(
                          (s) => s.id === q.supplierId
                        );
                        const isCheapest = q.quotedAmount === minPrice;
                        const score = computeWeightedScore(
                          rfq,
                          q.quotedAmount,
                          q.leadTimeDays,
                          q.supplierId
                        );

                        return (
                          <tr
                            key={q.id}
                            className={
                              q.isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
                            }
                          >
                            <td className="py-3.5 pr-3">
                              <p className="font-bold text-slate-900">
                                {q.supplierName}
                              </p>
                              {isCheapest ? (
                                <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Lowest Price Quote
                                </span>
                              ) : (
                                <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                  +{formatCurrency(q.quotedAmount - minPrice)} vs
                                  Lowest
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-sm text-slate-900">
                              {formatCurrency(q.quotedAmount, q.currency)}
                            </td>
                            <td className="py-3.5 px-3 font-mono">
                              {q.leadTimeDays} days
                            </td>
                            <td className="py-3.5 px-3">
                              <p>
                                Delivery:{" "}
                                <strong>{sup?.deliveryTimeScore ?? 90}%</strong>
                              </p>
                              <p className="text-slate-500">
                                Quality:{" "}
                                <strong>{sup?.qualityRating ?? 4.5}/5.0 ★</strong>
                              </p>
                            </td>
                            <td className="py-3.5 px-3 max-w-xs text-slate-600">
                              {q.warrantyAndSpecsNote}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-slate-900 text-emerald-400">
                                {score} pts
                              </span>
                            </td>
                            <td className="py-3.5 pl-3 text-right">
                              {q.isSelected ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                                  <Award className="w-3.5 h-3.5" />
                                  Selected Winner
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      !isCheapest &&
                                      !evalOverrideReason[rfq.id]?.trim()
                                    ) {
                                      notify(
                                        "OVERRIDE ALERT: Because this is NOT the cheapest quote, please enter a Mandatory Override Reason below before awarding!"
                                      );
                                      return;
                                    }
                                    mutate(
                                      {
                                        action: "EVALUATE_AND_SELECT_QUOTE",
                                        rfqId: rfq.id,
                                        quoteId: q.id,
                                        selectionJustification:
                                          evalJustification[rfq.id] ||
                                          `Selected ${q.supplierName} with weighted score ${score}/100.`,
                                        cheapestOverrideReason:
                                          evalOverrideReason[rfq.id],
                                      },
                                      isCheapest
                                        ? `Awarded ${rfq.rfqNumber} to lowest-priced compliant bidder ${q.supplierName}.`
                                        : `Awarded ${rfq.rfqNumber} to ${q.supplierName} and recorded Cheapest-Quote Override Alert in Audit Log!`
                                    );
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                                >
                                  Select &amp; Award
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mandatory Selection Justification + Cheapest Override Reason Inputs */}
                <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mandatory Selection Justification (Audit Trail)
                    </label>
                    <input
                      placeholder="State technical & commercial justification for selected supplier..."
                      value={
                        evalJustification[rfq.id] ??
                        rfq.selectionJustification ??
                        ""
                      }
                      onChange={(e) =>
                        setEvalJustification((prev) => ({
                          ...prev,
                          [rfq.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-800 mb-1">
                      ⚠️ Override Reason (Required if Cheapest Quote is NOT Selected)
                    </label>
                    <input
                      placeholder="e.g. Cheapest bidder has 10-day lead time; urgent 4-day ex-stock required..."
                      value={
                        evalOverrideReason[rfq.id] ??
                        rfq.cheapestOverrideReason ??
                        ""
                      }
                      onChange={(e) =>
                        setEvalOverrideReason((prev) => ({
                          ...prev,
                          [rfq.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-amber-50/40"
                    />
                  </div>
                </div>

                {rfq.cheapestOverrideReason && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Audited Override Alert Recorded:</strong> Cheapest
                      quote bypassed in favor of{" "}
                      <strong>{rfq.selectedSupplierName}</strong> — Reason: &ldquo;
                      {rfq.cheapestOverrideReason}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          TAB 4: OPERATIONAL CONTRACT MANAGEMENT & AMENDMENTS
         ===================================================================== */}
      {activeTab === "contracts" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Operational Contract Cards */}
          <div className="lg:col-span-2 space-y-4">
            {orgContracts.map((cnt) => {
              const utilPct = Math.min(
                100,
                Math.round((cnt.utilizedSpend / cnt.ceilingValue) * 100)
              );
              const remaining = Math.max(
                0,
                cnt.ceilingValue - cnt.utilizedSpend
              );

              return (
                <div
                  key={cnt.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {cnt.contractNumber}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Version v{cnt.versionNumber}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {cnt.procurementMethod}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            cnt.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : cnt.status === "EXPIRING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {cnt.status} (Renewal Alert @ {cnt.renewalReminderDays}d)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {cnt.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Supplier: <strong>{cnt.supplierName}</strong> • Dept:{" "}
                        <strong>{cnt.departmentName}</strong> • Owner:{" "}
                        {cnt.ownerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Validity: <strong>{cnt.startDate}</strong> to{" "}
                        <strong>{cnt.endDate}</strong> • Signed Doc:{" "}
                        <code className="text-emerald-700">
                          {cnt.documentFileName}
                        </code>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Contract Ceiling</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(cnt.ceilingValue, cnt.currency)}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-700">
                        Remaining: {formatCurrency(remaining, cnt.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Contract Spend Utilization Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Linked PO Call-Off Spend:{" "}
                        <strong>{formatCurrency(cnt.utilizedSpend)}</strong> across{" "}
                        {cnt.linkedPoNumbers.length} POs (
                        {cnt.linkedPoNumbers.join(", ") || "None yet"})
                      </span>
                      <span className="font-bold text-slate-900">
                        {utilPct}% Utilized
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${utilPct}%` }}
                        className={`h-full rounded-full ${
                          utilPct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Amendment History */}
                  {cnt.amendments.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Contract Amendment
                        Version History
                      </p>
                      {cnt.amendments.map((a) => (
                        <div
                          key={a.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <span>
                            <strong>v{a.versionNumber}:</strong>{" "}
                            {a.amendmentSummary} ({formatCurrency(a.previousCeiling)}{" "}
                            → {formatCurrency(a.newCeiling)})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {a.amendedBy} • {a.amendedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Contract Amendment Form */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">
                      Amend Contract (v{cnt.versionNumber + 1}):
                    </span>
                    <input
                      type="number"
                      placeholder="New Ceiling (KES)"
                      value={amdCeiling[cnt.id] ?? cnt.ceilingValue}
                      onChange={(e) =>
                        setAmdCeiling((prev) => ({
                          ...prev,
                          [cnt.id]: e.target.value,
                        }))
                      }
                      className="w-32 px-2.5 py-1.5 rounded border border-slate-300"
                    />
                    <input
                      type="date"
                      value={amdEndDate[cnt.id] ?? cnt.endDate}
                      onChange={(e) =>
                        setAmdEndDate((prev) => ({
                          ...prev,
                          [cnt.id]: e.target.value,
                        }))
                      }
                      className="px-2.5 py-1.5 rounded border border-slate-300"
                    />
                    <input
                      placeholder="Amendment justification..."
                      value={amdSummary[cnt.id] || ""}
                      onChange={(e) =>
                        setAmdSummary((prev) => ({
                          ...prev,
                          [cnt.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        mutate(
                          {
                            action: "AMEND_CONTRACT",
                            contractId: cnt.id,
                            newCeiling: Number(
                              amdCeiling[cnt.id] ?? cnt.ceilingValue
                            ),
                            newEndDate: amdEndDate[cnt.id] ?? cnt.endDate,
                            amendmentSummary:
                              amdSummary[cnt.id] ||
                              "Extended contract ceiling and validity period.",
                          },
                          `Amended ${cnt.contractNumber} to Version v${cnt.versionNumber + 1}.`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    >
                      Save Amendment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Register New Operational Contract */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cntTitle) return;
                mutate(
                  {
                    action: "CREATE_CONTRACT",
                    title: cntTitle,
                    supplierId: cntSupplierId || orgSuppliers[0]?.id,
                    departmentId: cntDeptId || orgDepts[0]?.id,
                    procurementMethod: cntMethod,
                    startDate: cntStartDate,
                    endDate: cntEndDate,
                    renewalReminderDays: Number(cntReminder),
                    ceilingValue: Number(cntCeiling),
                  },
                  `Registered new operational supplier contract (${cntTitle}).`
                );
                setCntTitle("");
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 sticky top-24"
            >
              <h3 className="text-sm font-bold text-slate-900">
                Register Supplier Contract
              </h3>
              <input
                placeholder="Contract Title (e.g. Annual Lab Reagents Framework)"
                value={cntTitle}
                onChange={(e) => setCntTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Awarded Supplier
                </label>
                <select
                  value={cntSupplierId}
                  onChange={(e) => setCntSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {orgSuppliers
                    .filter((s) => !s.isBlacklisted)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.supplierCode})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Responsible Department
                </label>
                <select
                  value={cntDeptId}
                  onChange={(e) => setCntDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {orgDepts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={cntStartDate}
                    onChange={(e) => setCntStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={cntEndDate}
                    onChange={(e) => setCntEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ceiling Value (KES)
                  </label>
                  <input
                    type="number"
                    value={cntCeiling}
                    onChange={(e) => setCntCeiling(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Renewal Alert Window
                  </label>
                  <select
                    value={cntReminder}
                    onChange={(e) => setCntReminder(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="90">90 Days Advance</option>
                    <option value="60">60 Days Advance</option>
                    <option value="30">30 Days Advance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Procurement Method
                </label>
                <select
                  value={cntMethod}
                  onChange={(e) =>
                    setCntMethod(e.target.value as ProcurementMethodKey)
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="FRAMEWORK_AGREEMENT">
                    Framework Agreement
                  </option>
                  <option value="TENDER">Public / Selective Tender</option>
                  <option value="COMPETITIVE_QUOTATION">
                    Competitive Quotation
                  </option>
                  <option value="SINGLE_SOURCE">Single-Source</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Register Operational Contract
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          BRANDED RFQ DOCUMENT PDF MODAL
         ===================================================================== */}
      {previewRfqPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Branded Request for Quotation (RFQ) Template
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRfqPdf(null)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="p-5 rounded-xl text-white flex justify-between items-center"
              style={{ backgroundColor: activeOrg.primaryColor }}
            >
              <div>
                <h2 className="text-xl font-bold">{activeOrg.name}</h2>
                <p className="text-xs opacity-90">{activeOrg.documentHeader}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold bg-black/20 px-2.5 py-1 rounded">
                  REQUEST FOR QUOTATION
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {previewRfqPdf.rfqNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Source Requisition</span>
                <strong className="text-slate-900">
                  {previewRfqPdf.prNumber} ({previewRfqPdf.departmentName})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Submission Deadline</span>
                <strong className="text-rose-700">
                  {previewRfqPdf.submissionDeadline}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Procurement Method</span>
                <strong className="text-slate-900">
                  {previewRfqPdf.procurementMethod}
                </strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">
                Scope of Supply: {previewRfqPdf.title}
              </h4>
              <p className="text-slate-600">
                Invited Suppliers:{" "}
                {previewRfqPdf.invitedSupplierIds
                  .map(
                    (id) =>
                      orgSuppliers.find((s) => s.id === id)?.name || id
                  )
                  .join(", ")}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {activeOrg.documentFooter}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BRANDED QUOTATION EVALUATION & AWARD LETTER PDF MODAL
         ===================================================================== */}
      {previewEvalPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Quotation Evaluation Report &amp; Award Justification
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewEvalPdf(null)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="p-5 rounded-xl text-white flex justify-between items-center"
              style={{ backgroundColor: activeOrg.primaryColor }}
            >
              <div>
                <h2 className="text-xl font-bold">{activeOrg.name}</h2>
                <p className="text-xs opacity-90">{activeOrg.documentHeader}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold bg-black/20 px-2.5 py-1 rounded">
                  QUOTATION EVALUATION REPORT
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {previewEvalPdf.rfqNumber}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600">
                    <th className="py-2">Supplier</th>
                    <th className="py-2">Quoted Amount</th>
                    <th className="py-2">Lead Time</th>
                    <th className="py-2">Weighted Score</th>
                    <th className="py-2">Award Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewEvalPdf.quotations.map((q) => (
                    <tr key={q.id}>
                      <td className="py-2.5 font-bold">{q.supplierName}</td>
                      <td className="py-2.5 font-mono">
                        {formatCurrency(q.quotedAmount, q.currency)}
                      </td>
                      <td className="py-2.5">{q.leadTimeDays} days</td>
                      <td className="py-2.5 font-mono font-bold">
                        {computeWeightedScore(
                          previewEvalPdf,
                          q.quotedAmount,
                          q.leadTimeDays,
                          q.supplierId
                        )}{" "}
                        / 100
                      </td>
                      <td className="py-2.5">
                        {q.isSelected ? (
                          <strong className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> AWARDED
                          </strong>
                        ) : (
                          "Unselected"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewEvalPdf.selectionJustification && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p>
                  <strong>Selection Justification:</strong>{" "}
                  {previewEvalPdf.selectionJustification}
                </p>
                {previewEvalPdf.cheapestOverrideReason && (
                  <p className="text-amber-800">
                    <strong>Cheapest-Quote Override Justification:</strong>{" "}
                    {previewEvalPdf.cheapestOverrideReason}
                  </p>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {activeOrg.documentFooter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
