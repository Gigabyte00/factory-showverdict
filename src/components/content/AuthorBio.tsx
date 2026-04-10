import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface AuthorBioProps {
  name: string;
  slug: string;
  title?: string | null;
  bio?: string | null;
  credentials?: string | null;
  avatarUrl?: string | null;
  expertise?: string[] | null;
  socialLinks?: Record<string, string> | null;
  reviewsCount?: number | null;
}

const SOCIAL_LABELS: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  website: 'Website',
  youtube: 'YouTube',
};

/**
 * Full author bio box shown at the bottom of articles.
 * Reinforces E-E-A-T: credentials, expertise, social proof.
 */
export function AuthorBio({
  name,
  slug,
  title,
  bio,
  credentials,
  avatarUrl,
  expertise,
  socialLinks,
  reviewsCount,
}: AuthorBioProps) {
  const links = socialLinks ?? {};

  return (
    <div className="border rounded-xl p-6 bg-muted/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        About the Author
      </p>

      <div className="flex gap-4 items-start">
        <Link href={`/authors/${slug}`} className="shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <Link href={`/authors/${slug}`} className="font-bold text-lg hover:text-primary transition">
              {name}
            </Link>
            {title && (
              <span className="text-sm text-muted-foreground">{title}</span>
            )}
          </div>

          {credentials && (
            <p className="text-sm text-primary font-medium mb-2">{credentials}</p>
          )}

          {reviewsCount != null && reviewsCount > 0 && (
            <p className="text-xs text-muted-foreground mb-2">
              {reviewsCount.toLocaleString()} reviews published
            </p>
          )}

          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{bio}</p>
          )}

          {expertise && expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {expertise.map((area) => (
                <span
                  key={area}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/authors/${slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View full profile →
            </Link>
            {Object.entries(links).map(([platform, url]) =>
              url ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition"
                >
                  {SOCIAL_LABELS[platform] ?? platform}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorBio;
