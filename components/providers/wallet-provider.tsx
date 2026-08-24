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
import { WatchWalletChanges, getNetwork } from "@stellar/freighter-api";
import type { WalletAdapter } from "@/lib/wallet/adapter";
import { FreighterAdapter } from "@/lib/wallet/freighter-adapter";
import { getWalletErrorMessage } from "@/lib/wallet/errors";

interface WalletState {
  adapter: WalletAdapter | null;
  publicKey: string | null;
  network: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    adapter: null,
    publicKey: null,
    network: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const connectionAttemptRef = useRef(0);
  const watcherRef = useRef<WatchWalletChanges | null>(null);

  const startWatching = useCallback(() => {
    try {
      const watcher = new WatchWalletChanges(3000);
      watcher.watch((params) => {
        if (params.error) {
          // Wallet change error — silently ignore or log
          return;
        }
        setState((prev) => ({
          ...prev,
          publicKey: params.address ?? prev.publicKey,
          network: params.networkPassphrase ?? prev.network,
        }));
      });
      watcherRef.current = watcher;
    } catch {
      // WatchWalletChanges may fail in SSR or if Freighter is unavailable
    }
  }, []);

  const stopWatching = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.stop();
      watcherRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    const attemptId = ++connectionAttemptRef.current;

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const adapter = new FreighterAdapter();
      const available = await adapter.isAvailable();

      if (attemptId !== connectionAttemptRef.current) return;

      if (!available) {
        toast.error("Freighter not installed", {
          description: "Please install the Freighter extension to connect your wallet.",
        });
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: new Error("Freighter not installed"),
        }));
        return;
      }

      await adapter.connect();

      if (attemptId !== connectionAttemptRef.current) return;

      const publicKey = await adapter.getPublicKey();

      if (attemptId !== connectionAttemptRef.current) return;

      let networkPassphrase: string | null = null;
      try {
        const networkResult = await getNetwork();
        if (!networkResult.error && networkResult.networkPassphrase) {
          networkPassphrase = networkResult.networkPassphrase;
        }
      } catch {
        // Ignore network fetch errors
      }

      if (attemptId !== connectionAttemptRef.current) return;

      setState({
        adapter,
        publicKey,
        network: networkPassphrase,
        isConnecting: false,
        isConnected: true,
        error: null,
      });

      localStorage.removeItem("connectly-wallet-manually-disconnected");
      startWatching();
      toast.success("Wallet connected", {
        description: `Connected to ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
      });
    } catch (error) {
      if (attemptId !== connectionAttemptRef.current) return;

      const message = getWalletErrorMessage(error);
      toast.error("Connection failed", { description: message });
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: new Error(message),
      }));
    }
  }, [startWatching]);

  const disconnect = useCallback(() => {
    connectionAttemptRef.current++;
    localStorage.setItem("connectly-wallet-manually-disconnected", "true");
    stopWatching();
    setState({
      adapter: null,
      publicKey: null,
      network: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
    toast.success("Wallet disconnected");
  }, [stopWatching]);

  // Auto-reconnect on mount unless the user manually disconnected
  useEffect(() => {
    if (localStorage.getItem("connectly-wallet-manually-disconnected") === "true") {
      return;
    }

    let cancelled = false;

    async function autoReconnect() {
      const adapter = new FreighterAdapter();
      const available = await adapter.isAvailable();
      if (!available || cancelled) return;

      try {
        const publicKey = await adapter.getPublicKey();
        if (cancelled) return;

        let networkPassphrase: string | null = null;
        try {
          const networkResult = await getNetwork();
          if (!networkResult.error && networkResult.networkPassphrase) {
            networkPassphrase = networkResult.networkPassphrase;
          }
        } catch {
          // Ignore network fetch errors
        }

        if (cancelled) return;

        setState({
          adapter,
          publicKey,
          network: networkPassphrase,
          isConnecting: false,
          isConnected: true,
          error: null,
        });

        startWatching();
      } catch {
        // Not previously connected — stay disconnected
      }
    }

    autoReconnect();

    return () => {
      cancelled = true;
      stopWatching();
    };
  }, [startWatching, stopWatching]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
