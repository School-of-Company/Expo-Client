import { toast } from 'react-toastify';
import { printBadge } from '@/shared/model';
import { AttendUserResponse } from '@/shared/types/exhibition/check-in/type';

// 참가자 ID와 연수자 ID는 서로 다른 번호 체계라 구분과 합쳐 행을 가린다
export const toAttendUserRowKey = ({
  participationType,
  id,
}: AttendUserResponse) => `${participationType}-${id}`;

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

  printBadge({
    // 소속이 있으면 "광주초 홍길동", 없으면 이름만
    name: badge.school ? `${badge.school} ${badge.name}` : badge.name,
    qrCode: badge.qrCode,
    isTemporary: false,
  });
};
