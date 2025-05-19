import { printBadge } from '@/shared/model';
import { AttendUserResponse } from '@/shared/types/exhibition/check-in/type';

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
