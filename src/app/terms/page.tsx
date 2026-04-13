import { getSiteConfig } from '@/lib/site-config';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  return {
    title: `Terms of Service`,
    description: `Terms of service for ${site.name}. Usage terms, disclaimers, and legal information.`,
    alternates: { canonical: `${site.domain}/terms` },
  };
}

export default function TermsPage() {
  const site = getSiteConfig();
  const domain = site.domain?.replace('https://', '') ?? 'example.com';

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using {site.name} ({domain}), you agree to these terms of service.
            If you do not agree, please do not use this site.
          </p>

          <h2>Content &amp; Accuracy</h2>
          <p>
            {site.name} provides informational content for educational purposes. While we strive
            for accuracy, we make no guarantees that all information is complete, current, or error-free.
            Product details, prices, and availability may change without notice.
          </p>

          <h2>Affiliate Disclosure</h2>
          <p>
            {site.name} is a participant in various affiliate programs. Links to products and services
            on this site may be affiliate links, meaning we earn a commission if you make a purchase
            through those links, at no additional cost to you. This relationship does not influence
            our content or recommendations.
          </p>

          <h2>Not Professional Advice</h2>
          <p>
            Content on {site.name} is for informational purposes only and should not be construed as
            professional, financial, medical, or legal advice. Always consult qualified professionals
            before making important decisions.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on {site.name}, including text, graphics, and logos, is owned by {site.name}
            or used with permission. You may not reproduce, distribute, or create derivative works
            without our written consent.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            {site.name} is provided "as is" without warranties of any kind. We are not liable for any
            damages arising from your use of this site, including but not limited to purchases made
            through affiliate links.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of {site.name} after changes
            constitutes acceptance of the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at <strong>legal@{domain}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
