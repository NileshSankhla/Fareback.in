import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "my-modern-web",
    template: "%s | my-modern-web",
  },
  description:
    "A production-ready Next.js 16 foundation with Bun, TypeScript, Tailwind CSS v4, and Drizzle ORM.",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Drizzle ORM"],
  authors: [{ name: "my-modern-web" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "my-modern-web",
    description:
      "A production-ready Next.js 16 foundation with Bun, TypeScript, Tailwind CSS v4, and Drizzle ORM.",
    siteName: "my-modern-web",
  },
  twitter: {
    card: "summary_large_image",
    title: "my-modern-web",
    description:
      "A production-ready Next.js 16 foundation with Bun, TypeScript, Tailwind CSS v4, and Drizzle ORM.",
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
