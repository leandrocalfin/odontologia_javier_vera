// Cliente Supabase público: SIN cookies (no usa next/headers). Obligatorio
// para leer el contenido del sitio desde unstable_cache (los datos de
// contacto/portada son públicos y estáticos) y para que el sitio quede
// cacheado/ISR en vez de dinámico por visita.
// Si faltan las variables de entorno, devuelve null y el sitio cae al
// respaldo mínimo de contenido.js.
import { createClient } from "@supabase/supabase-js";

let cliente = null;

export function getSupabasePublic() {
  if (cliente) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  cliente = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}
