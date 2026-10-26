"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Globe2,
  Lock,
  PackageCheck,
  ShieldCheck,
  Ship,
  Sparkles,
  ThermometerSnowflake,
  Truck,
  Warehouse,
} from "lucide-react";

const CORE_SERVICES = [
  {
    id: "bulk-supply",
    title: "Institutional Bulk Wholesale Supply",
    badge: "Direct Allocation",
    tagline: "Mill & Manufacturer Direct Volumes for Healthcare, Retail & Construction",
    description:
      "Vensure negotiates directly with global pharmaceutical manufacturers, domestic sugar & edible oil refineries, and structural steel rolling mills to supply institutional clients without intermediary layer markups.",
    features: [
      "Contracted Volume Allocations with fixed quarterly price locks in KES",
      "Flexible Credit Terms (30 - 60 day payment schedules for verified accounts)",
      "Dedicated Enterprise Account Manager & 24/7 priority requisition hotline",
      "Complete regulatory dossiers, batch test Certificates of Analysis (CoA)",
    ],
    sla: "99.4% On-Time In-Full (OTIF) Delivery",
    targetSectors: "Hospitals, Supermarket Chains, Commercial Contractors, County Health Boards",
  },
  {
    id: "cold-chain",
    title: "Validated Pharmaceutical & Cold Chain Logistics",
    badge: "Active Telematics",
    tagline: "Unbroken 2°C – 8°C & -20°C Temperature Integrity from Port to Clinic",
    description:
      "Operating Kenya's premier validated pharmaceutical cold chain network. From refrigerated maritime reefers at Kilindini Harbour to county hospital vaccine banks, our automated telemetry logs guarantee zero thermal excursions.",
    features: [
      "Dual-redundant cooling units with automatic generator failover in all vaults",
      "Continuous satellite GPS & GSM real-time temperature telemetry loggers",
      "Validated phase-change thermal shippers and active reefer truck fleet",
      "WHO Good Distribution Practices (GDP) validated calibration records",
    ],
    sla: "Zero Cold Chain Excursions Guaranteed",
    targetSectors: "Specialized Clinics, Vaccine Distribution Programs, Bio-pharmaceuticals, Dairy Cold Storage",
  },
  {
    id: "fleet",
    title: "Nationwide 47-County Fleet & Freight Haulage",
    badge: "GPS Monitored",
    tagline: "Over 85 Company-Owned Heavy Trucks Connecting Kenyan Trade Corridors",
    description:
      "Eliminating the uncertainty of third-party transport brokers. Vensure's own fleet of 5-tonne, 10-tonne, 15-tonne, and 28-tonne heavy haulage trucks operate scheduled daily dispatch runs across all 47 counties of Kenya.",
    features: [
      "Electronic Proof of Delivery (e-PoD) with biometric receiver sign-offs",
      "24/7 Satellite Telematics & Geofenced route corridor compliance",
      "Same-Day delivery within Nairobi Metropolitan Area and Coastal strip",
      "Express 24-Hour delivery to Western Kenya, Rift Valley, and Mount Kenya regions",
    ],
    sla: "Scheduled 8h – 36h Nationwide Turnaround",
    targetSectors: "Regional Distributors, Government Directorates, Remote Construction Sites, NGO Relief Convoys",
  },
  {
    id: "bonded",
    title: "Bonded Warehousing & Port Clearance Logistics",
    badge: "KRA Licensed",
    tagline: "16,000 SQM Customs Bonded Storage at Changamwe, Mombasa Port Gateway",
    description:
      "Facilitating seamless maritime imports through the Port of Mombasa. Our bonded facility allows international suppliers to store bulk inventory duty-deferred until domestic release or cross-border EAC transit.",
    features: [
      "Direct port shipside offloading and container deconsolidation services",
      "Duty-deferred bonded storage reducing immediate customs cash-outlay",
      "Fast-track Kenya Single Window and EAC Single Customs Territory clearing",
      "Cross-border bonded escort and transshipment into Uganda, Rwanda, and South Sudan",
    ],
    sla: "Fast-Track 48-Hour Vessel to Warehouse Clearance",
    targetSectors: "International Exporters, Commodity Importers, Multilateral Development Agencies",
  },
  {
    id: "vmi",
    title: "Vendor-Managed Inventory (VMI) & JIT Fulfillment",
    badge: "Tech Integrated",
    tagline: "Automated Reorder Thresholds Integrated with Vensure Procurement MS",
    description:
      "Never suffer critical stockouts again. Our VMI program embeds automatic reorder triggers directly with client storerooms, ensuring consumable supplies are restocked Just-In-Time (JIT) based on live consumption rates.",
    features: [
      "Automated stock replenishment when departmental safety stock hits 25%",
      "Consignment stock options with payment triggered upon actual usage",
      "Barcode scanning and batch tracking down to the individual ward or site level",
      "Native synchronization with our internal Procurement Management System",
    ],
    sla: "Zero Unplanned Stockout Commitment",
    targetSectors: "Private Hospital Networks, Fast-Paced Industrial Assembly Lines, FMCG Retail Warehouses",
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-24 py-12">
      {/* Header */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 text-xs text-[#c3c3cc]">
          <span className="w-2 h-2 rounded-full bg-[#5266eb]"></span>
          <span>End-to-End Supply Chain Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#ededf3] leading-tight max-w-3xl">
          Comprehensive Logistics, Cold Storage &amp; Bulk Distribution.
        </h1>
        <p className="text-sm sm:text-base text-[#c3c3cc] max-w-2xl leading-relaxed">
          From shipside container deconsolidation in Mombasa to temperature-controlled last-mile delivery in Turkana, Vensure operates Kenya&apos;s most integrated distribution infrastructure.
        </p>
      </section>

      {/* Services List (Mercury Graphite Surface Cards) */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-8">
        {CORE_SERVICES.map((service, idx) => (
          <div
            key={service.id}
            id={service.id}
            className="bg-[#1e1e2a] rounded-xl p-8 sm:p-12 border border-[#70707d]/20 space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#70707d]/20 pb-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#5266eb]">0{idx + 1}.</span>
                  <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#272735] text-[#ededf3]">
                    {service.badge}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
                  {service.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#5266eb] font-medium">
                  {service.tagline}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#171721] border border-[#70707d]/30 text-right">
                <span className="text-[10px] text-[#c3c3cc] block">Service Benchmark SLA</span>
                <strong className="text-xs text-emerald-400">{service.sla}</strong>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#c3c3cc] leading-relaxed max-w-3xl">
              {service.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {service.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#ededf3]">
                  <CheckCircle2 className="w-4 h-4 text-[#5266eb] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[#70707d]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="text-[#c3c3cc]">
                <strong className="text-[#ededf3]">Primary Client Sectors:</strong> {service.targetSectors}
              </div>
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="px-5 py-2.5 rounded-full text-xs font-medium bg-[#272735] hover:bg-[#5266eb] hover:text-white text-[#ededf3] transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Engage This Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Fleet & Telemetry Specification Section */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#1e1e2a] rounded-xl p-8 sm:p-12 border border-[#70707d]/30 space-y-8">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
              Physical Logistics Asset Overview
            </span>
            <h3 className="text-2xl font-normal text-[#ededf3]">
              Fleet Classifications &amp; Cargo Configurations
            </h3>
            <p className="text-xs text-[#c3c3cc] max-w-xl">
              All vehicles are managed directly through our Nairobi operations control center with real-time video telematics, speed limiters, and dual-driver shifts on overnight routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#c3c3cc]">
            <div className="bg-[#171721] p-6 rounded-xl border border-[#70707d]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ededf3]">Light Commercial Reefers (3T – 5T)</span>
                <span className="text-[10px] font-mono text-cyan-400">Cold Chain Active</span>
              </div>
              <p>Specialized for clinic vaccine runs, hospital express supplies, and urban retail deliveries in congested metropolitan zones.</p>
              <div className="text-[11px] text-[#ededf3] font-mono pt-2 border-t border-[#70707d]/20">
                Payload: 4 Pallets • Temperature: -20°C to +8°C
              </div>
            </div>

            <div className="bg-[#171721] p-6 rounded-xl border border-[#70707d]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ededf3]">Medium Rigid Haulers (10T – 15T)</span>
                <span className="text-[10px] font-mono text-[#5266eb]">Regional Trunk</span>
              </div>
              <p>Ideal for multi-county supermarket orders, institutional hospital supply consignments, and bulk agricultural inputs.</p>
              <div className="text-[11px] text-[#ededf3] font-mono pt-2 border-t border-[#70707d]/20">
                Payload: 12 Pallets • Curtainsider / Box Body
              </div>
            </div>

            <div className="bg-[#171721] p-6 rounded-xl border border-[#70707d]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#ededf3]">Heavy Semi-Trailers (28T – 32T)</span>
                <span className="text-[10px] font-mono text-emerald-400">Port Corridors</span>
              </div>
              <p>Direct port container transport, bulk structural cement haulage, and long-haul inter-depot rebalancing from Mombasa to Kisumu.</p>
              <div className="text-[11px] text-[#ededf3] font-mono pt-2 border-t border-[#70707d]/20">
                Payload: 26 Pallets / 40ft High Cube Container
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="bg-[#1e1e2a] rounded-2xl p-10 border border-[#70707d]/30 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-normal text-[#ededf3]">
            Custom Logistics &amp; Distribution Contracting
          </h3>
          <p className="text-xs sm:text-sm text-[#c3c3cc] max-w-xl mx-auto leading-relaxed">
            Need dedicated fleet leasing, long-term cold-vault reservations, or cross-border transshipment agreements? Speak with our operations planning team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full text-xs font-medium text-white bg-[#5266eb] hover:bg-[#4355d8] transition flex items-center gap-2"
            >
              <span>Schedule Logistics Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 rounded-full text-xs font-medium text-[#ededf3] border border-[#ededf3]/25 hover:border-[#ededf3] transition"
            >
              Read About Regional Hubs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
