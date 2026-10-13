import axios, { AxiosResponse } from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// 서버 파일명을 쓸 수 없을 때의 이름
const FALLBACK_FILE_NAME = 'export.xlsx';

// 리포트 서버 일부는 Content-Disposition 의 filename= 에 한글을 그대로 넣는다(filename* 없이).
// 서블릿 컨테이너는 헤더를 ISO-8859-1 로 써서 한글이 '?' 로 바뀌므로, 그때 쓸 이름을 경로별로 둔다
const FALLBACK_FILE_NAMES: [RegExp, string][] = [
  [/^\/excel\/trainee\//, '연수자_출석부.xlsx'],
  [/^\/excel\/standard\//, '참가자_명단.xlsx'],
  [/^\/excel\/program\//, '프로그램_참가자_명단.xlsx'],
  [/^\/excel\/[^/]+$/, '교원연수자_정보.xlsx'],
];

const getFallbackFileName = (path: string) =>
  FALLBACK_FILE_NAMES.find(([pattern]) => pattern.test(path))?.[1] ??
  FALLBACK_FILE_NAME;

// UTF-8 바이트를 ISO-8859-1 로 읽어 깨진 문자열이면 되살린다. 되살릴 수 없으면 그대로 둔다
const repairLatin1 = (value: string) => {
  if (!Array.from(value).some((char) => char.charCodeAt(0) >= 0x80))
    return value;
  if (Array.from(value).some((char) => char.charCodeAt(0) > 0xff)) return value;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(value, (char) => char.charCodeAt(0)),
    );
  } catch {
    return value;
  }
};

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
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
  if (!plain) return fallback;
  const name = sanitizeFileName(repairLatin1(plain));
  // 한글이 '?'·대체 문자로 바뀌었으면 원래 이름을 알 수 없다
  return !name || /[?\uFFFD]/.test(name) ? fallback : name;
};

/** 오류 응답도 blob 으로 오므로 JSON { status, message } 를 읽어 서버 문구를 꺼낸다 */
export const readErrorMessage = async (data: unknown) => {
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
  fallbackFileName = FALLBACK_FILE_NAME,
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
      getFileName(response.headers['content-disposition'], fallbackFileName),
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response
          ? await readErrorMessage(error.response.data)
          : NETWORK_ERROR_MESSAGE,
      );
    }
    throw error;
  }
};

export type ExcelDownloadParams = Record<string, string | number>;

/** 관리자 엑셀 GET 다운로드(`/excel/...`). 실패하면 서버 문구를 담은 Error 를 던진다 */
export const downloadExcel = (path: string, params?: ExcelDownloadParams) =>
  downloadExcelFile(
    () =>
      clientTokenInstance.get<Blob>(path, {
        params,
        headers: { 'X-File-Download': 'true' },
        responseType: 'blob',
      }),
    getFallbackFileName(path),
  );
