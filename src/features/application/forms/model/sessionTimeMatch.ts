import type { OwnerApplication } from '../api/myApplications';

export interface TimeWindow {
  startedAt: string;
  endedAt: string;
}

// 'YYYY-MM-DD HH:mm' 은 Safari 가 읽지 못해 T 로 바꾼다
const toTime = (value: string) => new Date(value.replace(' ', 'T')).getTime();

/** 내 확정 사전등록 회차의 시간 창. 회차 목록에서 찾지 못한 신청은 뺀다 */
export const getConfirmedSessionWindows = (
  applications: OwnerApplication[],
  sessions: (TimeWindow & { id: number })[] = [],
): TimeWindow[] =>
  applications.flatMap((application) => {
    if (
      application.type !== 'PREREGISTER' ||
      application.status !== 'CONFIRMED'
    )
      return [];
    const session = sessions.find(
      (item) => item.id === application.sessionOrProgramId,
    );
    return session ? [session] : [];
  });

/**
 * 프로그램이 내 확정 사전등록 회차와 시간이 일부라도 겹치는지(Expo-Application-Server#197).
 * [시작, 끝) 기준이며 입장 허용 여유(leadMinutes)는 넣지 않는다.
 * 확정 회차를 모르면 막을 근거가 없어 true 로 둔다. 조회 시점의 안내이고 최종 판정은 서버가 한다
 */
export const matchesSessionTime = (
  program: TimeWindow,
  windows: TimeWindow[],
) =>
  windows.length === 0 ||
  windows.some(
    (window) =>
      toTime(program.startedAt) < toTime(window.endedAt) &&
      toTime(window.startedAt) < toTime(program.endedAt),
  );
