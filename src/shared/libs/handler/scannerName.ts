const SCANNER_NAME_HEADER = 'X-Scanner-Name';

// Attendance 가 X-Scanner-Name 을 읽는 스캔 요청(입장·퇴장·종이 QR 입장, 간편입장 +1/취소). 경로는 /api/server/token 뒤 기준이다
const SCAN_REQUESTS: { method: string; path: RegExp }[] = [
  { method: 'PATCH', path: /^\/attendance\/(?:exit\/|qr\/)?[^/]+$/ },
  { method: 'POST', path: /^\/walk-in-counts\/[^/]+$/ },
];

/**
 * 스캔 요청이면 브라우저가 보낸 스캐너 이름만 Gateway 로 넘긴다.
 * 길이·제어 문자 정리는 Attendance 가 하므로 값은 그대로 두고, 없거나 스캔 요청이 아니면 넘기지 않는다
 */
export const scannerNameHeaders = (
  method: string,
  path: string,
  scannerName: string | null,
): Record<string, string> => {
  if (!scannerName) return {};
  const isScan = SCAN_REQUESTS.some(
    (scan) => scan.method === method && scan.path.test(path),
  );
  return isScan ? { [SCANNER_NAME_HEADER]: scannerName } : {};
};
