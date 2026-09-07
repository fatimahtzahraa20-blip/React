export async function readPaymentResponse(response) {
  const body = await response.text();
  let result;
  try { result = JSON.parse(body); } catch {
    throw new Error('The payment server returned an empty or invalid response. Restart npm run dev and check the server terminal.');
  }
  if (!response.ok) throw new Error(result?.error || `Checkout failed (HTTP ${response.status}).`);
  if (typeof result?.url !== 'string' || !result.url.startsWith('https://')) {
    throw new Error('The payment server did not return a valid checkout link.');
  }
  return result;
}
