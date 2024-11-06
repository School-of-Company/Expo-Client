import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function PATCH() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await apiClient.patch('/auth', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || 'Signin failed';

    return NextResponse.json({ error: message }, { status });
  }
}
