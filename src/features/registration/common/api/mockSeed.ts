import {
  RegistrationApplication,
  RegistrationParticipantType,
  RegistrationProgram,
  RegistrationProgramType,
  RegistrationQrColor,
  RegistrationSession,
  RegistrationStatus,
} from '@/shared/types/registration/type';

// TODO: 신청 서버 API 연결 시 mockRegistration 과 함께 제거

const program = (
  id: number,
  code: string,
  name: string,
  type: RegistrationProgramType,
  qrColor: RegistrationQrColor,
  maxSessionsPerPerson = 1,
): RegistrationProgram => ({
  id,
  code,
  name,
  type,
  qrType: type,
  qrColor,
  maxSessionsPerPerson,
  status: 'OPEN',
  applyStartAt: '2026-09-28T09:00',
  applyEndAt: '2026-10-29T18:00',
});

export const seedPrograms = (): RegistrationProgram[] => [
  program(1, 'PRE', '사전등록', 'GENERAL', 'BLACK'),
  program(2, 'BELL_ELEM', '초등학생 AI·SW골든벨', 'GOLDENBELL', 'GREEN'),
  program(3, 'BELL_SEC', '중·고등학생 AI·SW골든벨', 'GOLDENBELL', 'GREEN'),
  program(4, 'TRAIN_SAMSUNG', '삼성 연수', 'TRAINING', 'BLUE', 2),
  program(5, 'TRAIN_GOOGLE', '구글 연수', 'TRAINING', 'BLUE', 2),
  program(6, 'TRAIN_APPLE', '애플 연수', 'TRAINING', 'BLUE', 2),
  program(7, 'KEYNOTE', '미래교육 특강', 'KEYNOTE', 'PURPLE'),
  program(8, 'ODYSSEY', '오디세이 투어', 'ODYSSEY', 'RED'),
];

const session = (
  id: number,
  programId: number,
  round: number,
  name: string,
  date: string,
  time: [string, string],
  place: string,
  capacity: number,
  waitlistCapacity: number,
): RegistrationSession => ({
  id,
  programId,
  round,
  name,
  date,
  startTime: time[0],
  endTime: time[1],
  place,
  capacity,
  waitlistCapacity,
  promotionMode: 'AUTO',
});

const DAY1 = '2026-10-31';
const DAY2 = '2026-11-01';

export const seedSessions = (): RegistrationSession[] => [
  session(
    1,
    1,
    1,
    '10월 31일(토) 오전',
    DAY1,
    ['09:30', '12:30'],
    '박람회장',
    1000,
    100,
  ),
  session(
    2,
    1,
    2,
    '10월 31일(토) 오후',
    DAY1,
    ['13:00', '17:00'],
    '박람회장',
    1000,
    100,
  ),
  session(
    3,
    1,
    3,
    '11월 1일(일) 오전',
    DAY2,
    ['09:30', '12:30'],
    '박람회장',
    1000,
    100,
  ),
  session(
    4,
    1,
    4,
    '11월 1일(일) 오후',
    DAY2,
    ['13:00', '16:00'],
    '박람회장',
    1000,
    100,
  ),
  session(5, 2, 1, '초등 골든벨', DAY1, ['13:30', '14:30'], '대강당', 50, 10),
  session(6, 3, 1, '중고등 골든벨', DAY2, ['11:00', '12:00'], '대강당', 50, 10),
  session(7, 4, 1, '1회차', DAY1, ['13:00', '14:00'], '210호', 30, 10),
  session(8, 5, 1, '1회차', DAY1, ['13:00', '14:00'], '212호', 30, 10),
  session(9, 6, 1, '1회차', DAY1, ['13:00', '14:00'], '202호', 30, 10),
  session(10, 7, 1, '기조강연', DAY1, ['11:00', '12:30'], '추후 안내', 300, 30),
  session(
    11,
    8,
    1,
    '오디세이 1회차',
    DAY1,
    ['10:00', '11:00'],
    'AI교육원 일원',
    16,
    8,
  ),
  session(
    12,
    8,
    2,
    '오디세이 2회차',
    DAY1,
    ['13:30', '14:30'],
    'AI교육원 일원',
    16,
    8,
  ),
  session(
    13,
    8,
    3,
    '오디세이 3회차',
    DAY1,
    ['15:00', '16:00'],
    'AI교육원 일원',
    16,
    8,
  ),
];

const NAMES = [
  '박하민',
  '문강현',
  '김서연',
  '이도윤',
  '최지우',
  '정하준',
  '강민서',
  '조예준',
  '윤서아',
  '장시우',
  '임지호',
  '한유나',
  '오건우',
  '서채원',
  '신주원',
  '권하린',
  '황지안',
  '안도현',
  '송수아',
  '류태윤',
];

