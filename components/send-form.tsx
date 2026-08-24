"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWallet } from "@/components/providers/wallet-provider";
import { useBalance } from "@/hooks/use-balance";
import { sendXLM } from "@/lib/stellar/transaction";
import { SendIcon, AlertTriangleIcon } from "lucide-react";
import { toast } from "sonner";

export function SendForm() {
  const { isConnected, publicKey, adapter } = useWallet();
  const { balance, maxSendable, baseFee, refresh } = useBalance();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);

  const hasInsufficientFunds =
    balance !== null && baseFee !== null && Number(balance) <= Number(baseFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !adapter || !amount || !destination) return;

    setIsSending(true);
    try {
      const txHash = await sendXLM({
        sourcePublicKey: publicKey,
        destination,
        amount,
        signTransaction: (xdr) => adapter.signTransaction(xdr),
      });
      toast.success("Transaction submitted", {
        description: `Hash: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
      });
      setDestination("");
      setAmount("");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Transaction failed", { description: message });
    } finally {
      setIsSending(false);
    }
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
            {hasInsufficientFunds && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="size-4" />
                <AlertTitle>Insufficient funds</AlertTitle>
                <AlertDescription>
                  Your account balance is too low to cover the transaction fee.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="destination">Destination Address</Label>
              <Input
                id="destination"
                placeholder="G..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={!isConnected || isSending}
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
                disabled={!isConnected || isSending}
              />
              {maxSendable !== null && baseFee !== null && (
                <p className="text-xs text-muted-foreground">
                  Available: {maxSendable} XLM (fee: {baseFee} XLM)
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                !isConnected ||
                !destination ||
                !amount ||
                isSending ||
                hasInsufficientFunds
              }
            >
              {isSending ? "Sending..." : "Send XLM"}
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
