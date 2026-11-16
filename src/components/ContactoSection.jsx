"use client";

import { useState } from "react";
import { DEFAULT_CONTENT, buildWhatsAppTurnos } from "@/lib/contenido";

const motivos = [
  "Consulta clínica general / Especialidades",
  "Ortodoncia y ortodoncia infantil",
  "Implantes y prótesis",
  "Alineadores invisibles",
  "Blanqueamiento y estética",
  "Urgencia odontológica",
  "Otro motivo",
];

const soloDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

function IconoCampo({ tipo, className = "h-4 w-4" }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
  };

  if (tipo === "direccion") {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (tipo === "ubicacion") {
    return (
      <svg {...common}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (tipo === "reloj") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  if (tipo === "telefono") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (tipo === "escudo") {
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  if (tipo === "enviar") {
    return (
      <svg {...common}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
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

export default function ContactoSection({ contacto }) {
  const data = contacto ?? DEFAULT_CONTENT.contacto;

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/30";

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    motivo: motivos[0],
    mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setEnviado(false);
  };

  const enviar = (e) => {
    e.preventDefault();
    setEnviado(true);
    setForm({
      nombre: "",
      telefono: "",
      correo: "",
      motivo: motivos[0],
      mensaje: "",
    });
  };

  const mapaEmbed =
    data.mapa_url?.startsWith("http")
      ? data.mapa_url
      : `https://www.google.com/maps?q=${encodeURIComponent(
          data.direccion
        )}&output=embed`;
  const whatsappTurnos = buildWhatsAppTurnos(data);
  const telefonoGeneralDigitos = soloDigitos(data.telefono_turnos);
  const telefonoTurnosLink = telefonoGeneralDigitos ? `+54${telefonoGeneralDigitos}` : "";

  const datosSede = [
    {
      icono: "ubicacion",
      titulo: "Dirección",
      lineas: [data.direccion],
    },
    {
      icono: "reloj",
      titulo: "Horarios de Atención",
      lineas: [data.horario],
    },
    {
      icono: "telefono",
      titulo: "Recepción Telefónica",
      lineas: [data.telefono_turnos],
      href: telefonoTurnosLink ? `tel:${telefonoTurnosLink}` : undefined,
    },
  ];

  return (
    <section id="contacto" className="scroll-mt-20 bg-[#f5f8fb]">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        {/* Título de la sección */}
        <div className="reveal text-center" data-reveal>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Contacto
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-sky-800"
          />
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Envianos tu consulta sobre tratamientos, turnos o coberturas. Te
            respondemos a la brevedad.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* ==================== FORMULARIO ==================== */}
          <div className="reveal rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" data-reveal style={{ "--d": 1 }}>
            <form onSubmit={enviar} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contacto-nombre"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Nombre y Apellido
                  </label>
                  <input
                    id="contacto-nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={cambiar("nombre")}
                    placeholder="Ej: Marcela Benítez"
                    className={`mt-2 ${inputBase}`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contacto-telefono"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Teléfono / Celular
                  </label>
                  <input
                    id="contacto-telefono"
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={cambiar("telefono")}
                    placeholder="Ej: 2966 00-0000"
                    className={`mt-2 ${inputBase}`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contacto-correo"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Correo Electrónico
                </label>
                <input
                  id="contacto-correo"
                  type="email"
                  required
                  value={form.correo}
                  onChange={cambiar("correo")}
                  placeholder="ejemplo@correo.com"
                  className={`mt-2 ${inputBase}`}
                />
              </div>

              <div>
                <label
                  htmlFor="contacto-motivo"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Motivo de tu Consulta
                </label>
                <div className="relative mt-2">
                  <select
                    id="contacto-motivo"
                    value={form.motivo}
                    onChange={cambiar("motivo")}
                    className={`appearance-none pr-10 ${inputBase}`}
                  >
                    {motivos.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contacto-mensaje"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Mensaje
                </label>
                <textarea
                  id="contacto-mensaje"
                  rows={4}
                  required
                  value={form.mensaje}
                  onChange={cambiar("mensaje")}
                  placeholder="Contanos brevemente el motivo (sin datos clínicos detallados)..."
                  className={`mt-2 resize-y ${inputBase}`}
                />
              </div>

              {/* Aviso de privacidad */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <IconoCampo
                  tipo="escudo"
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                />
                <p className="text-xs leading-5 text-amber-800">
                  Por tu privacidad, evitá enviar información clínica detallada
                  (diagnósticos, estudios o medicación). Alcanzan tus datos de
                  contacto y el motivo general.
                </p>
              </div>

              {/* Confirmación visual */}
              {enviado && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      ¡Operación exitosa!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Recibimos tu consulta y te responderemos a la brevedad.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-900"
              >
                <IconoCampo tipo="enviar" className="h-4 w-4" />
                Enviar Consulta
              </button>
            </form>
          </div>

          {/* ==================== DATOS DEL SEDE + MAPA ==================== */}
          <div className="flex flex-col gap-5">
            <div className="reveal rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" data-reveal style={{ "--d": 1 }}>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Información de la Sede
              </h3>

              <ul className="mt-5 flex flex-col gap-4">
                {datosSede.map((dato) => {
                  const Contenido = (
                    <div className="flex items-start gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                        <IconoCampo tipo={dato.icono} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {dato.titulo}
                        </p>
                        {dato.lineas.map((linea) => (
                          <p
                            key={linea}
                            className="mt-0.5 text-sm leading-5 text-slate-600"
                          >
                            {linea}
                          </p>
                        ))}
                      </div>
                    </div>
                  );

                  return (
                    <li key={dato.titulo}>
                      {dato.href ? (
                        <a
                          href={dato.href}
                          className="inline-block transition-opacity hover:opacity-80"
                        >
                          {Contenido}
                        </a>
                      ) : (
                        Contenido
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Redes / canales de contacto */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href={data.instagram ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 text-white shadow-sm transition-transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                <a
                  href={data.facebook ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition-transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                <a
                  href={whatsappTurnos}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Mapa de la sede */}
            <div className="reveal overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" data-reveal style={{ "--d": 2 }}>
              <iframe
                title={`Ubicación del consultorio — ${data.direccion}`}
                src={mapaEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-56 w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
