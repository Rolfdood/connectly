import { StrKey } from "@stellar/stellar-sdk";

export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  if (!address.startsWith("G")) return false;
  if (address.length !== 56) return false;
  try {
    StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidAmount(
  amount: string,
  maxSendable: string | null
): boolean {
  if (!amount || typeof amount !== "string") return false;

  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return false;

  // Max 7 decimal places
  const parts = amount.split(".");
  if (parts.length === 2 && parts[1].length > 7) return false;

  if (maxSendable !== null) {
    const max = Number(maxSendable);
    if (num > max) return false;
  }

  return true;
}
