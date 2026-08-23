import { BalanceCard } from "@/components/balance-card";
import { SendForm } from "@/components/send-form";
import { WalletCard } from "@/components/wallet-card";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Connectly
        </h1>
        <p className="mx-auto mt-2 max-w-md text-lg text-muted-foreground">
          A minimalistic payment dApp for sending XLM on the Stellar Testnet.
        </p>
      </div>
      <WalletCard />
      <div className="grid gap-6 sm:grid-cols-2">
        <BalanceCard />
        <SendForm />
      </div>
    </div>
  );
}
