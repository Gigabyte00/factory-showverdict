import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const emoji = process.env.SITE_FAVICON_EMOJI || '🔗';
  const primaryColor = process.env.SITE_PRIMARY_COLOR || '#3B82F6';

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
        }}
      >
        <span style={{ fontSize: 100 }}>{emoji}</span>
      </div>
    ),
    { ...size }
  );
}
