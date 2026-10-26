"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  Globe2,
  Layers,
  MapPin,
  Package,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  ThermometerSnowflake,
  Truck,
  Users2,
  Warehouse,
} from "lucide-react";
import { formatKES } from "@/lib/utils";

const PRODUCT_CATEGORIES = [
  {
    title: "Pharmaceuticals & Healthcare",
    code: "MED-WH",
    description:
      "WHO-prequalified hospital pharmaceuticals, surgical consumables, cold-chain biologics, diagnostic test kits, and ICU critical gear.",
    metrics: "2,400+ Active SKUs • PPB Certified",
    tag: "Cold Chain Active",
    link: "/products?category=Healthcare",
  },
  {
    title: "FMCG & Commercial Foodstuffs",
    code: "FMCG-DIST",
    description:
      "Bulk edible oils, milled grains, shelf-stable canned provisions, institutional dairy formulations, and high-velocity retail packaged goods.",
    metrics: "Direct Mill Allocations • Volume Pallets",
    tag: "High Turnover",
    link: "/products?category=FMCG",
  },
  {
    title: "Industrial & Structural Hardware",
    code: "IND-SUP",
    description:
      "Structural steel beams, Portland cement, industrial valving, PPE gear, commercial electrical cables, and heavy fabrication consumables.",
    metrics: "KEBS Certified • Heavy Haulage Fleet",
    tag: "Contract Grade",
    link: "/products?category=Industrial",
  },
  {
    title: "Agro-Inputs & Certified Biologics",
    code: "AGRO-CHAIN",
    description:
      "Certified hybrid seed lots, soil nutritionals, temperature-controlled veterinary vaccines, and cold-storage farmgate aggregation.",
    metrics: "KEPHIS Compliant • Reefer Distribution",
    tag: "Traceable Batches",
    link: "/products?category=Agriculture",
  },
];

const LOGISTICS_HUBS = [
  {
    name: "Nairobi Central Hub & HQ",
    type: "Primary Consolidation & Cross-Dock",
    location: "Enterprise Road, Industrial Area",
    capacity: "24,000 SQM • 18 Loading Docks",
    leadTime: "Same-Day Delivery (Nairobi Metropolitan)",
    highlight: "Equipped with automated WMS & pharmaceutical-grade cold vaults.",
  },
  {
    name: "Mombasa Port Gateway",
    type: "Maritime Bonded Depot",
    location: "Port Reitz Road, Changamwe",
    capacity: "16,000 SQM • Rail & Port Siding",
    leadTime: "24 Hours (Coastal & Taita Taveta)",
    highlight: "Direct vessel container deconsolidation & EAC transit clearing.",
  },
  {
    name: "Kisumu Great Lakes Depot",
    type: "Western & Lake Region Transshipment",
    location: "Obote Road Industrial Strip",
    capacity: "8,500 SQM • Cold Storage Annex",
    leadTime: "Next-Day Delivery (14 Western Counties)",
    highlight: "Servicing lakeside institutions, Kakamega, and Busia border trade.",
  },
  {
    name: "Eldoret North Rift Center",
    type: "Agricultural & Northern Transit Hub",
    location: "Kapsoya Industrial Zone",
    capacity: "7,000 SQM • Agro-Chemical Vault",
    leadTime: "Next-Day Delivery (North Rift & Turkana)",
    highlight: "Serving agricultural cooperatives, regional hospitals, and Uganda highway corridor.",
  },
];

