"use client";

import { useState } from "react";
import { guardarContacto } from "./actions";

const CAMPOS = [
  { nombre: "direccion", etiqueta: "Dirección", placeholder: "Emilia Rodiño de Clark 795...", max: 255 },
  { nombre: "mapa_url", etiqueta: "URL del mapa (iframe embed de Google Maps)", placeholder: "https://www.google.com/maps?...", max: 500 },
  { nombre: "horario", etiqueta: "Horario de atención", placeholder: "Lunes a sábados de 08:00 a 20:00 hs", max: 100 },
  { nombre: "telefono_turnos", etiqueta: "Teléfono de turnos (recepción)", placeholder: "2966-449813", max: 30 },
  { nombre: "telefono_urgencias", etiqueta: "Teléfono de urgencias 24 hs", placeholder: "2966-234055", max: 30 },
  { nombre: "email", etiqueta: "Email público (opcional)", placeholder: "consultorio@exemplo.com", max: 160 },
  { nombre: "instagram", etiqueta: "Instagram (URL https://...)", placeholder: "https://www.instagram.com/...", max: 500 },
  { nombre: "facebook", etiqueta: "Facebook (URL)", placeholder: "https://www.facebook.com/...", max: 500 },
];

export default function DatosAdmin({ contacto, onSaved }) {
  const [form, setForm] = useState({
    direccion: contacto?.direccion ?? "",
    mapa_url: contacto?.mapa_url ?? "",
    horario: contacto?.horario ?? "",
    telefono_turnos: contacto?.telefono_turnos ?? "",
    telefono_urgencias: contacto?.telefono_urgencias ?? "",
    email: contacto?.email ?? "",
    instagram: contacto?.instagram ?? "",
    facebook: contacto?.facebook ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const onChange = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setError("");
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    const res = await guardarContacto(form);
    if (res?.ok === true) onSaved("Datos guardados");
    else setError(res?.error ?? "No se pudo guardar");
    setGuardando(false);
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <p className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2.5 text-[12px] leading-5 text-sky-200">
        Los datos de contacto se usan en el inicio, en el pie de página, en la sección Contacto y para los botones de WhatsApp del sitio.
      </p>
      {CAMPOS.map((c) => (
        <div key={c.nombre}>
          <label htmlFor={`datos-${c.nombre}`} className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {c.etiqueta}
          </label>
          <input
            id={`datos-${c.nombre}`}
            type="text"
            value={form[c.nombre]}
            onChange={onChange(c.nombre)}
            placeholder={c.placeholder}
            maxLength={c.max}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#082F49]/80 px-3 text-[13px] text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
      ))}
      {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={guardando}
        className="inline-flex h-10 w-fit items-center rounded-xl bg-sky-500 px-6 text-[13px] font-bold text-[#082F49] hover:bg-sky-400 disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar datos y redes"}
      </button>
    </form>
  );
}
