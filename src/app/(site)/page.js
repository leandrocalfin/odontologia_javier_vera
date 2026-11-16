import Link from "next/link";
import Image from "next/image";
import {
  getContenido,
  buildWhatsAppTurnos,
} from "@/lib/contenido";
import FaqSection from "@/components/FaqSection";
import ContactoSection from "@/components/ContactoSection";
import GaleriaNosotros from "@/components/GaleriaNosotros";
import ObrasSocialesCarrusel from "@/components/ObrasSocialesCarrusel";
import QuienesSomosTexto from "@/components/QuienesSomosTexto";

// La página pública se sirve estática y se revalida como máximo una vez al
// día; el panel de administración la invalida al instante al guardar cambios.
export const revalidate = 86400;

const pasosAtencion = [
  {
    paso: "01",
    titulo: "Escribinos a WhatsApp",
    descripcion:
      "Iniciá la conversación con nuestra línea oficial asignada en Río Gallegos desde cualquier dispositivo.",
    nota: "Respuesta dentro del horario clínico",
    icono: "chat",
    colorIcono: "bg-emerald-100 text-emerald-600",
    colorNota: "text-sky-700",
  },
  {
    paso: "02",
    titulo: "Detallá tu motivo",
    descripcion:
      "Compartí tu consulta (urgencia, chequeo general, ortodoncia, rehabilitación oral completo) junto con tu cobertura u obra social.",
    nota: "Información protegida y confidencial",
    icono: "detalle",
    colorIcono: "bg-sky-100 text-sky-600",
    colorNota: "text-red-600",
  },
  {
    paso: "03",
    titulo: "Coordinamos tu turno",
    descripcion:
      "Coordinamos el día y horario que mejor se adapte a tu disponibilidad para que puedas asistir a tu consulta.",
    nota: "Confirmación inmediata con especialista",
    icono: "calendario",
    colorIcono: "bg-emerald-100 text-emerald-600",
    colorNota: "text-emerald-600",
  },
];

function IconoPaso({ tipo, className = "h-6 w-6" }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  if (tipo === "chat") {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }

  if (tipo === "detalle") {
    return (
      <svg {...common}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 11h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconoNota({ tipo, className = "h-4 w-4" }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  if (tipo === "chat") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    );
  }

  if (tipo === "detalle") {
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

function ToothIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5c-2.1 0-2.9 1.3-4.8 1.3-1.6 0-3.2 1.2-3.2 3.3 0 3.4 1.9 4.7 2.6 8.9.3 1.9 1 4.1 2.9 4.1 1.6 0 1.7-2 2.1-4.1.2-1.2 1.1-1.9 2.4-1.9s2.2.7 2.4 1.9c.4 2.1.5 4.1 2.1 4.1 1.9 0 2.6-2.2 2.9-4.1.7-4.2 2.6-5.5 2.6-8.9 0-2.1-1.6-3.3-3.2-3.3-1.9 0-2.7-1.3-4.8-1.3Z" />
    </svg>
  );
}

function TarjetaProfesional({ persona, director = false }) {
  return (
    <div className="group text-center">
      {persona.foto ? (
        <Image
          src={persona.foto}
          alt={persona.nombre}
          width={director ? 224 : 176}
          height={director ? 224 : 176}
          className={`mx-auto rounded-full object-cover object-[center_18%] ring-4 ring-sky-100 transition-all duration-300 ease-out group-hover:scale-105 group-hover:ring-sky-800 group-hover:shadow-xl group-hover:shadow-sky-900/20 ${
            director
              ? "h-28 w-28 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
              : "h-20 w-20 sm:h-40 sm:w-40 lg:h-44 lg:w-44"
          }`}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`mx-auto flex items-center justify-center rounded-full bg-sky-950 font-display font-bold tracking-wide text-white ring-4 ring-sky-100 transition-all duration-300 ease-out group-hover:scale-105 group-hover:ring-sky-800 group-hover:shadow-xl group-hover:shadow-sky-900/20 ${
            director
              ? "h-24 w-24 text-xl sm:h-48 sm:w-48 sm:text-4xl lg:h-56 lg:w-56"
              : "h-16 w-16 text-base sm:h-40 sm:w-40 sm:text-3xl lg:h-44 lg:w-44"
          }`}
        >
          {persona.iniciales}
        </div>
      )}
      <h3 className="mt-2 font-display text-xs font-bold leading-tight text-slate-900 sm:mt-5 sm:text-xl lg:text-2xl">
        {persona.nombre}
      </h3>
      <p className="mt-0.5 text-[10px] font-medium leading-4 text-sky-800 sm:mt-1 sm:text-base lg:text-lg">
        {persona.matricula}
      </p>
    </div>
  );
}

