import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fetchForm } from '../fetch-form.js';

const KEY = 'hdf_enquiry_AbCd';
const FORM = `<form class="cf-form" method="post" action="https://forms.surfpacific.com/f/${KEY}"><input name="email"></form>`;
const reply = (status, body, type = 'text/html; charset=utf-8', version = '3') => async () => ({
  status, ok: status >= 200 && status < 300, text: async () => body,
  headers: { get: (h) => ({ 'content-type': type, 'x-pulse-form-version': version })[h.toLowerCase()] ?? null },
});

test('returns the form and its version', async () => {
  const r = await fetchForm(KEY, { fetch: reply(200, FORM) });
  assert.equal(r.html, FORM);
  assert.equal(r.version, '3');
});

test('asks the right address', async () => {
  let seen;
  await fetchForm(KEY, { fetch: async (url, init) => { seen = url; return reply(200, FORM)(url, init); } });
  assert.equal(seen, `https://forms.surfpacific.com/api/forms/${KEY}/html`);
});

test('a key that is not a key fails before any request', async () => {
  let called = false;
  await assert.rejects(fetchForm('../x', { fetch: async () => { called = true; } }), /not a form key/);
  assert.equal(called, false);
});

test('no live form: the build fails, saying so', async () => {
  await assert.rejects(fetchForm(KEY, { fetch: reply(404, '{}', 'application/json') }), /no live form with this key/);
});

test('Current unreachable or erroring: the build fails, and the live site keeps its last version', async () => {
  await assert.rejects(fetchForm(KEY, { fetch: async () => { throw new Error('ECONNREFUSED'); } }), /could not reach Current.*last good version/);
  await assert.rejects(fetchForm(KEY, { fetch: reply(503, 'busy') }), /answered 503/);
});

test('anything that is not THIS form never reaches the page', async () => {
  await assert.rejects(fetchForm(KEY, { fetch: reply(200, '<html>Sign in to the Wi-Fi</html>') }), /not this form's HTML/);
  await assert.rejects(fetchForm(KEY, { fetch: reply(200, FORM.replace(KEY, 'someone_else_1')) }), /not this form's HTML/);
  await assert.rejects(fetchForm(KEY, { fetch: reply(200, FORM, 'application/json') }), /not this form's HTML/);
});
