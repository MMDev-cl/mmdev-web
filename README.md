# MM Dev Corporate Website

Sitio institucional de MM Dev, la línea tecnológica de Manuel Matus Development SpA.

## Stack

- Astro 7 y TypeScript estricto.
- Node.js 24 definido mediante `mise`.
- Fuentes IBM Plex Sans e Inter empaquetadas localmente.
- Sitemap, robots, metadata social y datos estructurados.
- Cloudflare Pages Functions para el formulario.
- Cloudflare Turnstile y Resend como frontera antispam/envío.

## Desarrollo

```bash
mise install
npm ci
npm run dev
```

Validación completa:

```bash
npm run validate
```

## Configuración

La configuración pública vive en `src/config/site.config.ts`; los colores y tipografías en `src/styles/tokens.css`. Consulte `docs/site-configuration.md` para el mapa completo y las variables del formulario.

No se deben almacenar claves, datos de formularios ni credenciales dentro del repositorio.
