"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/components/providers/wallet-provider";
import { WalletIcon } from "lucide-react";

export function BalanceCard() {
  const { isConnected } = useWallet();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
        <WalletIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="text-2xl font-bold">--- XLM</div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Connect your wallet to view your balance.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
