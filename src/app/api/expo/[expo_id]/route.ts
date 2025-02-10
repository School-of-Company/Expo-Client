import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  try {
    const response = await apiClient.get(`/expo/${expo_id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'expoDetail failed';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  try {
    const response = await apiClient.delete(`/expo/${expo_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'expo delete failed';

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { expo_id: number } },
) {
  const { expo_id } = params;
  const body = await request.json();
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  try {
    const response = await apiClient.patch(`/expo/${expo_id}`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('🍒' + response.status);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message;
    return NextResponse.json({ error: message }, { status });
  }
}
