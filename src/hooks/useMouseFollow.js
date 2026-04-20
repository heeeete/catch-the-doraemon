import { useState, useEffect } from 'react';

export const useMouseFollow = (circleRef, isCursorOverTarget, recalculation) => {
  const [isCursorOver, setIsCursorOver] = useState(false);

  useEffect(() => {
    let offsetX = 0;
    let offsetY = 0;

    if (circleRef.current) {
      const rect = circleRef.current.getBoundingClientRect();
      offsetX = rect.width / 2;
      offsetY = rect.height / 2;
    }

    const followMouse = (e) => {
      setIsCursorOver(isCursorOverTarget(e));
      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${e.x - offsetX}px, ${e.y - offsetY}px)`;
      }
    };

    window.addEventListener("mousemove", followMouse);
    return () => {
      window.removeEventListener("mousemove", followMouse);
    };
  }, [recalculation, circleRef, isCursorOverTarget]);

  return { isCursorOver };
};
