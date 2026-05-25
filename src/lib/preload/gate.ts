// @ts-nocheck
/**
 * Lightweight pub-sub task tracker for preloader essentials.
 *
 * Each task contributes a weighted slice of overall progress (0..1). The gate
 * exposes a single combined `progress` plus `essentialsReady` (all tasks settled).
 * Subscribers receive a snapshot whenever progress / readiness changes.
 *
 * Tasks settle as `done` or `error`; both count toward "ready" so a failed asset
 * never blocks the Enter button. Failures are surfaced via the `errors` array on
 * the snapshot for callers that want to react.
 */

type TaskStatus = "pending" | "done" | "error";

type TaskRecord = {
  id: string;
  label?: string;
  weight: number;
  status: TaskStatus;
  progress: number;
  error?: unknown;
};

export type PreloaderGateSnapshot = {
  progress: number;
  essentialsReady: boolean;
  pendingCount: number;
  totalCount: number;
  errors: { id: string; error: unknown }[];
};

export type PreloaderTaskHandle = {
  id: string;
  complete: () => void;
  fail: (error?: unknown) => void;
  setProgress: (value: number) => void;
};

const tasks = new Map<string, TaskRecord>();
const listeners = new Set<(snapshot: PreloaderGateSnapshot) => void>();
let lastSnapshot: PreloaderGateSnapshot = {
  progress: 0,
  essentialsReady: true, // becomes false as soon as the first pending task is registered
  pendingCount: 0,
  totalCount: 0,
  errors: [],
};

function clamp01(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function computeSnapshot(): PreloaderGateSnapshot {
  let totalWeight = 0;
  let weightedProgress = 0;
  let pending = 0;
  const errors: PreloaderGateSnapshot["errors"] = [];

  for (const task of tasks.values()) {
    totalWeight += task.weight;
    if (task.status === "pending") {
      pending += 1;
      weightedProgress += task.progress * task.weight;
    } else {
      weightedProgress += task.weight;
      if (task.status === "error") {
        errors.push({ id: task.id, error: task.error });
      }
    }
  }

  const progress = totalWeight > 0 ? weightedProgress / totalWeight : 1;
  return {
    progress: totalWeight > 0 ? clamp01(progress) : 1,
    essentialsReady: pending === 0,
    pendingCount: pending,
    totalCount: tasks.size,
    errors,
  };
}

function emit() {
  lastSnapshot = computeSnapshot();
  for (const listener of listeners) {
    try {
      listener(lastSnapshot);
    } catch (error) {
      // Listeners must not break the pipeline.
      // eslint-disable-next-line no-console
      console.error("[preloaderGate] listener threw", error);
    }
  }
}

export function registerTask({
  id,
  label,
  weight = 1,
}: {
  id: string;
  label?: string;
  weight?: number;
}): PreloaderTaskHandle {
  const existing = tasks.get(id);
  if (existing) {
    return makeHandle(existing);
  }

  const record: TaskRecord = {
    id,
    label,
    weight: weight > 0 ? weight : 1,
    status: "pending",
    progress: 0,
  };
  tasks.set(id, record);
  emit();
  return makeHandle(record);
}

function makeHandle(record: TaskRecord): PreloaderTaskHandle {
  return {
    id: record.id,
    complete: () => {
      if (record.status !== "pending") return;
      record.status = "done";
      record.progress = 1;
      emit();
    },
    fail: (error) => {
      if (record.status !== "pending") return;
      record.status = "error";
      record.progress = 1;
      record.error = error;
      emit();
    },
    setProgress: (value) => {
      if (record.status !== "pending") return;
      const next = clamp01(value);
      if (next === record.progress) return;
      record.progress = next;
      emit();
    },
  };
}

/** Track a Promise as a single gate task. Resolves/rejects are forwarded to the gate. */
export function trackPromise<T>(
  id: string,
  promise: Promise<T>,
  options: { label?: string; weight?: number } = {},
): Promise<T> {
  const handle = registerTask({ id, label: options.label, weight: options.weight });
  return promise.then(
    (value) => {
      handle.complete();
      return value;
    },
    (error) => {
      handle.fail(error);
      throw error;
    },
  );
}

export function getSnapshot(): PreloaderGateSnapshot {
  return lastSnapshot;
}

export function subscribe(listener: (snapshot: PreloaderGateSnapshot) => void) {
  listeners.add(listener);
  // Send the current snapshot synchronously so consumers can initialise state.
  listener(lastSnapshot);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: reset the gate. Not used in production code paths. */
export function __resetPreloaderGate() {
  tasks.clear();
  lastSnapshot = {
    progress: 0,
    essentialsReady: true,
    pendingCount: 0,
    totalCount: 0,
    errors: [],
  };
  emit();
}
