import axios from 'axios';
import { toast } from 'react-toastify';

export const sendSms = async (
  phoneNumber: string,
  setIsSmsSent: React.Dispatch<React.SetStateAction<boolean>>,
  setTimer: React.Dispatch<React.SetStateAction<number>>,
) => {
  if (!phoneNumber) {
    toast.error('전화번호를 입력해주세요.');
    return;
  }

  try {
    const response = await axios.post('/api/auth/sms', { phoneNumber });
    if (response.status === 200) {
      setIsSmsSent(true);
      setTimer(180);
      toast.success('인증번호가 발송되었습니다.');
    }
  } catch (error) {
    console.error('SMS sending failed', error);
    toast.error('인증번호 발송에 실패했습니다.');
  }
};
