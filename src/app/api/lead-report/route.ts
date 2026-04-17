import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

interface Lead {
  websiteSource: string;
  websiteRegion: string;
  name: string;
  email: string;
  company: string;
  submittedAt: string;
}

export async function GET(request: NextRequest) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const resend = new Resend(process.env.RESEND_API_KEY!);
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use ?month=YYYY-MM to override, otherwise default to previous month
    const now = new Date();
    const monthParam = request.nextUrl.searchParams.get("month");
    let monthKey: string;
    let monthLabel: string;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      monthKey = `leads:${monthParam}`;
      const [y, m] = monthParam.split("-").map(Number);
      monthLabel = new Date(y, m - 1, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      monthKey = `leads:${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
      monthLabel = prevMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    // Fetch all leads for the month
    const rawLeads = await redis.lrange(monthKey, 0, -1);
    const leads: Lead[] = rawLeads.map((entry) =>
      typeof entry === "string" ? JSON.parse(entry) : entry
    );

    if (leads.length === 0) {
      await resend.emails.send({
        from: "Ollie Hours <noreply@ollieinvoice.com>",
        to: process.env.REPORT_EMAIL!,
        subject: `choquer.agency-marketing-report-${monthLabel.replace(" ", "-")}`,
        html: `<p>No leads were received in ${monthLabel}.</p>`,
      });

      return NextResponse.json({ sent: true, leads: 0 });
    }

    // Group by website
    const grouped: Record<string, { region: string; leads: Lead[] }> = {};
    for (const lead of leads) {
      const key = lead.websiteSource;
      if (!grouped[key]) {
        grouped[key] = { region: lead.websiteRegion, leads: [] };
      }
      grouped[key].leads.push(lead);
    }

    // Sort by lead count descending
    const sorted = Object.entries(grouped).sort(
      (a, b) => b[1].leads.length - a[1].leads.length
    );

    // Build email HTML
    const rows = sorted
      .map(
        ([domain, data]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:500;">${domain}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eee;">${data.region}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;font-weight:600;">${data.leads.length}</td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;">
        <h1 style="font-size:22px;color:#111;">Lead Report — ${monthLabel}</h1>
        <p style="color:#666;margin-bottom:24px;">Total leads: <strong>${leads.length}</strong> across <strong>${sorted.length}</strong> websites</p>

        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #ddd;">Website</th>
              <th style="padding:10px 14px;text-align:left;border-bottom:2px solid #ddd;">Region</th>
              <th style="padding:10px 14px;text-align:center;border-bottom:2px solid #ddd;">Leads</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <h2 style="font-size:16px;color:#111;margin-top:32px;">Lead Details</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;font-size:13px;">Name</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;font-size:13px;">Email</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;font-size:13px;">Company</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;font-size:13px;">Website</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;font-size:13px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${leads
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .map(
                (lead) => `
              <tr>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:13px;">${lead.name}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:13px;">${lead.email}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:13px;">${lead.company}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:13px;">${lead.websiteSource}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;font-size:13px;">${new Date(lead.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <p style="color:#999;font-size:12px;margin-top:24px;">Generated automatically on ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>
    `;

    await resend.emails.send({
      from: "Ollie Hours <noreply@ollieinvoice.com>",
      to: process.env.REPORT_EMAIL!,
      subject: `choquer.agency-marketing-report-${monthLabel.replace(" ", "-")}`,
      html,
    });

    return NextResponse.json({ sent: true, leads: leads.length });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
