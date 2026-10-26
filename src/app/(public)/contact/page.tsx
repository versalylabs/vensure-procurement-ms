"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";

function ContactPageContent() {
  const searchParams = useSearchParams();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+254 ");
  const [category, setCategory] = useState("Healthcare");
  const [destinationCounty, setDestinationCounty] = useState("Nairobi");
  const [volumeTier, setVolumeTier] = useState("Bulk Pallet (KES 500k - 2.5M)");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<{
    referenceNo: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const skuParam = searchParams.get("sku");
    const qtyParam = searchParams.get("qty");
    const catParam = searchParams.get("cat");
    const countyParam = searchParams.get("county");
    const serviceParam = searchParams.get("service");

    if (catParam) setCategory(catParam);
    if (countyParam) setDestinationCounty(countyParam);
    if (skuParam) {
      setMessage(`Requested formal wholesale quotation for SKU [${skuParam}], estimated quantity: ${qtyParam || "1 pallet"}.`);
    } else if (serviceParam) {
      setMessage(`Inquiry regarding dedicated ${serviceParam} commercial agreement and service level contract.`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/public-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactPerson,
          email,
          phone,
          category,
          destinationCounty,
          volumeTier,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Submission failed. Please check your inputs.");
        return;
      }

      setSubmittedResponse({
        referenceNo: data.referenceNo,
        message: data.message,
      });
    } catch {
      setErrorMessage("Network error connecting to Vensure dispatch routing server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 py-12">
      {/* Header */}
      <section className="max-w-[1200px] mx-auto px-6 space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1e2a] border border-[#70707d]/30 text-xs text-[#c3c3cc]">
          <span className="w-2 h-2 rounded-full bg-[#5266eb]"></span>
          <span>Commercial Engagements &amp; Depot Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#ededf3] leading-tight">
          Connect with Our National Wholesale &amp; Logistics Desk.
        </h1>
        <p className="text-sm text-[#c3c3cc] max-w-2xl leading-relaxed">
          Submit an institutional RFQ, discuss master framework distribution contracts, or reach out to our regional operations hubs across Kenya.
        </p>
      </section>

      {/* Main 2-Column Section: Form + Contact Info */}
      <section id="inquiry" className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive RFQ / Business Form (Graphite Card #1e1e2a) */}
          <div className="lg:col-span-7 bg-[#1e1e2a] rounded-xl p-8 sm:p-10 border border-[#70707d]/30 space-y-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#5266eb] font-medium">
                Official Business Inquiry
              </span>
              <h2 className="text-xl sm:text-2xl font-normal text-[#ededf3]">
                Request a Wholesale Quotation / Account Opening
              </h2>
              <p className="text-xs text-[#c3c3cc]">
                Responses are reviewed and routed by our senior commercial account directors within 2 business hours.
              </p>
            </div>

            {submittedResponse ? (
              <div className="p-8 rounded-xl bg-[#171721] border border-emerald-500/40 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#5266eb] block">
                    TRACKING REF: {submittedResponse.referenceNo}
                  </span>
                  <h3 className="text-lg font-normal text-white">
                    Wholesale Enquiry Successfully Logged
                  </h3>
                </div>
                <p className="text-xs text-[#c3c3cc] leading-relaxed max-w-md mx-auto">
                  {submittedResponse.message}
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedResponse(null);
                      setMessage("");
                    }}
                    className="px-5 py-2 rounded-full text-xs bg-[#272735] text-[#ededf3] hover:bg-[#313142]"
                  >
                    Submit Another Inquiry
                  </button>
                  <Link
                    href="/products"
                    className="px-5 py-2 rounded-full text-xs bg-[#5266eb] text-white hover:bg-[#4355d8]"
                  >
                    Back to Product Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Company / Institutional Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Horizon Healthcare Group"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#171721] px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Contact Person Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Achieng Otieno"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full bg-[#171721] px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Corporate Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="procurement@organization.co.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#171721] px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Direct Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 711 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#171721] px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Product Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#171721] px-3 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] focus:outline-none"
                    >
                      <option value="Healthcare">Pharmaceuticals &amp; Medical</option>
                      <option value="FMCG">FMCG &amp; Food Commodities</option>
                      <option value="Industrial">Industrial &amp; Hardware</option>
                      <option value="Agriculture">Agricultural Inputs</option>
                      <option value="Logistics Only">Fleet &amp; Cold Chain Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Delivery County
                    </label>
                    <select
                      value={destinationCounty}
                      onChange={(e) => setDestinationCounty(e.target.value)}
                      className="w-full bg-[#171721] px-3 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] focus:outline-none"
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Uasin Gishu (Eldoret)">Uasin Gishu (Eldoret)</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Kilifi">Kilifi</option>
                      <option value="Kakamega">Kakamega</option>
                      <option value="Meru">Meru</option>
                      <option value="Turkana">Turkana</option>
                      <option value="Other Kenyan County">Other County</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#c3c3cc] mb-1 font-medium">
                      Estimated Volume
                    </label>
                    <select
                      value={volumeTier}
                      onChange={(e) => setVolumeTier(e.target.value)}
                      className="w-full bg-[#171721] px-3 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] focus:outline-none"
                    >
                      <option value="KES 150k - 500k">Box / Carton (KES 150k – 500k)</option>
                      <option value="Bulk Pallet (KES 500k - 2.5M)">Pallet Tier (KES 500k – 2.5M)</option>
                      <option value="Full Truckload (KES 2.5M - 10M)">Full Truckload (KES 2.5M – 10M)</option>
                      <option value="Annual Framework (> KES 10M)">Annual Contract (&gt; KES 10M)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#c3c3cc] mb-1 font-medium">
                    Order Details, SKUs or Special Delivery Instructions
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify item quantities, delivery schedule, cold-chain temperature thresholds, or tender reference numbers..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#171721] px-3.5 py-2.5 rounded-lg border border-[#70707d]/40 text-[#ededf3] placeholder-[#70707d] focus:outline-none focus:border-[#ededf3]"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-full text-xs font-medium text-white bg-[#5266eb] hover:bg-[#4355d8] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Logging Inquiry in Vensure Dispatch Matrix...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Official Inquiry &amp; Generate Tracking Code</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Depots, Helplines & Portals */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Portals Box */}
            <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/30 space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-[#ededf3]">
                Already an Active Trading Partner?
              </h3>
              <p className="text-[#c3c3cc] leading-relaxed">
                Registered institutional buyers and approved suppliers can access their respective dedicated self-service systems:
              </p>
              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 rounded-full bg-[#272735] hover:bg-[#313142] text-[#ededf3] transition flex items-center justify-between font-medium"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Client Procurement MS
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/portal"
                  className="w-full py-2.5 px-4 rounded-full border border-[#ededf3]/20 hover:border-[#ededf3] text-[#ededf3] transition flex items-center justify-between font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#5266eb]" />
                    Supplier Self-Service Portal
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Central Communications & Contacts */}
            <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/30 space-y-4 text-xs text-[#c3c3cc]">
              <h3 className="text-sm font-semibold text-[#ededf3]">
                Direct Lines &amp; Customer Support
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#5266eb] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#ededf3] block">Operations Switchboard:</strong>
                    <span>+254 20 790 3000 / +254 711 820 400</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#5266eb] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#ededf3] block">Commercial Wholesale Desk:</strong>
                    <span>wholesale@vensure.co.ke</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#5266eb] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#ededf3] block">Depot Operating Hours:</strong>
                    <span>Monday – Friday: 06:00 – 19:00 EAT</span>
                    <span className="block text-[11px] text-emerald-400">Emergency Cold-Chain Reefer Dispatch: 24/7/365</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Logistics Depots */}
            <div className="bg-[#1e1e2a] rounded-xl p-6 border border-[#70707d]/30 space-y-4 text-xs text-[#c3c3cc]">
              <h3 className="text-sm font-semibold text-[#ededf3]">
                Regional Hub Locations
              </h3>
              <div className="space-y-3 divide-y divide-[#70707d]/20">
                <div className="pt-2">
                  <strong className="text-[#ededf3] block">Nairobi Central Logistics Park (HQ)</strong>
                  <span>Enterprise Road, Industrial Area, Nairobi</span>
                </div>
                <div className="pt-2">
                  <strong className="text-[#ededf3] block">Mombasa Maritime Gateway Depot</strong>
                  <span>Port Reitz Road, Changamwe, Mombasa</span>
                </div>
                <div className="pt-2">
                  <strong className="text-[#ededf3] block">Kisumu Great Lakes Transshipment Hub</strong>
                  <span>Obote Road Industrial Strip, Kisumu</span>
                </div>
                <div className="pt-2">
                  <strong className="text-[#ededf3] block">Eldoret North Rift Center</strong>
                  <span>Kapsoya Industrial Zone, Eldoret</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#171721] flex items-center justify-center p-12 text-[#c3c3cc] text-xs">
          Loading contact form...
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
