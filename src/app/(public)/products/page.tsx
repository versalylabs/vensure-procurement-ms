"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Filter,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  ThermometerSnowflake,
  X,
} from "lucide-react";
import { formatKES } from "@/lib/utils";

interface WholesaleProduct {
  id: string;
  sku: string;
  name: string;
  category: "Healthcare" | "FMCG" | "Industrial" | "Agriculture";
  specification: string;
  unitOfMeasure: string;
  moq: number;
  benchmarkUnitPrice: number;
  coldChainRequired: boolean;
  hubLocation: string;
  inStock: boolean;
  leadTimeHours: number;
}

const PRODUCTS_CATALOG: WholesaleProduct[] = [
  {
    id: "p1",
    sku: "PHARM-AMO-625",
    name: "Amoxicillin / Clavulanate 625mg Tablets",
    category: "Healthcare",
    specification: "USP Standard blister packs, 10x10 per outer box. Batch CoA and PPB import verification attached.",
    unitOfMeasure: "Box (100 Tabs)",
    moq: 50,
    benchmarkUnitPrice: 8500,
    coldChainRequired: false,
    hubLocation: "Nairobi Central Vault",
    inStock: true,
    leadTimeHours: 12,
  },
  {
    id: "p2",
    sku: "MED-INF-901",
    name: "Digital Touchscreen Infusion Pump",
    category: "Healthcare",
    specification: "Clinical ICU rated, micro-flow accuracy ±2%, rechargeable lithium-ion battery, KEBS verified.",
    unitOfMeasure: "Unit",
    moq: 5,
    benchmarkUnitPrice: 145000,
    coldChainRequired: false,
    hubLocation: "Nairobi Central Vault",
    inStock: true,
    leadTimeHours: 24,
  },
  {
    id: "p3",
    sku: "SURG-LAP-50",
    name: "Sterile Laparotomy Sponges with X-Ray Detectable Line",
    category: "Healthcare",
    specification: "100% Cotton gauze, pre-washed, 4-ply 45cm x 45cm, packaged in peelable medical pouches.",
    unitOfMeasure: "Box of 50",
    moq: 30,
    benchmarkUnitPrice: 5600,
    coldChainRequired: false,
    hubLocation: "Mombasa Gateway Hub",
    inStock: true,
    leadTimeHours: 18,
  },
  {
    id: "p4",
    sku: "FMCG-OIL-20L",
    name: "Refined Palm Olein Vegetable Cooking Oil (20L)",
    category: "FMCG",
    specification: "Fortified with Vitamin A, zero cholesterol, tamper-evident sealed HDPE yellow jerrycan.",
    unitOfMeasure: "20L Jerrycan",
    moq: 60,
    benchmarkUnitPrice: 4850,
    coldChainRequired: false,
    hubLocation: "Mombasa Gateway Hub",
    inStock: true,
    leadTimeHours: 24,
  },
  {
    id: "p5",
    sku: "FMCG-RICE-50K",
    name: "Grade 1 Fortified Long Grain White Rice (50kg)",
    category: "FMCG",
    specification: "Aromatic double-polished, maximum 5% brokens, moisture < 13%, food-grade woven polypropylene bag.",
    unitOfMeasure: "50kg Sack",
    moq: 100,
    benchmarkUnitPrice: 7200,
    coldChainRequired: false,
    hubLocation: "Kisumu Great Lakes Hub",
    inStock: true,
    leadTimeHours: 18,
  },
  {
    id: "p6",
    sku: "FMCG-SGR-50K",
    name: "Refined Pure Granulated White Cane Sugar (50kg)",
    category: "FMCG",
    specification: "99.8% Polarisation, dry crystalline, KEBS standardization marked, institutional baker & retail pack.",
    unitOfMeasure: "50kg Sack",
    moq: 80,
    benchmarkUnitPrice: 8100,
    coldChainRequired: false,
    hubLocation: "Kisumu Great Lakes Hub",
    inStock: true,
    leadTimeHours: 18,
  },
  {
    id: "p7",
    sku: "IND-STL-16MM",
    name: "Deformed High-Yield Structural Rebars (16mm x 12m)",
    category: "Industrial",
    specification: "BS 4449 Grade 500B high tensile rib steel, mill test certification, bundled in 1-tonne straps.",
    unitOfMeasure: "12m Bar",
    moq: 120,
    benchmarkUnitPrice: 3450,
    coldChainRequired: false,
    hubLocation: "Nairobi Central Logistics",
    inStock: true,
    leadTimeHours: 24,
  },
  {
    id: "p8",
    sku: "IND-CEM-425",
    name: "Portland Pozzolana Structural Cement 42.5N (50kg)",
    category: "Industrial",
    specification: "High early strength civil construction cement, shrink-wrapped 40-bag wooden pallets.",
    unitOfMeasure: "50kg Bag",
    moq: 200,
    benchmarkUnitPrice: 780,
    coldChainRequired: false,
    hubLocation: "Mombasa Gateway Hub",
    inStock: true,
    leadTimeHours: 12,
  },
  {
    id: "p9",
    sku: "PPE-NIT-88",
    name: "Heavy-Duty Chemical Resistant Nitrile Gloves (Box 100)",
    category: "Industrial",
    specification: "Powder-free, textured fingertips, puncture resistance Level 4, certified EN 374 & EN 388.",
    unitOfMeasure: "Box (100 Pcs)",
    moq: 40,
    benchmarkUnitPrice: 2100,
    coldChainRequired: false,
    hubLocation: "Nairobi Central Vault",
    inStock: true,
    leadTimeHours: 12,
  },
  {
    id: "p10",
    sku: "VET-VAC-BIO",
    name: "Bovine Multi-Strain Respiratory Biologic (Cold Chain)",
    category: "Agriculture",
    specification: "Continuous cold-vault maintained at 2°C – 8°C. Multidose vial with diluent, KEPHIS verified.",
    unitOfMeasure: "50-Dose Vial",
    moq: 25,
    benchmarkUnitPrice: 16500,
    coldChainRequired: true,
    hubLocation: "Eldoret North Rift Hub",
    inStock: true,
    leadTimeHours: 24,
  },
  {
    id: "p11",
    sku: "AGRO-FERT-50",
    name: "Enriched Granular Basal Compound NPK 17:17:17 (50kg)",
    category: "Agriculture",
    specification: "Uniform particle size, anti-caking coated, certified nutrient content, polythene lined sack.",
    unitOfMeasure: "50kg Sack",
    moq: 150,
    benchmarkUnitPrice: 5400,
    coldChainRequired: false,
    hubLocation: "Eldoret North Rift Hub",
    inStock: true,
    leadTimeHours: 24,
  },
  {
    id: "p12",
    sku: "INSUL-COLD-10",
    name: "Human Regular Insulin 100 IU/ml (Cold Chain 2°C-8°C)",
    category: "Healthcare",
    specification: "10ml Vials, GMP audited recombinant DNA human insulin, verified cold-chain shipping log.",
    unitOfMeasure: "Pack of 10 Vials",
    moq: 40,
    benchmarkUnitPrice: 12500,
    coldChainRequired: true,
    hubLocation: "Nairobi Central Vault",
    inStock: true,
    leadTimeHours: 12,
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || "All");
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<WholesaleProduct | null>(null);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(50);
  const [quoteDestination, setQuoteDestination] = useState<string>("Nairobi");
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [catParam]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS_CATALOG.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.specification.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenQuoteModal = (product: WholesaleProduct) => {
    setSelectedProductForQuote(product);
    setQuoteQuantity(product.moq);
    setQuoteSubmitted(false);
  };

  return (
    <div className="space-y-16 py-12">
      {/* Header & Controls */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
            Master Wholesale Inventory
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#ededf3]">
            Verified Institutional Catalogs &amp; Pallet Pricing
          </h1>
          <p className="text-xs sm:text-sm text-[#c3c3cc] max-w-2xl leading-relaxed">
            All items are warehoused in Vensure facilities, inspected against Kenyan regulatory standards, and available for contracted volume allocation.
          </p>
        </div>

        {/* Filter Pills & Search Bar (Mercury Style Pill Controls) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#1e1e2a] p-1.5 rounded-full border border-[#70707d]/20">
            {["All", "Healthcare", "FMCG", "Industrial", "Agriculture"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 text-xs rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-[#5266eb] text-white font-medium"
                    : "text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]"
                }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-[#70707d] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, item name or spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e1e2a] text-[#ededf3] placeholder-[#70707d] text-xs pl-10 pr-4 py-2.5 rounded-full border border-[#70707d]/30 focus:outline-none focus:border-[#ededf3] transition"
            />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-[1200px] mx-auto px-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-[#1e1e2a] rounded-xl p-12 text-center space-y-3 border border-[#70707d]/20">
            <Package className="w-8 h-8 text-[#70707d] mx-auto" />
            <h3 className="text-base font-medium text-[#ededf3]">No wholesale items matched your filter</h3>
            <p className="text-xs text-[#c3c3cc]">Try adjusting your search keywords or category filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded-full text-xs bg-[#272735] text-[#ededf3] hover:bg-[#313142]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/20 hover:border-[#70707d]/50 transition flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#272735] text-[#ededf3]">
                      {p.sku}
                    </span>
                    {p.coldChainRequired ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-700/40 font-medium flex items-center gap-1">
                        <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
                        2°C – 8°C Cold Chain
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#272735] text-[#c3c3cc]">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-normal text-[#ededf3] group-hover:text-white transition">
                    {p.name}
                  </h3>

                  <p className="text-xs text-[#c3c3cc] leading-relaxed line-clamp-3">
                    {p.specification}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#70707d]/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#c3c3cc]">Unit of Measure:</span>
                    <span className="text-[#ededf3] font-medium">{p.unitOfMeasure}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#c3c3cc]">Minimum Order (MOQ):</span>
                    <span className="text-[#ededf3] font-mono">{p.moq} {p.unitOfMeasure.split(" ")[0]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#c3c3cc]">Benchmark Wholesale Rate:</span>
                    <span className="text-sm font-semibold text-[#ededf3]">
                      {formatKES(p.benchmarkUnitPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#c3c3cc]/80">
                    <span>{p.hubLocation}</span>
                    <span className="text-emerald-400">Dispatch in {p.leadTimeHours}h</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQuoteModal(p)}
                    className="w-full mt-2 py-2.5 rounded-full text-xs font-medium bg-[#272735] hover:bg-[#5266eb] hover:text-white text-[#ededf3] transition flex items-center justify-center gap-1.5"
                  >
                    <span>Request Volume Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Catalog Download Strip */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#1e1e2a] rounded-xl p-8 border border-[#70707d]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-normal text-[#ededf3]">
              Need Full Specifications &amp; Pallet Dimensions?
            </h4>
            <p className="text-xs text-[#c3c3cc]">
              Download the complete Vensure Wholesale 2026 Master Product Catalog with packaging metrics, batch numbers, and HS customs codes.
            </p>
          </div>
          <Link
            href="/contact?subject=CatalogDownload"
            className="px-6 py-2.5 rounded-full text-xs font-medium border border-[#ededf3]/25 hover:border-[#ededf3] hover:bg-[#ededf3]/5 text-[#ededf3] transition flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#5266eb]" />
            <span>Download PDF Catalog</span>
          </Link>
        </div>
      </section>

      {/* Quote Request Modal */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1e2a] rounded-2xl border border-[#70707d]/30 max-w-lg w-full p-6 sm:p-8 space-y-6 text-[#ededf3] relative">
            <button
              type="button"
              onClick={() => setSelectedProductForQuote(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#c3c3cc] hover:text-[#ededf3] hover:bg-[#272735]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#5266eb]">
                {selectedProductForQuote.sku}
              </span>
              <h3 className="text-lg font-normal text-[#ededf3]">
                Wholesale Quote Request
              </h3>
              <p className="text-xs text-[#c3c3cc]">
                {selectedProductForQuote.name}
              </p>
            </div>

            {!quoteSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuoteSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div className="p-3 rounded-lg bg-[#171721] border border-[#70707d]/20 flex items-center justify-between">
                  <span className="text-[#c3c3cc]">Benchmark Base Price:</span>
                  <span className="font-semibold text-white">
                    {formatKES(selectedProductForQuote.benchmarkUnitPrice)} / {selectedProductForQuote.unitOfMeasure}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#c3c3cc] mb-1">
                      Required Quantity (MOQ: {selectedProductForQuote.moq})
                    </label>
                    <input
                      type="number"
                      min={selectedProductForQuote.moq}
                      value={quoteQuantity}
                      onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                      className="w-full bg-[#171721] px-3 py-2 rounded-lg border border-[#70707d]/40 text-[#ededf3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#c3c3cc] mb-1">
                      Delivery County
                    </label>
                    <select
                      value={quoteDestination}
                      onChange={(e) => setQuoteDestination(e.target.value)}
                      className="w-full bg-[#171721] px-3 py-2 rounded-lg border border-[#70707d]/40 text-[#ededf3] focus:outline-none"
                    >
                      <option value="Nairobi">Nairobi Metropolitan</option>
                      <option value="Mombasa">Mombasa Coastal Hub</option>
                      <option value="Kisumu">Kisumu Great Lakes</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Uasin Gishu (Eldoret)</option>
                      <option value="Other 42 Counties">Other 42 Counties</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#171721] border border-[#70707d]/20 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#c3c3cc]">Estimated Gross Allocation:</span>
                    <span className="text-[#5266eb] font-semibold">
                      {formatKES(quoteQuantity * selectedProductForQuote.benchmarkUnitPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#70707d]">
                    *Tiered volume rebates and multi-month standing purchase orders qualify for 4% – 12% commercial discounts.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForQuote(null)}
                    className="px-4 py-2 rounded-full text-xs text-[#c3c3cc] hover:text-[#ededf3]"
                  >
                    Cancel
                  </button>
                  <Link
                    href={`/contact?sku=${selectedProductForQuote.sku}&qty=${quoteQuantity}&county=${quoteDestination}`}
                    className="px-5 py-2 rounded-full text-xs font-medium bg-[#5266eb] hover:bg-[#4355d8] text-white flex items-center gap-1.5"
                  >
                    <span>Proceed to RFQ Submission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </form>
            ) : (
              <div className="p-6 rounded-xl bg-[#171721] border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-white">Item Reserved for Quote Generation</h4>
                <p className="text-xs text-[#c3c3cc]">
                  Click below to finalize your company details on our commercial inquiry form.
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-5 py-2 rounded-full text-xs font-medium bg-[#5266eb] text-white"
                >
                  Go to Official RFQ Form →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-[#c3c3cc]">
          Loading Master Wholesale Inventory...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
