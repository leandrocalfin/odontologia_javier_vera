import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabaseServer";
import Panel from "./panel";

export const metadata = {
  title: "Panel — Consultorio Javier Vera",
  robots: { index: false, follow: false },
};

const TABLAS = [
  "site_hero",
  "site_nosotros",
  "site_galeria",
  "site_especialistas",
  "site_tratamientos",
  "site_preguntas",
  "site_contacto",
];

export default async function AdminPage() {
  const { sb, user, isAdmin } = await getAdminUser().catch(() => ({
    sb: null,
    user: null,
    isAdmin: false,
  }));

  if (!user) redirect("/admin/login");
  if (!isAdmin) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-[420px] rounded-2xl border border-white/10 bg-sky-950 p-8 text-center shadow-xl">
          <h1 className="font-display text-[22px] font-bold text-white">Sin acceso</h1>
          <p className="mt-2 text-[13px] text-slate-300">
            Tu cuenta ({user?.email}) no es administradora del sitio.
          </p>
          <a href="/" className="mt-5 inline-block rounded-xl border border-sky-500/40 bg-sky-500/10 px-5 py-2.5 text-[13px] font-semibold text-sky-300 transition-colors hover:bg-sky-500/20">
            Volver al sitio
          </a>
        </div>
      </main>
    );
  }

  const resultados = await Promise.all([
    sb.from("site_hero").select("*").limit(1).maybeSingle(),
    sb.from("site_nosotros").select("*").limit(1).maybeSingle(),
    sb.from("site_galeria").select("*").order("orden", { ascending: true }),
    sb.from("site_especialistas").select("*").order("orden", { ascending: true }),
    sb.from("site_tratamientos").select("*").order("orden", { ascending: true }),
    sb.from("site_preguntas").select("*").order("orden", { ascending: true }),
    sb.from("site_contacto").select("*").limit(1).maybeSingle(),
  ]);

  // Misma tolerancia a fallos que en CRYBE: una tabla rota no debe verse
  // igual que una tabla vacía.
  const fallos = resultados
    .map((r, i) => (r.error ? { tabla: TABLAS[i], mensaje: r.error.message ?? r.error.code } : null))
    .filter(Boolean);
  if (fallos.length) {
    console.error(
      `[admin] ${fallos.length}/${resultados.length} consultas fallaron: ` +
        fallos.map((f) => `${f.tabla} -> ${f.mensaje}`).join(" | ")
    );
  }

  const [
    hero,
    nosotros,
    galeria,
    especialistas,
    tratamientos,
    preguntas,
    contacto,
  ] = resultados.map((r) => (Array.isArray(r.data) ? r.data : r.data));

  const contenido = {
    hero: hero ?? null,
    nosotros: nosotros ?? null,
    galeria: galeria ?? [],
    especialistas: especialistas ?? [],
    tratamientos: tratamientos ?? [],
    preguntas: preguntas ?? [],
    contacto: contacto ?? null,
  };

  return (
    <>
      {fallos.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-4">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200 sm:p-5">
            <h2 className="font-display text-[15px] font-bold text-amber-100">
              No se pudo cargar {fallos.length} de {resultados.length} secciones
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-amber-200/90">
              Verificá en Supabase que existan las tablas y que las policies
              permitan SELECT (las llaman <code className="rounded bg-amber-400/20 px-1.5 py-0.5">anon_read_*</code>):
            </p>
            <ul className="mt-2 space-y-0.5 text-[12px]">
              {fallos.map((f) => (
                <li key={f.tabla}>
                  <code className="rounded bg-amber-400/20 px-1.5 py-0.5">{f.tabla}</code>
                  <span className="text-amber-200/80"> {f.mensaje}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Panel contenido={contenido} email={user?.email} />
    </>
  );
}
