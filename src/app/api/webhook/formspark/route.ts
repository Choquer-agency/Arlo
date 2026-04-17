import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function POST(request: NextRequest) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  try {
    const data = await request.json();

    const lead = {
      websiteSource: data.websiteSource || "unknown",
      websiteRegion: data.websiteRegion || "unknown",
      name: data.name || "",
      email: data.email || "",
      company: data.company || "",
      submittedAt: data.submittedAt || new Date().toISOString(),
    };

    // Store under monthly key: leads:2026-03
    const monthKey = `leads:${lead.submittedAt.slice(0, 7)}`;
    await redis.lpush(monthKey, JSON.stringify(lead));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
