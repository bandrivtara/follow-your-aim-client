export function handleError() {
  const IGNORE_RESIZE_OBSERVER_ERROR =
    /ResizeObserver loop completed with undelivered notifications|ResizeObserver loop limit exceeded/;

  // 1) Фільтруємо window.onerror / ErrorEvent (захоплюємо якнайраніше)
  window.addEventListener(
    "error",
    (event: ErrorEvent) => {
      const msg = event?.message || "";

      if (typeof msg === "string" && IGNORE_RESIZE_OBSERVER_ERROR.test(msg)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return;
      }
    },
    true, // важливо: capture phase
  );

  // 2) Фільтруємо console.error (overlay дуже часто підписаний саме на нього)
  const originalConsoleError = window.console.error;

  window.console.error = (...args: any[]) => {
    const [first] = args;

    if (typeof first === "string" && IGNORE_RESIZE_OBSERVER_ERROR.test(first)) {
      return;
    }

    if (
      first instanceof Error &&
      IGNORE_RESIZE_OBSERVER_ERROR.test(first.message)
    ) {
      return;
    }

    originalConsoleError(...args);
  };
}
