const VISITOR_KEY = "accord_vid";
const SESSION_KEY = "accord_sid";

function storedId(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  storage.setItem(key, created);
  return created;
}

export function visitorId() {
  try {
    return storedId(localStorage, VISITOR_KEY);
  } catch {
    return "";
  }
}

export function sessionId() {
  try {
    return storedId(sessionStorage, SESSION_KEY);
  } catch {
    return "";
  }
}

export function postShopEvent(path: string, body: Record<string, string | number | boolean>) {
  void fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify(body),
  }).catch(() => undefined);
}