export default async function Home() {
  const {
    hero,
    nosotros,
    galeria,
    especialistas,
    tratamientos,
    preguntas,
    contacto,
  } = await getContenido();
  const waTurnos = buildWhatsAppTurnos(contacto);
  const equipo = especialistas.map((e) => ({
    nombre: e.nombre,
    matricula: e.matricula,
    foto: e.foto_url,
    iniciales: e.nombre
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }));
  return (
    <main className="flex flex-1 flex-col bg-white">
      {/* Hero: imagen full-bleed a pantalla completa, tocando el navbar */}
      {hero && (
      <section className="relative min-h-[480px] w-full flex-1 overflow-hidden bg-sky-950">
        {/* Imagen de fondo full-bleed */}
        <Image
          src={hero.image_url}
          alt="Consultorio odontológico Javier Vera"
          fill
          sizes="100vw"
          className="reveal object-cover object-[center_30%]"
          priority
          data-reveal
          style={{ "--d": 0 }}
        />
        {/* Degradado azul desde la izquierda para legibilidad del texto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-950/95 via-sky-950/60 to-transparent"
        />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Texto sobre la imagen, mitad izquierda */}
          <div className="flex max-w-xl flex-col justify-end pt-28 pb-20 sm:pb-16 lg:pb-24">
            <div className="reveal max-w-lg" data-reveal style={{ "--d": 2 }}>
              <span className="inline-flex w-fit items-center rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-3.5 w-3.5 animate-blink text-red-500"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Rio Gallegos, Santa Cruz
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.65)] sm:text-5xl lg:text-6xl">
                {hero.titulo}
              </h1>
              <p className="mt-2 font-display text-xl font-bold text-sky-300 [text-shadow:0_2px_6px_rgba(0,0,0,0.65)] sm:text-2xl">
                {hero.subtitulo}
              </p>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-100 [text-shadow:0_2px_6px_rgba(0,0,0,0.65)] sm:text-lg">
                {hero.descripcion}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <a
                  href={waTurnos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-sky-950 shadow-sm transition-colors hover:bg-sky-50"
                >
                  Solicitar turno
                </a>
                <Link
                  href="/#tratamientos"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-transparent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Ver tratamientos
                </Link>
              </div>
            </div>
          </div>
        </div>

      </section>
      )}

      {/* ==================== CÓMO SOLICITAR ATENCIÓN ==================== */}
      <section className="bg-[#f5f8fb]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          {/* Título de la sección */}
          <div className="text-center reveal" data-reveal>
            <p className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-sky-700">
              Gestión rápida &amp; transparente
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Como solicitar un turno
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Reservá tu consulta fácilmente, sin llamadas telefónicas y
              directamente con nuestro equipo de secretaría.
            </p>
          </div>

          {/* Pasos en 3 cards: mobile apiladas compactas (filas), desktop 2 por fila y la 3ra centrada */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:max-w-4xl sm:grid-cols-2 sm:gap-5 lg:max-w-7xl lg:grid-cols-3">
            {pasosAtencion.map((paso, i) => (
              <article
                key={paso.paso}
                data-reveal
                style={{ "--d": i }}
                className={`reveal relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg sm:rounded-3xl ${
                  i === 2
                    ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-10px)] lg:col-span-1 lg:max-w-none lg:mx-0"
                    : ""
                }`}
              >
                {/* MOBILE: fila horizontal compacta */}
                <div className="flex flex-row items-center gap-3 p-3 sm:hidden">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${paso.colorIcono}`}
                  >
                    <IconoPaso tipo={paso.icono} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold leading-tight text-slate-900">
                      <span className="mr-1.5 select-none text-slate-300">{paso.paso}.</span>
                      {paso.titulo}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {paso.descripcion}
                    </p>
                    <p
                      className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold leading-4 ${paso.colorNota}`}
                    >
                      <IconoNota tipo={paso.icono} />
                      {paso.nota}
                    </p>
                  </div>
                </div>

                {/* DESKTOP/TABLET: tarjeta completa */}
                <div className="hidden p-5 sm:flex sm:flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${paso.colorIcono}`}
                    >
                      <IconoPaso tipo={paso.icono} className="h-5 w-5" />
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-display text-3xl font-extrabold leading-none text-slate-200"
                    >
                      {paso.paso}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
                    {paso.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {paso.descripcion}
                  </p>
                  <p
                    className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold ${paso.colorNota}`}
                  >
                    <IconoNota tipo={paso.icono} />
                    {paso.nota}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* CTA debajo de las 3 cards */}
          <div className="reveal mt-8 flex w-full flex-col items-center gap-4 rounded-2xl bg-sky-950 px-4 py-4 text-center sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5 sm:text-left" data-reveal>
            <div>
              <h2 className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
                ¿Agendamos tu consulta?
              </h2>
              <p className="mt-1 max-w-md text-xs leading-5 text-sky-100 sm:text-sm sm:leading-5">
                {contacto.horario}
              </p>
            </div>
            <a
              href={waTurnos}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5b] sm:w-auto sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ==================== NOSOTROS ==================== */}
      <section
        id="nosotros"
        className="scroll-mt-20 w-full bg-white"
      >
        <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* Título de la sección, centrado */}
        <div className="reveal text-center" data-reveal>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Nosotros
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-sky-800"
          />
        </div>

        {/* Quiénes somos */}
        {(galeria.length > 0 || nosotros) && (
          <div className={`mt-10 grid items-start gap-10 lg:mt-12 ${galeria.length > 0 && nosotros ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
            {/* Imagen de la sección Nosotros */}
            {galeria.length > 0 && (
              <div className="reveal" data-reveal>
                <GaleriaNosotros items={galeria} />
              </div>
            )}
            {nosotros && (
              <div className="reveal" data-reveal style={{ "--d": 1 }}>
                <QuienesSomosTexto descripcion={nosotros.descripcion} />
              </div>
            )}
          </div>
        )}

        </div>

        {/* Obras sociales y prepagas, carrusel en movimiento continuo (fondo azul ancho completo) */}
        <ObrasSocialesCarrusel />
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">

        {/* Equipo médico */}
        {equipo.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <div className="reveal text-center" data-reveal>
            <h3>
              <span className="font-sans text-lg font-semibold uppercase tracking-[0.15em] text-sky-800 sm:text-xl lg:text-2xl">
                Nuestro equipo
              </span>
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
              Profesionales matriculados, en constante capacitación y con un
              único objetivo: tu sonrisa.
            </p>
          </div>
          <div className="mt-10">
            {equipo.length === 0 ? null : equipo.length === 3 ? (
              /* Trío en fila: Lucas (izquierda), Javier (centro, más grande), Gianna (derecha) */
              <div className="mx-auto grid w-full max-w-4xl grid-cols-3 items-center gap-2 sm:gap-4 lg:gap-6">
                <div className="reveal order-2" data-reveal style={{ "--d": 1 }}>
                  <TarjetaProfesional persona={equipo[0]} director />
                </div>
                <div className="reveal order-1" data-reveal style={{ "--d": 2 }}>
                  <TarjetaProfesional persona={equipo[1]} />
                </div>
                <div className="reveal order-3" data-reveal style={{ "--d": 3 }}>
                  <TarjetaProfesional persona={equipo[2]} />
                </div>
              </div>
            ) : (
              /* Cualquier otra cantidad: fila centrada y pareja (sin huecos ni undefined) */
              <div className="mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                {equipo.map((p, i) => (
                  <div key={i} className="reveal" data-reveal style={{ "--d": i + 1 }}>
                    <TarjetaProfesional persona={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
        </div>

      </section>

      {/* ==================== TRATAMIENTOS ==================== */}
      {tratamientos.length > 0 && (
      <section
        id="tratamientos"
        className="scroll-mt-20 bg-[#f5f8fb]"
      >
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
          <div className="reveal text-center" data-reveal>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tratamientos
            </h2>
            <div
              aria-hidden="true"
              className="mx-auto mt-4 h-1 w-16 rounded-full bg-sky-800"
            />
            <h3 className="mt-5">
              <span className="font-sans text-lg font-semibold uppercase tracking-[0.15em] text-sky-800 sm:text-xl lg:text-2xl">
                Nuestros Servicios
              </span>
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
              Tres profesionales, una única sonrisa: el tratamiento indicado
              por especialistas matriculados, con tecnología y trato cercano.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {tratamientos.map((t, i) => (
              <article
                key={`${t.nombre}-${t.orden}`}
                data-reveal
                style={{ "--d": i % 3 }}
                className={`reveal group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl sm:rounded-3xl ${
                  i === 8 ? "col-span-2 mx-auto w-full max-w-[calc(50%-6px)] lg:col-span-1 lg:max-w-none" : ""
                }`}
              >
                <div className="relative h-28 w-full overflow-hidden sm:h-44 lg:h-48">
                  <Image
                    src={t.imagen_url}
                    alt={t.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative z-10 -mt-5 flex justify-center sm:-mt-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950 text-white shadow-lg ring-4 ring-white sm:h-14 sm:w-14 sm:rounded-2xl">
                    <ToothIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col items-center pb-4 pt-3 text-center sm:pb-6 sm:pt-4">
                  <h3 className="font-display text-xs font-bold leading-tight text-slate-900 sm:text-lg">
                    {t.nombre}
                  </h3>
                  <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">
                    {t.descripcion}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ==================== PREGUNTAS FRECUENTES ==================== */}
      {preguntas.length > 0 && <FaqSection preguntas={preguntas} />}

      {/* ==================== CONTACTO ==================== */}
      <ContactoSection contacto={contacto} />
    </main>
  );
}
