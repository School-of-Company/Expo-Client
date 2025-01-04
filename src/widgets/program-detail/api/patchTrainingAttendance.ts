import axios from 'axios';

interface TrainingProgramData {
  id: number;
  traineeId: number;
}

export const PatchTrainingAttendance = async ({
  id,
  traineeId,
}: TrainingProgramData) => {
  const response = await axios.patch(`/api/attendance/training/${id}`, {
    traineeId,
  });
  return response;
};
