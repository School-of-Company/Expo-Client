import { AxiosError, AxiosRequestConfig } from 'axios';
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

  const config: AxiosRequestConfig = {
    responseType: 'arraybuffer',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    const response = await apiClient.get(`/excel/${expo_id}`, config);

    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="export.xlsx"');
    headers.append(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return new NextResponse(response.data, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'Excel export failed';
    return NextResponse.json({ error: message }, { status });
  }
}
