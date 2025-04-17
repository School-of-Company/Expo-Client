import { NextRequest } from 'next/server';
import { baseHandleRequest } from '@/shared/libs/handler/baseHandler';

export async function GET(req: NextRequest) {
  return baseHandleRequest(req);
}

export async function POST(req: NextRequest) {
  return baseHandleRequest(req);
}

export async function DELETE(req: NextRequest) {
  return baseHandleRequest(req);
}

export async function PATCH(req: NextRequest) {
  return baseHandleRequest(req);
}

export async function PUT(req: NextRequest) {
  return baseHandleRequest(req);
}
