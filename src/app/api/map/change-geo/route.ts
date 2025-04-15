import axios from 'axios';
import { NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const x = searchParams.get('x');
  const y = searchParams.get('y');

  if (!x || !y) {
    return NextResponse.json(
      { error: 'Missing x or y coordinates' },
      { status: 400 },
    );
  }

  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${x}&y=${y}`;

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
