import axios from 'axios';

interface StandardProgramData {
  id: number;
  participantId: number;
  phoneNumber: string;
}

export const PatchStandardAttendance = async ({
  id,
  participantId,
  phoneNumber,
}: StandardProgramData) => {
  const response = await axios.patch(`/api/attendance/standard/${id}`, {
    participantId,
    phoneNumber,
  });
  return response;
};
