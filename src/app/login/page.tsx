"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { VensureIcon } from "@/components/VensureLogo";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "System Administrator (Full Access)" },
  { value: "PROCUREMENT_OFFICER", label: "Procurement Officer (Sourcing & POs)" },
  { value: "DEPARTMENT_HEAD", label: "Department Head / HOD (PR Approvals)" },
  { value: "FINANCE", label: "Finance & Accounts (Budget & 3-Way Match)" },
  { value: "APPROVER", label: "Executive Approver / MD (> KES 2.5M Sign-Off)" },
  { value: "WAREHOUSE", label: "Warehouse & Stores (GRN Inspection - Price Masked)" },
  { value: "REQUESTER", label: "Department Requester (Raise Requisitions)" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("versalylabs@gmail.com");
  const [password, setPassword] = useState("labversaly-16");
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [destination, setDestination] = useState<"/workspace" | "/portal">(
    "/workspace"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure dark theme consistency
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("vensure_theme", "dark");
  }, []);

  const fillDemoCredentials = () => {
    setEmail("versalylabs@gmail.com");
    setPassword("labversaly-16");
    setError(null);
  };

  const handleLogin = async (
    e: React.FormEvent,
    authMethod: string = "CREDENTIALS"
  ) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/phase1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "AUTHENTICATE_DEMO_USER",
          email,
          password,
          role: selectedRole,
          authMethod,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        setError(
          data.error ||
            "Invalid email or password. Please use the demo credentials below."
        );
        setSubmitting(false);
        return;
      }

      localStorage.setItem(
        "vensure_session",
        JSON.stringify({
          email,
          role: selectedRole,
          signedInAt: new Date().toISOString(),
        })
      );

      router.push(destination);
    } catch {
      setError("Network error while signing in. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#171721] text-[#ededf3]">
      {/* Top Bar */}
      <header className="h-16 px-6 border-b border-[#272735] bg-[#1e1e2a] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <VensureIcon size={36} />
          <div>
            <span className="font-bold text-base tracking-tight text-[#ededf3]">
              Vensure
            </span>
            <span className="block text-[11px] text-[#c3c3cc] font-medium leading-none">
              Wholesale &amp; Procurement MS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-[#c3c3cc] hover:text-[#ededf3] transition"
          >
            ← Public Website
          </Link>
          <Link
            href="/workspace"
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#272735] bg-[#272735] text-[#ededf3] hover:bg-[#323246] transition"
          >
            Open Workspace Directly →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Value Proposition & Demo Credentials Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5266eb]/15 border border-[#5266eb]/30 text-[#818cf8] text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Multi-Tenant Procurement &amp; Spend Governance
            </div>

            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-[#ededf3]">
              Vendor trust.{" "}
              <span className="text-[#818cf8]">Purchase certainty.</span>
            </h1>

            <p className="text-sm leading-relaxed text-[#c3c3cc]">
              Sign in to manage departmental procurement plans, 4-layer budget
              encumbrances, competitive RFQs, purchase orders, warehouse GRNs,
              and automated 3-way invoice matching in Kenyan Shillings.
            </p>

            {/* Demo Credentials Box */}
            <div className="rounded-xl p-5 border border-[#272735] bg-[#1e1e2a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ededf3]">
                  <Sparkles className="w-4 h-4 text-[#5266eb]" />
                  Official Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="px-3.5 py-1 rounded-full bg-[#5266eb] hover:bg-[#4355d8] text-white text-xs font-medium transition cursor-pointer"
                >
                  Auto-Fill Credentials
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#272735] bg-[#272735]">
                  <span className="text-[10px] uppercase font-bold text-[#c3c3cc] block mb-0.5">
                    Demo Email Address
                  </span>
                  <code className="font-mono font-bold text-[#818cf8] text-xs select-all">
                    versalylabs@gmail.com
                  </code>
                </div>
                <div className="p-3 rounded-xl border border-[#272735] bg-[#272735]">
                  <span className="text-[10px] uppercase font-bold text-[#c3c3cc] block mb-0.5">
                    Demo Password
                  </span>
                  <code className="font-mono font-bold text-[#818cf8] text-xs select-all">
                    labversaly-16
                  </code>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#c3c3cc]">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5266eb]" />7 RBAC Roles
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5266eb]" />2 Client Tenants
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5266eb]" />Supplier Portal
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form Card */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#272735] bg-[#1e1e2a] p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-medium text-[#ededf3]">
                  Sign in to Vensure MS
                </h2>
                <p className="text-xs text-[#c3c3cc] mt-1">
                  Enter your credentials or click auto-fill for the Versaly Labs
                  administrator demo.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, "CREDENTIALS")} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#c3c3cc]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#c3c3cc] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="versalylabs@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#272735] bg-[#272735] text-[#ededf3] text-xs font-medium focus:outline-none focus:border-[#5266eb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#c3c3cc]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#c3c3cc] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="labversaly-16"
                      className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#272735] bg-[#272735] text-[#ededf3] text-xs font-medium focus:outline-none focus:border-[#5266eb]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c3c3cc] hover:text-[#ededf3] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#c3c3cc]">
                      Active RBAC Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-full border border-[#272735] bg-[#272735] text-[#ededf3] text-xs font-medium focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#c3c3cc]">
                      Launch Destination
                    </label>
                    <select
                      value={destination}
                      onChange={(e) =>
                        setDestination(
                          e.target.value as "/workspace" | "/portal"
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-full border border-[#272735] bg-[#272735] text-[#ededf3] text-xs font-medium focus:outline-none"
                    >
                      <option value="/workspace">
                        Internal Procurement Suite
                      </option>
                      <option value="/portal">
                        External Supplier Portal
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-full bg-[#5266eb] hover:bg-[#4355d8] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {submitting
                    ? "Authenticating Session..."
                    : "Sign In to Procurement MS"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#272735]" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="px-2 bg-[#1e1e2a] text-[#c3c3cc]">
                    Or Single Sign-On (SSO)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, "GOOGLE_WORKSPACE_OIDC")}
                  className="py-2.5 px-3 rounded-full border border-[#272735] bg-[#272735] hover:bg-[#323246] text-[#ededf3] text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#5266eb]" />
                  Google Workspace
                </button>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, "MICROSOFT_ENTRA_365_SAML")}
                  className="py-2.5 px-3 rounded-full border border-[#272735] bg-[#272735] hover:bg-[#323246] text-[#ededf3] text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#5266eb]" />
                  Microsoft 365 SSO
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-[#272735] text-center text-xs bg-[#1e1e2a] text-[#c3c3cc]">
        Vensure by Versaly — Enterprise Wholesale &amp; Procurement Management Suite • Alpine Dark
      </footer>
    </div>
  );
}
