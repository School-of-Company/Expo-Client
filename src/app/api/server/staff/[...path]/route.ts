import { NextRequest, NextResponse } from 'next/server';
import { staffHandleRequest } from '@/shared/libs/handler/staffHandler';

export async function GET(req: NextRequest): Promise<NextResponse> {
  return staffHandleRequest(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return staffHandleRequest(req);
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return staffHandleRequest(req);
}
