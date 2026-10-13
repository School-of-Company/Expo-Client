import axios from 'axios';
import { NextResponse } from 'next/server';
import { isRateLimited } from '../rateLimit';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// x는 경도, y는 위도다. 숫자가 아니거나 범위를 벗어나면 카카오로 넘기지 않는다
const parseCoordinate = (value: string | null, limit: number) => {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
};

export async function GET(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const x = parseCoordinate(searchParams.get('x'), 180);
  const y = parseCoordinate(searchParams.get('y'), 90);

  if (x === null || y === null) {
    return NextResponse.json(
      { error: 'Invalid x or y coordinates' },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({ x: String(x), y: String(y) });
  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?${query}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching address data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address data' },
      { status: 500 },
    );
  }
}
