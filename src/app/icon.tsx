import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '6px',
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
        }}
      >
        <span style={{ fontSize: 20 }}>{emoji}</span>
      </div>
    ),
    { ...size }
  );
}
