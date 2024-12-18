import { useEffect } from 'react';

export const useTimer = (
  timer: number,
  setTimer: React.Dispatch<React.SetStateAction<number>>,
  setIsSmsSent: React.Dispatch<React.SetStateAction<boolean>>, // 추가
) => {
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (timer === 0) {
      setIsSmsSent(false);
    }
  }, [timer, setTimer, setIsSmsSent]);
};
