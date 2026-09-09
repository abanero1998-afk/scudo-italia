export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string }; lat?: number; lng?: number };
const g = globalThis as unknown as { __scudoSubs?: PushSub[] };
if (!g.__scudoSubs) g.__scudoSubs = [];
export function listSubs() { return g.__scudoSubs!; }
export function addSub(sub: PushSub) {
  g.__scudoSubs = g.__scudoSubs!.filter((s) => s.endpoint !== sub.endpoint);
  g.__scudoSubs.push(sub);
  return g.__scudoSubs.length;
}