export default function PublicHomePage() {
  const [quickEmail, setQuickEmail] = useState("");
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  // Estimator State
  const [calcCategory, setCalcCategory] = useState("Healthcare");
  const [calcCounty, setCalcCounty] = useState("Nairobi");
  const [calcVolume, setCalcVolume] = useState("Pallet");
  const [calcColdChain, setCalcColdChain] = useState(false);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickEmail.trim()) {
      setQuickSubmitted(true);
    }
  };

  return (
    <div className="space-y-24">
      {/* =========================================================================
          1. HERO SECTION: Cinematic Alpine / Blue Hour Dark Observatory
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 overflow-hidden bg-[#171721]">
        {/* Relevant Low-Opacity Logistics & Warehouse Architectural Background Image */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <Image
            src="/images/hero-warehouse.jpg"
            alt="Vensure Distribution Center & Logistics Warehouse"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-20 filter contrast-110 brightness-95"
          />
          {/* Subtle Dark Vignette & Atmospheric Gradients to Preserve Readability and Alpine Palette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171721] via-[#171721]/50 to-[#171721]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#171721] via-transparent to-[#171721]" />
        </div>

        {/* Subtle Atmospheric Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#70707d 1px, transparent 1px), radial-gradient(#70707d 1px, #171721 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative max-w-[820px] mx-auto text-center space-y-8 pt-12 pb-16 z-10">
          {/* Subtle Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 text-xs text-[#c3c3cc]">
            <span className="w-2 h-2 rounded-full bg-[#5266eb]"></span>
            <span>Kenya Wholesale, Cold Chain &amp; 47-County Fleet Distribution</span>
          </div>

          {/* Headline: Intermediate Weight 480 Display */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#ededf3] leading-[1.12]">
            The Distribution Backbone of <span className="text-white font-medium">East Africa</span>.
          </h1>

          {/* Subtext: Measured & Architectural */}
          <p className="text-base sm:text-lg text-[#c3c3cc] max-w-[620px] mx-auto leading-relaxed font-normal">
            Large-scale institutional supply, certified temperature-controlled cold chain, and guaranteed volume fulfillment. From Mombasa Port to 47 counties.
          </p>

          {/* Inline Email / Business Lead Capture Form (Mercury Style Reference Pill Input) */}
          <div className="max-w-[540px] mx-auto">
            {!quickSubmitted ? (
              <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                <input
                  type="email"
                  required
                  placeholder="Enter corporate email or company name..."
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="w-full sm:w-auto flex-1 px-5 py-3.5 text-sm bg-transparent text-[#ededf3] placeholder-[#c3c3cc] border border-[#ededf3]/30 sm:border-r-0 rounded-full sm:rounded-r-none sm:rounded-l-full focus:outline-none focus:border-[#ededf3] transition"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-white bg-[#5266eb] hover:bg-[#4355d8] rounded-full sm:rounded-l-none sm:rounded-r-full transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Open Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-full bg-[#1e1e2a] border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you. Routing to our corporate account desk...</span>
                <Link href="/contact" className="underline font-semibold ml-2 text-white">
                  Continue to RFQ Form →
                </Link>
              </div>
            )}
          </div>

          {/* Micro-Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#c3c3cc]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#5266eb]" />
              KEMSA &amp; PPRA Registered
            </span>
            <span className="flex items-center gap-1.5">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
              2°C – 8°C Cold Vault Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              85+ Fleet GPS Tracked
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CORPORATE PERFORMANCE METRICS (Mercury Flat Graphite Cards)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-1">
            <span className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
              KES 4.2B+
            </span>
            <p className="text-xs text-[#c3c3cc]">
              Annual Bulk Volume Distributed
            </p>
          </div>
          <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-1">
            <span className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
              47 Counties
            </span>
            <p className="text-xs text-[#c3c3cc]">
              Active Nationwide Last-Mile Reach
            </p>
          </div>
          <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-1">
            <span className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
              55,000 SQM
            </span>
            <p className="text-xs text-[#c3c3cc]">
              Bonded &amp; Cold Storage Capacity
            </p>
          </div>
          <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-1">
            <span className="text-2xl sm:text-3xl font-normal text-[#5266eb]">
              99.4%
            </span>
            <p className="text-xs text-[#c3c3cc]">
              On-Time In-Full (OTIF) Delivery SLA
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. PRODUCT CATEGORIES (Mercury 4-Card Grid)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#70707d]/20 pb-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
              Wholesale Verticals
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
              Core Supply Lines &amp; Institutional Catalogs
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs text-[#ededf3] hover:text-[#5266eb] transition flex items-center gap-1 font-medium"
          >
            Explore Complete Master Catalog ({formatKES(280000000)} Inventory) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCT_CATEGORIES.map((cat) => (
            <div
              key={cat.code}
              className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 hover:border-[#70707d]/50 transition space-y-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#272735] text-[#c3c3cc]">
                    {cat.code}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full border border-[#70707d]/30 text-[#c3c3cc]">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-xl font-normal text-[#ededf3] group-hover:text-white transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#c3c3cc] leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#70707d]/20 flex items-center justify-between text-xs">
                <span className="text-[#c3c3cc] font-medium">{cat.metrics}</span>
                <Link
                  href={cat.link}
                  className="text-[#ededf3] group-hover:text-[#5266eb] font-medium inline-flex items-center gap-1 transition"
                >
                  View Items <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. DISTRIBUTION NETWORK & DEPOT NETWORK
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-10">
        <div className="space-y-2 border-b border-[#70707d]/20 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            National Footprint
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Strategic Regional Logistics Hubs
          </h2>
          <p className="text-xs text-[#c3c3cc] max-w-2xl leading-relaxed">
            Vensure operates high-throughput distribution facilities strategically positioned along the Northern Corridor trade artery, ensuring guaranteed delivery timelines across urban and remote counties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOGISTICS_HUBS.map((hub) => (
            <div
              key={hub.name}
              className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#272735] flex items-center justify-center text-[#5266eb]">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#ededf3]">
                    {hub.name}
                  </h4>
                  <span className="text-[11px] text-[#5266eb] block mt-0.5">
                    {hub.type}
                  </span>
                </div>
                <div className="text-xs text-[#c3c3cc] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#70707d]" />
                    <span>{hub.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#70707d]" />
                    <span className="text-emerald-400">{hub.leadTime}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#c3c3cc]/80 pt-2 border-t border-[#70707d]/20 leading-relaxed">
                  {hub.highlight}
                </p>
              </div>

              <span className="text-[10px] font-mono text-[#c3c3cc] block pt-2">
                {hub.capacity}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE WHOLESALE ESTIMATOR TOOL (Client Interactive Feature)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#1e1e2a] rounded-xl p-8 sm:p-12 border border-[#70707d]/30 space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
              Interactive Dispatch Estimator
            </span>
            <h3 className="text-2xl font-normal text-[#ededf3]">
              Estimate Lead Times &amp; Fleet Allocation
            </h3>
            <p className="text-xs text-[#c3c3cc] leading-relaxed">
              Configure your intended delivery parameter to preview Vensure fleet dispatch routing, cold chain protocol, and expected turnaround.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#c3c3cc] mb-1.5">
                Supply Vertical
              </label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value)}
                className="w-full bg-[#171721] text-[#ededf3] text-xs px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 focus:outline-none"
              >
                <option value="Healthcare">Pharmaceuticals &amp; Medical Supplies</option>
                <option value="FMCG">FMCG &amp; Packaged Consumer Goods</option>
                <option value="Industrial">Industrial Hardware &amp; Cement</option>
                <option value="Agriculture">Agricultural Inputs &amp; Seeds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#c3c3cc] mb-1.5">
                Destination County
              </label>
              <select
                value={calcCounty}
                onChange={(e) => setCalcCounty(e.target.value)}
                className="w-full bg-[#171721] text-[#ededf3] text-xs px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 focus:outline-none"
              >
                <option value="Nairobi">Nairobi Metropolitan</option>
                <option value="Mombasa">Mombasa &amp; Coastal Strip</option>
                <option value="Kisumu">Kisumu &amp; Lake Basin</option>
                <option value="Nakuru">Nakuru &amp; Central Rift</option>
                <option value="Uasin Gishu (Eldoret)">Uasin Gishu (Eldoret Hub)</option>
                <option value="Turkana (Lodwar)">Turkana (Lodwar Corridor)</option>
                <option value="Garissa">Garissa &amp; North Eastern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#c3c3cc] mb-1.5">
                Shipment Volume Scale
              </label>
              <select
                value={calcVolume}
                onChange={(e) => setCalcVolume(e.target.value)}
                className="w-full bg-[#171721] text-[#ededf3] text-xs px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 focus:outline-none"
              >
                <option value="Box / Carton Tier">Box / Mixed Carton (Min. KES 150k)</option>
                <option value="Pallet">Standard Pallet Tier (1 – 5 Pallets)</option>
                <option value="Full Truck Load (10T - 28T)">Full Truckload (FTL 10T – 28T)</option>
                <option value="Multi-Container Bulk">Multi-Container Direct Rail/Road</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#c3c3cc] mb-1.5">
                Cold Chain Handling
              </label>
              <button
                type="button"
                onClick={() => setCalcColdChain((prev) => !prev)}
                className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-medium border flex items-center justify-between transition ${
                  calcColdChain
                    ? "bg-[#5266eb]/20 text-[#ededf3] border-[#5266eb]"
                    : "bg-[#171721] text-[#c3c3cc] border-[#70707d]/40"
                }`}
              >
                <span>{calcColdChain ? "Active 2°C – 8°C" : "Ambient Standard"}</span>
                <ThermometerSnowflake className={`w-3.5 h-3.5 ${calcColdChain ? "text-[#5266eb]" : "text-[#70707d]"}`} />
              </button>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-6 rounded-xl bg-[#171721] border border-[#70707d]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct Route Confirmed
                </span>
                <span className="text-[#c3c3cc]">•</span>
                <span className="text-[#ededf3]">Dispatched from {calcCounty.includes("Mombasa") ? "Mombasa Maritime Hub" : calcCounty.includes("Eldoret") || calcCounty.includes("Turkana") ? "Eldoret North Rift Hub" : calcCounty.includes("Kisumu") ? "Kisumu Great Lakes Hub" : "Nairobi Central Logistics Park"}</span>
              </div>
              <p className="text-[#c3c3cc]">
                Guaranteed Lead Time:{" "}
                <strong className="text-white">
                  {calcCounty === "Nairobi" ? "Same-Day (Under 8 Hours)" : calcCounty.includes("Turkana") || calcCounty.includes("Garissa") ? "36 - 48 Hours Scheduled Reefer" : "18 - 24 Hours Door-to-Door"}
                </strong>{" "}
                • Telemetry:{" "}
                <span className="text-cyan-300">
                  {calcColdChain ? "Continuous GSM GPS Data Logger Active" : "Standard Barcode Scan Milestone"}
                </span>
              </p>
            </div>

            <Link
              href={`/contact?cat=${encodeURIComponent(calcCategory)}&county=${encodeURIComponent(calcCounty)}&vol=${encodeURIComponent(calcVolume)}`}
              className="px-6 py-2.5 rounded-full text-xs font-medium bg-[#5266eb] hover:bg-[#4355d8] text-white transition flex items-center gap-2 whitespace-nowrap"
            >
              <span>Request Formal Quotation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INSTITUTIONAL CLIENT TRUST & TESTIMONIALS
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            Partners in East Africa
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Trusted by Healthcare Groups, Commercial Chains &amp; Contractors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <p className="text-xs text-[#c3c3cc] italic leading-relaxed">
              &ldquo;Vensure&apos;s cold-chain consistency for surgical consumables and ICU pharmaceuticals into our 12 regional hospital clinics has reduced stockouts to near zero. Their telemetry logs give our pharmacy directors absolute peace of mind.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#70707d]/20 text-xs">
              <strong className="text-[#ededf3] block">Dr. Achieng O.</strong>
              <span className="text-[#c3c3cc] text-[11px]">Head of Clinical Supply, Horizon Healthcare Group</span>
            </div>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <p className="text-xs text-[#c3c3cc] italic leading-relaxed">
              &ldquo;Procuring bulk structural steel and cement for infrastructure tenders demands tight scheduling. Vensure delivers directly to site in Kisumu and Mombasa without missing port clearance deadlines.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#70707d]/20 text-xs">
              <strong className="text-[#ededf3] block">Eng. Peter K. M.</strong>
              <span className="text-[#c3c3cc] text-[11px]">Project Director, Crestline Engineering Ltd</span>
            </div>
          </div>

          <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 space-y-4">
            <p className="text-xs text-[#c3c3cc] italic leading-relaxed">
              &ldquo;For commercial retail distribution across 28 supermarkets in Western Kenya, Vensure&apos;s FMCG volume allocations and transparent pricing in KES allow us to manage our working capital efficiently.&rdquo;
            </p>
            <div className="pt-3 border-t border-[#70707d]/20 text-xs">
              <strong className="text-[#ededf3] block">Grace W. Mwangi</strong>
              <span className="text-[#c3c3cc] text-[11px]">Category Lead, Apex Distribution Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. BOTTOM CONVERSION CTA BANNER (Mercury Cobalt conversion)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="bg-[#1e1e2a] rounded-2xl p-10 sm:p-14 border border-[#70707d]/30 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-3xl font-normal text-[#ededf3]">
              Ready to Upgrade Your Wholesale Supply Chain?
            </h3>
            <p className="text-xs sm:text-sm text-[#c3c3cc] leading-relaxed">
              Open an institutional trading account, review volume discounts, or speak with an East Africa procurement specialist today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact#inquiry"
              className="px-6 py-3 rounded-full text-xs font-medium text-white bg-[#5266eb] hover:bg-[#4355d8] transition flex items-center gap-2"
            >
              <span>Submit Business RFQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 rounded-full text-xs font-medium text-[#ededf3] border border-[#ededf3]/25 hover:border-[#ededf3] hover:bg-[#ededf3]/5 transition"
            >
              Browse 2026 Catalog
            </Link>
            <Link
              href="/portal"
              className="px-6 py-3 rounded-full text-xs font-medium text-[#c3c3cc] bg-[#272735] hover:bg-[#313142] transition"
            >
              Vendor Portal Access →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
