"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  guardarTratamiento,
  eliminarTratamiento,
  reordenarTratamiento,
} from "./actions";

export default function TratamientosAdmin({ tratamientos, onSaved }) {
  const [form, setForm] = useState({ id: null, nombre: "", descripcion: "" });
  const [imagenFile, setImagenFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const imagenPreview = useMemo(
    () => (imagenFile ? URL.createObjectURL(imagenFile) : null),
    [imagenFile]
  );

  useEffect(() => {
    return () => { if (imagenPreview) URL.revokeObjectURL(imagenPreview); };
  }, [imagenPreview]);

  const editar = (t) => {
    setForm({ id: t.id, nombre: t.nombre ?? "", descripcion: t.descripcion ?? "" });
    setImagenFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("La imagen pesa más de 4 MB");
      e.target.value = "";
      return;
    }
    setImagenFile(file);
    setError("");
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    {
      const datos = new FormData();
      if (form.id) datos.set("id", String(form.id));
      datos.set("nombre", form.nombre);
      datos.set("descripcion", form.descripcion);
      if (imagenFile) datos.set("imagen", imagenFile);
      const res = await guardarTratamiento(datos);
      if (res?.ok === true) {
        const mensaje = form.id ? "Tratamiento guardado" : "Tratamiento agregado";
        setForm({ id: null, nombre: "", descripcion: "" });
        setImagenFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSaved(mensaje);
      } else {
        setError(res?.error ?? "No se pudo guardar");
      }
    }
    setGuardando(false);
  };

  const editarImagen = form.id
    ? tratamientos?.find((t) => t.id === form.id)?.imagen_url
    : null;

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={guardar} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#082F49]/60 p-4">
        <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-sky-400">
          {form.id ? "Editar tratamiento" : "Agregar tratamiento"}
        </h3>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Vista previa + adjuntar imagen */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950 sm:w-44">
              {imagenPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagenPreview} alt="Vista previa" className="h-full w-full object-cover" />
              ) : editarImagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editarImagen} alt={form.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[12px] text-slate-500">
                  Sin imagen
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              Adjuntar imagen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPickFile}
              aria-label="Seleccionar imagen del tratamiento"
            />
            {imagenFile && (
              <p className="max-w-[180px] truncate text-center text-[10px] text-slate-400" title={imagenFile.name}>
                {imagenFile.name}
              </p>
            )}
          </div>

          {/* Campos */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input required value={form.nombre} onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setError(""); }} placeholder="Nombre" maxLength={120} className="h-11 rounded-xl border border-white/10 bg-[#082F49]/80 px-3 text-[13px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40" autoComplete="off" aria-label="Nombre del tratamiento" />
            <textarea required rows={4} value={form.descripcion} onChange={(e) => { setForm({ ...form, descripcion: e.target.value }); setError(""); }} placeholder="Descripción corta (máx 500 caracteres)" maxLength={500} className="w-full rounded-xl border border-white/10 bg-[#082F49]/80 px-3 py-2 text-[13px] leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40" aria-label="Descripción del tratamiento" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="submit" disabled={guardando} className="inline-flex h-10 items-center rounded-xl bg-sky-500 px-6 text-[12px] font-bold text-[#082F49] hover:bg-sky-400 disabled:opacity-60">
            {guardando ? "Guardando…" : "Guardar"}
          </button>
          {form.id && (
            <button type="button" onClick={() => { setForm({ id: null, nombre: "", descripcion: "" }); setImagenFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-[12px] text-slate-300 hover:text-white">
              Cancelar
            </button>
          )}
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      </form>

      <ul className="flex flex-col gap-3">
        {(tratamientos ?? []).map((t, i) => (
          <li key={t.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#082F49] p-3 sm:flex-row sm:items-center">
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-slate-950 sm:h-20 sm:w-32">
              {t.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.imagen_url} alt={t.nombre} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[12px] text-slate-500">Sin imagen</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14px] font-bold text-white">{t.nombre}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-slate-300">{t.descripcion}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => editar(t)} className="rounded-md bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/25">Editar</button>
                <button type="button" aria-label="Subir" onClick={async () => { setGuardando(true); const res = await reordenarTratamiento(t.id, "up"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === 0} className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↑</button>
                <button type="button" aria-label="Bajar" onClick={async () => { setGuardando(true); const res = await reordenarTratamiento(t.id, "down"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === tratamientos.length - 1} className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↓</button>
                <button type="button" onClick={async () => { if (!window.confirm(`¿Eliminar "${t.nombre}"?`)) return; setGuardando(true); try { const res = await eliminarTratamiento(t.id); if (res?.ok === true) onSaved("Tratamiento eliminado"); else setError(res?.error ?? "No se pudo eliminar"); } finally { setGuardando(false); } }} disabled={guardando} className="rounded-md bg-red-500/15 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/25">Eliminar</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
