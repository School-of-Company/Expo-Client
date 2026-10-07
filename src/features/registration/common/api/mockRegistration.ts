import {
  RegistrationApplyPeriodRequest,
  RegistrationGroupSmsRequest,
  RegistrationGroupSmsResult,
  RegistrationHistory,
  RegistrationHistoryAction,
  RegistrationMonitoring,
  RegistrationOverview,
  RegistrationProgram,
  RegistrationProgramCreateRequest,
  RegistrationPromotionPolicyRequest,
  RegistrationScheduleSaveRequest,
  RegistrationSessionCreateRequest,
  RegistrationStatusChangeRequest,
  RegistrationStatusChangeResult,
} from '@/shared/types/registration/type';
import { seedApplications, seedPrograms, seedSessions } from './mockSeed';

// TODO: 신청 서버 API 연결 시 제거하고 실제 API 로 교체
// 서버 동작(자동 승급, 정원 검증, 이력 기록)을 흉내 내기 위해 메모리에 상태를 보관한다.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let programs = seedPrograms();
let sessions = seedSessions();
const applications = seedApplications(programs, sessions);
let autoPromotionUntil: string | null = null;
const histories: RegistrationHistory[] = [];
const monitoring: RegistrationMonitoring = {
  todayPageView: 1284,
  todayUniqueVisitor: 412,
  totalPageView: 18342,
  totalUniqueVisitor: 5127,
  todayCheckInCount: 0,
};

const addHistory = (action: RegistrationHistoryAction, summary: string) => {
  histories.unshift({
    id: histories.length + 1,
    action,
    summary,
    actor: '관리자',
    createdAt: new Date().toISOString(),
  });
};

const isAutoPromotionActive = () =>
  !autoPromotionUntil || new Date() < new Date(autoPromotionUntil);

const countConfirmed = (sessionId: number) =>
  applications.filter(
    (application) =>
      application.sessionId === sessionId && application.status === 'CONFIRMED',
  ).length;

