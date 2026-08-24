import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { WalletAdapter } from "./adapter";
import { mapFreighterError, WalletError } from "./errors";

export class FreighterAdapter implements WalletAdapter {
  id = "freighter";
  name = "Freighter";

  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      const result = await isConnected();
      return result.isConnected;
    } catch {
      return false;
    }
  }

  async connect(): Promise<void> {
    try {
      const result = await requestAccess();
      if (result.error) {
        throw mapFreighterError(result.error);
      }
      if (!result.address) {
        throw new WalletError("UNKNOWN", "Freighter did not return an address.");
      }
    } catch (error) {
      throw mapFreighterError(error);
    }
  }

  async disconnect(): Promise<void> {
    // Freighter v6 does not expose a programmatic disconnect API.
    // Clearing local state is handled by the WalletProvider.
  }

  async getPublicKey(): Promise<string> {
    try {
      const result = await getAddress();
      if (result.error) {
        throw mapFreighterError(result.error);
      }
      if (!result.address) {
        throw new WalletError("UNKNOWN", "Freighter did not return an address.");
      }
      return result.address;
    } catch (error) {
      throw mapFreighterError(error);
    }
  }

  async signTransaction(
    xdr: string,
    networkPassphrase?: string
  ): Promise<string> {
    try {
      const result = await freighterSignTransaction(xdr, { networkPassphrase });
      if (result.error) {
        throw mapFreighterError(result.error);
      }
      if (!result.signedTxXdr) {
        throw new WalletError(
          "UNKNOWN",
          "Freighter did not return a signed transaction."
        );
      }
      return result.signedTxXdr;
    } catch (error) {
      throw mapFreighterError(error);
    }
  }
}
