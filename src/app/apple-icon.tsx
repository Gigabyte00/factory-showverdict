import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '32px',
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          color: '#fff',
          fontSize: 100,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.03em',
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}
