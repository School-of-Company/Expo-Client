import axios from 'axios';

interface SMSData {
  title: string;
  content: string;
  authority: 'STANDARD' | 'TRAINEE';
  id: string;
}

export const sendSMS = async (data: SMSData) => {
  try {
    const response = await axios.post(`/api/sms/message/${data.id}`, {
      title: data.title,
      content: data.content,
      authority: data.authority,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating exhibition:', error);
    throw error;
  }
};
