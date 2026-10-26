import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vensure-procurement-ms",
    phase: "Phase 0 Foundation",
    timestamp: new Date().toISOString(),
  });
}
