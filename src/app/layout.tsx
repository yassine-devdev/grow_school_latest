import type { Metadata } from "next";
import { Orbitron, Roboto, Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/hooks/useAppContext";
import { ToastProvider } from "@/hooks/useToast";
import { QueryProvider } from "@/components/providers/QueryProvider";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "GROW YouR NEED Saas School",
  description: "Comprehensive school management system with AI-powered features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/next.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${orbitron.variable} ${roboto.variable} ${inter.variable} ${sourceCodePro.variable} font-roboto`}
      >
        <QueryProvider>
          <ToastProvider>
            <AppContextProvider>
              {children}
            </AppContextProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
