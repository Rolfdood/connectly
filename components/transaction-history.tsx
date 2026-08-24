"use client";

import { useMemo, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useTxHistory,
  type TxRecord,
} from "@/components/providers/tx-history-provider";
import { formatRelativeTime, formatTimestamp } from "@/lib/utils";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  HistoryIcon,
  Trash2Icon,
} from "lucide-react";

const MAX_DISPLAYED = 20;

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    showSuccessToast(`${label} copied to clipboard`, { id: "hash-copied" });
  } catch {
    showErrorToast(`Failed to copy ${label.toLowerCase()}`, {
      id: "hash-copied-error",
    });
  }
}

function TxDetailDialog({
  tx,
  onClose,
}: {
  tx: TxRecord | null;
  onClose: () => void;
}) {
  const isSuccess = tx?.status === "success";
  const explorerUrl =
    isSuccess && tx?.hash
      ? `https://stellar.expert/explorer/testnet/tx/${tx.hash}`
      : null;

  return (
    <Dialog open={tx !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Full information about this transaction.
          </DialogDescription>
        </DialogHeader>

        {tx && (
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={isSuccess ? "default" : "destructive"}>
                {isSuccess ? "Success" : "Failed"}
              </Badge>
            </div>

            <Separator />

            <div className="grid gap-1">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-mono break-all">{tx.destination}</span>
            </div>

            <div className="grid gap-1">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono">{tx.amount} XLM</span>
            </div>

            <div className="grid gap-1">
              <span className="text-muted-foreground">Timestamp</span>
              <span>{formatTimestamp(tx.timestamp)}</span>
            </div>

            <Separator />

            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction Hash</span>
                {tx.hash && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => copyToClipboard(tx.hash, "Hash")}
                    aria-label="Copy transaction hash"
                  >
                    <CopyIcon />
                  </Button>
                )}
              </div>
              {tx.hash ? (
                <span className="font-mono break-all text-xs">{tx.hash}</span>
              ) : (
                <span className="text-muted-foreground">
                  No hash — transaction was not submitted.
                </span>
              )}
            </div>

            {explorerUrl && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon />
                  View on Stellar Expert
                </a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TransactionHistory() {
  const { history, clearHistory } = useTxHistory();
  const [selectedTx, setSelectedTx] = useState<TxRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const displayed = useMemo(() => history.slice(0, MAX_DISPLAYED), [history]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
        <HistoryIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Send your first XLM!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
              {displayed.map((tx) => {
                const isSuccess = tx.status === "success";
                return (
                  <li key={tx.id} className="animate-in fade-in slide-in-from-top-1">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTx(tx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedTx(tx);
                        }
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {isSuccess ? (
                        <CircleCheckIcon className="size-4 shrink-0 text-green-500" />
                      ) : (
                        <CircleXIcon className="size-4 shrink-0 text-destructive" />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-mono text-xs">
                          {truncateAddress(tx.destination)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          {formatRelativeTime(tx.timestamp)}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-sm">
                        {tx.amount} XLM
                      </span>
                      {tx.hash && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(tx.hash, "Hash");
                          }}
                          aria-label="Copy transaction hash"
                        >
                          <CopyIcon />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {history.length > MAX_DISPLAYED && (
              <p className="text-center text-xs text-muted-foreground">
                Showing the most recent {MAX_DISPLAYED} transactions.
              </p>
            )}

            <Separator />

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2Icon />
              Clear History
            </Button>
          </div>
        )}
      </CardContent>

      <TxDetailDialog
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear transaction history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all recorded transactions for the current
              session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearHistory();
                setShowClearConfirm(false);
              }}
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
