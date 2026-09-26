# Configuración del sitio personal de Manuel Matus

La identidad, el contenido y los servicios externos se mantienen separados de los componentes.

## Contenido público

Editar `src/config/site.config.ts` para modificar:

- identidad personal, retrato y enlaces sociales;
- razón social a cargo de los servicios y datos;
- correo y presentación del formulario;
- título, descripción e imagen social.

## Identidad visual

Editar `src/styles/tokens.css` para modificar colores, tipografías, radios y anchos generales. Los componentes deben consumir estas variables y no incorporar colores de marca nuevos directamente.

Activos:

- `public/favicon.svg`: icono del navegador;
- `public/og-image.png`: imagen para redes y mensajería;
- `public/og-image.svg`: fuente editable de la imagen social.

Las fuentes de cuerpo y títulos se distribuyen desde Fontsource y se empaquetan durante el build. No se consultan servidores de Google Fonts en producción.

## Medición consentida

La integración usa el contenedor `GTM-M9CZ2JMS` con Consent Mode básico. El navegador establece inicialmente `analytics_storage`, `ad_storage`, `ad_user_data` y `ad_personalization` como `denied`. Google Tag Manager no se descarga mientras la decisión sea desconocida o la analítica esté rechazada.

Cuando la persona acepta, sólo `analytics_storage` cambia a `granted` y el contenedor se carga una vez. Los tres estados publicitarios permanecen en `denied`. Al revocar una autorización, se actualiza el estado, se intentan eliminar las cookies `_ga` y `_ga_*` accesibles y se recarga la página para detener el contenedor cargado.

La preferencia se almacena en `localStorage` bajo la clave `mmdev.measurement-consent` con este esquema:

```json
{
  "version": 1,
  "analytics": "granted | denied",
  "updatedAt": "fecha ISO 8601",
  "expiresAt": "fecha ISO 8601"
}
```

La decisión caduca lógicamente después de 180 días. Un valor ausente, vencido, inválido o inaccesible se considera una decisión desconocida: no se carga GTM y se vuelve a mostrar la interfaz.

Como respaldo de seguridad, una denegación crea la cookie first-party `mmdev_analytics_consent_denied=1` con `Path=/`, `SameSite=Lax`, `Secure` en HTTPS y una vigencia máxima de 180 días. Es una preferencia técnica necesaria, no una cookie analítica o publicitaria, y no contiene identificadores ni datos personales.

El tombstone tiene precedencia sobre cualquier `granted` anterior en `localStorage`. En cada carga se intenta reconciliar ese registro antiguo a `denied`. Una aceptación sólo se aplica después de verificar el registro `granted`, eliminar el tombstone y confirmar su ausencia. Si no puede conservarse la denegación en ninguno de los dos mecanismos, la sesión actual permanece denegada, no se recarga y la interfaz informa el error.

Las pestañas se sincronizan mediante el evento `storage` y, cuando está disponible, un `BroadcastChannel` llamado `mmdev-measurement-consent`. Los mensajes contienen exclusivamente la versión del esquema y la decisión. Los receptores vuelven a validar su almacenamiento y el tombstone; no reemiten mensajes recibidos, con lo que se evitan ecos y ciclos de recarga.

El botón del pie usa el atributo `data-open-privacy-preferences`. Otros componentes pueden reabrir la interfaz mediante la API `window.mmdevMeasurement.openPreferences()` o emitiendo el evento `mmdev:privacy-preferences:open` sobre `document`.

`openPreferences()` conserva una solicitud prematura hasta que el componente visual registra su listener. La página 404 muestra la interfaz cuando no existe una decisión válida, pero no incorpora footer: una decisión ya guardada debe cambiarse desde una página que incluya el botón del pie.

La propiedad de Google Analytics 4 debe configurarse externamente como una etiqueta Google dentro del contenedor. Su ID de medición no debe insertarse directamente en el repositorio, el layout ni las páginas.

### Content Security Policy

`public/_headers` autoriza únicamente los orígenes de producción necesarios:

- scripts desde `https://www.googletagmanager.com`;
- conexiones a `www.googletagmanager.com`, `www.google-analytics.com`, sus subdominios y `analytics.google.com` con sus subdominios;
- imágenes desde `www.googletagmanager.com`, `www.google-analytics.com` y sus subdominios.

No se autorizan dominios de Google Ads, DoubleClick ni Tag Assistant. La implementación tampoco incluye el iframe `noscript` de GTM.

### Prueba manual

1. Borrar la clave `mmdev.measurement-consent` y las cookies `_ga` existentes.
2. Recargar y verificar que aparece la interfaz y no hay solicitudes a `googletagmanager.com` ni `google-analytics.com`.
3. Rechazar, recargar y confirmar que GTM sigue sin descargarse.
4. Reabrir desde **Configurar cookies**, aceptar y confirmar que se solicita una sola vez `gtm.js?id=GTM-M9CZ2JMS`.
5. Verificar en el estado de consentimiento que sólo `analytics_storage` está en `granted`.
6. Reabrir, rechazar y comprobar la eliminación de cookies accesibles y la recarga de la página.
7. Confirmar después de la recarga que no se vuelve a solicitar GTM.
8. Abrir una segunda pestaña y comprobar la propagación de aceptación y rechazo.
9. Probar los controles con teclado y lector de pantalla.

La etiqueta GA4 se configuró y validó dentro de GTM. Mantener esa configuración externa; no duplicar la medición directamente en el sitio.

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
Nombre, correo, mensaje y autorización para responder son obligatorios; teléfono es opcional. Ejecutar `npm run verify:contact` para verificar el contrato entre el formulario y el endpoint. Los enlaces sociales sin URL se ocultan hasta que se configuren; `portrait` muestra las iniciales hasta añadir una foto real.

## Validación

```bash
npm ci
npm run validate
```
