# Configuración del sitio MM Dev

La identidad, el contenido y los servicios externos se mantienen separados de los componentes.

## Contenido público

Editar `src/config/site.config.ts` para modificar:

- nombre y razón social;
- navegación;
- presentación principal;
- capacidades;
- método de trabajo;
- principios empresariales;
- correo y opciones del formulario;
- título, descripción e imagen social.

## Identidad visual

Editar `src/styles/tokens.css` para modificar colores, tipografías, radios y anchos generales. Los componentes deben consumir estas variables y no incorporar colores de marca nuevos directamente.

Activos:

- `public/brand/mark.svg`: símbolo principal;
- `public/favicon.svg`: icono del navegador;
- `public/og-image.png`: imagen para redes y mensajería;
- `public/og-image.svg`: fuente editable de la imagen social.

Las fuentes se distribuyen desde los paquetes Fontsource y se empaquetan durante el build. No se consultan servidores de Google Fonts en producción.

## Formulario

El frontend está en `src/components/Contact.astro` y el endpoint en `functions/api/contact.ts`.

Variables de Cloudflare Pages:

| Variable                    | Tipo              | Uso                                             |
| --------------------------- | ----------------- | ----------------------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Variable de build | Clave pública del widget Turnstile              |
| `TURNSTILE_SECRET_KEY`      | Secreto           | Validación server-side de Turnstile             |
| `RESEND_API_KEY`            | Secreto           | Envío transaccional mediante Resend             |
| `CONTACT_FROM_EMAIL`        | Variable          | Remitente perteneciente a un dominio verificado |
| `CONTACT_TO_EMAIL`          | Variable          | Destino; normalmente `contacto@mmdev.cl`        |

El formulario permanece deshabilitado si no existe la clave pública Turnstile. El endpoint rechaza envíos si faltan los secretos.

## Validación

```bash
npm ci
npm run validate
```
