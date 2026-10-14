// 서버 연결 전 예시 데이터. Expo-Application-Server#109 배포 후 API 로 교체
// 접수번호는 Expo-Application-Server#107 의 접수번호 발급이 함께 필요하다
import { AdminApplicationActivity } from '../api/applicationActivityApi';

export const ACTIVITY_MOCK_ISSUE = 'Expo-Application-Server#109';
export const RECEIPT_NO_MOCK_ISSUE =
  'Expo-Application-Server#107, Expo-Application-Server#109';

/** 처리 주체. 서버는 지금 관리자 취소의 actorId 만 남긴다 */
export type ActivityActorType = 'USER' | 'ADMIN' | 'SYSTEM';

/** #109 이후 이력 행에 함께 올 것으로 예상하는 참가자·회차 정보 */
export interface ActivityMockDetail {
  receiptNo: string;
  participantName: string;
  phoneNumber: string;
  affiliation: string;
  participantTypeLabel: string;
  sessionLabel: string;
  actorType: ActivityActorType;
  /** 취소 후 다시 신청한 건 */
  isReapplied: boolean;
}

export interface ActivityMockExtras {
  detailById: Map<number, ActivityMockDetail>;
  /** 처리일 조건 안에서 관리자가 처리한 이력 수 */
  adminProcessedCount: number;
}

const FAMILY_NAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
];
const GIVEN_NAMES = [
  '서연',
  '민준',
  '지우',
  '도윤',
  '하은',
  '예준',
  '수아',
  '시우',
  '지호',
  '서윤',
];
const AFFILIATIONS = [
  '한빛초등학교',
  '새솔중학교',
  '누리고등학교',
  '미래교육대학교',
  '교육지원청',
  '개인 참가',
];
const PARTICIPANT_TYPES = ['교사', '학생', '학부모', '일반인', '예비교사'];
const SESSION_LABELS = ['1회차 · 필수', '1회차 · 선택', '2회차 · 선택', '상시'];

// 같은 참가자·이력은 언제 그려도 같은 값이 나오게 id 로 고른다
const pick = <T>(list: T[], seed: number) =>
  list[Math.abs(Math.trunc(seed)) % list.length];

const pad = (value: number, length: number) =>
  String(Math.abs(Math.trunc(value)) % 10 ** length).padStart(length, '0');

const toDetail = ({
  id,
  participantId,
  action,
  actorId,
  createdAt,
}: AdminApplicationActivity): ActivityMockDetail => ({
  receiptNo: `${createdAt.slice(0, 4).replace(/\D/g, '') || '0000'}-${pad(
    participantId * 37 + 11,
    5,
  )}`,
  participantName: `${pick(FAMILY_NAMES, participantId)}${pick(
    GIVEN_NAMES,
    participantId * 7 + 3,
  )}`,
  phoneNumber: `010-${pad(participantId * 7919, 4)}-${pad(
    participantId * 104729,
    4,
  )}`,
  affiliation: pick(AFFILIATIONS, participantId * 3 + 1),
  participantTypeLabel: pick(PARTICIPANT_TYPES, participantId * 5 + 2),
  sessionLabel: pick(SESSION_LABELS, id),
  // 기록된 관리자는 그대로 두고, 기록이 없는 이력만 사용자·시스템으로 나눈다
  actorType:
    actorId !== null ? 'ADMIN' : action === 'PROMOTED' ? 'SYSTEM' : 'USER',
  isReapplied: action === 'APPLIED' && id % 4 === 0,
});

/** 불러온 이력 행에 붙일 예시 정보와 관리자 처리 건수 */
export const getActivityMockExtras = (
  activities: AdminApplicationActivity[],
  totalElements: number,
): ActivityMockExtras => {
  const detailById = new Map(
    activities.map((activity) => [activity.id, toDetail(activity)]),
  );
  return {
    detailById,
    adminProcessedCount: Math.round(totalElements * 0.12),
  };
};