const PARTICIPANTS: {
  type: RegistrationParticipantType;
  affiliation: string;
  grade?: string;
}[] = [
  { type: 'HIGH', affiliation: '광주고등학교', grade: '2학년' },
  { type: 'ELEMENTARY', affiliation: '산동초등학교', grade: '5학년' },
  { type: 'MIDDLE', affiliation: '무등중학교', grade: '1학년' },
  { type: 'TEACHER', affiliation: '선운초등학교' },
  { type: 'PRETEACHER', affiliation: '광주교육대학교' },
  { type: 'GENERAL', affiliation: '' },
  { type: 'TEACHER', affiliation: 'AI교육원' },
];

const PARTICIPANT_TYPES_BY_CODE: Record<string, RegistrationParticipantType[]> =
  {
    BELL_ELEM: ['ELEMENTARY'],
    BELL_SEC: ['MIDDLE', 'HIGH'],
    TRAIN_SAMSUNG: ['TEACHER', 'PRETEACHER'],
    TRAIN_GOOGLE: ['TEACHER', 'PRETEACHER'],
    TRAIN_APPLE: ['TEACHER', 'PRETEACHER'],
    ODYSSEY: ['ELEMENTARY', 'MIDDLE', 'HIGH'],
  };

const REGIONS = ['광주', '전남'];

// [sessionId, 확정 수, 대기 수, 취소 수]
const SEED: [number, number, number, number][] = [
  [1, 12, 0, 1],
  [2, 6, 0, 0],
  [3, 8, 0, 2],
  [4, 3, 0, 0],
  [5, 9, 0, 1],
  [6, 4, 0, 0],
  [7, 5, 0, 1],
  [8, 9, 0, 0],
  [9, 6, 0, 0],
  [10, 14, 0, 1],
  [11, 4, 0, 0],
  [12, 16, 3, 1],
  [13, 2, 0, 0],
];

const DAY = 24 * 60 * 60 * 1000;
const SEED_DAYS = 7;

const pad = (value: number, length: number) =>
  String(value).padStart(length, '0');

// 실제로 배정되지 않는 010-0xxx 대역만 사용해 실존 번호와 겹치지 않게 한다
const createPhoneNumber = (seed: number) =>
  `010-0${pad((seed * 7919) % 1000, 3)}-${pad((seed * 104729) % 10000, 4)}`;

export const seedApplications = (
  programs: RegistrationProgram[],
  sessions: RegistrationSession[],
): RegistrationApplication[] => {
  const result: RegistrationApplication[] = [];
  const baseTime = new Date('2026-09-29T09:00:00+09:00').getTime();

  SEED.forEach(([sessionId, confirmed, waiting, canceled]) => {
    const targetSession = sessions.find(({ id }) => id === sessionId)!;
    const targetProgram = programs.find(
      ({ id }) => id === targetSession.programId,
    )!;
    const statuses: RegistrationStatus[] = [
      ...Array<RegistrationStatus>(confirmed).fill('CONFIRMED'),
      ...Array<RegistrationStatus>(waiting).fill('WAITING'),
      ...Array<RegistrationStatus>(canceled).fill('CANCELED'),
    ];
    const allowed = PARTICIPANT_TYPES_BY_CODE[targetProgram.code];
    const candidates = allowed
      ? PARTICIPANTS.filter(({ type }) => allowed.includes(type))
      : PARTICIPANTS;

    statuses.forEach((status) => {
      const index = result.length;
      const participant = candidates[index % candidates.length];
      // 같은 보호자 번호로 여러 명을 신청한 경우를 재현하기 위해 번호를 일부 공유
      const verifiedPhoneNumber = createPhoneNumber(Math.floor(index / 3) + 1);
      const isPre = targetProgram.type === 'GENERAL';

      result.push({
        id: index + 1,
        name: NAMES[index % NAMES.length],
        phoneNumber: isPre ? '' : verifiedPhoneNumber,
        verifiedPhoneNumber,
        affiliation: participant.affiliation,
        region: REGIONS[index % REGIONS.length],
        participantType: participant.type,
        grade: participant.grade,
        programId: targetProgram.id,
        sessionId,
        status,
        applyType: index % 11 === 0 ? 'ONSITE' : 'GENERAL',
        // 대기자는 확정자보다 늦게 신청한 것으로 맞춰 승급 순서가 자연스럽도록 함
        createdAt: new Date(
          status === 'WAITING'
            ? baseTime + SEED_DAYS * DAY + index * 60 * 1000
            : baseTime + ((index * 7919) % (SEED_DAYS * 24 * 60)) * 60 * 1000,
        ).toISOString(),
      });
    });
  });

  return result;
};
