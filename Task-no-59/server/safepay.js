export class SafepayError extends Error {}
// Request contract follows getsafepay/safepay-node's Payments and Checkout resources.
export function createSafepay({ publicKey, environment, appUrl, fetchImpl = fetch }) {
  if (!publicKey?.startsWith('sec_')) throw new SafepayError('Configure SAFEPAY_PUBLIC_KEY using the Public API Key starting with sec_.');
  const host = environment === 'sandbox' ? 'https://sandbox.api.getsafepay.com' : 'https://api.getsafepay.com';
  const checkoutHost = environment === 'sandbox' ? host : 'https://getsafepay.com';
  return async ({ amount, currency, orderId }) => {
    const response = await fetchImpl(`${host}/order/v1/init`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ amount, currency, client: publicKey, environment }),
    });
    let body;
    try { body = JSON.parse(await response.text()); } catch {
      throw new SafepayError('Safepay returned an empty or invalid response. Please try again.');
    }
    if (!response.ok || typeof body?.data?.token !== 'string' || !body.data.token) {
      throw new SafepayError(response.status === 401 || response.status === 403
        ? 'Safepay rejected the credentials. Check SAFEPAY_PUBLIC_KEY and its sandbox/production account.'
        : `Safepay rejected checkout (HTTP ${response.status}). Check the amount, currency and Safepay account settings.`);
    }
    const url = new URL('/checkout/pay', checkoutHost);
    url.search = new URLSearchParams({
      beacon: body.data.token, order_id: orderId, env: environment,
      cancel_url: `${appUrl}/?checkout=cancelled`, redirect_url: `${appUrl}/?checkout=success`,
      source: 'custom', webhooks: 'false',
    }).toString();
    return { id: body.data.token, url: url.href };
  };
}
