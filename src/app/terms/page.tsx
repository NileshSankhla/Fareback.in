import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for Fareback.in.",
};

const TermsPage = () => (
  <div className="container mx-auto max-w-3xl px-4 py-16">
    <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
    <p className="mt-4 text-muted-foreground">
      Please read these Terms and Conditions carefully before using Fareback.in.
    </p>

    <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
      <section>
        <h2 className="text-xl font-semibold text-foreground">1. Introduction and Acceptance of Terms</h2>
        <p className="mt-3">
          By accessing and using Fareback.in, you agree to be bound by these Terms and Conditions.
          Fareback.in is a cashback and rewards platform that redirects users to third-party websites
          such as Amazon, Flipkart, and other partner platforms through affiliate links. We do not
          sell any products directly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">2. User Obligations and Anti-Fraud Policy</h2>
        <p className="mt-3">
          Users agree to provide accurate information and must not engage in fraudulent activities.
          Prohibited activities include, but are not limited to, fake orders, self-referrals, multiple
          account creation, misuse of coupons, or the use of bots, VPNs, or any unfair means to gain
          cashback. We reserve the right to suspend or terminate any user account that violates these terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">3. Cashback Tracking and Confirmation</h2>
        <p className="mt-3">
          Cashback is not guaranteed and depends entirely on successful tracking and confirmation by our
          affiliate partners. It may fail due to reasons such as cookie blocking, ad blockers, the use of
          other referral links, or order cancellations/returns. Cashback will be credited to your Fareback.in
          account only after it is confirmed by the merchant. The processing time may vary (typically 30-90
          days or more).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">4. Payments and Withdrawals</h2>
        <p className="mt-3">Payments will be made exclusively via UPI.</p>
        <p className="mt-2">
          There is no minimum amount needed for withdrawal. You may withdraw your confirmed cashback at
          any time. Fareback.in reserves the right to hold, decline, or cancel cashback in the event of
          suspicious or fraudulent activity.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">5. Third-Party Websites and Liability</h2>
        <p className="mt-3">
          We are not responsible for any issues related to third-party websites, including product quality,
          delivery, refunds, or customer service. Users must resolve such issues directly with the respective
          merchant. Fareback.in shall not be liable for any losses, including the loss of cashback, due to
          tracking failures, technical issues, or third-party actions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
        <p className="mt-3">
          All content on the website, including text, design, and branding, is the intellectual property of
          Fareback.in and may not be copied without permission.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">7. Governing Law and Updates</h2>
        <p className="mt-3">
          These Terms may be updated at any time, and continued use of the website implies acceptance of the
          updated version. These Terms are governed by the laws of India. For any queries, you may contact us
          at support@fareback.in.
        </p>
      </section>
    </div>
  </div>
);

export default TermsPage;
