import axios from 'axios';
import { PatchStandardProgramData } from '@/shared/types/program-detail/type';

export const patchStandardAttendance = async ({
  id,
  participantId,
  phoneNumber,
}: PatchStandardProgramData) => {
  const response = await axios.patch(`/api/attendance/standard/${id}`, {
    participantId,
    phoneNumber,
  });
  return response;
};
