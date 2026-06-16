import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<AppIcon size={32} radius={6} fontSize={20} />, { ...size });
}

export function AppIcon({
  size,
  radius,
  fontSize,
}: {
  size: number;
  radius: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#4f46e5',
        borderRadius: radius,
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize,
          fontWeight: 700,
          fontFamily: 'serif',
          lineHeight: 1,
          letterSpacing: '-1px',
        }}
      >
        D
      </span>
    </div>
  );
}
