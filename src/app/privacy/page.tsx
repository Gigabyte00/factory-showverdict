import { getSiteConfig } from '@/lib/site-config';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  return {
    title: `Privacy Policy - ${site.name}`,
    description: `Privacy policy for ${site.name}. How we collect, use, and protect your information.`,
    alternates: { canonical: `${site.domain}/privacy` },
  };
}

export default function PrivacyPage() {
  const site = getSiteConfig();
  const domain = site.domain?.replace('https://', '') ?? 'example.com';

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>Information We Collect</h2>
          <p>
            {site.name} collects minimal information to provide a better experience:
          </p>
          <ul>
            <li><strong>Analytics data:</strong> We use Google Analytics to understand how visitors use our site. This includes pages visited, time on site, and general location (country/city level). No personally identifiable information is collected through analytics.</li>
            <li><strong>Email addresses:</strong> If you subscribe to our newsletter, we collect your email address. We never sell or share your email with third parties.</li>
            <li><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies to measure site performance.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To send newsletter updates (only if you subscribe)</li>
            <li>To improve our content and site experience</li>
            <li>To analyze site traffic and trends</li>
          </ul>

          <h2>Affiliate Links &amp; Advertising</h2>
          <p>
            {site.name} participates in affiliate programs. When you click an affiliate link and make a purchase,
            we may earn a commission at no additional cost to you. Affiliate partners may use cookies to track referrals.
            This does not affect our editorial independence or product ratings.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Google Analytics:</strong> For site analytics (see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>)</li>
            <li><strong>Vercel:</strong> For hosting (see <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel's Privacy Policy</a>)</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Unsubscribe from our newsletter at any time</li>
            <li>Request deletion of any personal data we hold</li>
            <li>Opt out of analytics tracking via your browser settings</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For privacy-related questions, contact us at <strong>privacy@{domain}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
