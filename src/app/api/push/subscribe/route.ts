import { NextResponse } from "next/server";
import { addSub, listSubs } from "@/lib/push-store";
export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: "subscription non valida" }, { status: 400 });
  }
  const n = addSub({ endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth }, lat: body.lat, lng: body.lng });
  return NextResponse.json({ ok: true, count: n });
}
export async function GET() {
  return NextResponse.json({ count: listSubs().length });
}
