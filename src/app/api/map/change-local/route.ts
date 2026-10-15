import axios from 'axios';
import { NextResponse } from 'next/server';
import { isRateLimited } from '../rateLimit';

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// 주소 검색어는 한 줄 주소면 충분하므로 길이를 제한한다
const MAX_ADDRESS_LENGTH = 100;

export async function GET(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address')?.trim();

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 },
    );
  }

  if (address.length > MAX_ADDRESS_LENGTH) {
    return NextResponse.json(
      { error: 'Address parameter is too long' },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({ query: address });
  const url = `https://dapi.kakao.com/v2/local/search/address.json?${query}`;

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
