import { NextResponse } from "next/server";
import webpush from "web-push";
import { listSubs } from "@/lib/push-store";
import { VAPID_MAIL, VAPID_PRIVATE, VAPID_PUBLIC } from "@/lib/vapid";
export async function POST(req: Request) {
  webpush.setVapidDetails(VAPID_MAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  const body = await req.json().catch(() => ({}));
  const title = body.title ?? "SCUDO ITALIA";
  const message = body.body ?? "Allerta grandine sulla rete.";
  const payload = JSON.stringify({ title, body: message, url: "/" });
  const results = await Promise.allSettled(
    listSubs().map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload))
  );
  return NextResponse.json({ sent: results.filter((r) => r.status === "fulfilled").length, total: results.length });
}
