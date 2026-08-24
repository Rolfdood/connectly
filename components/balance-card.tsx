"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/components/providers/wallet-provider";
import { useBalance } from "@/hooks/use-balance";
import { WalletIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BalanceCard() {
  const { isConnected, publicKey } = useWallet();
  const { balance, isLoading, isUnfunded, error, refresh } = useBalance();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
        <WalletIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {isConnected ? (
          <>
            <div className="flex items-center justify-between">
              {isLoading && balance === null ? (
                <Skeleton className="h-10 w-48" />
              ) : balance !== null ? (
                <div className="text-4xl font-mono font-bold">
                  {balance}{" "}
                  <span className="text-lg font-sans font-medium text-muted-foreground">
                    XLM
                  </span>
                </div>
              ) : (
                <div className="text-sm text-destructive">
                  {error ? `Error: ${error.message}` : "Unable to load balance"}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refresh()}
                disabled={isLoading}
                aria-label="Refresh balance"
              >
                <RefreshCwIcon
                  className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            {publicKey && (
              <div className="text-sm text-muted-foreground font-mono">
                {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
              </div>
            )}
            {isUnfunded && (
              <div className="text-xs text-muted-foreground">
                This account is not yet funded. It needs a small activation
                deposit before it can hold a balance.
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Connect your wallet to view your balance.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
