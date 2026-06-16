import { ImageResponse } from 'next/og';
import { AppIcon } from '@/app/icon';
import type { NextRequest } from 'next/server';

// Public route — referenced from the web manifest, fetched without auth cookie.
export function GET(request: NextRequest) {
  const size = Math.min(512, Math.max(16, Number(request.nextUrl.searchParams.get('size') ?? 512)));
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.6);

  return new ImageResponse(<AppIcon size={size} radius={radius} fontSize={fontSize} />, {
    width: size,
    height: size,
  });
}
