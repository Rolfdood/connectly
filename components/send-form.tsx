"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/components/providers/wallet-provider";
import { SendIcon } from "lucide-react";

export function SendForm() {
  const { isConnected } = useWallet();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: transaction logic will be wired in a future branch
  };

  // Clear form inputs when the wallet disconnects
  if (!isConnected && (destination || amount)) {
    setDestination("");
    setAmount("");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Send XLM</CardTitle>
        <SendIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="destination">Destination Address</Label>
              <Input
                id="destination"
                placeholder="G..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={!isConnected}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount (XLM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.0000001"
                min="0"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected}
              />
            </div>
            <Button type="submit" disabled={!isConnected || !destination || !amount}>
              Send XLM
            </Button>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">
            Connect your wallet to send XLM.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
