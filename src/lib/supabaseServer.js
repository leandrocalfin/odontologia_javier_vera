import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Llamado desde un Server Component: lo aplica el middleware.
        }
      },
    },
  });
}

export async function getAdminUser() {
  const sb = await getSupabaseServer();
  if (!sb) return { sb: null, user: null, isAdmin: false };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { sb, user: null, isAdmin: false };

  // Solo el RPC: authenticated no depende de ningún grant sobre la tabla
  // admins y no hay consulta redundante antes de la verificación real.
  const { data, error } = await sb.rpc("is_admin");
  if (error) {
    console.error(`[admin] is_admin() falló: ${error.code} ${error.message}`);
    return { sb, user, isAdmin: false };
  }
  return { sb, user, isAdmin: data === true };
}
