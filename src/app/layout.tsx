import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "CashbackCart",
    template: "%s | CashbackCart",
  },
  description:
    "CashbackCart helps users shop via affiliate offers and request UPI withdrawals from earned cashback.",
  keywords: ["cashback", "affiliate", "wallet", "UPI", "shopping"],
  authors: [{ name: "CashbackCart" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "CashbackCart",
    description:
      "Shop through CashbackCart partner cards, track eligibility, and request withdrawals to UPI.",
    siteName: "CashbackCart",
  },
  twitter: {
    card: "summary_large_image",
    title: "CashbackCart",
    description:
      "Affiliate cashback made simple with manual wallet and withdrawal management.",
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <body className="min-h-screen bg-background font-sans antialiased">
      <Providers>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
