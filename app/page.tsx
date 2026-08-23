export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Connectly
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        A minimalistic payment dApp for sending XLM on the Stellar Testnet.
      </p>
      <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">
          Connect your Freighter wallet to get started.
        </p>
      </div>
    </div>
  );
}
