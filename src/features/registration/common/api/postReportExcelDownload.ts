import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { ReportExcelDownloadRequest } from '@/shared/types/registration/type';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// 한글 파일명 헤더는 서버 컨테이너가 버릴 수 있어 기존과 같은 안전한 이름으로 대체한다
const FALLBACK_FILE_NAME = 'export.xlsx';

const DEFAULT_ERROR_MESSAGE = '엑셀 파일을 만들지 못했습니다.';

const getFileName = (contentDisposition?: string) => {
  if (!contentDisposition) return FALLBACK_FILE_NAME;
  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return FALLBACK_FILE_NAME;
    }
  }
  return (
    contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] ??
    FALLBACK_FILE_NAME
  );
};

/** 오류 응답도 blob 으로 오므로 JSON { status, message } 를 읽어 서버 문구를 꺼낸다 */
const readErrorMessage = async (data: unknown) => {
  if (!(data instanceof Blob)) return DEFAULT_ERROR_MESSAGE;
  try {
    const body = JSON.parse(await data.text());
    const message = body?.message ?? body?.error;
    return typeof message === 'string' && message
      ? message
      : DEFAULT_ERROR_MESSAGE;
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const postReportExcelDownload = async (
  expoId: string,
  request: ReportExcelDownloadRequest,
) => {
  try {
    const response = await clientTokenInstance.post<Blob>(
      `/excel/expos/${expoId}/downloads`,
      request,
      {
        headers: { 'X-File-Download': 'true' },
        responseType: 'blob',
      },
    );

    // 성공 상태여도 XLSX 가 아니면 저장하지 않는다 (오류 본문을 파일로 위장하지 않음)
    const contentType = String(response.headers['content-type'] ?? '');
    if (!contentType.includes(XLSX_CONTENT_TYPE) || response.data.size === 0) {
      throw new Error(await readErrorMessage(response.data));
    }

    saveBlob(
      response.data,
      getFileName(response.headers['content-disposition']),
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(await readErrorMessage(error.response?.data));
    }
    throw error;
  }
};
