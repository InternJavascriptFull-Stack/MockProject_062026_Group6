import { useState, useEffect } from "react";

type RouterListener = () => void;
const listeners = new Set<RouterListener>();

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

// Intercept window.history methods to notify listeners
const originalPushState = window.history.pushState.bind(window.history);
window.history.pushState = function (
  this: History,
  data: unknown,
  unused: string,
  url?: string | null,
) {
  originalPushState(data, unused, url);
  notify();
};

const originalReplaceState = window.history.replaceState.bind(window.history);
window.history.replaceState = function (
  this: History,
  data: unknown,
  unused: string,
  url?: string | null,
) {
  originalReplaceState(data, unused, url);
  notify();
};

window.addEventListener("popstate", () => {
  notify();
});

/**
 * Custom hook for routing.
 * Listens to URL changes and provides navigation functions.
 */
export function useRouter() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const handleChange = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState(null, "", to);
  };

  const getQueryParam = (name: string): string | null => {
    const params = new URLSearchParams(search);
    return params.get(name);
  };

  return { pathname, search, navigate, getQueryParam };
}
