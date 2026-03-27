import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Fareback.in.",
};

const PrivacyPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
    <p className="mt-4 text-muted-foreground">
      Fareback.in respects your privacy and is committed to protecting your personal information.
    </p>

    <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Information Collection</h2>
        <p className="mt-3">
          When you use our website, we may collect certain personal details such as your name, email
          address, and UPI payment information (for cashback processing). We also collect non-personal
          data like your IP address, browser type, device information, and browsing activity.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. Use of Information</h2>
        <p className="mt-3">
          This information is used to provide and improve our cashback services, track purchases made
          through affiliate links, process UPI withdrawals, communicate with users, and prevent fraud or
          misuse of our platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. Third-Party Tracking and Cookies</h2>
        <p className="mt-3">
          Fareback.in works with third-party affiliate networks such as Amazon, Flipkart, and others.
          When you click on our links, these platforms may use cookies or tracking technologies to record
          your activity. We do not control their data practices and recommend reviewing their respective
          privacy policies.
        </p>
        <p className="mt-2">
          We use cookies to enhance user experience, store preferences, and ensure proper tracking of
          transactions. You may disable cookies through your browser settings, although this may affect
          cashback tracking functionality.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
        <p className="mt-3">
          We take reasonable measures to protect your data, but no online system can guarantee complete
          security. Please be aware that cashback is subject to successful tracking and confirmation from
          affiliate partners, and we do not guarantee cashback in every case.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Policy Updates and Contact</h2>
        <p className="mt-3">
          By using Fareback.in, you consent to this Privacy Policy. We may update it from time to time,
          with changes posted on this page. If you have any questions or requests regarding your data,
          you can contact us at support@fareback.in.
        </p>
      </section>
    </div>
  </div>
);

export default PrivacyPage;
