import { AxiosResponse } from 'axios';
import { NextResponse } from 'next/server';

export function createResponse(
  response: AxiosResponse,
  isFileDownload: boolean,
) {
  if (isFileDownload) {
    return createFileDownloadResponse(response);
  }

  return response.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(response.data, { status: response.status });
}

export function createFileDownloadResponse(response: AxiosResponse) {
  const downloadHeaders = new Headers();
  downloadHeaders.set(
    'Content-Disposition',
    response.headers?.['content-disposition'] ||
      'attachment; filename="export.xlsx"',
  );
  downloadHeaders.set(
    'Content-Type',
    response.headers?.['content-type'] ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  // 개인정보가 담긴 파일이라 브라우저·중간 캐시에 남기지 않는다
  downloadHeaders.set(
    'Cache-Control',
    response.headers?.['cache-control'] || 'no-store',
  );

  return new NextResponse(response.data, {
    status: response.status,
    headers: downloadHeaders,
  });
}

export function createErrorResponse(
  message: string,
  status: number,
  isRefreshError = false,
) {
  return NextResponse.json(
    {
      error: message,
      status: status,
      isRefreshError: isRefreshError,
    },
    { status },
  );
}
