import { NextResponse } from 'next/server';
import { apiClient } from '@/shared/libs/apiClient';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const response = await apiClient.post('/auth', body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 400 });
  }
}
