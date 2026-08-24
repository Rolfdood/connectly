"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchNativeBalance } from "@/lib/stellar/balance";
import { fetchBaseFee } from "@/lib/stellar/fees";

interface BalanceState {
  balance: string | null;
  maxSendable: string | null;
  baseFee: string | null;
  isLoading: boolean;
  error: Error | null;
  isUnfunded: boolean;
}

interface BalanceContextValue extends BalanceState {
  refresh: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextValue | null>(null);

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return ctx;
}

function subtractXLM(a: string, b: string): string {
  const result = Number(a) - Number(b);
  if (result <= 0) return "0.0000000";
  return result.toFixed(7);
}

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, isConnected } = useWallet();
  const [state, setState] = useState<BalanceState>({
    balance: null,
    maxSendable: null,
    baseFee: null,
    isLoading: false,
    error: null,
    isUnfunded: false,
  });

  const isFetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [balanceResult, baseFee] = await Promise.all([
        fetchNativeBalance(publicKey!),
        fetchBaseFee(),
      ]);

      setState({
        balance: balanceResult.balance,
        maxSendable: subtractXLM(balanceResult.balance, baseFee),
        baseFee,
        isLoading: false,
        error: null,
        isUnfunded: balanceResult.isUnfunded,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("[BalanceProvider] Failed to fetch balance:", error);
      toast.error("Failed to fetch balance", {
        description: error.message,
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [publicKey]);

  useEffect(() => {
    if (!isConnected || !publicKey) {
      return;
    }

    // Fetch balance from external Horizon API when wallet connection/publicKey changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [isConnected, publicKey, refresh]);

  return (
    <BalanceContext.Provider value={{ ...state, refresh }}>
      {children}
    </BalanceContext.Provider>
  );
}
