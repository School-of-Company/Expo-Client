import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { admin_id: number } },
) {
  const { admin_id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  try {
    const response = await apiClient.patch(
      `/admin/${admin_id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

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
