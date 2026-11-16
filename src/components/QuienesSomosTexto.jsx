"use client";

import { useMemo, useState } from "react";

const SELECCION_VISIBLE = 2;

export default function QuienesSomosTexto({ descripcion }) {
  const [verMas, setVerMas] = useState(false);

  const parrafos = useMemo(
    () =>
      String(descripcion ?? "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [descripcion]
  );

  const visibles = parrafos.slice(0, SELECCION_VISIBLE);
  const extra = parrafos.slice(SELECCION_VISIBLE);

  const heading = (
    <h2>
      <span className="font-sans text-lg font-semibold uppercase tracking-[0.15em] text-sky-800 sm:text-xl lg:text-2xl">
        Quiénes somos
      </span>
    </h2>
  );

  return (
    <>
      {/* MOBILE: texto colapsable con "Ver más" */}
      <div className="sm:hidden">
        {heading}
        {visibles.map((texto, i) => (
          <p key={i} className="mt-3 text-base leading-7 text-slate-600 text-justify first:mt-3">
            {texto}
          </p>
        ))}

        {extra.length > 0 && (
          <>
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                verMas ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
              aria-hidden={!verMas}
            >
              <div className="overflow-hidden">
                {extra.map((texto, i) => (
                  <p key={i} className="pt-4 text-base leading-7 text-slate-600 text-justify first:pt-4">
                    {texto}
                  </p>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVerMas((v) => !v)}
              aria-expanded={verMas}
              className="mt-4 inline-flex items-center gap-2 font-sans text-sm font-semibold text-sky-800 underline underline-offset-4 transition-colors hover:text-sky-950"
            >
              {verMas ? "Ver menos" : "Ver más"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-300 ${verMas ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* DESKTOP/TABLET: texto completo, sin botón */}
      <div className="hidden sm:block">
        {heading}
        {parrafos.map((texto, i) => (
          <p key={i} className="mt-3 first:mt-3 text-base leading-7 text-slate-600 text-justify">
            {texto}
          </p>
        ))}
      </div>
    </>
  );
}
