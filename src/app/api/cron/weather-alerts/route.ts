import { NextResponse } from "next/server";
import webpush from "web-push";
import { listSubs } from "@/lib/push-store";
import { VAPID_MAIL, VAPID_PRIVATE, VAPID_PUBLIC } from "@/lib/vapid";
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const origin = new URL(req.url).origin;
  const wx = await fetch(`${origin}/api/weather`, { cache: "no-store" });
  const data = await wx.json();
  const alerts = data.alerts ?? [];
  if (!alerts.length) return NextResponse.json({ skipped: true, alerts: 0 });
  webpush.setVapidDetails(VAPID_MAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  const names = alerts.map((a: { name: string }) => a.name).join(", ");
  const payload = JSON.stringify({ title: "Allerta meteo SCUDO", body: `Rischio grandine: ${names}`, url: "/" });
  const results = await Promise.allSettled(
    listSubs().map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload))
  );
  return NextResponse.json({ alerts: alerts.length, pushed: results.filter((r) => r.status === "fulfilled").length });
}
