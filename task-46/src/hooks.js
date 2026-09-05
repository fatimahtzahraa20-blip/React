import { useEffect, useRef, useState } from "react";

export function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Keeps a single query param in sync with the URL (via history.pushState)
 * without pulling in a router — reads initial state from the URL on mount
 * and responds to back/forward navigation via popstate.
 */
export function useQueryParamState(paramName, defaultValue = "") {
  const [value, setValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName) ?? defaultValue;
  });
  const isFirstRun = useRef(true);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(paramName) ?? defaultValue);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramName]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.pushState({}, "", newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, paramName]);

  return [value, setValue];
}
