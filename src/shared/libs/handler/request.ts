import { AxiosRequestConfig, ResponseType } from 'axios';
import { NextRequest } from 'next/server';
import {
  FILE_DOWNLOAD_TIMEOUT_MS,
  serverInstance,
} from '@/shared/libs/http/serverInstance';
import { isFileDownloadRequest } from './proxyTarget';
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
  const responseType: ResponseType = isFileDownload ? 'arraybuffer' : 'json';

  return await serverInstance.request({
    url,
    method: req.method as AxiosRequestConfig['method'],
    data: requestData,
    responseType,
    headers: headers as AxiosRequestConfig['headers'],
    ...(isFileDownload && { timeout: FILE_DOWNLOAD_TIMEOUT_MS }),
  });
}
