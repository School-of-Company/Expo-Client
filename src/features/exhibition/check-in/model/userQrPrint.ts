import { toast } from 'react-toastify';
import { printBadge } from '@/shared/model';
import { AttendUserResponse } from '@/shared/types/exhibition/check-in/type';

// 참가자 ID와 연수자 ID는 서로 다른 번호 체계라 구분과 합쳐 행을 가린다
export const toAttendUserRowKey = ({
  participationType,
  id,
}: AttendUserResponse) => `${participationType}-${id}`;

export type AttendeeType = 'TEACHER' | 'GENERAL' | 'TRAINEE';

export const ATTENDEE_TYPE_LABEL: Record<AttendeeType, string> = {
  TEACHER: '교사',
  GENERAL: '일반',
  TRAINEE: '연수자',
};

// 서버는 교사도 STANDARD 로 주지만 명찰(badge)은 연수자 전원과 교사에게만 준다
export const getAttendeeType = ({
  participationType,
  badge,
}: Pick<AttendUserResponse, 'participationType' | 'badge'>): AttendeeType =>
  participationType === 'TRAINEE' ? 'TRAINEE' : badge ? 'TEACHER' : 'GENERAL';

export const userQrPrint = (data: AttendUserResponse[], selectItem: string) => {
  const selectedData = data.find(
    (item) => toAttendUserRowKey(item) === selectItem,
  );
  if (!selectedData) return;

  const { badge } = selectedData;
  if (!badge) {
    toast.warn('명찰 출력 대상(교사·연수자)이 아닙니다.');
    return;
  }

  printBadge({ school: badge.school, name: badge.name });
};
