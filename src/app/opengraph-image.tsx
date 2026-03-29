import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Site preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  const siteName = process.env.SITE_NAME || 'Factory Site';
  const tagline = process.env.SITE_HERO_TAGLINE || '';
  const primaryColor = process.env.SITE_PRIMARY_COLOR || '#3B82F6';
  const emoji = process.env.SITE_FAVICON_EMOJI || '';
  const domain = process.env.SITE_DOMAIN || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, #111827, #1f2937, ${primaryColor}33)`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: primaryColor,
          }}
        />

        {/* Emoji icon — only render if set */}
        {emoji ? (
          <span style={{ fontSize: 72, marginBottom: 16 }}>{emoji}</span>
        ) : null}

        {/* Site name */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {siteName}
        </h1>

        {/* Tagline — only render if set */}
        {tagline ? (
          <p
            style={{
              fontSize: 28,
              color: '#9ca3af',
              margin: '16px 0 0 0',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </p>
        ) : null}

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: primaryColor,
            }}
          />
          <span style={{ fontSize: 18, color: '#6b7280' }}>
            {domain}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
