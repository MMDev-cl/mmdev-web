import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.ts';

const originalFetch = globalThis.fetch;
const sentEmails = [];
let turnstileSuccess = true;

globalThis.fetch = async (url, options) => {
  if (url.includes('/siteverify')) {
    return Response.json({ success: turnstileSuccess, action: 'contact' });
  }
  if (url.includes('api.resend.com')) {
    sentEmails.push(JSON.parse(options.body));
    return Response.json({ id: 'test-email' });
  }
  throw new Error(`Unexpected request: ${url}`);
};

const env = {
  TURNSTILE_SECRET_KEY: 'test-secret',
  RESEND_API_KEY: 'test-key',
  CONTACT_FROM_EMAIL: 'test@mmdev.cl',
};

const submit = (fields, overrideEnv = env) =>
  onRequestPost({
    request: new Request('https://mmdev.cl/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://mmdev.cl',
      },
      body: JSON.stringify({
        name: 'Manu',
        email: 'manu@example.com',
        message: 'Quiero conectar mi inventario con la tienda.',
        consent: 'on',
        'cf-turnstile-response': 'test-token',
        ...fields,
      }),
    }),
    env: overrideEnv,
  });

try {
  assert.equal((await submit({})).status, 200);
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].subject, '[mmdev.cl] Nueva consulta');
  assert.match(sentEmails[0].text, /Área: No especificado/);
  assert.doesNotMatch(sentEmails[0].text, /Empresa:/);

  assert.equal((await submit({ message: 'Muy breve' })).status, 400);
  assert.equal((await submit({ consent: '' })).status, 400);
  assert.equal(sentEmails.length, 1);

  turnstileSuccess = false;
  assert.equal((await submit({})).status, 400);
  turnstileSuccess = true;
  assert.equal(sentEmails.length, 1);

  assert.equal((await submit({}, {})).status, 503);
  assert.equal(sentEmails.length, 1);

  assert.equal(
    (await submit({ service: 'Integraciones', phone: '+56 9 1234 5678' }))
      .status,
    200,
  );
  assert.match(sentEmails[1].subject, /Integraciones/);
  assert.match(sentEmails[1].text, /Teléfono: \+56 9 1234 5678/);

  console.log(
    'Contact verification passed: optional fields, validation, Turnstile and email.',
  );
} finally {
  globalThis.fetch = originalFetch;
}
