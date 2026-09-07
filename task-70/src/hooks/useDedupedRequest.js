import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../api/httpClient.js';
export function useDedupedRequest() {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const generation = useRef(0);
  const active = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current++; active.current?.cancel(); };
  }, []);
  const cancel = useCallback(() => {
    generation.current++;
    active.current?.cancel();
    active.current = null;
    if (mounted.current) setState((s) => ({ ...s, loading: false }));
  }, []);
  const call = useCallback(async (url, options) => {
    const version = ++generation.current;
    // Subscribe first so repeated identical calls keep sharing the same fetch.
    const next = request(url, options);
    active.current?.cancel();
    active.current = next;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await next.promise;
      if (!mounted.current || version !== generation.current) return;
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (!mounted.current || version !== generation.current) return;
      setState((s) => ({ ...s, error: error.name === 'AbortError' ? null : error, loading: false }));
    }
  }, []);
  return { ...state, call, cancel };
}


