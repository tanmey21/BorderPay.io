export function parseInvokeResponse(data) {
  if (typeof data !== "string") {
    return { fabricTxId: null, result: data };
  }

  const match = data.match(/Transaction ID :\s*(\S+)\s*Response:\s*(.*)/s);
  if (match) {
    return { fabricTxId: match[1], result: match[2].trim() };
  }

  return { fabricTxId: null, result: data };
}
