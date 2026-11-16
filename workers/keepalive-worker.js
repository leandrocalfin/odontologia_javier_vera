// Worker aparte para el keep-alive de Supabase Free.
// No es el sitio: es un Worker independiente en Cloudflare.
// Cómo usarlo (2 min, sin código local):
//  1. Cloudflare Dashboard > Workers & Pages > Create > Create Worker
//     > pegá este archivo > Deploy.
//  2. Settings > Variables:
//     - SITE_URL = https://tu-dominio-testing.com (sin barra final).
//     - KEEPALIVE_SECRET = un valor largo aleatorio (marcar como Secret).
//     El mismo valor va como variable KEEPALIVE_SECRET en el hosting del
//     sitio (donde está corriendo Next.js). Nunca en el código ni en wrangler.jsonc.
//  3. Triggers > Cron Triggers > Add Cron > "0 8 */2 * *" (cada 2 días).
// Hace un GET a /api/keepalive, que ejecuta una query real en Supabase
// y cuenta como actividad (evita la pausa a los 7 días sin uso).
// Si la respuesta no es ok, lanza error para que quede visible
// en los logs del cron (Requests > Logs).
export default {
  async scheduled(event, env, ctx) {
    const res = await fetch(env.SITE_URL + "/api/keepalive", {
      method: "GET",
      headers: { "x-keepalive-secret": env.KEEPALIVE_SECRET ?? "" },
    });
    if (!res.ok) throw new Error(`keepalive falló: HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.ok) throw new Error("keepalive falló: ok:false");
  },
};