const getWaitingQueue = (sessionId: number) =>
  applications
    .filter(
      (application) =>
        application.sessionId === sessionId && application.status === 'WAITING',
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

/** AUTO 회차의 공석을 대기 순서대로 채운다. 승급된 인원 수를 반환 */
const fillSeats = (sessionIds: number[]) => {
  if (!isAutoPromotionActive()) return 0;
  let promoted = 0;
  sessionIds.forEach((sessionId) => {
    const target = sessions.find(({ id }) => id === sessionId);
    if (!target || target.promotionMode !== 'AUTO') return;
    const seats = target.capacity - countConfirmed(sessionId);
    getWaitingQueue(sessionId)
      .slice(0, Math.max(seats, 0))
      .forEach((application) => {
        application.status = 'CONFIRMED';
        promoted += 1;
      });
  });
  if (promoted > 0) {
    addHistory('AUTO_PROMOTION', `대기자 ${promoted}명 자동 승급`);
  }
  return promoted;
};

export const mockGetRegistrationOverview =
  async (): Promise<RegistrationOverview> => {
    await delay(300);
    return {
      programs: programs.map((item) => ({ ...item })),
      sessions: sessions.map((item) => ({ ...item })),
      applications: applications.map((item) => ({ ...item })),
      autoPromotionUntil,
    };
  };

export const mockGetRegistrationMonitoring =
  async (): Promise<RegistrationMonitoring> => {
    await delay(200);
    // 실시간 갱신처럼 보이도록 조회할 때마다 조금씩 증가
    const increase = 1 + Math.floor(Math.random() * 3);
    monitoring.todayPageView += increase;
    monitoring.totalPageView += increase;
    return { ...monitoring };
  };

export const mockGetRegistrationHistories = async (): Promise<
  RegistrationHistory[]
> => {
  await delay(200);
  return histories.map((item) => ({ ...item }));
};

export const mockPostRegistrationGroupSms = async ({
  applicationIds,
}: RegistrationGroupSmsRequest): Promise<RegistrationGroupSmsResult> => {
  await delay(500);
  const phoneNumbers = new Set(
    applications
      .filter(({ id }) => applicationIds.includes(id))
      .map(
        ({ phoneNumber, verifiedPhoneNumber }) =>
          phoneNumber || verifiedPhoneNumber,
      ),
  );
  addHistory('GROUP_SMS', `그룹 문자 ${phoneNumbers.size}건 발송`);
  return { sentCount: phoneNumbers.size };
};

export const mockPatchRegistrationStatus = async ({
  applicationIds,
  status,
}: RegistrationStatusChangeRequest): Promise<RegistrationStatusChangeResult> => {
  await delay(400);
  const targets = applications
    .filter(({ id }) => applicationIds.includes(id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let changedCount = 0;
  const freedSessionIds = new Set<number>();

  targets.forEach((application) => {
    if (status === 'CONFIRMED') {
      const target = sessions.find(({ id }) => id === application.sessionId);
      if (
        application.status !== 'WAITING' ||
        !target ||
        countConfirmed(target.id) >= target.capacity
      )
        return;
      application.status = 'CONFIRMED';
      changedCount += 1;
      return;
    }

    if (application.status === 'CANCELED') return;
    if (application.status === 'CONFIRMED') {
      freedSessionIds.add(application.sessionId);
    }
    application.status = 'CANCELED';
    changedCount += 1;
  });

  if (changedCount > 0) {
    addHistory(
      'STATUS_CHANGE',
      `${changedCount}건 ${status === 'CONFIRMED' ? '수동 승급' : '취소'} (접수번호 ${targets
        .map(({ id }) => `#${id}`)
        .join(', ')})`,
    );
  }

  return {
    changedCount,
    skippedCount: targets.length - changedCount,
    autoPromotedCount: fillSeats(Array.from(freedSessionIds)),
  };
};

const SESSION_TIME_PATTERN = /^\d{2}:\d{2}$/;

export const mockPutRegistrationSchedule = async ({
  programs: nextPrograms,
  sessions: nextSessions,
}: RegistrationScheduleSaveRequest) => {
  await delay(500);

  nextPrograms.forEach((item) => {
    if (!item.name.trim())
      throw new Error(`${item.code}: 프로그램명을 입력해주세요.`);
    if (item.maxSessionsPerPerson < 1)
      throw new Error(`${item.code}: 1인 최대 회차는 1 이상이어야 합니다.`);
    if (
      item.applyStartAt &&
      item.applyEndAt &&
      item.applyStartAt >= item.applyEndAt
    )
      throw new Error(`${item.code}: 신청 종료가 시작보다 늦어야 합니다.`);
  });

  nextSessions.forEach((item) => {
    const label = `회차 ID ${item.id}`;
    if (
      !SESSION_TIME_PATTERN.test(item.startTime) ||
      !SESSION_TIME_PATTERN.test(item.endTime)
    )
      throw new Error(`${label}: 시작/종료 시간을 입력해주세요.`);
    if (item.startTime >= item.endTime)
      throw new Error(`${label}: 종료 시간이 시작 시간보다 늦어야 합니다.`);
    if (item.capacity < countConfirmed(item.id))
      throw new Error(
        `${label}: 정원(${item.capacity})이 현재 확정 인원(${countConfirmed(item.id)})보다 적습니다.`,
      );
    if (item.waitlistCapacity < 0)
      throw new Error(`${label}: 대기 정원을 확인해주세요.`);
  });

  programs = nextPrograms.map((item) => ({ ...item }));
  sessions = nextSessions.map((item) => ({ ...item }));
  addHistory(
    'SCHEDULE_SAVE',
    `프로그램 ${programs.length}개 · 회차 ${sessions.length}개 일괄 저장`,
  );
  fillSeats(sessions.map(({ id }) => id));
};

export const mockPutRegistrationApplyPeriod = async ({
  applyStartAt,
  applyEndAt,
}: RegistrationApplyPeriodRequest) => {
  await delay(300);
  if (applyStartAt && applyEndAt && applyStartAt >= applyEndAt)
    throw new Error('신청 종료가 시작보다 늦어야 합니다.');
  programs = programs.map((item) => ({ ...item, applyStartAt, applyEndAt }));
  addHistory(
    'APPLY_PERIOD',
    applyStartAt || applyEndAt
      ? `전체 신청기간 ${applyStartAt ?? '제한 없음'} ~ ${applyEndAt ?? '제한 없음'} 적용`
      : '전체 신청기간 일괄 해제',
  );
};

export const mockPutRegistrationPromotionPolicy = async ({
  promotionMode,
  autoPromotionUntil: until,
}: RegistrationPromotionPolicyRequest) => {
  await delay(300);
  sessions = sessions.map((item) => ({ ...item, promotionMode }));
  autoPromotionUntil = until;
  addHistory(
    'PROMOTION_POLICY',
    `전체 회차 ${promotionMode} 승급 적용${until ? ` (자동승급 종료 ${until})` : ''}`,
  );
  fillSeats(sessions.map(({ id }) => id));
};

const PROGRAM_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const QR_COLOR_BY_TYPE: Record<
  RegistrationProgram['type'],
  RegistrationProgram['qrColor']
> = {
  GENERAL: 'BLACK',
  GOLDENBELL: 'GREEN',
  TRAINING: 'BLUE',
  KEYNOTE: 'PURPLE',
  ODYSSEY: 'RED',
};

export const mockPostRegistrationProgram = async (
  data: RegistrationProgramCreateRequest,
) => {
  await delay(300);
  if (!PROGRAM_CODE_PATTERN.test(data.code))
    throw new Error('코드는 영문 대문자, 숫자, _ 만 사용할 수 있습니다.');
  if (programs.some(({ code }) => code === data.code))
    throw new Error('이미 사용 중인 프로그램 코드입니다.');
  if (!data.name.trim()) throw new Error('프로그램명을 입력해주세요.');

  programs = [
    ...programs,
    {
      ...data,
      id: Math.max(0, ...programs.map(({ id }) => id)) + 1,
      qrType: data.type,
      qrColor: QR_COLOR_BY_TYPE[data.type],
      status: 'CLOSED',
      applyStartAt: null,
      applyEndAt: null,
    },
  ];
  addHistory('PROGRAM_CREATE', `프로그램 ${data.code} (${data.name}) 등록`);
};

export const mockPostRegistrationSession = async (
  data: RegistrationSessionCreateRequest,
) => {
  await delay(300);
  const target = programs.find(({ id }) => id === data.programId);
  if (!target) throw new Error('프로그램을 선택해주세요.');
  if (
    sessions.some(
      ({ programId, round }) =>
        programId === data.programId && round === data.round,
    )
  )
    throw new Error(`${target.name}에 ${data.round}회차가 이미 있습니다.`);
  if (
    !data.date ||
    !SESSION_TIME_PATTERN.test(data.startTime) ||
    !SESSION_TIME_PATTERN.test(data.endTime)
  )
    throw new Error('운영일과 시작/종료 시간을 입력해주세요.');
  if (data.startTime >= data.endTime)
    throw new Error('종료 시간이 시작 시간보다 늦어야 합니다.');
  if (data.capacity < 1) throw new Error('정원은 1명 이상이어야 합니다.');

  sessions = [
    ...sessions,
    {
      ...data,
      id: Math.max(0, ...sessions.map(({ id }) => id)) + 1,
      promotionMode: 'AUTO',
    },
  ];
  addHistory(
    'SESSION_CREATE',
    `${target.name} ${data.round}회차 (${data.name || data.date}) 개설`,
  );
};

export const mockDeleteRegistrationSession = async (sessionId: number) => {
  await delay(300);
  const target = sessions.find(({ id }) => id === sessionId);
  if (!target) throw new Error('회차를 찾을 수 없습니다.');
  if (
    applications.some(
      (application) =>
        application.sessionId === sessionId &&
        application.status !== 'CANCELED',
    )
  )
    throw new Error(
      '확정 또는 대기 중인 신청자가 있는 회차는 삭제할 수 없습니다.',
    );

  sessions = sessions.filter(({ id }) => id !== sessionId);
  const programName = programs.find(({ id }) => id === target.programId)?.name;
  addHistory('SESSION_DELETE', `${programName} ${target.round}회차 삭제`);
};
