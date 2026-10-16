import { AxiosRequestConfig, ResponseType } from 'axios';
import { NextRequest } from 'next/server';
import { clientIpHeaders } from '@/shared/libs/http/clientIp';
import {
  FILE_DOWNLOAD_TIMEOUT_MS,
  serverInstance,
} from '@/shared/libs/http/serverInstance';
import { isFileDownloadRequest } from './proxyTarget';
import { scannerNameHeaders } from './scannerName';
import { RequestData } from './type';

export async function parseRequestData(
  req: NextRequest,
  originalBody?: string | FormData,
): Promise<{
  requestData: RequestData;
  headers: Record<string, string | undefined>;
}> {
  const contentType = req.headers.get('content-type') || '';
  const headers: Record<string, string | undefined> = {};
  let requestData: RequestData = undefined;

  if (!['GET', 'DELETE', 'HEAD'].includes(req.method)) {
    if (contentType.includes('multipart/form-data')) {
      requestData = await req.formData();
    } else if (contentType.includes('application/json')) {
      const bodyText =
        typeof originalBody === 'string' ? originalBody : await req.text();
      requestData = JSON.parse(bodyText);
      headers['Content-Type'] = 'application/json';
    } else {
      const bodyText =
        typeof originalBody === 'string' ? originalBody : await req.text();
      requestData = bodyText;
    }
  }

  return { requestData, headers };
}

export async function sendRequest(
  req: NextRequest,
  url: string,
  accessToken: string | undefined,
  requestData: RequestData,
  headers: Record<string, string | undefined>,
) {
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const isFileDownload = isFileDownloadRequest(req);
  // 파일은 메모리에 모으지 않고 받는 대로 브라우저로 흘려보낸다
  const responseType: ResponseType = isFileDownload ? 'stream' : 'json';

  return await serverInstance.request({
    url,
    method: req.method as AxiosRequestConfig['method'],
    data: requestData,
    responseType,
    headers: {
      ...headers,
      ...clientIpHeaders(req),
      ...scannerNameHeaders(
        req.method,
        req.nextUrl.pathname.replace(/^\/api\/server\/token/, ''),
        req.headers.get('X-Scanner-Name'),
      ),
      // 압축을 풀면 Content-Length 가 실제 본문과 달라지므로 원본 그대로 받는다(XLSX 는 이미 zip 이다)
      ...(isFileDownload && { 'Accept-Encoding': 'identity' }),
    } as AxiosRequestConfig['headers'],
    ...(isFileDownload && {
      timeout: FILE_DOWNLOAD_TIMEOUT_MS,
      decompress: false,
    }),
  });
}
