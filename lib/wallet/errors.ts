export type WalletErrorCode =
  | "FREIGHTER_NOT_INSTALLED"
  | "USER_REJECTED"
  | "WRONG_NETWORK"
  | "TIMEOUT"
  | "UNKNOWN";

export class WalletError extends Error {
  constructor(
    public readonly code: WalletErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "WalletError";
  }
}

export function getWalletErrorMessage(error: unknown): string {
  if (error instanceof WalletError) {
    return error.message;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel")) {
      return "User rejected connection.";
    }
    if (msg.includes("timeout")) {
      return "Connection timed out. Please try again.";
    }
    return error.message;
  }

  return "An unexpected wallet error occurred.";
}

export function mapFreighterError(error: unknown): WalletError {
  if (error instanceof WalletError) return error;

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("rejected") || msg.includes("denied") || msg.includes("cancel")) {
      return new WalletError("USER_REJECTED", "User rejected connection.", error);
    }

    if (msg.includes("timeout")) {
      return new WalletError("TIMEOUT", "Connection timed out. Please try again.", error);
    }

    if (msg.includes("network") || msg.includes("testnet") || msg.includes("mainnet")) {
      return new WalletError(
        "WRONG_NETWORK",
        "Wrong network — please switch to Testnet in Freighter.",
        error
      );
    }

    return new WalletError("UNKNOWN", error.message, error);
  }

  return new WalletError("UNKNOWN", "An unexpected wallet error occurred.", error);
}
