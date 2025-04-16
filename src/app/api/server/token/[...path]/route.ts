import { NextRequest, NextResponse } from 'next/server';
import { handleRequest } from '@/shared/libs/handler/handler';

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req);
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req);
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req);
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  return handleRequest(req);
}
