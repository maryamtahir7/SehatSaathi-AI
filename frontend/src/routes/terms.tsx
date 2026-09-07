import { PageShell } from "@/components/site/page-shell";
import { createFileRoute } from '@tanstack/react-router';
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute('/terms')({
  component: TermsOfService,
});

function TermsOfService() {
  const { t } = useApp();
  return (
    <PageShell
      eyebrow={t("legal_eyebrow")}
      title={t("terms_title")}
      description={t("terms_desc")}
    >
      <div className="max-w-3xl mx-auto py-10 px-6 prose prose-slate dark:prose-invert">
        <div className="glass rounded-3xl p-8 md:p-12 border border-border/60 shadow-soft space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              By accessing or using SehatSaathi AI, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the website or use any services.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold mb-3">2. Not Medical Advice</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <strong>SehatSaathi AI is an informational tool and does not provide professional medical advice, diagnosis, or treatment.</strong> Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or generated on SehatSaathi AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. User Responsibilities</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You are responsible for maintaining the security of your account and password. You are also responsible for the accuracy of the data (such as prescriptions and symptoms) you provide to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Limitation of Liability</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              In no event shall SehatSaathi AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Contact</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              For any questions regarding these Terms, please contact us at <strong>medistore.pk@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
