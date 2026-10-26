"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Globe2,
  Layers,
  Truck,
  ExternalLink,
} from "lucide-react";
import { VensureIcon } from "@/components/VensureLogo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Contact & Hubs", href: "/contact" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#171721] text-[#ededf3] flex flex-col selection:bg-[#5266eb] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-[#1e1e2a] border-b border-[#70707d]/20 text-[#c3c3cc] text-xs py-2 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              East Africa Fleet Active: Daily bonded transshipment between Mombasa Port, Nairobi HQ & 47 counties.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#c3c3cc]">
            <span className="hidden sm:inline">Dispatch Hotline: +254 20 790 3000</span>
            <span className="hidden md:inline">•</span>
            <Link
              href="/portal"
              className="hover:text-[#ededf3] transition flex items-center gap-1 font-medium text-[#ededf3]"
            >
              Supplier Self-Service Portal <ExternalLink className="w-3 h-3 text-[#5266eb]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Top Navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#171721]/90 backdrop-blur-md border-b border-[#70707d]/20 py-3"
            : "bg-[#171721]/60 backdrop-blur-sm border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <VensureIcon size={38} />
            <div>
              <span className="text-lg font-bold tracking-wider text-[#ededf3]">
                VENSURE
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest text-[#c3c3cc] uppercase font-medium">
                Wholesale &amp; Distribution
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1e1e2a]/60 p-1 rounded-full border border-[#70707d]/20">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs rounded-full transition-all ${
                    active
                      ? "bg-[#272735] text-[#ededf3] font-medium"
                      : "text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Portals Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPortalDropdownOpen((prev) => !prev)}
                className="px-4 py-2 rounded-full text-xs text-[#ededf3] border border-[#ededf3]/20 hover:border-[#ededf3] hover:bg-[#ededf3]/5 transition flex items-center gap-1.5"
              >
                <span>Partner Portals</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#c3c3cc]" />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1e1e2a] rounded-xl border border-[#70707d]/30 shadow-2xl p-2 z-50 text-xs">
                  <div className="p-2 border-b border-[#70707d]/20 text-[11px] text-[#c3c3cc]">
                    Select Corporate Access Mode
                  </div>
                  <Link
                    href="/portal"
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#272735] transition text-[#ededf3]"
                    onClick={() => setPortalDropdownOpen(false)}
                  >
                    <Building2 className="w-4 h-4 text-[#5266eb] mt-0.5" />
                    <div>
                      <div className="font-medium text-[#ededf3]">External Supplier Portal</div>
                      <p className="text-[11px] text-[#c3c3cc]">
                        Self-service RFQs, PO confirmations & compliance vault
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#272735] transition text-[#ededf3]"
                    onClick={() => setPortalDropdownOpen(false)}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-[#ededf3]">Internal Procurement Suite</div>
                      <p className="text-[11px] text-[#c3c3cc]">
                        Enterprise workspace for institutional buyers & staff
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Primary Conversion CTA */}
            <Link
              href="/contact#inquiry"
              className="px-5 py-2 rounded-full text-xs text-white bg-[#5266eb] hover:bg-[#4355d8] transition font-medium flex items-center gap-1.5"
            >
              <span>Request Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-full bg-[#1e1e2a] text-[#ededf3] border border-[#70707d]/30 hover:bg-[#272735]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#171721] border-b border-[#70707d]/30 px-6 py-6 space-y-4">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2.5 rounded-xl text-sm ${
                    pathname === link.href
                      ? "bg-[#272735] text-[#ededf3] font-medium"
                      : "text-[#c3c3cc] hover:text-[#ededf3]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-[#70707d]/20 space-y-2">
              <Link
                href="/contact#inquiry"
                className="w-full py-2.5 rounded-full text-xs text-center text-white bg-[#5266eb] font-medium flex items-center justify-center gap-2"
              >
                <span>Request Wholesale Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/portal"
                  className="py-2 px-3 text-center rounded-full text-xs border border-[#ededf3]/20 text-[#ededf3]"
                >
                  Supplier Portal
                </Link>
                <Link
                  href="/login"
                  className="py-2 px-3 text-center rounded-full text-xs bg-[#272735] text-[#ededf3]"
                >
                  Client Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* Mercury Structured Footer */}
      <footer className="bg-[#171721] border-t border-[#70707d]/20 pt-16 pb-8 text-[#c3c3cc] text-xs">
        <div className="max-w-[1200px] mx-auto px-6 space-y-12">
          {/* Top 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Brand & Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <VensureIcon size={28} />
                <span className="text-base font-bold tracking-wider text-[#ededf3]">
                  VENSURE
                </span>
              </div>
              <p className="text-xs text-[#c3c3cc] leading-relaxed">
                Licensed bulk wholesale and nationwide multi-modal distribution company. Serving healthcare institutions, supermarket retail networks, contractors, and regional cooperatives across Kenya and East Africa.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#ededf3]">
                <Globe2 className="w-3.5 h-3.5 text-[#5266eb]" />
                <span>Nairobi • Mombasa • Kisumu • Eldoret</span>
              </div>
            </div>

            {/* Column 2: Product Verticals */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ededf3]">
                Wholesale Categories
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/products?category=Healthcare" className="hover:text-[#ededf3] transition">
                    Pharmaceuticals &amp; Medical Supplies
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=FMCG" className="hover:text-[#ededf3] transition">
                    FMCG, Foodstuffs &amp; Edible Commodities
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Industrial" className="hover:text-[#ededf3] transition">
                    Industrial Hardware, PPE &amp; Cement
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=Agriculture" className="hover:text-[#ededf3] transition">
                    Agrochemicals, Biologics &amp; Seeds
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-[#5266eb] hover:underline flex items-center gap-1 font-medium">
                    Browse 2026 Master Catalog →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Distribution & Cold Chain */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ededf3]">
                Logistics Infrastructure
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/services#cold-chain" className="hover:text-[#ededf3] transition">
                    Active Cold Chain Storage (2°C – 8°C &amp; -20°C)
                  </Link>
                </li>
                <li>
                  <Link href="/services#fleet" className="hover:text-[#ededf3] transition">
                    47-County Fleet Freight &amp; Telemetry
                  </Link>
                </li>
                <li>
                  <Link href="/services#bonded" className="hover:text-[#ededf3] transition">
                    KRA Bonded Warehousing (50,000+ SQM)
                  </Link>
                </li>
                <li>
                  <Link href="/services#cross-border" className="hover:text-[#ededf3] transition">
                    Mombasa Port Gateway &amp; EAC Transshipment
                  </Link>
                </li>
                <li>
                  <Link href="/services#vmi" className="hover:text-[#ededf3] transition">
                    Vendor Managed Inventory (VMI)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Quick Portals & Contacts */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#ededf3]">
                Access &amp; Inquiries
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#5266eb]" />
                  <span>+254 20 790 3000 / +254 711 820 400</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#5266eb]" />
                  <span>wholesale@vensure.co.ke</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#5266eb]" />
                  <span>Enterprise Rd, Industrial Area, Nairobi</span>
                </div>
              </div>
              <div className="pt-2 flex flex-col gap-1.5">
                <Link
                  href="/login"
                  className="text-xs text-[#ededf3] hover:underline flex items-center gap-1"
                >
                  Client Procurement Login →
                </Link>
                <Link
                  href="/portal"
                  className="text-xs text-[#ededf3] hover:underline flex items-center gap-1"
                >
                  Supplier RFQ &amp; PO Portal →
                </Link>
              </div>
            </div>
          </div>

          {/* Regulatory Disclaimer Strip (Mercury Style Reference Component) */}
          <div className="p-4 rounded-xl bg-[#1e1e2a] border border-[#70707d]/20 text-[11px] text-[#c3c3cc] space-y-1 leading-relaxed">
            <p>
              <strong className="text-[#ededf3]">Regulatory &amp; Compliance Standards:</strong> Vensure Wholesale &amp; Logistics Ltd is licensed by the Pharmacy and Poisons Board (PPB), registered with the Public Procurement Regulatory Authority (PPRA), and operates KRA-bonded multi-tier warehouses under East African Community Customs Management protocols. All pharmaceutical products adhere to WHO Good Distribution Practices (GDP).
            </p>
          </div>

          {/* Bottom Copyright & System Links */}
          <div className="pt-6 border-t border-[#70707d]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#c3c3cc]">
            <div>
              © 2026 Vensure Logistics &amp; Wholesale Ltd. All rights reserved. Registered in Kenya.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-[#ededf3]">
                Corporate Profile
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#ededf3]">
                Depot Network
              </Link>
              <span>•</span>
              <Link href="/login" className="hover:text-[#ededf3] text-[#5266eb]">
                Procurement MS
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
