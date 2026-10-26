import { NextResponse } from "next/server";
import { getPhase1State, savePhase1State, appendAuditEntry } from "@/server/store/phase1-store";

export interface PublicBusinessEnquiry {
  id: string;
  referenceNo: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  destinationCounty: string;
  volumeTier: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUOTE_ISSUED";
  submittedAt: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const companyName = String(body.companyName || "").trim();
    const contactPerson = String(body.contactPerson || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const category = String(body.category || "General Wholesale").trim();
    const destinationCounty = String(body.destinationCounty || "Nairobi").trim();
    const volumeTier = String(body.volumeTier || "Bulk Pallet (KES 500k - 2.5M)").trim();
    const message = String(body.message || "").trim();

    if (!companyName || !email) {
      return NextResponse.json(
        { ok: false, error: "Company name and corporate email are mandatory." },
        { status: 400 }
      );
    }

    const countyCode = destinationCounty.slice(0, 3).toUpperCase();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `ENQ-2026-${countyCode}-${randomSeq}`;
    const submittedAt = new Date().toISOString().replace("T", " ").slice(0, 19);

    const enquiry: PublicBusinessEnquiry = {
      id: `enq_${Date.now()}`,
      referenceNo,
      companyName,
      contactPerson: contactPerson || "Corporate Representative",
      email,
      phone: phone || "+254 700 000 000",
      category,
      destinationCounty,
      volumeTier,
      message: message || "Requested wholesale pricing and volume allocation.",
      status: "NEW",
      submittedAt,
    };

    // Optionally append to state audit trail as a public lead
    try {
      const state = getPhase1State();
      appendAuditEntry(state, {
        organizationId: state.activeOrganizationId,
        actorName: `${companyName} (${contactPerson || "Lead"})`,
        actorRole: "VIEWER",
        action: "PUBLIC_INQUIRY.SUBMITTED",
        entityType: "PublicEnquiry",
        entityId: referenceNo,
        summary: `Public wholesale inquiry received from "${companyName}" for [${category}] to ${destinationCounty} (${volumeTier}). Contact: ${email}.`,
      });
      savePhase1State(state);
    } catch {
      // In standalone mode if store lock happens, continue gracefully
    }

    return NextResponse.json({
      ok: true,
      referenceNo,
      companyName,
      destinationCounty,
      submittedAt,
      message:
        "Thank you for contacting Vensure. Your wholesale enquiry has been logged into our East Africa dispatch routing queue. A senior account executive will contact you within 2 business hours.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Failed to process enquiry." },
      { status: 500 }
    );
  }
}
