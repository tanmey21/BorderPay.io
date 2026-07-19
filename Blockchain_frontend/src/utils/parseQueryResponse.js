export function parseQueryResponse(data) {
  const prefix = "Response: ";
  const payload =
    typeof data === "string" && data.startsWith(prefix)
      ? data.slice(prefix.length)
      : String(data ?? "");

  if (!payload.trim()) {
    return null;
  }

  return JSON.parse(payload);
}
