// Proxy (antes "middleware" en Next ≤15): primera capa para el área admin.
// Refresca la cookie de sesión para que el token no expire en silencio, y
// redirige a /admin/login a quien no tiene sesión al entrar a /admin/*.
// La verificación REAL de administrador sigue en cada página del panel y en
// cada Server Action (getAdminUser()). El sitio público no pasa por aquí
// (matcher limitado a /admin), así sigue siendo estático.
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = { matcher: ["/admin/:path*"] };
