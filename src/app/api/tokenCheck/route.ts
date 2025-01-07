import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value || null;

  return NextResponse.json({ accessToken });
}
