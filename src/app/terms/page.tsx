import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for my-modern-web.",
};

const TermsPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
    <p className="mt-4 text-muted-foreground">
      This is a starter terms page. Replace this content with your legal terms
      before production release.
    </p>
  </div>
);

export default TermsPage;
