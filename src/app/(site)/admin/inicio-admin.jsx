"use client";

import { useRef, useState } from "react";
import { guardarHero, subirImagenHero } from "./actions";

export default function InicioAdmin({ hero, onSaved }) {
  const [form, setForm] = useState({
    titulo: hero?.titulo ?? "",
    subtitulo: hero?.subtitulo ?? "",
    descripcion: hero?.descripcion ?? "",
    image_url: hero?.image_url ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const onChange = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setError("");
  };

  const subirArchivo = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("La imagen pesa más de 4 MB");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const datos = new FormData();
      datos.set("file", file);
      const result = await subirImagenHero(datos);
      if (result?.ok === true) {
        const url = result?.datos?.url ?? "";
        setForm((f) => ({ ...f, image_url: url }));
        onSaved("Imagen actualizada");
      } else {
        setError(result?.error ?? "No se pudo subir la imagen");
      }
    } finally {
      setGuardando(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    const res = await guardarHero(form);
    if (res?.ok === true) onSaved("Portada guardada");
    else setError(res?.error ?? "No se pudo guardar");
    setGuardando(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="hero-image" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Imagen
        </label>

        <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-slate-950 sm:h-44">
          {form.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.image_url}
              alt="Vista previa"
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.opacity = "0.25"; }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[12px] text-slate-500">
              Sin imagen seleccionada
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={guardando}
            className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-slate-950/80 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-slate-950/95 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            Adjuntar imagen
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={subirArchivo}
            disabled={guardando}
            aria-label="Adjuntar imagen de portada"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          JPG, PNG o WebP. Máximo 4 MB. La imagen se sube a Supabase y se usa como portada del sitio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hero-titulo" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Título
          </label>
          <input
            id="hero-titulo"
            type="text"
            required
            maxLength={100}
            value={form.titulo}
            onChange={onChange("titulo")}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#082F49]/70 px-3 text-[13px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        <div>
          <label htmlFor="hero-subtitulo" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Subtítulo
          </label>
          <input
            id="hero-subtitulo"
            type="text"
            required
            maxLength={150}
            value={form.subtitulo}
            onChange={onChange("subtitulo")}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#082F49]/70 px-3 text-[13px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="hero-descripcion" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Descripción
        </label>
        <textarea
          id="hero-descripcion"
          required
          rows={3}
          maxLength={500}
          value={form.descripcion}
          onChange={onChange("descripcion")}
          className="w-full rounded-xl border border-white/10 bg-[#082F49]/70 px-3 py-2 text-[13px] leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
        />
        <p className="mt-1 text-right text-[10px] text-slate-500">{form.descripcion.length}/500</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex h-10 items-center rounded-xl bg-sky-500 px-6 text-[13px] font-bold text-[#082F49] transition hover:bg-sky-400 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
