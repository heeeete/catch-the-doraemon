import { useState, useRef, useCallback } from 'react';

export const useGameEffects = () => {
  const [combo, setCombo] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const comboTimeoutRef = useRef(null);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);
  }, []);

  const incrementCombo = useCallback(() => {
    setCombo((prev) => prev + 1);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setCombo(0), 2000);
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
  }, []);

  return { combo, isShaking, triggerShake, incrementCombo, resetCombo };
};
