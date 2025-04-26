export function parseSafeJson<T>(data: string | T): T {
  try {
    if (typeof data !== 'string') {
      return data;
    }
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
