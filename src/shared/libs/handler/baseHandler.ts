import { AxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { serverInstance } from '@/shared/libs/http/serverInstance';

export async function baseHandleRequest(
  req: NextRequest,
): Promise<NextResponse> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${req.nextUrl.pathname.replace('/api/server', '')}`;
  const method = req.method;
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  let data;
  if (!['GET', 'DELETE', 'HEAD'].includes(method)) {
    try {
      const textBody = await req.text();
      data = textBody ? JSON.parse(textBody) : undefined;
    } catch {
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다.' },
        { status: 400 },
      );
    }
  }

  try {
    const response = await serverInstance.request({
      url,
      method,
      params,
      data,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message ||
      '요청을 처리하는 중 오류가 발생했습니다.';

    return NextResponse.json({ error: message, status }, { status });
  }
}
