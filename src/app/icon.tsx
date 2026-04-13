import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Dynamic favicon via @vercel/og.
 *
 * Uses the first letter of the site name as the glyph. Emoji rendering via
 * satori requires a font pipeline (we don't ship one); a letter is
 * universally supported and looks clean. If you want an emoji favicon,
 * drop a static icon.png into public/ — Next.js will prefer that over
 * this generated file.
 */
export default function Icon() {
  const primaryColor = (process.env.SITE_PRIMARY_COLOR || '#3B82F6').trim();
  const siteName = (process.env.SITE_NAME || 'F').trim();
  const letter = siteName.charAt(0).toUpperCase() || 'F';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}
