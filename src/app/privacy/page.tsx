import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for my-modern-web.",
};

const PrivacyPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
    <p className="mt-4 text-muted-foreground">
      This is a starter policy page. Replace this content with your legal
      policy before production release.
    </p>
  </div>
);

export default PrivacyPage;
