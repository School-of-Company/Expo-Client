// 참여 서비스 퇴장 스캔·입장 집계 (Expo-Attendance-Server ScanExitReqDto·EntrySummaryResDto)

// 퇴장 스캔 요청. 일반 참가자 ID+코드, 연수자 ID, 종이 QR 토큰 중 정확히 하나만 보낸다
export type ExitScanRequest =
  | { participantId: number; code: string }
  | { traineeId: number }
  | { token: string };

export interface ExitScanResponse {
  subjectType: 'STANDARD' | 'TRAINEE' | 'PAPER_QR';
  // 오늘 입장·퇴장 시각('HH:mm')
  enteredTime: string;
  exitedTime: string;
  stayedMinutes: number;
}

// ADULT·STUDENT 는 예전 구분이다. 이미 기록된 박람회의 응답에만 오고 새로 기록하지 않는다
export type WalkInCategory =
  | 'KINDERGARTEN_STUDENT'
  | 'ELEMENTARY_STUDENT'
  | 'MIDDLE_SCHOOL_STUDENT'
  | 'HIGH_SCHOOL_STUDENT'
  | 'PARENT'
  | 'GENERAL'
  | 'TEACHER'
  | 'PRE_SERVICE_TEACHER'
  | 'ADULT'
  | 'STUDENT';

export interface WalkInCounts {
  expoId: string;
  date: string;
  // 0 인 구분도 모두 온다
  counts: { category: WalkInCategory; count: number }[];
  total: number;
}

export interface EntrySummary {
  expoId: string;
  // 박람회 전체 기간(all=true)이면 null
  date: string | null;
  // 집계한 시각(시간대 없는 지역 일시)
  generatedAt: string;
  registered: { standard: number; trainee: number };
  // 종이 QR 구분별. 입장이 없는 구분은 오지 않는다
  paper: { category: string | null; entered: number; exited: number }[];
  walkIn: WalkInCounts;
  totals: {
    // 등록 QR + 종이 QR + 간편입장
    entered: number;
    // QR 로 입장한 사람만 센다(간편입장은 퇴장을 세지 않는다)
    exited: number;
    // QR 로 입장했고 아직 퇴장하지 않은 수. 간편입장은 포함하지 않는다
    stillInside: number;
  };
  // 조회한 날짜와 상관없이 지금부터 10분 전까지의 입장 수
  recentEntered10m: number;
  // 서로 다른 QR 수(등록 QR + 종이 QR). 전체 기간이면 다른 날 같은 QR 을 한 번만 센다
  uniqueQr: number;
}
