import { getSiteConfig } from '@/lib/site-config';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const title = process.env.SITE_ABOUT_META_TITLE?.trim() || `About Us - ${site.name}`;
  const description = process.env.SITE_ABOUT_META_DESCRIPTION?.trim()
    || `Learn about ${site.name}. Our mission, values, and commitment to providing honest, well-researched content.`;
  return {
    title,
    description,
    alternates: { canonical: `${site.domain}/about` },
  };
}

/**
 * Optional env vars — set any subset to override the generic copy per site:
 *   SITE_ABOUT_HERO_TAGLINE    — big tagline under the H1 (defaults to generic)
 *   SITE_ABOUT_MISSION         — paragraph after "Our Mission" heading
 *   SITE_ABOUT_METHODOLOGY     — paragraph after "How We Work" heading
 *   SITE_ABOUT_EDITOR_NAME     — if set, renders an editor/author bio section
 *   SITE_ABOUT_EDITOR_TITLE    — e.g., "Registered Investment Adviser"
 *   SITE_ABOUT_EDITOR_BIO      — paragraph of editor bio copy
 *   SITE_ABOUT_CONTACT_EMAIL   — overrides the default hello@domain
 *   SITE_ABOUT_META_TITLE      — full <title> override
 *   SITE_ABOUT_META_DESCRIPTION — full <meta description> override
 */
export default function AboutPage() {
  const site = getSiteConfig();
  const trim = (v: string | undefined) => v?.trim() || undefined;

  const heroTagline = trim(process.env.SITE_ABOUT_HERO_TAGLINE)
    || 'Honest, well-researched content to help you make informed decisions.';
  const mission = trim(process.env.SITE_ABOUT_MISSION)
    || `${site.name} was created to provide clear, trustworthy information in the ${site.niche ?? 'our'} space. We research products and topics thoroughly so you can make confident decisions without wading through hype or misinformation.`;
  const methodology = trim(process.env.SITE_ABOUT_METHODOLOGY)
    || `Every article on ${site.name} goes through a rigorous editorial process. We research primary sources, compare options side-by-side, and update our content regularly to keep it accurate.`;
  const editorName = trim(process.env.SITE_ABOUT_EDITOR_NAME);
  const editorTitle = trim(process.env.SITE_ABOUT_EDITOR_TITLE);
  const editorBio = trim(process.env.SITE_ABOUT_EDITOR_BIO);
  const contactEmail = trim(process.env.SITE_ABOUT_CONTACT_EMAIL)
    || `hello@${site.domain?.replace('https://', '') ?? 'example.com'}`;

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About {site.name}</h1>
            <p className="text-xl text-muted-foreground">{heroTagline}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Our Mission</h2>
            <p>{mission}</p>

            <h2>How We Work</h2>
            <p>{methodology}</p>

            {editorName && (
              <>
                <h2>Editorial Team</h2>
                <div className="not-prose my-6 rounded-lg border bg-card p-6">
                  <div className="font-bold text-lg">{editorName}</div>
                  {editorTitle && <div className="text-sm text-muted-foreground italic">{editorTitle}</div>}
                  {editorBio && <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{editorBio}</p>}
                </div>
              </>
            )}

            <h2>Affiliate Disclosure</h2>
            <p>
              Some links on {site.name} are affiliate links, which means we may earn a small commission if you make a purchase.
              This never influences our ratings or recommendations. We only recommend products and services we genuinely believe in.
              See our full <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link> for details.
            </p>

            <h2>Contact Us</h2>
            <p>
              Have questions, feedback, or a suggestion? We&apos;d love to hear from you.
              Reach out at <strong>{contactEmail}</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
