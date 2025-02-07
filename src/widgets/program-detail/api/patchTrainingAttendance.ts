import axios from 'axios';
import { PatchTrainingProgramData } from '@/shared/types/program-detail/type';

export const patchTrainingAttendance = async ({
  id,
  traineeId,
}: PatchTrainingProgramData) => {
  const response = await axios.patch(`/api/attendance/training/${id}`, {
    traineeId,
  });
  return response;
};
