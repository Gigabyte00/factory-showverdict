import Image from 'next/image';
import Link from 'next/link';

interface AuthorCardProps {
  name: string;
  slug: string;
  title?: string | null;
  credentials?: string | null;
  avatarUrl?: string | null;
  expertise?: string[] | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  className?: string;
}

/**
 * Compact author card for post headers — surfaces E-E-A-T signals inline.
 * Links to /authors/[slug] for full profile.
 */
export function AuthorCard({
  name,
  slug,
  title,
  credentials,
  avatarUrl,
  expertise,
  publishedAt,
  updatedAt,
  className = '',
}: AuthorCardProps) {
  const displayDate = updatedAt || publishedAt;
  const dateLabel = updatedAt && publishedAt && updatedAt !== publishedAt ? 'Updated' : 'Published';

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Link href={`/authors/${slug}`} aria-label={`View ${name}'s profile`}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={44}
            height={44}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            href={`/authors/${slug}`}
            className="font-medium text-sm hover:text-primary transition"
          >
            {name}
          </Link>
          {title && (
            <span className="text-xs text-muted-foreground">{title}</span>
          )}
        </div>

        {credentials && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{credentials}</p>
        )}

        {expertise && expertise.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {expertise.slice(0, 3).map((area) => (
              <span
                key={area}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/8 text-primary/80 font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        )}

        {displayDate && (
          <p className="text-xs text-muted-foreground mt-1">
            {dateLabel}{' '}
            {new Date(displayDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthorCard;
