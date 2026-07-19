const RUNBOOK_PREFIX = "borderpay_runbook_";

export function getRunBookLogs(userId) {
  if (!userId) return [];
  try {
    const raw = window.localStorage.getItem(`${RUNBOOK_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendRunBookLog(userId, entry) {
  if (!userId) return;
  const logs = getRunBookLogs(userId);
  logs.unshift({
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recordedAt: new Date().toISOString(),
    ...entry,
  });
  window.localStorage.setItem(
    `${RUNBOOK_PREFIX}${userId}`,
    JSON.stringify(logs.slice(0, 200))
  );
}
