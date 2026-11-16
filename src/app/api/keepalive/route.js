import { NextResponse } from "next/server";
import { getSupabasePublic } from "@/lib/supabasePublic";

export const dynamic = "force-dynamic";

// GET /api/keepalive — consulta mínima real para que Supabase Free registre
// actividad y no pause el proyecto por inactividad (7 días).
// Lo llama el workflow programado de GitHub Actions (.github/workflows/keepalive.yml)
// con el header x-keepalive-secret.
// 200 = ok, 401 = secreto incorrecto, 500 = consulta falló (o no hay secreto).
export async function GET(request) {
  const secreto = process.env.KEEPALIVE_SECRET;
  if (!secreto) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (request.headers.get("x-keepalive-secret") !== secreto) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const sb = getSupabasePublic();
  if (!sb) return NextResponse.json({ ok: false }, { status: 500 });
  const { error } = await sb.from("site_hero").select("id").limit(1);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
