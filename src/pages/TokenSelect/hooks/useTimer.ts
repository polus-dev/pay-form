import { useEffect, useState } from "react";

export const useTimer = (expiresAt: string) => {
  const [timer, setTimer] = useState("00:00");
  const [isExpired, setIsExpired] = useState(false);
  const eventTime = new Date(expiresAt).getTime() / 1000;
  const currentTime = Date.now() / 1000;
  let diffTime = eventTime - currentTime - 1;
  useEffect(() => {
    if (!expiresAt) return;
    if (diffTime <= 0) {
      setIsExpired(true);
    }
    const id = setInterval(() => {
      if (diffTime <= 0) {
        setIsExpired(true);
        clearInterval(id);
        return;
      }
      const minutes = Math.floor(diffTime / 60);
      const seconds = Math.floor(diffTime % 60);

      setTimer(
        `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds
        }`
      );
      diffTime--;
    }, 1000);
  }, [expiresAt])

  return { timer, isExpired };
};
