export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export const isDocumentId = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export async function request(path, options = {}, tenantId = 'demo-tenant') {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the document service. Check that the application server is running, then retry.');
  }
  let data;
  try { data = await response.json(); }
  catch {
    throw new Error('The document service is unavailable. Check the server terminal and Supabase configuration, then retry.');
  }
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
