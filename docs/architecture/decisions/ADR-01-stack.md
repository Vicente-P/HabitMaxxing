# ADR-01 — Stack principal: Next.js + TypeScript

## Estado

Aceptado

---

## Contexto

El proyecto requiere una aplicación web full-stack con renderizado del lado del servidor (para SEO y performance), sistema de rutas, manejo de autenticación y conexión a base de datos. Se necesita un stack que permita aprender el ciclo de vida completo del software sin overhead de configuración excesivo.

---

## Decisión

Usar **Next.js 16 con App Router** como framework principal y **TypeScript** como lenguaje.

---

## Motivo

- **App Router** permite colocar Server Components, Route Handlers y páginas en la misma estructura, eliminando la separación artificial entre frontend y backend.
- **TypeScript** garantiza tipado end-to-end: desde los modelos de Prisma hasta los componentes de React, pasando por los schemas de Zod.
- **Next.js + Vercel** es la combinación con menor fricción para deploy: zero-config, preview deployments automáticos y edge functions.
- El ecosistema de Next.js tiene integración nativa con Auth.js, lo que simplifica EP-01.

---

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|------------|---------------------|
| **Remix** | Curva de aprendizaje más alta, ecosistema más pequeño, menos recursos de aprendizaje disponibles |
| **SvelteKit** | Lenguaje diferente (Svelte) que añade complejidad al aprendizaje en paralelo |
| **Nuxt (Vue)** | Mismo motivo que SvelteKit — Vue tiene menor adopción en el mercado laboral target |
| **Vite + React SPA** | Requiere backend separado, añade complejidad de infraestructura y no tiene SSR nativo |

---

## Consecuencias

✅ Tipado completo de extremo a extremo con TypeScript.  
✅ Deploy simplificado a Vercel sin configuración adicional.  
✅ Server Components reducen el JavaScript enviado al cliente.  
✅ Integración nativa con Auth.js y Prisma.  
⚠️ App Router tiene una curva de aprendizaje respecto al Pages Router anterior.  
⚠️ Next.js 16 es una versión relativamente nueva — algunos recursos de la comunidad aún referencian la API anterior.
