"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/components/providers/wallet-provider";
import {
  Loader2Icon,
  CopyIcon,
  LogOutIcon,
  Settings2Icon,
  WalletIcon,
} from "lucide-react";

export function WalletCard() {
  const { connect, disconnect, publicKey, isConnecting, isConnected, error } =
    useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleDisconnect = () => {
    setDropdownOpen(false);

    toast.custom(
      (t) => (
        <div className="rounded-lg border bg-popover p-4 text-popover-foreground shadow-md">
          <p className="text-sm font-medium">Disconnect your wallet?</p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={() => {
                disconnect();
                toast.dismiss(t);
              }}
            >
              Disconnect
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => toast.dismiss(t)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const showNotInstalled = error?.message === "Freighter not installed";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Wallet</CardTitle>
        <WalletIcon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isConnected && publicKey ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 shrink-0 rounded-full bg-green-500" />
              <span className="break-all text-sm font-medium">{publicKey}</span>
            </div>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm">
                  <Settings2Icon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <CopyIcon className="mr-2 size-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect}>
                  <LogOutIcon className="mr-2 size-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : isConnecting ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-yellow-500 animate-pulse" />
            <Loader2Icon className="size-4 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-muted-foreground" />
              <span className="text-sm">No wallet connected</span>
            </div>
            <Button onClick={connect} size="sm" className="w-fit">
              Connect Wallet
            </Button>
            {showNotInstalled && (
              <p className="text-xs text-muted-foreground">
                Freighter not installed.{" "}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Install Freighter
                </a>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
