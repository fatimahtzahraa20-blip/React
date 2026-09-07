let sequence = 0;
export function requestId() { return Date.now() + '-' + ++sequence; }
export async function apiRequest(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : { message: 'Empty response body' }; }
    catch { body = { error: 'Server returned a non-JSON response. Check that Express is running and /api is routed to it.', response: text.slice(0, 2000) }; }
    return { status: response.status, body, headers: Object.fromEntries(response.headers) };
  } catch (error) {
    return { status: 'Error', body: { error: error.name === 'AbortError' ? 'Request timed out. Check the API and retry.' : 'Unable to reach the API. Check the server and retry.' }, headers: {} };
  } finally { clearTimeout(timer); }
}

