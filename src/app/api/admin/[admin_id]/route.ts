import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { admin_id: number } },
) {
  const { admin_id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  console.log(accessToken);

  try {
    const response = await apiClient.patch(`/admin/${admin_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;

    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'signup check failed';

    return NextResponse.json({ error: message }, { status });
  }
}
