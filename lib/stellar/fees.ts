import { server } from "./horizon";

const CACHE_TTL_MS = 30_000;

let cachedBaseFee: string | null = null;
let cachedAt: number = 0;

const FALLBACK_BASE_FEE_XLM = "0.00001";

export async function fetchBaseFee(): Promise<string> {
  const now = Date.now();
  if (cachedBaseFee && now - cachedAt < CACHE_TTL_MS) {
    return cachedBaseFee;
  }

  try {
    const stats = await server.feeStats();
    const stroops = stats.last_ledger_base_fee;
    const xlm = (Number(stroops) / 10_000_000).toFixed(7);
    cachedBaseFee = xlm;
    cachedAt = now;
    return xlm;
  } catch {
    return FALLBACK_BASE_FEE_XLM;
  }
}
