import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Connectly — Send XLM on Stellar",
  description:
    "A minimalistic payment dApp for sending XLM on the Stellar Testnet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <WalletProvider>
            <Header />
            <main className="flex flex-1 flex-col">
              <div className="mx-auto w-full max-w-3xl px-4 py-8">
                {children}
              </div>
            </main>
            <footer className="border-t py-6">
              <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
                Connectly — Built on Stellar Testnet
              </div>
            </footer>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
