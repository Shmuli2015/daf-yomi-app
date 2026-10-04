const DEFAULT_IDLE_TIMEOUT_MS = 1000;

export type IdleTaskHandle = {
  cancel: () => void;
};

export function scheduleIdleTask(
  task: () => void,
  timeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
): IdleTaskHandle {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(() => {
      task();
    }, { timeout: timeoutMs });
    return {
      cancel: () => {
        cancelIdleCallback(id);
      },
    };
  }

  const id = requestAnimationFrame(() => {
    task();
  });
  return {
    cancel: () => {
      cancelAnimationFrame(id);
    },
  };
}

export function scheduleIdleSequence(tasks: Array<() => void>): IdleTaskHandle {
  if (tasks.length === 0) {
    return { cancel: () => undefined };
  }

  let pending: IdleTaskHandle | null = null;
  let index = 0;
  let cancelled = false;

  const runNext = () => {
    if (cancelled || index >= tasks.length) return;
    const task = tasks[index];
    index += 1;
    task();
    if (cancelled || index >= tasks.length) return;
    pending = scheduleIdleTask(runNext);
  };

  pending = scheduleIdleTask(runNext);

  return {
    cancel: () => {
      cancelled = true;
      pending?.cancel();
    },
  };
}
