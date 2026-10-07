/**
 * Fetch a form's live HTML from Current, at build time.
 *
 * The site build FAILS if this cannot return a form (Edward, 2026-10-07): the
 * deploy stops with a clear message and the live site keeps its last good
 * version. A stale or missing form is worse than a failed deploy, because a
 * failed deploy is noticed.
 *
 * What comes back is checked before it is used: it must be an HTML form that
 * posts to Current for THIS key. A captive portal, an error page or another
 * form's markup must never end up on a practice's website.
 */
export const DEFAULT_BASE = 'https://forms.surfpacific.com';
export const KEY_SHAPE = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * @param {string} key the form's key, as shown in Current
 * @param {{base?: string, fetch?: typeof fetch, timeoutMs?: number}} [opts]
 * @returns {Promise<{html: string, version: string|null}>}
 */
export async function fetchForm(key, { base = DEFAULT_BASE, fetch: fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  if (!KEY_SHAPE.test(String(key ?? ''))) {
    throw new Error(`<CurrentForm>: "${key}" is not a form key. Copy the key from the form's page in Current.`);
  }
  const url = `${base.replace(/\/+$/, '')}/api/forms/${encodeURIComponent(key)}/html`;
  let res;
  try {
    res = await fetchImpl(url, { headers: { accept: 'text/html' }, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw new Error(`<CurrentForm key="${key}">: could not reach Current (${err.message}). The build stops so the live site keeps its last good version — try the deploy again.`);
  }
  if (res.status === 404) {
    throw new Error(`<CurrentForm key="${key}">: Current has no live form with this key. Check the key on the form's page in Current.`);
  }
  if (!res.ok) {
    throw new Error(`<CurrentForm key="${key}">: Current answered ${res.status}. The build stops so the live site keeps its last good version — try the deploy again.`);
  }
  const type = res.headers.get('content-type') ?? '';
  const html = await res.text();
  const action = `action="${base.replace(/\/+$/, '')}/f/${key}"`;
  if (!type.includes('text/html') || !/^\s*<form[\s>]/i.test(html) || !html.includes(action)) {
    throw new Error(`<CurrentForm key="${key}">: what came back is not this form's HTML, so it was not put on the page.`);
  }
  return { html, version: res.headers.get('x-pulse-form-version') };
}
