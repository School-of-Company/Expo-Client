import { toast } from 'react-toastify';

export const handleChageDate = async (day: string) => {
  try {
    const [started, finished] = day.split('-');
    const startedDay = started.replace(/\./g, '-');
    const finishedDay = finished.replace(/\./g, '-');
    return { startedDay, finishedDay };
  } catch (error) {
    console.error('날짜 변환 실패:', error);
    toast.error('날짜 변환 중 오류가 발생했습니다.');
    return { startedDay: '', finishedDay: '' };
  }
};
