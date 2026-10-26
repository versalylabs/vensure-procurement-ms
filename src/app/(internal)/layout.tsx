"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarRange,
  FileSpreadsheet,
  Send,
  Factory,
  Scale,
  Wallet,
  FileSignature,
  PackageCheck,
  Truck,
  RotateCcw,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  Building2,
  Users,
  GitPullRequestDraft,
  Package,
  ShieldCheck,
  GitBranch,
  Globe,
  FolderKanban,
  BellRing,
  Webhook,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserCheck,
  Menu,
  X,
} from "lucide-react";
import { VensureIcon } from "@/components/VensureLogo";

interface NavCategory {
  id: string;
  title: string;
  accentColor: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "command",
    title: "Command & Analytics",
    accentColor: "text-emerald-500",
    items: [
      {
        label: "Procurement Workspace",
        href: "/workspace",
        icon: LayoutDashboard,
      },
      {
        label: "Document Trail & Templates",
        href: "/phase6?tab=trail",
        icon: FolderKanban,
      },
      {
        label: "Alerts & Escalations",
        href: "/phase6?tab=alerts",
        icon: BellRing,
      },
      {
        label: "Executive Analytics",
        href: "/phase6?tab=analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "planning",
    title: "Planning & Requisitions",
    accentColor: "text-teal-500",
    items: [
      {
        label: "Budget Control (KES)",
        href: "/phase2?tab=budget",
        icon: Wallet,
      },
      {
        label: "Procurement Methods",
        href: "/phase2?tab=methods",
        icon: GitBranch,
      },
      {
        label: "Annual Procurement Plans",
        href: "/phase2?tab=planning",
        icon: CalendarRange,
      },
      {
        label: "Purchase Requisitions",
        href: "/phase2?tab=pr",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    id: "sourcing",
    title: "Sourcing & Contracts",
    accentColor: "text-emerald-500",
    items: [
      {
        label: "Supplier Registry & Vault",
        href: "/phase3?tab=suppliers",
        icon: Factory,
      },
      {
        label: "RFQs & Clarifications",
        href: "/phase3?tab=rfq",
        icon: Send,
      },
      {
        label: "Quotation Evaluation",
        href: "/phase3?tab=evaluation",
        icon: Scale,
      },
      {
        label: "Operational Contracts",
        href: "/phase3?tab=contracts",
        icon: FileSignature,
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Receiving",
    accentColor: "text-amber-500",
    items: [
      {
        label: "Purchase Orders (PO)",
        href: "/phase4?tab=po",
        icon: PackageCheck,
      },
      {
        label: "Goods Receipt (GRN)",
        href: "/phase4?tab=grn",
        icon: Truck,
      },
      {
        label: "External Supplier Portal",
        href: "/portal",
        icon: Globe,
      },
    ],
  },
  {
    id: "payables",
    title: "Matching & Payables",
    accentColor: "text-rose-500",
    items: [
      {
        label: "Returns & Rejections",
        href: "/phase5?tab=returns",
        icon: RotateCcw,
      },
      {
        label: "3-Way Match Engine",
        href: "/phase5?tab=match",
        icon: Scale,
      },
      {
        label: "Invoices & Payments (KES)",
        href: "/phase5?tab=payments",
        icon: Receipt,
      },
    ],
  },
  {
    id: "integrations",
    title: "Enterprise Integrations",
    accentColor: "text-indigo-500",
    items: [
      {
        label: "ERP, Accounting & SSO",
        href: "/phase7?tab=integrations",
        icon: Webhook,
      },
      {
        label: "Security & Isolation Audit",
        href: "/phase7?tab=security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "admin",
    title: "Administration & Settings",
    accentColor: "text-blue-500",
    items: [
      {
        label: "Organization & Tenants",
        href: "/admin?tab=org",
        icon: Building2,
      },
      {
        label: "Users & RBAC Roles",
        href: "/admin?tab=rbac",
        icon: Users,
      },
      {
        label: "Approval Workflows",
        href: "/admin?tab=workflows",
        icon: GitPullRequestDraft,
      },
      {
        label: "Master Catalog & Tax (KES)",
        href: "/admin?tab=catalog",
        icon: Package,
      },
      {
        label: "Immutable Audit Log",
        href: "/admin?tab=audit",
        icon: ShieldCheck,
      },
    ],
  },
];

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      command: true,
      planning: true,
      sourcing: true,
      orders: true,
      payables: true,
      integrations: false,
      admin: false,
    }
  );
  const [sessionEmail, setSessionEmail] = useState("versalylabs@gmail.com");
  const [sessionRole, setSessionRole] = useState("ADMIN");

  useEffect(() => {
    // Lock in the unified Mercury dark theme globally
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("vensure_theme", "dark");

    const savedSession = localStorage.getItem("vensure_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.email) setSessionEmail(parsed.email);
        if (parsed.role) setSessionRole(parsed.role);
      } catch {
        // ignore
      }
    }
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Automatically expand category matching current pathname
  useEffect(() => {
    if (!pathname) return;
    NAV_CATEGORIES.forEach((cat) => {
      const matches = cat.items.some(
        (item) => item.href.split("?")[0] === pathname
      );
      if (matches) {
        setOpenCategories((prev) => ({ ...prev, [cat.id]: true }));
      }
    });
  }, [pathname]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllCategories = () => {
    const allOpen = NAV_CATEGORIES.every((c) => openCategories[c.id]);
    const next: Record<string, boolean> = {};
    NAV_CATEGORIES.forEach((c) => {
      next[c.id] = !allOpen;
    });
    setOpenCategories(next);
  };

  const renderNavContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-[#272735] shrink-0 bg-[#1e1e2a]">
        <Link href="/workspace" className="flex items-center gap-2.5 group">
          <VensureIcon size={34} />
          <div>
            <p className="font-bold text-sm leading-none text-[#ededf3] tracking-wide">
              Vensure
            </p>
            <p className="text-[11px] text-[#c3c3cc] font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
              Procurement Suite • KES
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleAllCategories}
            title="Expand / Collapse All Categories"
            className="text-[10px] font-semibold px-2 py-1 rounded-full border border-[#272735] text-[#c3c3cc] hover:bg-[#272735] hover:text-[#ededf3] transition cursor-pointer"
          >
            {NAV_CATEGORIES.every((c) => openCategories[c.id])
              ? "Collapse"
              : "Expand"}
          </button>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg border border-[#272735] text-[#c3c3cc] hover:bg-[#272735] md:hidden transition cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Independently Scrollable Dropdown Navigation Area */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2 bg-[#1e1e2a]">
        {NAV_CATEGORIES.map((category) => {
          const isOpen = Boolean(openCategories[category.id]);
          const hasActiveChild = category.items.some(
            (item) => item.href.split("?")[0] === pathname
          );

          return (
            <div
              key={category.id}
              className={`rounded-xl border transition-colors ${
                hasActiveChild
                  ? "border-[#5266eb]/40 bg-[#5266eb]/5"
                  : "border-[#272735] bg-[#1e1e2a]"
              }`}
            >
              {/* Category Dropdown Trigger */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full px-3 py-2 flex items-center justify-between text-left rounded-xl transition cursor-pointer hover:bg-[#272735] text-[#ededf3]"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider truncate text-[#ededf3]">
                  {category.title}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#272735] text-[#c3c3cc]">
                    {category.items.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#c3c3cc]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#c3c3cc]" />
                  )}
                </span>
              </button>

              {/* Collapsible Links */}
              {isOpen && (
                <div className="px-2 pb-2 pt-0.5 space-y-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href.split("?")[0] === pathname;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                          isActive
                            ? "bg-[#5266eb] text-white font-semibold shadow-xs"
                            : "text-[#c3c3cc] hover:bg-[#272735] hover:text-[#ededf3]"
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? "text-white" : "text-[#c3c3cc]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-[#272735] text-xs space-y-2 shrink-0 bg-[#1e1e2a]">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/admin?tab=org"
            className="flex items-center gap-2 text-[#c3c3cc] hover:text-[#ededf3] transition font-semibold"
          >
            <Settings className="w-3.5 h-3.5 text-[#5266eb]" />
            <span>Settings &amp; Admin</span>
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#272735] border border-[#272735] text-[#c3c3cc] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
            Mercury Dark
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/portal"
            className="text-center py-1.5 px-2 rounded-full transition text-[11px] font-medium border border-[#272735] bg-[#272735] hover:bg-[#323246] hover:border-[#39394d] text-[#ededf3]"
          >
            Supplier Portal
          </Link>
          <Link
            href="/login"
            className="text-center py-1.5 px-2 rounded-full transition text-[11px] font-medium border border-[#272735] bg-[#272735] hover:bg-[#323246] hover:border-[#39394d] text-[#ededf3] flex items-center justify-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Sign In / Out
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden flex bg-[#171721] text-[#ededf3]">
      {/* Desktop Sidebar: Visible on md: and above */}
      <aside className="hidden md:flex w-64 h-screen flex-col border-r border-[#272735] shrink-0 bg-[#1e1e2a] text-[#ededf3]">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#171721]/80 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Aside: Slides in on mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] h-full flex flex-col border-r border-[#272735] shadow-2xl transition-transform duration-300 md:hidden bg-[#1e1e2a] text-[#ededf3] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Right Column: Fixed Responsive Navbar + Independently Scrollable Page Content */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-[#171721]">
        <header className="h-16 border-b border-[#272735] px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 bg-[#1e1e2a] text-[#ededf3]">
          {/* Left: Mobile Hamburger & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg border border-[#272735] text-[#ededf3] hover:bg-[#272735] md:hidden shrink-0 transition cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold truncate text-[#ededf3]">
                Vensure Procurement MS
              </h1>
              <p className="hidden sm:block text-xs text-[#c3c3cc] truncate">
                Budget Governance • Strategic Sourcing • POs • 3-Way Match • KES Base
              </p>
            </div>
          </div>

          {/* Right: Actions, Session & Alerts */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Link Settings */}
            <Link
              href="/admin?tab=org"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#272735] bg-[#272735] text-[#ededf3] hover:bg-[#323246] transition"
            >
              <Settings className="w-3.5 h-3.5 text-[#5266eb]" />
              Settings
            </Link>

            {/* New Requisition Primary Cobalt CTA */}
            <Link
              href="/phase2?tab=pr"
              className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-[#5266eb] hover:bg-[#4355d8] text-white shadow-xs transition shrink-0"
            >
              <span className="hidden sm:inline">+ New Requisition</span>
              <span className="sm:hidden">+ PR</span>
            </Link>

            {/* User Session Pill */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-[#272735] bg-[#272735] text-[#ededf3] hover:bg-[#323246] transition"
              title="Click to switch user session or sign in"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#5266eb]" />
              <span className="truncate max-w-[120px] font-semibold text-[#ededf3]">
                {sessionEmail}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5266eb]/20 text-[#818cf8] font-bold">
                {sessionRole}
              </span>
            </Link>

            {/* Alerts Center Bell */}
            <Link
              href="/phase6?tab=alerts"
              className="p-2 rounded-full border border-[#272735] bg-[#272735] text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#323246] relative transition"
              aria-label="Active Procurement Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                7
              </span>
            </Link>
          </div>
        </header>

        {/* Main Page Content: Scrollable Independently with Responsive Padding */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto bg-[#171721] text-[#ededf3]">{children}</main>
      </div>
    </div>
  );
}
