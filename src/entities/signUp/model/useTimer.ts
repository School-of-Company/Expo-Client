import { useEffect } from 'react';

export const useTimer = (
  timer: number,
  setTimer: React.Dispatch<React.SetStateAction<number>>,
  setIsSmsSent: React.Dispatch<React.SetStateAction<boolean>>,
  isSmsVerified: boolean,
) => {
  useEffect(() => {
    if (timer > 0 && !isSmsVerified) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (timer === 0 || isSmsVerified) {
      setIsSmsSent(false);
      setTimer(0);
    }
  }, [timer, setTimer, isSmsVerified]);
};
