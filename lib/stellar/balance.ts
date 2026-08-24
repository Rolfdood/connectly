import { Horizon, NotFoundError } from "@stellar/stellar-sdk";
import { server } from "./horizon";

export interface NativeBalanceResult {
  balance: string;
  isUnfunded: boolean;
}

function formatXLM(value: string): string {
  return Number(value).toFixed(7);
}

export async function fetchNativeBalance(
  publicKey: string
): Promise<NativeBalanceResult> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b): b is Horizon.HorizonApi.BalanceLineNative =>
        typeof b === "object" && "asset_type" in b && b.asset_type === "native"
    );

    if (!nativeBalance) {
      return { balance: "0.0000000", isUnfunded: false };
    }

    return {
      balance: formatXLM(nativeBalance.balance),
      isUnfunded: false,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { balance: "0.0000000", isUnfunded: true };
    }

    if (
      error instanceof Error &&
      (error.message.includes("404") || error.message.includes("NotFound"))
    ) {
      return { balance: "0.0000000", isUnfunded: true };
    }

    // Log unexpected errors for debugging
    console.error("[fetchNativeBalance] Unexpected error:", error);
    throw error;
  }
}
