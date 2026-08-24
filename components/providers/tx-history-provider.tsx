"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWallet } from "@/components/providers/wallet-provider";

export type TxStatus = "success" | "failed";

export interface TxRecord {
  id: string;
  hash: string;
  destination: string;
  amount: string;
  timestamp: number;
  status: TxStatus;
}

interface TxHistoryContextValue {
  history: TxRecord[];
  addTx: (record: Omit<TxRecord, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const TxHistoryContext = createContext<TxHistoryContextValue | null>(null);

export function useTxHistory() {
  const ctx = useContext(TxHistoryContext);
  if (!ctx) {
    throw new Error("useTxHistory must be used within a TxHistoryProvider");
  }
  return ctx;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function TxHistoryProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const [history, setHistory] = useState<TxRecord[]>([]);
  const accountRef = useRef<string | null>(publicKey);

  const addTx = useCallback(
    (record: Omit<TxRecord, "id" | "timestamp">) => {
      const tx: TxRecord = {
        ...record,
        id: createId(),
        timestamp: Date.now(),
      };
      setHistory((prev) => [tx, ...prev]);
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Clear history when the active wallet changes (disconnect or account switch).
  useEffect(() => {
    if (accountRef.current !== publicKey) {
      accountRef.current = publicKey;
      setHistory([]);
    }
  }, [publicKey]);

  const value = useMemo(
    () => ({ history, addTx, clearHistory }),
    [history, addTx, clearHistory]
  );

  return (
    <TxHistoryContext.Provider value={value}>
      {children}
    </TxHistoryContext.Provider>
  );
}
