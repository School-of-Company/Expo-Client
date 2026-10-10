import { toast } from 'react-toastify';
import { printBadge } from '@/shared/model';
import { AttendUserResponse } from '@/shared/types/exhibition/check-in/type';

export const userQrPrint = (data: AttendUserResponse[], selectItem: number) => {
  const selectedData = data.find((item) => item.id === selectItem);
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
