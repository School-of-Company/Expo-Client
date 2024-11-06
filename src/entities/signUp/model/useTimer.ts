// src/utils/useTimer.ts
import { useEffect } from 'react';

export const useTimer = (
  timer: number,
  setTimer: React.Dispatch<React.SetStateAction<number>>,
) => {
  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer, setTimer]);
};
