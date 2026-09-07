import { PageShell } from "@/components/site/page-shell";
import { HeartPulse, Shield, Activity, Users, Award, MapPin } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <PageShell
      eyebrow="Our Mission"
      title="About SehatSaathi AI"
      description="Revolutionizing healthcare in Pakistan through the power of Artificial Intelligence."
    >
      <div className="max-w-4xl mx-auto py-10 px-6 space-y-12">
        {/* Intro Section */}
        <div className="glass rounded-3xl p-8 md:p-12 border border-border/60 shadow-soft text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <HeartPulse className="w-64 h-64" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Empowering Patients, Transforming Care</h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
            SehatSaathi AI was founded with a singular vision: to make high-quality healthcare accessible, affordable, and intelligent for everyone in Pakistan. By leveraging cutting-edge AI technologies, we bridge the gap between medical expertise and everyday patient needs, right from the comfort of their homes.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 border border-border/60 shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="size-6" />
            </div>
            <h3 className="font-bold text-lg">Trust & Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We prioritize your privacy and data security above all. Our systems use industry-leading encryption to ensure your medical records remain completely confidential.
            </p>
          </div>
          <div className="glass rounded-2xl p-6 border border-border/60 shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Activity className="size-6" />
            </div>
            <h3 className="font-bold text-lg">Innovation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From automated prescription scanning to AI-driven symptom analysis, we continuously innovate to bring the future of healthcare to your smartphone.
            </p>
          </div>
          <div className="glass rounded-2xl p-6 border border-border/60 shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Users className="size-6" />
            </div>
            <h3 className="font-bold text-lg">Accessibility</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Healthcare should have no barriers. We provide multilingual support, including Urdu, ensuring our AI companion can help families across the entire nation.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="glass rounded-3xl p-8 border border-border/60 shadow-soft space-y-8">
          <h2 className="text-2xl font-bold text-center">Comprehensive Health Ecosystem</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="mt-1"><Award className="size-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold mb-1">AI Diagnostics</h4>
                <p className="text-sm text-muted-foreground">Advanced symptom checker that guides you to the right medical specialty.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1"><Award className="size-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold mb-1">Smart Pharmacy</h4>
                <p className="text-sm text-muted-foreground">Order medicines directly to your doorstep with 100% genuine guarantees.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1"><Award className="size-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold mb-1">Prescription OCR</h4>
                <p className="text-sm text-muted-foreground">Instantly read and digitize handwritten doctor prescriptions.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1"><Award className="size-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold mb-1">Diet & Nutrition</h4>
                <p className="text-sm text-muted-foreground">Customized AI diet plans generated based on your specific health profile.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-4 pt-6">
          <h3 className="text-xl font-bold">Join the Healthcare Revolution</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Experience the next generation of healthcare technology. Developed with ❤️ for a healthier Pakistan.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
