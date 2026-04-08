import { useState, useEffect } from "react";
import axios from "axios";

const useBackendReady = () => {
  const [isReady, setIsReady] = useState(false);
  const [attempt, setAttempt] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/ping`, { timeout: 8000 });
        if (!cancelled) setIsReady(true);
      } catch {
        if (!cancelled) {
          setAttempt((prev) => prev + 1);
          setTimeout(ping, 2000); // retry every 2 seconds
        }
      }
    };

    ping();
    return () => { cancelled = true; };
  }, []);

  return { isReady, attempt };
};

export default useBackendReady;