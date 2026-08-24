"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWallet } from "@/components/providers/wallet-provider";
import { useTxHistory } from "@/components/providers/tx-history-provider";
import { useBalance } from "@/hooks/use-balance";
import {
  submitPayment,
  mapTransactionError,
} from "@/lib/stellar/transaction";
import { isValidStellarAddress, isValidAmount } from "@/lib/validation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { Networks } from "@stellar/stellar-sdk";
import {
  SendIcon,
  AlertTriangleIcon,
  CircleCheckIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { toast } from "sonner";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function addXLM(a: string, b: string): string {
  return (Number(a) + Number(b)).toFixed(7);
}

function TransactionSuccess({
  hash,
  onReset,
}: {
  hash: string;
  onReset: () => void;
}) {
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${hash}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      showSuccessToast("Hash copied to clipboard", { id: "hash-copied" });
    } catch {
      showErrorToast("Failed to copy hash", { id: "hash-copied-error" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
        <CircleCheckIcon className="size-8 text-green-500" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Transaction Successful
        </p>
        <p className="text-xs text-muted-foreground">
          Your payment was confirmed on the Stellar Testnet.
        </p>
      </div>

      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label>Transaction Hash</Label>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            aria-label="Copy transaction hash"
          >
            <CopyIcon />
          </Button>
        </div>
        <span className="break-all rounded-md bg-muted p-2 font-mono text-xs">
          {hash}
        </span>
      </div>

      <Button asChild variant="outline" size="sm" className="w-full">
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLinkIcon />
          View on Stellar Expert
        </a>
      </Button>

      <Button onClick={onReset} className="w-full">
        Send Another
      </Button>
    </div>
  );
}

export function SendForm() {
  const { isConnected, publicKey, adapter, network } = useWallet();
  const { balance, maxSendable, baseFee, refresh } = useBalance();
  const { addTx } = useTxHistory();

  const isWrongNetwork =
    network !== null && network !== Networks.TESTNET;
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const destinationError = useMemo(() => {
    if (!destination) return null;
    return isValidStellarAddress(destination) ? null : "Invalid Stellar address.";
  }, [destination]);

  const amountError = useMemo(() => {
    if (!amount) return null;
    return isValidAmount(amount, maxSendable)
      ? null
      : maxSendable !== null
        ? `Amount must be positive, have at most 7 decimals, and not exceed ${maxSendable} XLM.`
        : "Amount must be a positive number with at most 7 decimals.";
  }, [amount, maxSendable]);

  const hasInsufficientFunds =
    balance !== null && baseFee !== null && Number(balance) <= Number(baseFee);

  const canSubmit =
    isConnected &&
    !!destination &&
    !!amount &&
    !destinationError &&
    !amountError &&
    !isSending &&
    !hasInsufficientFunds &&
    !isWrongNetwork;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!publicKey || !adapter) return;
    setShowConfirm(false);
    setIsSending(true);
    setTxError(null);

    const toastId = toast.loading("Transaction submitted", {
      description: "Waiting for confirmation...",
    });

    try {
      const txHash = await submitPayment({
        sourcePublicKey: publicKey,
        destination,
        amount,
        signTransaction: (xdr, networkPassphrase) =>
          adapter.signTransaction(xdr, networkPassphrase),
      });
      addTx({ hash: txHash, destination, amount, status: "success" });
      setDestination("");
      setAmount("");
      setLastTxHash(txHash);
      showSuccessToast("Transaction confirmed", {
        id: toastId,
        description: `Hash: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
      });
      await refresh();
    } catch (err) {
      console.error("[SendForm] Transaction failed:", err);
      addTx({ hash: "", destination, amount, status: "failed" });
      const message = mapTransactionError(err);
      setTxError(message);
      showErrorToast("Transaction failed", {
        id: toastId,
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAnother = () => {
    setLastTxHash(null);
    setTxError(null);
    setDestination("");
    setAmount("");
  };

  // Clear form inputs when the wallet disconnects
  if (!isConnected && (destination || amount || lastTxHash || txError)) {
    setDestination("");
    setAmount("");
    setLastTxHash(null);
    setTxError(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Send XLM</CardTitle>
        <SendIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isConnected ? (
          lastTxHash ? (
            <TransactionSuccess hash={lastTxHash} onReset={handleSendAnother} />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {txError && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="size-4" />
                  <AlertTitle>Transaction failed</AlertTitle>
                  <AlertDescription>{txError}</AlertDescription>
                </Alert>
              )}
              {isWrongNetwork && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="size-4" />
                  <AlertTitle>Wrong network</AlertTitle>
                  <AlertDescription>
                    Your wallet is not on the Stellar Testnet. Please switch to
                    Testnet in Freighter to continue.
                  </AlertDescription>
                </Alert>
              )}
              {hasInsufficientFunds && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="size-4" />
                  <AlertTitle>Insufficient funds</AlertTitle>
                  <AlertDescription>
                    Your account balance is too low to cover the transaction
                    fee.
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
                  aria-invalid={!!destinationError}
                />
                {destinationError && (
                  <p className="text-xs text-destructive">{destinationError}</p>
                )}
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
                  aria-invalid={!!amountError}
                />
                {amountError && (
                  <p className="text-xs text-destructive">{amountError}</p>
                )}
                {maxSendable !== null && baseFee !== null && (
                  <p className="text-xs text-muted-foreground">
                    Available: {maxSendable} XLM (fee: {baseFee} XLM)
                  </p>
                )}
              </div>
              <Button type="submit" disabled={!canSubmit}>
                {isSending ? "Sending..." : "Send XLM"}
              </Button>
            </form>
          )
        ) : (
          <div className="text-sm text-muted-foreground">
            Connect your wallet to send XLM.
          </div>
        )}
      </CardContent>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Please review your transaction details before signing.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium">{truncateAddress(destination)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{amount} XLM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-medium">{baseFee ?? "—"} XLM</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">
                {baseFee ? `${addXLM(amount, baseFee)} XLM` : "—"}
              </span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
