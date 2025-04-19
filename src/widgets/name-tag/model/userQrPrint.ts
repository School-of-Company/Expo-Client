import { printBadge } from '@/shared/model/printUtils';
import { AttendUserResponse } from '@/shared/types/name-tag/type';

export interface UserData {
  id: number;
  name: string;
  phoneNumber: string;
  personalInformationStatus: string;
}

export const userQrPrint = (data: AttendUserResponse[], selectItem: number) => {
  const selectedData = data.find((item) => item.id === selectItem);

  if (selectedData) {
    const isTrainee = selectedData.participationType === 'TRAINEE';

    const qrPayload = {
      [isTrainee ? 'traineeId' : 'participantId']: selectedData.id,
      phoneNumber: selectedData.phoneNumber,
    };

    const badgeData = {
      name: selectedData.name,
      qrCode: JSON.stringify(qrPayload),
      isTemporary: false,
    };

    printBadge(badgeData);
  }
};
