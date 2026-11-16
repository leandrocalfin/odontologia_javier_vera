"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  guardarEspecialista,
  eliminarEspecialista,
  reordenarEspecialista,
  cambiarVisibleEspecialista,
} from "./actions";

export default function EquipoAdmin({ especialistas, onSaved }) {
  const [form, setForm] = useState({ id: null, nombre: "", matricula: "" });
  const [fotoFile, setFotoFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const fotoPreview = useMemo(() => (fotoFile ? URL.createObjectURL(fotoFile) : null), [fotoFile]);

  useEffect(() => {
    return () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview); };
  }, [fotoPreview]);

  const editar = (e) => {
    setForm({
      id: e.id ?? null,
      nombre: e.nombre ?? "",
      matricula: e.matricula ?? "",
    });
    setFotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abrirSelector = () => fileInputRef.current?.click();

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("La imagen pesa más de 4 MB");
      e.target.value = "";
      return;
    }
    setFotoFile(file);
    setError("");
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    try {
      const datos = new FormData();
      if (form.id) datos.set("id", String(form.id));
      datos.set("nombre", form.nombre);
      datos.set("matricula", form.matricula);
      if (fotoFile) datos.set("foto", fotoFile);
      const res = await guardarEspecialista(datos);
      if (res?.ok === true) {
        const mensaje = form.id ? "Profesional actualizado" : "Profesional agregado";
        setForm({ id: null, nombre: "", matricula: "" });
        setFotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSaved(mensaje);
      } else {
        setError(res?.error ?? "No se pudo guardar");
      }
    } finally {
      setGuardando(false);
    }
  };

  const iniciales = (nombre) =>
    nombre
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Formulario */}
      <form onSubmit={guardar} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#082F49]/60 p-4">
        <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-sky-400">
          {form.id ? "Editar profesional" : "Agregar profesional"}
        </h3>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Vista previa + subir */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-sky-500 bg-slate-950">
              {fotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPreview} alt="Vista previa" className="h-full w-full object-cover object-[center_18%]" />
              ) : form.id ? (
                (() => {
                  const original = especialistas.find((e) => e.id === form.id);
                  if (original?.foto_url) {
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={original.foto_url} alt={original.nombre} className="h-full w-full object-cover object-[center_18%]" />;
                  }
                  return (
                    <div className="grid h-full w-full place-items-center text-[18px] font-bold text-sky-300">
                      {iniciales(form.nombre || original?.nombre || "?")}
                    </div>
                  );
                })()
              ) : (
                <div className="grid h-full w-full place-items-center text-[18px] font-bold text-sky-300">
                  {form.nombre ? iniciales(form.nombre) : "—"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={abrirSelector}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              Adjuntar imagen de perfil
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPickFile}
              aria-label="Seleccionar imagen de perfil"
            />
            {fotoFile && (
              <p className="max-w-[180px] truncate text-center text-[10px] text-slate-400" title={fotoFile.name}>
                {fotoFile.name}
              </p>
            )}
          </div>

          {/* Campos */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input required value={form.nombre} onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setError(""); }} placeholder="Nombre y apellido" maxLength={100} className="h-11 rounded-xl border border-white/10 bg-[#082F49]/80 px-3 text-[13px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40" autoComplete="off" aria-label="Nombre y apellido" />
            <input required value={form.matricula} onChange={(e) => { setForm({ ...form, matricula: e.target.value }); setError(""); }} placeholder="Matrícula (MP ...)" maxLength={40} className="h-11 rounded-xl border border-white/10 bg-[#082F49]/80 px-3 text-[13px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40" autoComplete="off" aria-label="Matrícula" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="submit" disabled={guardando} className="inline-flex h-10 items-center rounded-xl bg-sky-500 px-6 text-[12px] font-bold text-[#082F49] hover:bg-sky-400 disabled:opacity-60">
            {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Guardar profesional"}
          </button>
          {form.id && (
            <button type="button" onClick={() => { setForm({ id: null, nombre: "", matricula: "" }); setFotoFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-[12px] text-slate-300 hover:text-white">
              Cancelar
            </button>
          )}
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      </form>

      {/* Lista */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(especialistas ?? []).map((e, i) => {
          const oculto = e.visible === false;
          const alternarVisible = async () => {
            setGuardando(true);
            setError("");
            const res = await cambiarVisibleEspecialista(e.id, oculto);
            if (res?.ok === true) onSaved(oculto ? "Profesional visible en el sitio" : "Profesional oculto del sitio");
            else setError(res?.error ?? "No se pudo actualizar la visibilidad");
            setGuardando(false);
          };
          return (
          <li key={e.id} className={`flex items-center gap-3 rounded-xl border border-white/10 bg-[#082F49] p-3 ${oculto ? "opacity-60" : ""}`}>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-950">
              {e.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.foto_url} alt={e.nombre} className="h-full w-full object-cover object-[center_18%]" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[18px] font-bold text-sky-300">
                  {iniciales(e.nombre)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{e.nombre}</p>
              <p className="truncate text-[11px] text-sky-400">{e.matricula}</p>
              {oculto && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Oculto · no se muestra en el sitio
                </p>
              )}
              <div className="mt-1.5 flex items-center gap-1">
                <button type="button" onClick={() => editar(e)} className="rounded-md bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300 hover:bg-sky-500/25">Editar</button>
                <button type="button" onClick={alternarVisible} disabled={guardando} aria-pressed={oculto} title={oculto ? "Mostrar en el sitio" : "Ocultar del sitio"} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold transition ${oculto ? "bg-slate-500/15 text-slate-400 hover:bg-slate-500/25 hover:text-slate-200" : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"}`}>
                  {oculto ? (
                    <>
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.83 20.83 0 0 1 5.06-6.06M9.9 4.24A10.16 10.16 0 0 1 12 4c7 0 11 8 11 8a20.79 20.79 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                      Oculto
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Visible
                    </>
                  )}
                </button>
                <div className="ml-auto flex items-center gap-0.5">
                  <button type="button" aria-label="Subir" onClick={async () => { setGuardando(true); const res = await reordenarEspecialista(e.id, "up"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === 0} className="grid h-6 w-6 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↑</button>
                  <button type="button" aria-label="Bajar" onClick={async () => { setGuardando(true); const res = await reordenarEspecialista(e.id, "down"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === especialistas.length - 1} className="grid h-6 w-6 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↓</button>
                </div>
              </div>
              <div className="mt-1 flex">
                <button type="button" onClick={async () => { if (!window.confirm(`¿Eliminar a ${e.nombre}?`)) return; setGuardando(true); try { const res = await eliminarEspecialista(e.id); if (res?.ok === true) onSaved("Profesional eliminado"); else setError(res?.error ?? "No se pudo eliminar"); } finally { setGuardando(false); } }} disabled={guardando} className="rounded-md bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/25">Eliminar</button>
              </div>
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
