// 서버 연결 전 예시 데이터. Expo-Attendance-Server#131 배포 후 API 로 교체

export const ATTENDANCE_ACTIVITY_ISSUE = 'Expo-Attendance-Server#131';

export type AttendanceMethod =
  | 'STANDARD'
  | 'TRAINEE'
  | 'PAPER_ADULT'
  | 'PAPER_CHILD'
  | 'WALK_IN_ADULT'
  | 'WALK_IN_STUDENT';

export interface AttendanceLog {
  id: string;
  // 시간대 없는 지역 일시('2026-10-31T14:05:12')
  occurredAt: string;
  type: 'ENTRY' | 'EXIT';
  method: AttendanceMethod;
  // 종이 QR·간편입장은 이름이 없다
  participantName: string | null;
  scannerName: string;
}

/** GET /attendance/activity/{expoId}?date=yyyy-MM-dd (예정). date 를 빼면 전체 기간 */
export interface AttendanceActivity {
  expoId: string;
  date: string | null;
  // 최근 10분 입장 건수. 오늘이 아니면 null
  recentEntered: number | null;
  hourly: { hour: number; entered: number; exited: number }[];
  // 최신순 30건
  logs: AttendanceLog[];
  // 입장 처리 건수 상위 15개 장치
  scanners: { scannerName: string; entered: number }[];
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
// 오전에 몰리고 점심 뒤 다시 느는 모양
const ENTRY_WEIGHT = [0.9, 1, 0.75, 0.45, 0.6, 0.55, 0.35, 0.2, 0.1, 0.02];
const EXIT_WEIGHT = [0, 0.1, 0.25, 0.45, 0.35, 0.4, 0.55, 0.7, 0.8, 0.6];
const METHODS: AttendanceMethod[] = [
  'STANDARD',
  'STANDARD',
  'STANDARD',
  'TRAINEE',
  'PAPER_ADULT',
  'PAPER_CHILD',
  'WALK_IN_ADULT',
  'WALK_IN_STUDENT',
];
const NAMES = ['김민준', '이서연', '박지호', '최수아', '정예준', '강하은'];
const SCANNERS = Array.from(
  { length: 18 },
  (_, index) => `입구 ${Math.floor(index / 3) + 1} · 스캐너 ${(index % 3) + 1}`,
);

// 날짜마다 다르지만 매번 같은 값이 나오도록 문자열로 시드를 만든다
const createRandom = (seed: string) => {
  let state = Array.from(seed).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    7,
  );
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

const pad = (value: number) => String(value).padStart(2, '0');

const createDay = (expoId: string, date: string): AttendanceActivity => {
  const random = createRandom(`${expoId}${date}`);
  const scale = 300 + Math.floor(random() * 200);

  const logs: AttendanceLog[] = Array.from({ length: 30 }, (_, index) => {
    const method = METHODS[Math.floor(random() * METHODS.length)];
    const hasName = method === 'STANDARD' || method === 'TRAINEE';
    const minutes = 17 * 60 - index * 3 - Math.floor(random() * 3);
    return {
      id: `${date}-${index}`,
      occurredAt: `${date}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:${pad(Math.floor(random() * 60))}`,
      type: random() < 0.3 && !method.startsWith('WALK_IN') ? 'EXIT' : 'ENTRY',
      method,
      participantName: hasName
        ? NAMES[Math.floor(random() * NAMES.length)]
        : null,
      scannerName: SCANNERS[Math.floor(random() * SCANNERS.length)],
    };
  });

  return {
    expoId,
    date,
    recentEntered: 10 + Math.floor(random() * 30),
    hourly: HOURS.map((hour, index) => ({
      hour,
      entered: Math.round(scale * ENTRY_WEIGHT[index] * (0.8 + random() * 0.4)),
      exited: Math.round(scale * EXIT_WEIGHT[index] * (0.8 + random() * 0.4)),
    })),
    logs,
    scanners: SCANNERS.map((scannerName) => ({
      scannerName,
      entered: Math.floor(random() * scale * 0.6),
    }))
      .sort((a, b) => b.entered - a.entered)
      .slice(0, 15),
  };
};

/** 고른 날짜(또는 전체 기간 날짜 목록)의 예시 활동 데이터 */
export const getMockAttendanceActivity = (
  expoId: string,
  days: string[],
  isToday: boolean,
): AttendanceActivity => {
  const results = days.map((date) => createDay(expoId, date));
  if (results.length === 1) {
    return {
      ...results[0],
      recentEntered: isToday ? results[0].recentEntered : null,
    };
  }

  const scanners = new Map<string, number>();
  results.forEach((result) =>
    result.scanners.forEach(({ scannerName, entered }) =>
      scanners.set(scannerName, (scanners.get(scannerName) ?? 0) + entered),
    ),
  );

  return {
    expoId,
    date: null,
    recentEntered: null,
    hourly: HOURS.map((hour, index) => ({
      hour,
      entered: results.reduce((sum, r) => sum + r.hourly[index].entered, 0),
      exited: results.reduce((sum, r) => sum + r.hourly[index].exited, 0),
    })),
    logs: results
      .flatMap(({ logs }) => logs)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 30),
    scanners: Array.from(scanners, ([scannerName, entered]) => ({
      scannerName,
      entered,
    }))
      .sort((a, b) => b.entered - a.entered)
      .slice(0, 15),
  };
};
