interface Env {
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
}

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  message: string;
  consent: string;
  website: string;
  'cf-turnstile-response': string;
}

interface TurnstileResult {
  success: boolean;
  action?: string;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

const readText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character] ?? character;
  });

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (origin && origin !== requestUrl.origin) {
    return json({ message: 'Origen de solicitud no permitido.' }, 403);
  }

  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return json({ message: 'Formato de solicitud no permitido.' }, 415);
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json<Record<string, unknown>>();
  } catch {
    return json({ message: 'La solicitud no contiene datos válidos.' }, 400);
  }

  const payload: ContactPayload = {
    name: readText(input.name, 100),
    email: readText(input.email, 160).toLowerCase(),
    company: readText(input.company, 120),
    phone: readText(input.phone, 40),
    service: readText(input.service, 100),
    message: readText(input.message, 3000),
    consent: readText(input.consent, 10),
    website: readText(input.website, 200),
    'cf-turnstile-response': readText(input['cf-turnstile-response'], 2048),
  };

  if (payload.website) {
    return json({
      message: 'Consulta enviada. Le responderemos a la brevedad.',
    });
  }

  if (
    payload.name.length < 2 ||
    !isEmail(payload.email) ||
    payload.company.length < 2 ||
    !payload.service ||
    payload.message.length < 20 ||
    payload.consent !== 'on'
  ) {
    return json(
      { message: 'Revise los campos obligatorios e inténtelo nuevamente.' },
      400,
    );
  }

  if (
    !env.TURNSTILE_SECRET_KEY ||
    !env.RESEND_API_KEY ||
    !env.CONTACT_FROM_EMAIL
  ) {
    return json(
      {
        message:
          'El formulario todavía no está disponible. Escriba a contacto@mmdev.cl.',
      },
      503,
    );
  }

  const turnstileBody = new FormData();
  turnstileBody.set('secret', env.TURNSTILE_SECRET_KEY);
  turnstileBody.set('response', payload['cf-turnstile-response']);
  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) turnstileBody.set('remoteip', remoteIp);

  const turnstileResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: turnstileBody },
  );
  const turnstile = await turnstileResponse.json<TurnstileResult>();

  if (
    !turnstile.success ||
    (turnstile.action && turnstile.action !== 'contact')
  ) {
    return json(
      {
        message:
          'No pudimos validar la protección antispam. Recargue e inténtelo nuevamente.',
      },
      400,
    );
  }

  const safe = {
    name: escapeHtml(payload.name),
    email: escapeHtml(payload.email),
    company: escapeHtml(payload.company),
    phone: escapeHtml(payload.phone || 'No informado'),
    service: escapeHtml(payload.service),
    message: escapeHtml(payload.message).replaceAll('\n', '<br />'),
  };

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL || 'contacto@mmdev.cl'],
      reply_to: payload.email,
      subject: `[mmdev.cl] ${payload.service} — ${payload.company}`,
      text: [
        `Nombre: ${payload.name}`,
        `Correo: ${payload.email}`,
        `Empresa: ${payload.company}`,
        `Teléfono: ${payload.phone || 'No informado'}`,
        `Área: ${payload.service}`,
        '',
        payload.message,
      ].join('\n'),
      html: `<h2>Nueva consulta desde mmdev.cl</h2>
        <p><strong>Nombre:</strong> ${safe.name}</p>
        <p><strong>Correo:</strong> ${safe.email}</p>
        <p><strong>Empresa:</strong> ${safe.company}</p>
        <p><strong>Teléfono:</strong> ${safe.phone}</p>
        <p><strong>Área:</strong> ${safe.service}</p>
        <hr />
        <p>${safe.message}</p>`,
    }),
  });

  if (!emailResponse.ok) {
    return json(
      {
        message:
          'No fue posible enviar la consulta. Escriba a contacto@mmdev.cl.',
      },
      502,
    );
  }

  return json({
    message: 'Consulta enviada correctamente. Le responderemos a la brevedad.',
  });
};

export const onRequestGet: PagesFunction<Env> = () =>
  json({ message: 'Método no permitido.' }, 405);
