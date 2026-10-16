// 입퇴장 서버 ScannerName 규칙: 앞뒤 공백을 지우고 40자까지만 남기며, 비면 기록하지 않는다
export const SCANNER_NAME_MAX_LENGTH = 40;

const SCANNER_NAME_HEADER = 'X-Scanner-Name';

/** 스캔 요청에 붙일 기기 이름 헤더. 이름이 없으면 붙이지 않아 예전처럼 처리된다 */
export const scannerNameConfig = (scannerName?: string) =>
  scannerName ? { headers: { [SCANNER_NAME_HEADER]: scannerName } } : {};
