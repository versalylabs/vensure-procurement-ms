export type RoleType =
  | "ADMIN"
  | "DEPARTMENT_HEAD"
  | "PROCUREMENT_OFFICER"
  | "FINANCE"
  | "APPROVER"
  | "VIEWER"
  | "SUPPLIER";

export interface RoleMetadata {
  role: RoleType;
  label: string;
  badgeColor: string;
  description: string;
  permissions: string[];
}

export const RBAC_ROLES: Record<RoleType, RoleMetadata> = {
  ADMIN: {
    role: "ADMIN",
    label: "System Administrator",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    description:
      "Full multi-tenant configuration, RBAC management, approval matrix setup, and audit log inspection.",
    permissions: [
      "org:manage",
      "users:manage",
      "workflows:manage",
      "catalog:manage",
      "pr:create",
      "pr:approve",
      "po:manage",
      "finance:manage",
      "audit:view",
    ],
  },
  DEPARTMENT_HEAD: {
    role: "DEPARTMENT_HEAD",
    label: "Department Head (HOD)",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    description:
      "Creates department procurement plans, raises PRs, and performs Level-1 departmental approvals.",
    permissions: [
      "plan:create",
      "pr:create",
      "pr:approve_dept",
      "budget:view_dept",
      "audit:view",
    ],
  },
  PROCUREMENT_OFFICER: {
    role: "PROCUREMENT_OFFICER",
    label: "Procurement Officer",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description:
      "Manages sourcing (RFQs, tenders), supplier onboarding, quote evaluation, contracts, and PO issuance.",
    permissions: [
      "pr:create",
      "rfq:manage",
      "suppliers:manage",
      "quotes:evaluate",
      "contracts:manage",
      "po:manage",
      "grn:manage",
      "audit:view",
    ],
  },
  FINANCE: {
    role: "FINANCE",
    label: "Finance & Budget Controller",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    description:
      "Configures department budgets, verifies 3-way match (PO ↔ GRN ↔ Invoice), and authorizes payments.",
    permissions: [
      "budget:manage",
      "pr:approve_finance",
      "invoice:match",
      "payment:authorize",
      "currency:manage",
      "audit:view",
    ],
  },
  APPROVER: {
    role: "APPROVER",
    label: "Executive Approver (MD / CFO)",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description:
      "High-value threshold sign-off on PRs, POs, Contracts, and Single-Source/Emergency justifications.",
    permissions: [
      "pr:approve_exec",
      "po:approve_exec",
      "contract:approve",
      "delegation:manage",
      "audit:view",
    ],
  },
  VIEWER: {
    role: "VIEWER",
    label: "Internal Viewer / Auditor",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    description:
      "Read-only access to requisitions, reports, and transaction audit trails.",
    permissions: ["reports:view", "audit:view"],
  },
  SUPPLIER: {
    role: "SUPPLIER",
    label: "External Supplier",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    description:
      "Scoped strictly to the External Supplier Portal: view invited RFQs, submit quotes, acknowledge POs.",
    permissions: ["portal:rfq_quote", "portal:po_acknowledge", "portal:profile"],
  },
};

export function hasPermission(role: RoleType, permission: string): boolean {
  return RBAC_ROLES[role]?.permissions.includes(permission) ?? false;
}
