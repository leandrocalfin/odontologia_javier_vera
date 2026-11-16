"use client";

import { useRef, useState } from "react";
import Script from "next/script";
import { loginAction } from "../actions";

export default function FormularioLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);

  const onScriptLoad = () => {
    if (typeof window === "undefined" || !window.turnstile || !turnstileRef.current) return;
    window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: setTurnstileToken,
      "error-callback": () => setTurnstileToken(""),
      "expired-callback": () => setTurnstileToken(""),
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError("");
    const res = await loginAction(email.trim(), password, turnstileToken || null);
    if (res?.error) {
      setError(res.error);
      setCargando(false);
    }
    // Sin error: la acción hizo redirect("/admin") y Next navega solo.
  };

  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/10 bg-sky-950 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)]">
      <div className="px-7 pt-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-sky-400" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5c-2.1 0-2.9 1.3-4.8 1.3-1.6 0-3.2 1.2-3.2 3.3 0 3.4 1.9 4.7 2.6 8.9.3 1.9 1 4.1 2.9 4.1 1.6 0 1.7-2 2.1-4.1.2-1.2 1.1-1.9 2.4-1.9s2.2.7 2.4 1.9c.4 2.1.5 4.1 2.1 4.1 1.9 0 2.6-2.2 2.9-4.1.7-4.2 2.6-5.5 2.6-8.9 0-2.1-1.6-3.3-3.2-3.3-1.9 0-2.7-1.3-4.8-1.3Z" />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-[22px] font-bold leading-tight tracking-tight text-white">
          Consultorio Javier&nbsp;Vera
        </h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
          Panel de administración
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 px-7 pb-8">
        <div>
          <label htmlFor="admin-email" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@consultoriojaviervera.com"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0B2740]/70 px-4 text-[15px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        <div>
          <label htmlFor="admin-pass" className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Contraseña
          </label>
          <input
            id="admin-pass"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0B2740]/70 px-4 text-[15px] text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-300">
            {error}
          </p>
        )}
        {siteKey && (
          <div>
            {/* Widget Turnstile: solo se carga si NEXT_PUBLIC_TURNSTILE_SITE_KEY está configurada */}
            <div ref={turnstileRef} className="flex justify-center" />
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onLoad={onScriptLoad}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={cargando || (Boolean(siteKey) && !turnstileToken)}
          className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 text-[15px] font-bold text-[#082F49] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
        <p className="text-center text-[11px] text-slate-500">
          Acceso restringido al personal autorizado.
        </p>
      </form>
    </div>
  );
}
