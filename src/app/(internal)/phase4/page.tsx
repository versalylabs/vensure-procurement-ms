"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  GoodsReceiptNoteRecord,
  Phase1DatabaseState,
  PurchaseOrderRecord,
} from "@/server/store/phase1-store";
import { formatCurrency } from "@/lib/utils";
import {
  PackageCheck,
  Truck,
  Globe,
  Plus,
  FileText,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  EyeOff,
  Eye,
  History,
  ArrowRight,
} from "lucide-react";

type Phase4Tab = "po" | "grn";

export default function Phase4Page() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          Loading Purchase Orders &amp; Warehouse GRN Engine...
        </div>
      }
    >
      <Phase4Content />
    </Suspense>
  );
}

function Phase4Content() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Phase4Tab) || "po";

  const [activeTab, setActiveTab] = useState<Phase4Tab>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Warehouse Mode Toggle (Module 13 requirement: Warehouse staff can confirm receipt without finance access)
  const [warehouseNoFinanceMode, setWarehouseNoFinanceMode] = useState(false);

  // Create PO Form State
  const [poRfqId, setPoRfqId] = useState("");
  const [poContractId, setPoContractId] = useState("");
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poDeptId, setPoDeptId] = useState("");
  const [poTitle, setPoTitle] = useState("");
  const [poSku, setPoSku] = useState("OPS-PPE-N95");
  const [poQty, setPoQty] = useState("100");
  const [poUom, setPoUom] = useState("BOX");
  const [poUnitPrice, setPoUnitPrice] = useState("59.5");
  const [poDeliveryDate, setPoDeliveryDate] = useState("2026-10-28");
  const [poAllowSplit, setPoAllowSplit] = useState(true);

  // PO Amendment State
  const [amdQty, setAmdQty] = useState<Record<string, string>>({});
  const [amdPrice, setAmdPrice] = useState<Record<string, string>>({});
  const [amdNote, setAmdNote] = useState<Record<string, string>>({});

  // GRN Creation Form State
  const [grnPoId, setGrnPoId] = useState("");
  const [grnDeliveryRef, setGrnDeliveryRef] = useState("DN-SUP-2026-104");
  const [grnReceivedBy, setGrnReceivedBy] = useState(
    "Josephine Mutiso (Central Warehouse)"
  );
  const [grnReceivedQty, setGrnReceivedQty] = useState("4");
  const [grnDamagedQty, setGrnDamagedQty] = useState("0");
  const [grnCondition, setGrnCondition] = useState<
    "GOOD" | "SHORTAGE" | "DAMAGED" | "SUBSTITUTED"
  >("GOOD");
  const [grnNote, setGrnNote] = useState("");

  // Branded PDF Modals
  const [previewPoPdf, setPreviewPoPdf] = useState<PurchaseOrderRecord | null>(
    null
  );
  const [previewGrnPdf, setPreviewGrnPdf] =
    useState<GoodsReceiptNoteRecord | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab") as Phase4Tab;
    if (t && ["po", "grn"].includes(t)) {
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
        Loading Purchase Orders &amp; Warehouse GRN Engine...
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ??
    state.organizations[0];
  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) ?? state.users[0];

  const orgPOs = state.purchaseOrders.filter(
    (p) => p.organizationId === activeOrg.id
  );
  const orgGRNs = state.goodsReceipts.filter(
    (g) => g.organizationId === activeOrg.id
  );
  const orgSuppliers = state.suppliers.filter(
    (s) => s.organizationId === activeOrg.id && !s.isBlacklisted
  );
  const orgDepts = state.departments.filter(
    (d) => d.organizationId === activeOrg.id
  );
  const orgContracts = state.contracts.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgRfqs = state.rfqs.filter((r) => r.organizationId === activeOrg.id);

  function handleSelectRfqForPo(rfqId: string) {
    setPoRfqId(rfqId);
    const found = orgRfqs.find((r) => r.id === rfqId);
    if (found) {
      setPoTitle(found.title);
      if (found.selectedSupplierId) {
        setPoSupplierId(found.selectedSupplierId);
      }
      if (found.awardedAmount) {
        setPoQty("1");
        setPoUom("LOT");
        setPoUnitPrice(String(found.awardedAmount));
      }
    }
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
            Order Fulfillment &amp; Supplier Portal Sync • {activeOrg.name}
          </span>
          <h2 className="text-lg font-bold">
            Purchase Orders (PO), External Supplier Portal &amp; Goods Receipt Notes (GRN)
          </h2>
          <p className="text-xs text-slate-400">
            Active Officer: <strong className="text-white">{activeUser.fullName}</strong> •
            Issuing a PO transitions budget from Encumbered (PR) to Committed (PO).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal"
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition"
          >
            <Globe className="w-4 h-4" />
            Open External Supplier Portal
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs + Warehouse Finance-Masking Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("po")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "po"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            1. Purchase Orders &amp; Amendments ({orgPOs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("grn")}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "grn"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Truck className="w-4 h-4" />
            2. Warehouse Goods Receipt Notes — GRN ({orgGRNs.length})
          </button>
        </div>

        {/* Warehouse Staff Finance-Masking Toggle (Module 13 requirement) */}
        <button
          type="button"
          onClick={() => setWarehouseNoFinanceMode((v) => !v)}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 transition ${
            warehouseNoFinanceMode
              ? "bg-amber-100 text-amber-900 border-amber-300"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {warehouseNoFinanceMode ? (
            <>
              <EyeOff className="w-4 h-4 text-amber-700" />
              Warehouse Clerk View Active (Finance Data Hidden)
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-slate-500" />
              Toggle Warehouse View (Hide Prices)
            </>
          )}
        </button>
      </div>

      {/* =====================================================================
          TAB 1: PURCHASE ORDERS (PO) & VERSION AMENDMENTS
         ===================================================================== */}
      {activeTab === "po" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Active & Historical POs */}
          <div className="lg:col-span-2 space-y-4">
            {orgPOs.map((po) => {
              const line = po.items[0];
              const deliveryPct =
                line && line.orderedQty > 0
                  ? Math.min(
                      100,
                      Math.round((line.receivedQty / line.orderedQty) * 100)
                    )
                  : 0;

              return (
                <div
                  key={po.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {po.poNumber}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Rev v{po.versionNumber}
                        </span>
                        {po.contractNumber && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Contract: {po.contractNumber}
                          </span>
                        )}
                        {po.rfqNumber && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                            From {po.rfqNumber}
                          </span>
                        )}
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            po.status === "COMPLETED" ||
                            po.status === "ACKNOWLEDGED"
                              ? "bg-emerald-100 text-emerald-800"
                              : po.status === "PARTIALLY_DELIVERED"
                                ? "bg-blue-100 text-blue-800"
                                : po.status === "CANCELLED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {po.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Supplier: <strong>{po.supplierName}</strong> • Dept:{" "}
                        <strong>{po.departmentName}</strong> • Expected Delivery:{" "}
                        <strong>{po.expectedDeliveryDate}</strong>
                        {po.confirmedDeliveryDate && (
                          <span className="text-emerald-700 font-semibold">
                            {" "}
                            (Supplier Confirmed: {po.confirmedDeliveryDate})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-2">
                      {!warehouseNoFinanceMode && (
                        <div>
                          <p className="text-xs text-slate-500">
                            Committed PO Total
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency(po.totalAmount, po.currency)}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setPreviewPoPdf(po)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          Branded PO PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGrnPoId(po.id);
                            setActiveTab("grn");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                        >
                          Receive Goods (GRN) →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Acknowledgment Banner */}
                  {po.supplierAckNote && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span>
                        <strong>Supplier Portal Acknowledgment:</strong> &ldquo;
                        {po.supplierAckNote}&rdquo;
                      </span>
                      <Link
                        href="/portal"
                        className="text-emerald-700 underline font-semibold shrink-0 ml-2"
                      >
                        View in Portal →
                      </Link>
                    </div>
                  )}

                  {/* Split Delivery Progress Bar */}
                  {line && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">
                          Line Item: <strong>{line.description}</strong> (
                          <code>{line.sku}</code>) — Received{" "}
                          <strong>
                            {line.receivedQty} of {line.orderedQty}{" "}
                            {line.unitOfMeasure}
                          </strong>
                          {!warehouseNoFinanceMode &&
                            ` @ ${formatCurrency(line.unitPrice)}/${line.unitOfMeasure}`}
                        </span>
                        <span className="font-bold text-slate-900">
                          {deliveryPct}% Delivered
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${deliveryPct}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* PO Amendment History */}
                  {po.amendments.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> PO Amendment Trail
                      </p>
                      {po.amendments.map((a) => (
                        <div
                          key={a.id}
                          className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <span>
                            <strong>Rev v{a.versionNumber}:</strong>{" "}
                            {a.amendmentNote} (
                            {formatCurrency(a.previousAmount)} →{" "}
                            {formatCurrency(a.newAmount)})
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {a.amendedBy} • {a.amendedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PO Amendment & Cancellation Controls */}
                  {po.status !== "CANCELLED" && po.status !== "COMPLETED" && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          Amend PO (v{po.versionNumber + 1}):
                        </span>
                        <input
                          type="number"
                          placeholder="New Qty"
                          value={
                            amdQty[po.id] ?? String(line?.orderedQty ?? 10)
                          }
                          onChange={(e) =>
                            setAmdQty((prev) => ({
                              ...prev,
                              [po.id]: e.target.value,
                            }))
                          }
                          className="w-20 px-2 py-1.5 rounded border border-slate-300"
                        />
                        {!warehouseNoFinanceMode && (
                          <input
                            type="number"
                            placeholder="Unit Price (KES)"
                            value={
                              amdPrice[po.id] ?? String(line?.unitPrice ?? 100)
                            }
                            onChange={(e) =>
                              setAmdPrice((prev) => ({
                                ...prev,
                                [po.id]: e.target.value,
                              }))
                            }
                            className="w-24 px-2 py-1.5 rounded border border-slate-300"
                          />
                        )}
                        <input
                          placeholder="Amendment note..."
                          value={amdNote[po.id] || ""}
                          onChange={(e) =>
                            setAmdNote((prev) => ({
                              ...prev,
                              [po.id]: e.target.value,
                            }))
                          }
                          className="w-44 px-2.5 py-1.5 rounded border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            mutate(
                              {
                                action: "AMEND_PURCHASE_ORDER",
                                poId: po.id,
                                orderedQty: Number(
                                  amdQty[po.id] ?? line?.orderedQty ?? 10
                                ),
                                unitPrice: Number(
                                  amdPrice[po.id] ?? line?.unitPrice ?? 100
                                ),
                                amendmentNote:
                                  amdNote[po.id] ||
                                  "Revised order quantity and schedule.",
                              },
                              `Amended ${po.poNumber} to Rev v${po.versionNumber + 1} and adjusted Committed Budget.`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                        >
                          Save Amendment
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "CANCEL_PURCHASE_ORDER",
                              poId: po.id,
                            },
                            `Cancelled ${po.poNumber} and released ${formatCurrency(po.totalAmount)} back to Available Budget!`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel PO &amp; Release Budget
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Auto-Generate PO from Selected Quote or Contract */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  {
                    action: "CREATE_PO_FROM_QUOTE_OR_CONTRACT",
                    rfqId: poRfqId || undefined,
                    contractId: poContractId || undefined,
                    supplierId: poSupplierId || orgSuppliers[0]?.id,
                    departmentId: poDeptId || orgDepts[0]?.id,
                    title: poTitle || "Purchase Order Supply",
                    sku: poSku,
                    itemDescription: poTitle || "Standard Supply Item",
                    orderedQty: Number(poQty),
                    unitOfMeasure: poUom,
                    unitPrice: Number(poUnitPrice),
                    expectedDeliveryDate: poDeliveryDate,
                    allowSplitDelivery: poAllowSplit,
                  },
                  "Issued Purchase Order, transitioned budget from Encumbered → Committed, and dispatched to Supplier Portal!"
                );
                setPoTitle("");
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 sticky top-24"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Auto-Generate Purchase Order
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Issue New Purchase Order (PO)
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Auto-Fill from Evaluated RFQ (Optional)
                </label>
                <select
                  value={poRfqId}
                  onChange={(e) => handleSelectRfqForPo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50"
                >
                  <option value="">— Direct / Call-Off PO —</option>
                  {orgRfqs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.rfqNumber}: {r.title.slice(0, 32)}... ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Link to Active Contract (Optional)
                </label>
                <select
                  value={poContractId}
                  onChange={(e) => setPoContractId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="">— No Linked Contract —</option>
                  {orgContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Supplier
                  </label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {orgSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={poDeptId}
                    onChange={(e) => setPoDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {orgDepts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                placeholder="PO Title / Description"
                value={poTitle}
                onChange={(e) => setPoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500">
                    Ordered Qty
                  </label>
                  <input
                    type="number"
                    value={poQty}
                    onChange={(e) => setPoQty(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">
                    UOM
                  </label>
                  <input
                    value={poUom}
                    onChange={(e) => setPoUom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500">
                    Unit Price (KES)
                  </label>
                  <input
                    type="number"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={poDeliveryDate}
                  onChange={(e) => setPoDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={poAllowSplit}
                  onChange={(e) => setPoAllowSplit(e.target.checked)}
                />
                Allow Partial / Split Deliveries (Multiple GRNs)
              </label>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">Committed PO Value:</span>
                <strong className="text-base text-slate-900">
                  {formatCurrency(
                    Number(poQty || 0) * Number(poUnitPrice || 0)
                  )}
                </strong>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Issue PO &amp; Dispatch to Supplier Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GOODS RECEIPT NOTE (GRN) & WAREHOUSE MODE
         ===================================================================== */}
      {activeTab === "grn" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Recorded GRNs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Warehouse Receiving &amp; Inspection
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Recorded Goods Receipt Notes ({orgGRNs.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Feeds directly into Automated 3-Way Matching (PO ↔ GRN ↔ Invoice)
                </p>
              </div>
            </div>

            {orgGRNs.map((grn) => (
              <div
                key={grn.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {grn.grnNumber}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Against {grn.poNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          grn.status === "FULLY_RECEIVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {grn.status}
                      </span>
                      {grn.hasDiscrepancy && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3" />
                          Discrepancy Flagged
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      Supplier: {grn.supplierName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Department: <strong>{grn.departmentName}</strong> •
                      Received By: <strong>{grn.receivedBy}</strong> • Delivery
                      Note: <code>{grn.deliveryNoteRef}</code> • Timestamp:{" "}
                      {grn.receivedAt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewGrnPdf(grn)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Branded GRN PDF
                  </button>
                </div>

                {/* GRN Line Items (No Financial Prices Shown for Warehouse Safety!) */}
                <div className="overflow-x-auto pt-2 border-t border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="pb-1.5">SKU</th>
                        <th className="pb-1.5">Item Description</th>
                        <th className="pb-1.5 text-right">PO Ordered</th>
                        <th className="pb-1.5 text-right">Received This GRN</th>
                        <th className="pb-1.5 text-right">Damaged / Short</th>
                        <th className="pb-1.5 text-right">Inspection Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grn.items.map((item) => (
                        <tr key={item.id} className="text-slate-800">
                          <td className="py-2 font-mono">{item.sku}</td>
                          <td className="py-2 font-semibold">
                            {item.description}
                          </td>
                          <td className="py-2 text-right font-mono">
                            {item.orderedQty} {item.unitOfMeasure}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-emerald-700">
                            {item.receivedQtyThisGrn} {item.unitOfMeasure}
                          </td>
                          <td className="py-2 text-right font-mono text-rose-700">
                            {item.damagedOrShortQty} {item.unitOfMeasure}
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                item.conditionFlag === "GOOD"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.conditionFlag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {grn.items[0]?.discrepancyNote && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong>Warehouse Inspection &amp; Discrepancy Note:</strong>{" "}
                    &ldquo;{grn.items[0].discrepancyNote}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column: Record New Warehouse GRN */}
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  {
                    action: "RECORD_GOODS_RECEIPT_GRN",
                    poId: grnPoId || orgPOs[0]?.id,
                    deliveryNoteRef: grnDeliveryRef,
                    receivedBy: grnReceivedBy,
                    receivedQtyThisGrn: Number(grnReceivedQty),
                    damagedOrShortQty: Number(grnDamagedQty),
                    conditionFlag: grnCondition,
                    discrepancyNote: grnNote,
                  },
                  "Recorded Goods Receipt Note (GRN) and updated PO delivery status!"
                );
                setGrnNote("");
              }}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 sticky top-24"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Warehouse Receipt Confirmation
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Record Goods Receipt Note (GRN)
                </h3>
                <p className="text-xs text-slate-500">
                  Confirm physical quantities without exposing financial invoice totals.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Open Purchase Order
                </label>
                <select
                  value={grnPoId}
                  onChange={(e) => setGrnPoId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {orgPOs
                    .filter((p) => p.status !== "CANCELLED")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.poNumber} — {p.supplierName} (Rec:{" "}
                        {p.items[0]?.receivedQty}/{p.items[0]?.orderedQty}{" "}
                        {p.items[0]?.unitOfMeasure})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Supplier Delivery Note #
                  </label>
                  <input
                    value={grnDeliveryRef}
                    onChange={(e) => setGrnDeliveryRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Warehouse Receiving Clerk
                  </label>
                  <input
                    value={grnReceivedBy}
                    onChange={(e) => setGrnReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Accepted Qty Received Now
                  </label>
                  <input
                    type="number"
                    value={grnReceivedQty}
                    onChange={(e) => setGrnReceivedQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Shortage / Damaged Qty
                  </label>
                  <input
                    type="number"
                    value={grnDamagedQty}
                    onChange={(e) => setGrnDamagedQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physical Inspection Flag
                </label>
                <select
                  value={grnCondition}
                  onChange={(e) =>
                    setGrnCondition(
                      e.target.value as
                        | "GOOD"
                        | "SHORTAGE"
                        | "DAMAGED"
                        | "SUBSTITUTED"
                    )
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="GOOD">
                    GOOD — Full Spec &amp; Quality Verified
                  </option>
                  <option value="SHORTAGE">
                    SHORTAGE — Partial / Short Delivery
                  </option>
                  <option value="DAMAGED">
                    DAMAGED — Defective / Damaged Packaging
                  </option>
                  <option value="SUBSTITUTED">
                    SUBSTITUTED — Alternate Brand/Spec Delivered
                  </option>
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Inspection remarks, batch numbers, or shortage/damage details..."
                value={grnNote}
                onChange={(e) => setGrnNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Confirm Receipt &amp; Generate GRN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          BRANDED PURCHASE ORDER PDF MODAL
         ===================================================================== */}
      {previewPoPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Branded Purchase Order (PO) Document
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
                  onClick={() => setPreviewPoPdf(null)}
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
                  OFFICIAL PURCHASE ORDER
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {previewPoPdf.poNumber} (v{previewPoPdf.versionNumber})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Awarded Supplier</span>
                <strong className="text-slate-900">
                  {previewPoPdf.supplierName}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Delivery Schedule</span>
                <strong className="text-slate-900">
                  Expected: {previewPoPdf.expectedDeliveryDate}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">PO Status</span>
                <strong className="text-emerald-700">
                  {previewPoPdf.status}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Ordered Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewPoPdf.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-3 font-mono">{it.sku}</td>
                      <td className="py-3 font-bold">{it.description}</td>
                      <td className="py-3 text-right font-mono">
                        {it.orderedQty} {it.unitOfMeasure}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {activeOrg.documentFooter}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BRANDED GRN PDF MODAL
         ===================================================================== */}
      {previewGrnPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Branded Goods Receipt Note (GRN)
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
                  onClick={() => setPreviewGrnPdf(null)}
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
                  GOODS RECEIPT NOTE (GRN)
                </span>
                <p className="text-lg font-mono font-bold mt-1">
                  {previewGrnPdf.grnNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Purchase Order Ref</span>
                <strong className="text-slate-900">
                  {previewGrnPdf.poNumber} ({previewGrnPdf.supplierName})
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Delivery Note Ref</span>
                <strong className="text-slate-900">
                  {previewGrnPdf.deliveryNoteRef}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Received By</span>
                <strong className="text-emerald-700">
                  {previewGrnPdf.receivedBy}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600">
                    <th className="py-2">SKU</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">PO Ordered</th>
                    <th className="py-2 text-right">Accepted Qty</th>
                    <th className="py-2 text-right">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewGrnPdf.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-3 font-mono">{it.sku}</td>
                      <td className="py-3 font-bold">{it.description}</td>
                      <td className="py-3 text-right font-mono">
                        {it.orderedQty} {it.unitOfMeasure}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        {it.receivedQtyThisGrn} {it.unitOfMeasure}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {it.conditionFlag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
              {activeOrg.documentFooter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
