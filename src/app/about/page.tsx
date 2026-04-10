import { getSiteConfig } from '@/lib/site-config';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  return {
    title: `About Us`,
    description: `Learn about ${site.name}. Our mission, values, and commitment to providing honest, well-researched content.`,
    alternates: { canonical: `${site.domain}/about` },
  };
}

export default function AboutPage() {
  const site = getSiteConfig();

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About {site.name}</h1>
            <p className="text-xl text-muted-foreground">
              Honest, well-researched content to help you make informed decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>Our Mission</h2>
            <p>
              {site.name} was created to provide clear, trustworthy information in the {site.niche ?? 'our'} space.
              We research products and topics thoroughly so you can make confident decisions without wading through hype or misinformation.
            </p>

            <h2>How We Work</h2>
            <p>
              Every article on {site.name} goes through a rigorous editorial process. We research primary sources,
              compare options side-by-side, and update our content regularly to keep it accurate.
            </p>

            <h2>Affiliate Disclosure</h2>
            <p>
              Some links on {site.name} are affiliate links, which means we may earn a small commission if you make a purchase.
              This never influences our ratings or recommendations. We only recommend products and services we genuinely believe in.
              See our full <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link> for details.
            </p>

            <h2>Contact Us</h2>
            <p>
              Have questions, feedback, or a suggestion? We'd love to hear from you.
              Reach out at <strong>hello@{site.domain?.replace('https://', '') ?? 'example.com'}</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
