# Connectly

A minimalistic payment dApp built on the **Stellar Testnet**. Connectly enables users to connect their Freighter wallet, view their XLM balance, and send payments to any Stellar address with a clean, responsive UI.

> **Status**: Under active development. This project is currently unlicensed.

## Features

- **Wallet Integration** — Connect and disconnect your [Freighter](https://www.freighter.app/) wallet with an extensible adapter architecture.
- **Balance Display** — Real-time XLM balance fetched from the Stellar Horizon Testnet, with auto-refresh after transactions.
- **Send Payments** — Send XLM to any Stellar address with real-time validation, fee estimation, and a confirmation step.
- **Transaction Feedback** — Clear success and failure states with transaction hashes and direct links to [Stellar Expert](https://stellar.expert).
- **Transaction History** — Session-scoped list of recent sends with detail modals and copy-to-clipboard actions.
- **Theme Toggle** — Switch between light, dark, and system themes with smooth transitions and persistent preference.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style, Neutral base)
- **Blockchain**: [Stellar](https://stellar.org/) Testnet
- **Wallet SDK**: [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api)
- **Horizon SDK**: [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and a package manager (`npm`, `pnpm`, or `yarn`)
- [Freighter](https://www.freighter.app/) browser extension installed and configured for **Testnet**
- A funded Stellar Testnet account (get free XLM from the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rolfdood/connectly.git
cd connectly
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: This project uses the Stellar **Testnet**. Ensure your Freighter wallet is set to Testnet mode before connecting.

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
connectly/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Tailwind theme variables
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   └── utils.ts          # Utility helpers (cn, etc.)
├── public/               # Static assets
├── next.config.ts
├── package.json
└── tsconfig.json
```
## License

This project is currently unlicensed and under active development. All rights reserved.
