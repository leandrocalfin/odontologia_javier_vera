// Cliente Supabase de navegador (sesión de usuarios).
// Se usa en el cliente únicamente para detectar si hay sesión de administrador
// sin hacer las páginas dinámicas (el sitio público queda estático).
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser =
  url && anonKey ? createBrowserClient(url, anonKey) : null;
