import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const role = request.headers.get('role') || 'user';

  return NextResponse.json({ role });
}
