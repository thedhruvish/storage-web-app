import { useCallback, useRef } from "react";

export function useNavigationDebounce() {
  const lastNavTime = useRef(0);

  const debounceNavigation = useCallback(
    (callback: () => void, delay = 500) => {
      const now = Date.now();
      if (now - lastNavTime.current < delay) {
        return;
      }
      lastNavTime.current = now;
      callback();
    },
    [],
  );

  return debounceNavigation;
}
