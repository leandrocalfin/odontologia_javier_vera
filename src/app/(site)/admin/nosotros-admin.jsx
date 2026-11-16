"use client";

import { useRef, useState } from "react";
import {
  eliminarGaleria,
  reordenarGaleria,
  agregarFotoGaleria,
  guardarNosotros,
} from "./actions";

export default function NosotrosAdmin({ nosotros, galeria, onSaved }) {
  const [descripcion, setDescripcion] = useState(nosotros?.descripcion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const guardarTexto = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    const res = await guardarNosotros({ descripcion });
    if (res?.ok === true) onSaved("Texto de Nosotros guardado");
    else setError(res?.error ?? "No se pudo guardar");
    setGuardando(false);
  };

  const subirArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    const esVideo = file.type === "video/mp4";
    const fotos = (galeria ?? []).filter((g) => g.tipo === "foto").length;
    const videos = (galeria ?? []).filter((g) => g.tipo === "video").length;
    if (esVideo && videos >= 2) { setError("Máximo 2 videos en la galería"); return; }
    if (!esVideo && fotos >= 7) { setError("Máximo 7 fotos en la galería"); return; }
    const topeMb = esVideo ? 5_000_000 : 4_000_000;
    if (file.size > topeMb) {
      setError(esVideo ? "El video pesa más de 5 MB" : "La imagen pesa más de 4 MB");
      return;
    }
    setGuardando(true);
    setError("");
    {
      const datos = new FormData();
      datos.set("file", file);
      const res = await agregarFotoGaleria(datos);
      if (res?.ok === true) onSaved(esVideo ? "Video subido" : "Imagen subida");
      else setError(res?.error ?? (esVideo ? "No se pudo subir el video" : "No se pudo subir la imagen"));
    }
    setGuardando(false);
  };

  const mover = async (id, dir) => {
    setGuardando(true);
    try {
      const res = await reordenarGaleria(id, dir);
      if (res?.ok === true) onSaved("Orden actualizado");
      else setError(res?.error ?? "No se pudo reordenar");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id) => {
    if (!window.confirm("¿Eliminar este item de la galería?")) return;
    setGuardando(true);
    try {
      const res = await eliminarGaleria(id);
      if (res?.ok === true) onSaved("Item eliminado");
      else setError(res?.error ?? "No se pudo eliminar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Texto de Nosotros */}
      <form onSubmit={guardarTexto} className="rounded-xl border border-white/10 bg-[#082F49]/60 p-4">
        <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-sky-400">
          Texto — Quiénes somos
        </h3>
        <label htmlFor="nosotros-desc" className="sr-only">
          Descripción
        </label>
        <textarea
          id="nosotros-desc"
          rows={10}
          value={descripcion}
          onChange={(e) => { setDescripcion(e.target.value); setError(""); }}
          maxLength={5000}
          placeholder="Párrafos separados por una línea en blanco."
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#082F49]/80 px-3 py-2 text-[13px] leading-6 text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-500">{descripcion.length}/5000 · Párrafos separados por una línea en blanco</span>
          <button type="submit" disabled={guardando} className="inline-flex h-9 items-center rounded-lg bg-sky-500 px-4 text-[12px] font-bold text-[#082F49] hover:bg-sky-400 disabled:opacity-60">
            {guardando ? "Guardando…" : "Guardar texto"}
          </button>
        </div>
        {error && <p role="alert" className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      </form>

      {/* Galería */}
      <div className="rounded-xl border border-white/10 bg-[#082F49]/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-sky-400">
              Galería ({galeria?.length ?? 0})
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">Máx. 7 fotos (JPG, PNG, WebP hasta 4 MB) y 2 videos (MP4 hasta 5 MB). El orden se muestra en ese orden en la home.</p>
          </div>
          {(() => {
            const fotos = (galeria ?? []).filter((g) => g.tipo === "foto").length;
            const videos = (galeria ?? []).filter((g) => g.tipo === "video").length;
            const completa = fotos >= 7 && videos >= 2;
            return (
              <label className={`inline-flex h-9 items-center rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 text-[12px] font-bold text-sky-300 transition ${completa ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-sky-500/20"} ${guardando ? "opacity-60" : ""}`}>
                {completa ? "Galería completa" : "+ Agregar foto/video"}
                {!completa && (
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    className="sr-only"
                    onChange={subirArchivo}
                    disabled={guardando}
                  />
                )}
              </label>
            );
          })()}
        </div>

        {(galeria?.length ?? 0) === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-[#060E18] p-5 text-center text-[13px] text-slate-500">
            La galería está vacía. Agregá tu primera imagen.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {galeria.map((item, i) => (
              <li key={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#082F49]">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  {item.tipo === "video" ? (
                    <video src={item.src} className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  {item.tipo === "video" && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-semibold text-white">VIDEO</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2">
                  <p className="line-clamp-2 text-[11px] leading-4 text-slate-300" title={item.alt}>
                    {item.alt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                    <div className="flex gap-1">
                      <button type="button" aria-label="Subir" onClick={() => mover(item.id, "up")} disabled={guardando || i === 0} className="grid h-6 w-6 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↑</button>
                      <button type="button" aria-label="Bajar" onClick={() => mover(item.id, "down")} disabled={guardando || i === galeria.length - 1} className="grid h-6 w-6 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↓</button>
                    </div>
                    <button type="button" aria-label="Eliminar" onClick={() => borrar(item.id)} disabled={guardando} className="grid h-6 w-6 place-items-center rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30">×</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
