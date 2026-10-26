"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe2,
  ShieldCheck,
  Target,
  ThermometerSnowflake,
  Truck,
  Users2,
  Warehouse,
} from "lucide-react";

const LEADERSHIP_TEAM = [
  {
    name: "Davis K. Cheruiyot",
    role: "Managing Director & CEO",
    bio: "Over 20 years in East African maritime logistics, bulk commodity distribution, and commercial cross-border trade between Mombasa and the Great Lakes.",
  },
  {
    name: "Dr. Evelyn W. Kariuki",
    role: "Director of Healthcare & Pharmaceutical Cold Chain",
    bio: "Former clinical supply regulator specializing in WHO Good Distribution Practices (GDP), cold-chain validation, and institutional medical procurement.",
  },
  {
    name: "Captain Samuel O. Barasa",
    role: "Chief Operating Officer & Head of Fleet",
    bio: "Oversees Vensure's 85+ heavy transport fleet, telematics monitoring, cross-dock transit hubs, and 47-county last-mile distribution.",
  },
  {
    name: "CPA Mercy N. Mutua",
    role: "Chief Financial Officer & Trade Credit Lead",
    bio: "Leads institutional B2B trade finance, supplier invoice discounting, and enterprise procurement capital allocation.",
  },
];

const COMPLIANCE_ITEMS = [
  {
    authority: "Pharmacy and Poisons Board (PPB)",
    license: "Wholesale & Distribution Premises License WDL-2026-NBO",
    desc: "Authorized wholesale handling, cold storage, and distribution of human pharmaceuticals and hospital-grade medical devices.",
  },
  {
    authority: "Kenya Bureau of Standards (KEBS)",
    license: "Standardization Mark of Quality & Diamond Mark",
    desc: "Certified batch testing and compliance assurance for all distributed industrial, construction, and consumer goods.",
  },
  {
    authority: "Kenya Revenue Authority (KRA)",
    license: "Customs Bonded Warehouse License CBW-MBSA-041",
    desc: "Operates 16,000 SQM bonded storage at Mombasa Port Gateway for duty-deferred international bulk consignments.",
  },
  {
    authority: "Public Procurement Regulatory Authority (PPRA)",
    license: "National Institutional Supplier Registry No. REG/B2B/2026",
    desc: "Fully registered and verified corporate vendor for government directorates, public healthcare funds, and academic institutions.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="space-y-24 py-12">
      {/* =========================================================================
          1. HEADER: Architectural & Measured
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 text-xs text-[#c3c3cc]">
          <span className="w-2 h-2 rounded-full bg-[#5266eb]"></span>
          <span>Corporate Profile &amp; Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#ededf3] leading-tight max-w-3xl">
          Building Resilient Supply Chains Across Kenya &amp; the East African Corridor.
        </h1>
        <p className="text-sm sm:text-base text-[#c3c3cc] max-w-2xl leading-relaxed">
          Founded in Nairobi, Vensure is an integrated B2B wholesale, bonded warehousing, and fleet distribution enterprise dedicated to eliminating supply chain fragmentation.
        </p>
      </section>

      {/* =========================================================================
          2. CORPORATE GENESIS & OPERATING MODEL
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 text-xs sm:text-sm text-[#c3c3cc] leading-relaxed">
            <h2 className="text-2xl font-normal text-[#ededf3]">
              From Regional Warehousing to a 47-County Distribution Artery
            </h2>
            <p>
              Traditional wholesale distribution in East Africa has long suffered from erratic price markups, compromised pharmaceutical cold chains, and delayed delivery outside the capital.
            </p>
            <p>
              Vensure was established to bridge this structural gap. By deploying centralized bulk procurement, investing in continuous cold-chain data loggers, and operating our own dedicated heavy fleet, we provide hospitals, retailers, and industrial contractors with unyielding delivery certainty.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="bg-[#1e1e2a] p-4 rounded-xl border border-[#70707d]/20 space-y-1">
                <span className="text-xl font-normal text-[#ededf3]">85+ Vehicles</span>
                <p className="text-[11px] text-[#c3c3cc]">Company-Owned Fleet</p>
              </div>
              <div className="bg-[#1e1e2a] p-4 rounded-xl border border-[#70707d]/20 space-y-1">
                <span className="text-xl font-normal text-[#ededf3]">4 Regional Hubs</span>
                <p className="text-[11px] text-[#c3c3cc]">Mombasa to Lake Victoria</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/30 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-[#5266eb]">
                Our Institutional Purpose
              </span>
              <h3 className="text-xl font-normal text-[#ededf3]">
                Mission &amp; Operating Philosophy
              </h3>
            </div>
            <div className="space-y-4 text-xs text-[#c3c3cc]">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-[#5266eb] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#ededf3] block mb-0.5">The Vensure Mission:</strong>
                  To deliver seamless wholesale access to essential healthcare, FMCG, and construction commodities across East Africa with uncompromised quality and transparent Kenyan pricing.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#ededf3] block mb-0.5">The Vensure Vision:</strong>
                  To become the most dependable and technologically integrated distribution partner for institutions across the 47 counties of Kenya and cross-border EAC markets.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FOUR PILLARS OF OPERATIONAL EXCELLENCE
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-10">
        <div className="space-y-2 border-b border-[#70707d]/20 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            Core Competencies
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Engineered for High-Reliability Fulfillment
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <div className="w-9 h-9 rounded-full bg-[#272735] flex items-center justify-center text-cyan-400">
              <ThermometerSnowflake className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-normal text-[#ededf3]">
              Active Cold Chain
            </h3>
            <p className="text-xs text-[#c3c3cc] leading-relaxed">
              Pharmaceutical and biologic storage at 2°C – 8°C and -20°C with automated backup power and satellite GPS temperature loggers on all reefer trucks.
            </p>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <div className="w-9 h-9 rounded-full bg-[#272735] flex items-center justify-center text-[#5266eb]">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-normal text-[#ededf3]">
              Direct Fleet Haulage
            </h3>
            <p className="text-xs text-[#c3c3cc] leading-relaxed">
              No reliance on unpredictable third-party brokers. Our own telematics-tracked fleet guarantees delivery to all 47 counties within 8 to 36 hours.
            </p>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <div className="w-9 h-9 rounded-full bg-[#272735] flex items-center justify-center text-emerald-400">
              <Warehouse className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-normal text-[#ededf3]">
              Bonded Port Gateway
            </h3>
            <p className="text-xs text-[#c3c3cc] leading-relaxed">
              Direct container deconsolidation at Changamwe, Mombasa Port, enabling rapid maritime customs clearance and lower demurrage overheads.
            </p>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <div className="w-9 h-9 rounded-full bg-[#272735] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-normal text-[#ededf3]">
              Regulatory Rigor
            </h3>
            <p className="text-xs text-[#c3c3cc] leading-relaxed">
              Full PPB, KEBS, and KRA compliance. Every batch is cataloged with verified Certificates of Analysis (CoA) and import declaration numbers.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. REGULATORY CERTIFICATIONS & COMPLIANCE
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-8">
        <div className="space-y-2 border-b border-[#70707d]/20 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            Governance &amp; Accreditation
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Verified Regulatory Standing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPLIANCE_ITEMS.map((item) => (
            <div
              key={item.authority}
              className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-3"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="text-sm font-semibold text-[#ededf3]">
                  {item.authority}
                </h3>
              </div>
              <div className="text-xs font-mono text-[#5266eb] bg-[#171721] p-2 rounded border border-[#70707d]/30">
                {item.license}
              </div>
              <p className="text-xs text-[#c3c3cc] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. EXECUTIVE LEADERSHIP
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-8">
        <div className="space-y-2 border-b border-[#70707d]/20 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            Leadership
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Executive Management Team
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEADERSHIP_TEAM.map((exec) => (
            <div
              key={exec.name}
              className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#272735] flex items-center justify-center text-[#ededf3] font-semibold text-sm">
                  {exec.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#ededf3]">
                    {exec.name}
                  </h3>
                  <span className="text-[11px] text-[#5266eb] block">
                    {exec.role}
                  </span>
                </div>
                <p className="text-xs text-[#c3c3cc] leading-relaxed pt-2 border-t border-[#70707d]/20">
                  {exec.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. CONTACT CTA
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="bg-[#1e1e2a] rounded-2xl p-10 border border-[#70707d]/30 text-center space-y-5">
          <h3 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Partner with Kenya&apos;s Leading Wholesale Network
          </h3>
          <p className="text-xs sm:text-sm text-[#c3c3cc] max-w-xl mx-auto leading-relaxed">
            Discuss corporate framework agreements, bulk pharmaceutical supply contracts, or schedule a facility inspection at our Nairobi Central Logistics Park.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full text-xs font-medium text-white bg-[#5266eb] hover:bg-[#4355d8] transition flex items-center gap-2"
            >
              <span>Contact Headquarters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 rounded-full text-xs font-medium text-[#ededf3] border border-[#ededf3]/25 hover:border-[#ededf3] transition"
            >
              Review Logistics Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
