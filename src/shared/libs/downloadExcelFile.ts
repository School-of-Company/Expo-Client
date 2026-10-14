import axios, { AxiosResponse } from 'axios';
import { toServerMessage } from '@/shared/libs/handler/serverMessage';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// 서버 파일명을 쓸 수 없을 때의 이름. 헤더가 없으면 프록시도 같은 이름을 넣는다
const FALLBACK_FILE_NAME = 'export.xlsx';

// 경로 구분자는 저장 이름에서 뺀다(제어 문자는 브라우저가 저장할 때 정리한다)
const sanitizeFileName = (value: string) => value.replace(/[\\/]/g, '_').trim();

const DEFAULT_ERROR_MESSAGE = '엑셀 파일을 만들지 못했습니다.';

// 브라우저가 응답을 받지 못한 경우. 서버 연결 실패(502·504)는 프록시가 문구를 담아 응답한다
const NETWORK_ERROR_MESSAGE =
  '네트워크 연결이 끊겨 파일을 받지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.';

// 클릭 직후 URL 을 해제하면 일부 브라우저가 저장을 시작하기 전에 blob 을 잃는다
const REVOKE_DELAY_MS = 1_000;

export const getFileName = (
  contentDisposition?: string,
  fallback = FALLBACK_FILE_NAME,
) => {
  if (!contentDisposition) return fallback;
  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return sanitizeFileName(decodeURIComponent(encoded)) || fallback;
    } catch {
      return fallback;
    }
  }
  // 리포트 서버는 한글 이름을 filename* 로 보내므로 filename= 에는 ASCII 이름만 온다.
  // 서버 배포 전처럼 한글이 '?'·대체 문자로 깨져 오면 원래 이름을 알 수 없으니 기본 이름을 쓴다
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
  const name = plain && sanitizeFileName(plain);
  return !name || /[?\uFFFD]/.test(name) ? fallback : name;
};

/**
 * 오류 응답도 blob 으로 오므로 JSON({ message } · { error } · ProblemDetail { detail })을 읽어 서버 문구를 꺼낸다.
 * 영문뿐이면 상태별 한국어 문구를 쓴다
 */
export const readErrorMessage = async (data: unknown, status = 0) => {
  if (!(data instanceof Blob)) return DEFAULT_ERROR_MESSAGE;
  try {
    const body = JSON.parse(await data.text());
    return toServerMessage(status, body) ?? DEFAULT_ERROR_MESSAGE;
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
};

export const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

/**
 * blob 으로 받은 XLSX 응답을 저장한다. 실패하면 서버 문구를 담은 Error 를 던진다.
 * request 는 responseType: 'blob' 으로 요청해야 한다.
 * 저장했으면 true, 응답 없이 끝났으면(로그인 화면으로 이동 중) false 를 돌려준다. 성공 안내는 true 일 때만 띄운다
 */
export const downloadExcelFile = async (
  request: () => Promise<AxiosResponse<Blob>>,
): Promise<boolean> => {
  try {
    const response: AxiosResponse<Blob> | undefined = await request();
    // 토큰 갱신 실패로 로그인 화면으로 옮겨 가는 중이면 인터셉터가 응답 없이 끝낸다
    if (!response) return false;

    // 성공 상태여도 XLSX 가 아니면 저장하지 않는다 (오류 본문을 파일로 위장하지 않음)
    const contentType = String(response.headers['content-type'] ?? '');
    if (!contentType.includes(XLSX_CONTENT_TYPE) || response.data.size === 0) {
      throw new Error(await readErrorMessage(response.data));
    }

    saveBlob(
      response.data,
      getFileName(response.headers['content-disposition']),
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response
          ? await readErrorMessage(error.response.data, error.response.status)
          : NETWORK_ERROR_MESSAGE,
      );
    }
    throw error;
  }
};

export type ExcelDownloadParams = Record<string, string | number>;

/** 관리자 엑셀 GET 다운로드(`/excel/...`). 실패하면 서버 문구를 담은 Error 를 던진다 */
export const downloadExcel = (path: string, params?: ExcelDownloadParams) =>
  downloadExcelFile(() =>
    clientTokenInstance.get<Blob>(path, {
      params,
      headers: { 'X-File-Download': 'true' },
      responseType: 'blob',
    }),
  );
