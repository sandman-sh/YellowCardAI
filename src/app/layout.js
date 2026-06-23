import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Script from "next/script";

export const metadata = {
  title: "YellowCard AI | Web3 Football Betting Copilot",
  description: "Stop the tilt. Protect your bankroll. YellowCard AI is a stateful AI betting copilot on Sui using Walrus Memory for decentralized, on-chain state.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Script id="suppress-extension-errors" strategy="beforeInteractive">
          {`
            (function() {
              if (typeof window === 'undefined') return;
              function shouldSuppress(error, message) {
                const msg = message || (error && error.message) || '';
                const stack = (error && error.stack) || '';
                return msg.includes('Cannot redefine property: ethereum') || 
                       msg.includes('ethereum') ||
                       stack.includes('chrome-extension://') ||
                       stack.includes('evmAsk.js');
              }
              window.addEventListener('error', function(event) {
                if (shouldSuppress(event.error, event.message)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && shouldSuppress(event.reason)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}

