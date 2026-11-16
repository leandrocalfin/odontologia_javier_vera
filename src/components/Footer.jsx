import Image from "next/image";
import Link from "next/link";
import {
  DEFAULT_CONTENT,
  buildWhatsAppTurnos,
  buildWhatsAppUrgencias,
} from "@/lib/contenido";

const soloDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");
const mapasDestino = (direccion) => {
  if (!direccion) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    direccion
  )}`;
};
const telefonoLink = (numero) => {
  const d = soloDigitos(numero);
  return d ? `tel:+54${d}` : undefined;
};
const navegacion = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Tratamientos", href: "/#tratamientos" },
  { label: "Preguntas", href: "/#preguntas" },
];

const tratamientos = [
  "Ortodoncia con brackets",
  "Implantes dentales",
  "Alineadores invisibles",
  "Carillas dentales",
  "Rehabilitación Oral Integral",
];

function Icono({ path, className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {path}
    </svg>
  );
}

function LetrasGrandes() {
  const anio = new Date().getFullYear();
  return (
    <div className="pb-4 pt-3 text-center text-[11px] leading-5 text-slate-500 sm:pb-5 sm:text-xs">
      <ul className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 sm:gap-x-2.5">
        <li>
          © {anio} Consultorio Odontológico Javier Vera. Todos los derechos
          reservados.
        </li>
        <li aria-hidden="true">•</li>
        <li>
          <Link
            href="/aviso-legal"
            className="underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Aviso Legal
          </Link>
        </li>
        <li aria-hidden="true">•</li>
        <li>
          <Link
            href="/politica-de-privacidad"
            className="underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Política de Privacidad
          </Link>
        </li>
        <li aria-hidden="true">•</li>
        <li>
          <Link
            href="/politica-de-cookies"
            className="underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Política de Cookies
          </Link>
        </li>
        <li aria-hidden="true">•</li>
        <li>
          <Link
            href="/admin/login"
            className="underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Acceso admin
          </Link>
        </li>
      </ul>
      <p className="mt-2">
        Sitio desarrollado por{" "}
        <a
          href="https://www.leandrocalfin.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 transition-colors hover:text-white hover:underline"
        >
          Leandro Calfin
        </a>
      </p>
    </div>
  );
}

export default function Footer({ contacto }) {
  const data = contacto ?? DEFAULT_CONTENT.contacto;

  return (
    <footer className="w-full bg-sky-950 text-slate-300">
      {/* ============ MOBILE: footer compacto centrado ============ */}
      <div className="flex w-full flex-col items-center px-4 pb-4 pt-6 text-center sm:hidden">
        <Link
          href="/"
          aria-label="Consultorio Odontológico Javier Vera — Inicio"
          className="flex items-center justify-center rounded-2xl bg-white px-4 py-2"
        >
          <Image
            src="/logoPrincipal.png"
            alt="Consultorio Odontológico Javier Vera"
            width={375}
            height={557}
            className="h-10 w-auto"
          />
        </Link>
        <p className="mt-3 font-display text-xs font-bold uppercase leading-tight tracking-[0.2em] text-white">
          Consultorio Odontológico
        </p>
        <p className="mt-0.5 font-display text-[11px] font-semibold uppercase leading-tight tracking-[0.35em] text-sky-300">
          JAVIER VERA
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
          Atención dental integral para toda la familia, con tecnología,
          profesionales matriculados y un trato cercano y personalizado.
        </p>

      </div>

      {/* ============ DESKTOP/TABLET: footer completo 4 columnas ============ */}
      <div className="mx-auto hidden w-full max-w-7xl sm:block">
        <div className="grid gap-6 px-4 pt-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-8 lg:px-8">
          {/* Marca */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Consultorio Odontológico Javier Vera — Inicio"
            >
              <span className="flex items-center justify-center rounded-2xl bg-white px-3 py-1.5">
                <Image
                  src="/logoPrincipal.png"
                  alt="Consultorio Odontológico Javier Vera"
                  width={375}
                  height={557}
                  className="h-9 w-auto"
                />
              </span>
              <span className="flex flex-col font-display font-bold leading-tight text-white">
                <span className="text-sm tracking-tight sm:text-base">
                  Consultorio Odontológico
                </span>
                <span className="text-xs tracking-widest sm:text-sm">
                  JAVIER VERA
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Odontología integral para toda la familia en Río Gallegos.
              Prevención, estética y rehabilitación con profesionales
              matriculados.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={data.instagram ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-slate-300 transition-colors hover:text-white"
              >
                <Icono
                  path={
                    <>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </>
                  }
                />
              </a>
              <a
                href={data.facebook ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-slate-300 transition-colors hover:text-white"
              >
                <Icono
                  path={
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  }
                />
              </a>
              <a
                href={buildWhatsAppTurnos(data)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-slate-300 transition-colors hover:text-white"
              >
                <Icono
                  path={
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  }
                />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Enlaces del sitio">
            <h3>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
                Navegación
              </span>
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              {navegacion.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={mapasDestino(data.direccion)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Cómo llegar
                </a>
              </li>
            </ul>
          </nav>

          {/* Tratamientos */}
          <div>
            <h3>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
                Tratamientos
              </span>
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              {tratamientos.map((t) => (
                <li key={t}>
                  <Link
                    href="/#tratamientos"
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
                Contacto
              </span>
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-sm">
              <li className="flex gap-2.5">
                <Icono
                  className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
                  path={
                    <>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </>
                  }
                />
                <a
                  href={mapasDestino(data.direccion)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {data.direccion}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Icono
                  className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
                  path={
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  }
                />
                <a
                  href={telefonoLink(data.telefono_turnos)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {data.telefono_turnos}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Icono
                  className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
                  path={
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </>
                  }
                />
                <span className="text-slate-400">{data.horario}</span>
              </li>
              <li className="flex gap-2.5">
                <Icono
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  path={
                    <>
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </>
                  }
                />
                <a
                  href={buildWhatsAppUrgencias(data)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Urgencias 24 hs: {data.telefono_urgencias}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Línea inferior compartida */}
      <div className="mx-auto w-full max-w-7xl px-4">
        <div
          aria-hidden="true"
          className="mt-4 border-t border-white/10 sm:mt-6"
        />
        <LetrasGrandes />
      </div>
    </footer>
  );
}
