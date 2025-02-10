import axios from 'axios';
import { NextResponse } from 'next/server';

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 },
    );
  }

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;

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
