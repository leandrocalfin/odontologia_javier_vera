"use client";

import { useState } from "react";
import {
  guardarPregunta,
  eliminarPregunta,
  reordenarPregunta,
} from "./actions";

export default function PreguntasAdmin({ preguntas, onSaved }) {
  const [form, setForm] = useState({ id: null, pregunta: "", respuesta: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const editar = (p) => {
    setForm({ id: p.id, pregunta: p.pregunta ?? "", respuesta: p.respuesta ?? "" });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setError("");
    {
      const res = await guardarPregunta({
        id: form.id || null,
        pregunta: form.pregunta,
        respuesta: form.respuesta,
      });
      if (res?.ok === true) {
        const mensaje = form.id ? "Pregunta actualizada" : "Pregunta agregada";
        setForm({ id: null, pregunta: "", respuesta: "" });
        onSaved(mensaje);
      } else {
        setError(res?.error ?? "No se pudo guardar");
      }
    }
    setGuardando(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={guardar} className="rounded-xl border border-white/10 bg-[#082F49]/60 p-4">
        <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-sky-400">
          {form.id ? "Editar pregunta" : "Agregar pregunta"}
        </h3>
        <input required value={form.pregunta} onChange={(e) => { setForm({ ...form, pregunta: e.target.value }); setError(""); }} placeholder="Pregunta" maxLength={255} className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#082F49]/80 px-3 text-[13px] text-white" />
        <textarea required rows={3} value={form.respuesta} onChange={(e) => { setForm({ ...form, respuesta: e.target.value }); setError(""); }} placeholder="Respuesta" maxLength={1000} className="mt-2 w-full rounded-xl border border-white/10 bg-[#082F49]/80 px-3 py-2 text-[13px] leading-6 text-white" />
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <button type="submit" disabled={guardando} className="inline-flex h-10 items-center rounded-xl bg-sky-500 px-5 text-[12px] font-bold text-[#082F49] hover:bg-sky-400 disabled:opacity-60">
            {guardando ? "Guardando…" : "Guardar"}
          </button>
          {form.id && <button type="button" onClick={() => setForm({ id: null, pregunta: "", respuesta: "" })} className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-[12px] text-slate-300 hover:text-white">Cancelar</button>}
        </div>
        {error && <p role="alert" className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{error}</p>}
      </form>

      <ul className="flex flex-col gap-2">
        {(preguntas ?? []).map((p, i) => (
          <li key={p.id} className="rounded-xl border border-white/10 bg-[#082F49] p-3">
            <p className="text-[13px] font-semibold text-white">{p.pregunta}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-300">{p.respuesta}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => editar(p)} className="rounded-md bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-500/25">Editar</button>
              <button type="button" onClick={async () => { if (!window.confirm("¿Eliminar esta pregunta?")) return; setGuardando(true); const res = await eliminarPregunta(p.id); if (res?.ok === true) onSaved("Pregunta eliminada"); else setError(res?.error ?? "No se pudo eliminar"); setGuardando(false); }} disabled={guardando} className="rounded-md bg-red-500/15 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/25">Eliminar</button>
              <div className="ml-auto flex items-center gap-0.5">
                <button type="button" aria-label="Subir" onClick={async () => { setGuardando(true); const res = await reordenarPregunta(p.id, "up"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === 0} className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↑</button>
                <button type="button" aria-label="Bajar" onClick={async () => { setGuardando(true); const res = await reordenarPregunta(p.id, "down"); if (res?.ok === true) onSaved("Orden actualizado"); else setError(res?.error ?? "No se pudo reordenar"); setGuardando(false); }} disabled={guardando || i === preguntas.length - 1} className="grid h-7 w-7 place-items-center rounded bg-white/5 text-slate-300 hover:text-white disabled:opacity-30">↓</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
