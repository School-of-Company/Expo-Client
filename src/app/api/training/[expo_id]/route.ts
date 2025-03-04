import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const config = accessToken
    ? {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : {};

  try {
    const response = await apiClient.get(`/training/${expo_id}`, config);

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Unknown error';
      return NextResponse.json({ error: message }, { status: status || 500 });
    } else {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
      );
    }
  }
}
