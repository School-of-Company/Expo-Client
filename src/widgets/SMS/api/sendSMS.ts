import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { SendSmSData } from '@/shared/types/sms';

export const sendSMS = async (
  id: string,
  authority: string,
  data: SendSmSData,
) => {
  try {
    const response = await clientTokenInstance.post(`/sms/message/${id}`, {
      title: data.title,
      content: data.content,
      authority: 'ROLE_' + authority,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || '문자 전송에 실패했습니다');
    }
    throw error;
  }
};
