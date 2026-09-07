import { PageShell } from "@/components/page-shell";

export function PrivacyPolicy() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="How we handle and protect your personal medical data."
    >
      <div className="max-w-3xl mx-auto py-10 px-6 prose prose-slate dark:prose-invert">
        <div className="glass rounded-3xl p-8 md:p-12 border border-border/60 shadow-soft space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              At SehatSaathi AI, we collect minimal personal information necessary to provide our services. This includes your basic profile details, medical prescriptions you upload for scanning, and symptom queries you enter into our AI diagnostic tools.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">2. Use of Your Data</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your data is exclusively used to generate personalized health insights, parse prescriptions accurately, and suggest relevant medical facilities. We do not sell, rent, or share your personal health information (PHI) with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. AI Processing</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Interactions with our symptom checker and prescription scanner are processed by AI models. Please be aware that while data is anonymized before processing where possible, you should avoid entering sensitive identifiable information in free-text medical queries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We employ industry-standard encryption protocols to protect your data during transit and at rest. Your account is secured using Appwrite's robust authentication systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Contact Us</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at <strong>medistore.pk@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
