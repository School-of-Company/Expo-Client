import axios from 'axios';

interface SMSData {
  title: string;
  content: string;
  authority: 'STANDARD' | 'TRAINEE';
  id: string;
}

export const sendSMS = async (data: SMSData) => {
  try {
    const response = await axios.post(
      `/api/server/token/sms/message/${data.id}`,
      {
        title: data.title,
        content: data.content,
        authority: 'ROLE_' + data.authority,
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '문자 발송 실패');
    }
    throw error;
  }
};
