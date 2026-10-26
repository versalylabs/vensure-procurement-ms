"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RBAC_ROLES, RoleType, hasPermission } from "@/lib/rbac";
import type { Phase1DatabaseState } from "@/server/store/phase1-store";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Users,
  GitPullRequestDraft,
  Package,
  ShieldCheck,
  Plus,
  CheckCircle2,
  XCircle,
  UserCheck,
  Palette,
  History,
  Coins,
  Search,
  Sparkles,
  KeyRound,
} from "lucide-react";

type TabKey = "org" | "rbac" | "workflows" | "catalog" | "audit";

export default function Phase1AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-slate-500">
          Loading Administration, Settings &amp; RBAC Engine...
        </div>
      }
    >
      <Phase1AdminContent />
    </Suspense>
  );
}

function Phase1AdminContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "org";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [state, setState] = useState<Phase1DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Forms state
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [deptBudget, setDeptBudget] = useState("100000");

  const [ccCode, setCcCode] = useState("");
  const [ccName, setCcName] = useState("");
  const [ccDeptId, setCcDeptId] = useState("");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Operations & Clinical Facilities");
  const [inviteRole, setInviteRole] = useState<RoleType>("PROCUREMENT_OFFICER");

  const [delFromUser, setDelFromUser] = useState("");
  const [delToUser, setDelToUser] = useState("");
  const [delReason, setDelReason] = useState("Annual Leave / Vacation Cover");
  const [delEndDate, setDelEndDate] = useState("2026-10-25");

  const [catSku, setCatSku] = useState("");
  const [catName, setCatName] = useState("");
  const [catCategory, setCatCategory] = useState("Medical Equipment");
  const [catSpec, setCatSpec] = useState("");
  const [catUom, setCatUom] = useState("EA");
  const [catCost, setCatCost] = useState("450");
  const [catMethod, setCatMethod] = useState("RFQ");

  const [approvalComment, setApprovalComment] = useState<Record<string, string>>({});
  const [auditSearch, setAuditSearch] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabKey;
    if (
      tabParam &&
      ["org", "rbac", "workflows", "catalog", "audit"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/phase1")
      .then((r) => r.json())
      .then((data: Phase1DatabaseState) => {
        setState(data);
        setLoading(false);
      });

    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("vensure_theme", "dark");
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
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
        Loading Administration &amp; Multi-Tenant Settings...
      </div>
    );
  }

  const activeOrg =
    state.organizations.find((o) => o.id === state.activeOrganizationId) ??
    state.organizations[0];
  const activeUser =
    state.users.find((u) => u.id === state.activeUserId) ?? state.users[0];

  const orgBranches = state.branches.filter(
    (b) => b.organizationId === activeOrg.id
  );
  const orgDepartments = state.departments.filter(
    (d) => d.organizationId === activeOrg.id
  );
  const orgCostCenters = state.costCenters.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgUsers = state.users.filter(
    (u) => u.organizationId === activeOrg.id
  );
  const orgCatalog = state.catalogItems.filter(
    (c) => c.organizationId === activeOrg.id
  );
  const orgWorkflows = state.approvalWorkflows.filter(
    (w) => w.organizationId === activeOrg.id
  );
  const orgQueue = state.approvalQueue.filter(
    (q) => q.organizationId === activeOrg.id
  );
  const orgAuditLogs = state.auditLogs.filter(
    (a) =>
      a.organizationId === activeOrg.id &&
      (auditSearch.trim() === "" ||
        a.summary.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        a.actorName.toLowerCase().includes(auditSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/40 flex items-center gap-2.5 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Multi-Tenant & Active RBAC Session Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activeOrg.primaryColor }}
            />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Administration • Multi-Tenant &amp; RBAC Context
            </span>
          </div>
          <h2 className="text-lg font-bold">{activeOrg.name}</h2>
          <p className="text-xs text-slate-400">
            Tenant Slug: <code className="text-slate-200">{activeOrg.slug}</code> • Tax ID:{" "}
            <code className="text-slate-200">{activeOrg.taxId}</code> • Base Currency:{" "}
            <strong className="text-white">{activeOrg.baseCurrency}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tenant Switcher */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-400">
              Switch Client Organization (Multi-Tenant)
            </label>
            <select
              value={activeOrg.id}
              onChange={(e) =>
                mutate(
                  {
                    action: "SWITCH_ORGANIZATION",
                    organizationId: e.target.value,
                  },
                  "Switched active multi-tenant organization & isolated data scope."
                )
              }
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
            >
              {state.organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.industry})
                </option>
              ))}
            </select>
          </div>

          {/* Active User / RBAC Role Simulator */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-400">
              Simulate Active RBAC User Session
            </label>
            <select
              value={activeUser.id}
              onChange={(e) =>
                mutate(
                  {
                    action: "SWITCH_ACTIVE_USER",
                    userId: e.target.value,
                  },
                  "Switched active RBAC user session and recorded audit event."
                )
              }
              className="bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg px-3 py-2 font-medium"
            >
              {state.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email}) — [{u.role}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enterprise Unified Theme Status & Sign-In Gateway */}
      <div className="bg-[#1e1e2a] rounded-xl border border-[#272735] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#ededf3] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#5266eb]" />
            Enterprise Theme: Mercury Alpine Dark (Unified System-Wide)
          </p>
          <p className="text-[11px] text-[#c3c3cc]">
            Monochromatic Onyx (#171721), Graphite (#1e1e2a), and Cobalt (#5266eb) design system active throughout the website and workspace. Demo Login:{" "}
            <code className="font-mono font-semibold text-[#818cf8]">versalylabs@gmail.com</code> /{" "}
            <code className="font-mono font-semibold text-[#818cf8]">labversaly-16</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#5266eb]/15 border border-[#5266eb]/30 text-[#818cf8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
            Mercury Dark Active
          </span>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#272735] border border-[#272735] text-[#ededf3] hover:bg-[#323246] transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#5266eb]" />
            Open Sign-In Page (/login)
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          {
            id: "org",
            label: "1. Org, Branches & White-Label",
            icon: Building2,
          },
          {
            id: "rbac",
            label: "2. Users, 7-Role RBAC & Delegation",
            icon: Users,
          },
          {
            id: "workflows",
            label: "3. Approval Workflows & Live Queue",
            icon: GitPullRequestDraft,
          },
          {
            id: "catalog",
            label: "4. Product Catalog, Currency & Tax",
            icon: Package,
          },
          {
            id: "audit",
            label: `5. Immutable Audit Log (${orgAuditLogs.length})`,
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabKey)}
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

      {/* TAB 1: ORGANIZATION, MULTI-TENANCY & WHITE-LABEL BRANDING */}
      {activeTab === "org" && (
        <div className="space-y-6">
          {/* White-Label Branding Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Client White-Label Branding &amp; Document Header/Footer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Used on exported PDFs (PRs, RFQs, POs, GRNs, Award Letters) and the External Supplier Portal
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Permission Required: org:manage (
                {hasPermission(activeUser.role, "org:manage")
                  ? "Granted"
                  : "Read-Only"}
                )
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                mutate(
                  {
                    action: "UPDATE_BRANDING",
                    name: fd.get("name"),
                    taxId: fd.get("taxId"),
                    primaryColor: fd.get("primaryColor"),
                    baseCurrency: fd.get("baseCurrency"),
                    documentHeader: fd.get("documentHeader"),
                    documentFooter: fd.get("documentFooter"),
                  },
                  "Saved organization white-label branding & PDF template settings."
                );
              }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organization Legal Name
                </label>
                <input
                  name="name"
                  defaultValue={activeOrg.name}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tax ID / PIN Number
                </label>
                <input
                  name="taxId"
                  defaultValue={activeOrg.taxId}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Base Currency
                </label>
                <select
                  name="baseCurrency"
                  defaultValue={activeOrg.baseCurrency || "KES"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="KES">KES (KSh - Kenyan Shilling)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Brand Primary Hex Color
                </label>
                <input
                  name="primaryColor"
                  defaultValue={activeOrg.primaryColor}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Branded PDF Document Header
                </label>
                <input
                  name="documentHeader"
                  defaultValue={activeOrg.documentHeader}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Branded PDF Document Footer
                </label>
                <input
                  name="documentFooter"
                  defaultValue={activeOrg.documentFooter}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Save Branding &amp; Template Settings
                </button>
              </div>
            </form>
          </div>

          {/* Branches, Departments & Cost Centers Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Branches */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Company Branches ({orgBranches.length})
              </h3>
              <div className="space-y-2">
                {orgBranches.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{b.name}</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-slate-500">{b.address}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!branchCode || !branchName) return;
                  mutate(
                    {
                      action: "ADD_BRANCH",
                      code: branchCode,
                      name: branchName,
                      address: branchAddress || "Regional Office",
                      isHeadquarters: false,
                    },
                    `Added branch ${branchName} (${branchCode}).`
                  );
                  setBranchCode("");
                  setBranchName("");
                  setBranchAddress("");
                }}
                className="space-y-2 pt-2 border-t border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-700">
                  Add New Branch
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="Code (BR-KSM)"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                  <input
                    placeholder="Branch Name"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <input
                  placeholder="Physical Address"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Branch
                </button>
              </form>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Departments &amp; Budgets ({orgDepartments.length})
              </h3>
              <div className="space-y-2">
                {orgDepartments.map((d) => {
                  const available =
                    d.totalBudget - d.encumbered - d.committed - d.actualSpend;
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {d.name}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {d.code}
                        </span>
                      </div>
                      <p className="text-slate-500">HOD: {d.headName}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-700">
                        <span>Total: {formatCurrency(d.totalBudget)}</span>
                        <span className="font-semibold text-emerald-700">
                          Avail: {formatCurrency(available)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!deptCode || !deptName) return;
                  mutate(
                    {
                      action: "ADD_DEPARTMENT",
                      code: deptCode,
                      name: deptName,
                      headName: deptHead || "Department Head",
                      totalBudget: Number(deptBudget),
                    },
                    `Created department ${deptName} (${deptCode}).`
                  );
                  setDeptCode("");
                  setDeptName("");
                  setDeptHead("");
                }}
                className="space-y-2 pt-2 border-t border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-700">
                  Add Department
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="DEPT-FIN"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                  <input
                    placeholder="Department Name"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="HOD Name"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                  <input
                    type="number"
                    placeholder="Annual Budget (KES)"
                    value={deptBudget}
                    onChange={(e) => setDeptBudget(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Department
                </button>
              </form>
            </div>

            {/* Cost Centers */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Cost Centers ({orgCostCenters.length})
              </h3>
              <div className="space-y-2">
                {orgCostCenters.map((cc) => (
                  <div
                    key={cc.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {cc.name}
                      </span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {cc.code}
                      </span>
                    </div>
                    <p className="text-slate-500">Dept: {cc.departmentName}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ccCode || !ccName) return;
                  mutate(
                    {
                      action: "ADD_COST_CENTER",
                      code: ccCode,
                      name: ccName,
                      departmentId: ccDeptId || orgDepartments[0]?.id,
                    },
                    `Created cost center ${ccName} (${ccCode}).`
                  );
                  setCcCode("");
                  setCcName("");
                }}
                className="space-y-2 pt-2 border-t border-slate-200"
              >
                <p className="text-xs font-semibold text-slate-700">
                  Add Cost Center
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="CC-4010"
                    value={ccCode}
                    onChange={(e) => setCcCode(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                  <input
                    placeholder="Cost Center Name"
                    value={ccName}
                    onChange={(e) => setCcName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <select
                  value={ccDeptId}
                  onChange={(e) => setCcDeptId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                >
                  {orgDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Cost Center
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS, 7-ROLE RBAC & VACATION DELEGATION */}
      {activeTab === "rbac" && (
        <div className="space-y-6">
          {/* 7 RBAC Roles Reference Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              7-Role Access Control Matrix
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.values(RBAC_ROLES).map((r) => (
                <div
                  key={r.role}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}
                    >
                      {r.role}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {r.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {r.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Directory + Invite User + Vacation Delegation */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Organization Users &amp; Live Role Assignment ({orgUsers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-3">Name &amp; Email</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">RBAC Role</th>
                      <th className="py-2.5 pl-3">Vacation Delegation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orgUsers.map((u) => {
                      const delegatee = state.users.find(
                        (x) => x.id === u.delegatedToUserId
                      );
                      return (
                        <tr key={u.id}>
                          <td className="py-3 pr-3">
                            <p className="font-semibold text-slate-900">
                              {u.fullName}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              {u.email}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {u.departmentName}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                mutate(
                                  {
                                    action: "UPDATE_USER_ROLE",
                                    userId: u.id,
                                    role: e.target.value,
                                  },
                                  `Updated ${u.fullName}'s role to ${e.target.value}.`
                                )
                              }
                              className="px-2 py-1 rounded border border-slate-300 text-xs font-medium bg-white"
                            >
                              {Object.keys(RBAC_ROLES).map((rk) => (
                                <option key={rk} value={rk}>
                                  {rk}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pl-3">
                            {delegatee ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                                <UserCheck className="w-3 h-3" />
                                Cover: {delegatee.fullName} (until{" "}
                                {u.delegationEnd})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                No active delegation
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invite User & Vacation Delegation Forms */}
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inviteName || !inviteEmail) return;
                  mutate(
                    {
                      action: "INVITE_USER",
                      fullName: inviteName,
                      email: inviteEmail,
                      departmentName: inviteDept,
                      role: inviteRole,
                    },
                    `Invited ${inviteName} as ${inviteRole}.`
                  );
                  setInviteName("");
                  setInviteEmail("");
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  Invite User &amp; Assign Role
                </h3>
                <input
                  placeholder="Full Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  placeholder="Department Name"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {Object.keys(RBAC_ROLES).map((rk) => (
                    <option key={rk} value={rk}>
                      {rk} — {RBAC_ROLES[rk as RoleType].label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Send Invitation &amp; Log Audit Event
                </button>
              </form>

              {/* Approval Delegation (Vacation Cover) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fromId = delFromUser || orgUsers[0]?.id;
                  const toId = delToUser || orgUsers[1]?.id;
                  if (!fromId || !toId) return;
                  mutate(
                    {
                      action: "SET_DELEGATION",
                      fromUserId: fromId,
                      toUserId: toId,
                      reason: delReason,
                      endDate: delEndDate,
                    },
                    "Activated approval vacation delegation cover."
                  );
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  Approval Delegation / Vacation Cover
                </h3>
                <p className="text-xs text-slate-500">
                  Temporarily route pending sign-offs to an alternate approver with full audit traceability.
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Approver Going on Leave
                  </label>
                  <select
                    value={delFromUser}
                    onChange={(e) => setDelFromUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {orgUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Delegate Authority To
                  </label>
                  <select
                    value={delToUser}
                    onChange={(e) => setDelToUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    {orgUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  placeholder="Delegation Reason"
                  value={delReason}
                  onChange={(e) => setDelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <input
                  type="date"
                  value={delEndDate}
                  onChange={(e) => setDelEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Activate Vacation Cover
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURABLE APPROVAL WORKFLOWS & LIVE QUEUE */}
      {activeTab === "workflows" && (
        <div className="space-y-6">
          {/* Configured Multi-Level Approval Chains */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Configurable Multi-Level Approval Matrix &amp; Thresholds
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {orgWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {wf.targetDocument}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {wf.name}
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {wf.steps.map((s) => (
                      <div
                        key={s.stepOrder}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            {s.stepName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Role: <strong>{s.approverRole}</strong> • SLA:{" "}
                            {s.slaHours}h
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                          {s.minThresholdAmount === 0
                            ? "All Amounts"
                            : `> ${formatCurrency(s.minThresholdAmount)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Interactive Approval Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Approval Execution Queue (Test Threshold Routing &amp; Comments)
              </h3>
              <p className="text-xs text-slate-500">
                Approve or reject transactions below as{" "}
                <strong>
                  {activeUser.fullName} ({activeUser.role})
                </strong>{" "}
                to see multi-step progression and automatic audit logging.
              </p>
            </div>

            <div className="space-y-4">
              {orgQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {item.referenceNo}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {item.departmentName}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            item.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Transaction Value</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Step History Timeline */}
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" /> Approval Chain &amp; Timestamped Audit Comments
                    </p>
                    {item.history.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">
                            {h.stepName}
                          </p>
                          <p className="text-slate-600">
                            Actor: <strong>{h.actorName}</strong> ({h.actorRole})
                            {h.delegatedFrom && (
                              <span className="ml-2 text-amber-700 font-medium">
                                [Vacation Cover for {h.delegatedFrom}]
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 italic">
                            &ldquo;{h.comment}&rdquo;
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[11px] text-slate-400">
                            {h.timestamp}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              h.decision === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : h.decision === "REJECTED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {h.decision}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Controls if Under Review */}
                  {item.status === "UNDER_REVIEW" && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                      <input
                        placeholder="Enter mandatory approval or rejection comment..."
                        value={approvalComment[item.id] || ""}
                        onChange={(e) =>
                          setApprovalComment((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "PROCESS_APPROVAL_DECISION",
                              queueId: item.id,
                              decision: "APPROVED",
                              comment:
                                approvalComment[item.id] ||
                                `Approved by ${activeUser.fullName} (${activeUser.role}).`,
                            },
                            `Approved current step on ${item.referenceNo}.`
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Step
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          mutate(
                            {
                              action: "PROCESS_APPROVAL_DECISION",
                              queueId: item.id,
                              decision: "REJECTED",
                              comment:
                                approvalComment[item.id] ||
                                "Rejected: Please revise quantities and resubmit.",
                            },
                            `Rejected ${item.referenceNo} with mandatory audit reason.`
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCT CATALOG, MULTI-CURRENCY & TAX SETUP */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Standard Item / Product Catalog with Pre-Filled Specs ({orgCatalog.length})
              </h3>
              <div className="space-y-3">
                {orgCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-900">
                          {item.sku}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px]">
                          Method: {item.defaultMethod}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {item.name}
                      </h4>
                      <p className="text-slate-500">{item.specification}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Reference Cost</p>
                      <p className="text-base font-bold text-slate-900">
                        {formatCurrency(item.referenceUnitCost, item.currency)}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          / {item.unitOfMeasure}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Catalog Item Form */}
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!catSku || !catName) return;
                  mutate(
                    {
                      action: "ADD_CATALOG_ITEM",
                      sku: catSku,
                      name: catName,
                      category: catCategory,
                      specification: catSpec,
                      unitOfMeasure: catUom,
                      referenceUnitCost: Number(catCost),
                      currency: activeOrg.baseCurrency,
                      defaultMethod: catMethod,
                    },
                    `Added catalog item ${catSku} (${catName}).`
                  );
                  setCatSku("");
                  setCatName("");
                  setCatSpec("");
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900">
                  Add Standard Catalog Item
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="SKU (e.g. LAB-099)"
                    value={catSku}
                    onChange={(e) => setCatSku(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    placeholder="Category"
                    value={catCategory}
                    onChange={(e) => setCatCategory(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <input
                  placeholder="Standard Item Name"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <textarea
                  placeholder="Pre-filled technical specification..."
                  value={catSpec}
                  onChange={(e) => setCatSpec(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="UOM (EA, BOX, KIT)"
                    value={catUom}
                    onChange={(e) => setCatUom(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="number"
                    placeholder="Unit Cost (KES)"
                    value={catCost}
                    onChange={(e) => setCatCost(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Default Procurement Method
                  </label>
                  <select
                    value={catMethod}
                    onChange={(e) => setCatMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  >
                    <option value="DIRECT_PURCHASE">Direct Purchase</option>
                    <option value="RFQ">Standard RFQ</option>
                    <option value="COMPETITIVE_QUOTATION">
                      Competitive Quotation (Min 3 Quotes)
                    </option>
                    <option value="TENDER">Public / Selective Tender</option>
                    <option value="FRAMEWORK_AGREEMENT">
                      Framework Agreement Call-Off
                    </option>
                    <option value="SINGLE_SOURCE">Single-Source</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Save to Master Catalog
                </button>
              </form>

              {/* Multi-Currency & Tax Rates */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Multi-Currency &amp; Tax Rules
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  {state.currencies.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <span className="font-semibold">
                        {c.code} ({c.symbol}) — {c.name}
                      </span>
                      <span className="font-mono">
                        Rate: {c.exchangeRate} {c.isBase ? "(Base)" : ""}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                  {state.taxRates.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <span>{t.name}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {t.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT LOG VIEWER */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Every action records Actor, RBAC Role, Entity, Summary, IP Address, and Timestamp
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                placeholder="Filter by user, action, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            {orgAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[11px]">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {log.actorName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {log.actorRole}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-600">
                      {log.entityType}: {log.entityId}
                    </span>
                  </div>
                  <p className="text-slate-700">{log.summary}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                  <p>{log.timestamp}</p>
                  <p>IP: {log.ipAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
