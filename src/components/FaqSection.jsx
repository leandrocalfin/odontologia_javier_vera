"use client";

import { useState } from "react";

export default function FaqSection({ preguntas }) {
  const [abierta, setAbierta] = useState(0);
  const items = preguntas && preguntas.length ? preguntas : [];

  return (
    <section
      id="preguntas"
      className="scroll-mt-20 border-t border-slate-200 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
        <div className="reveal text-center" data-reveal>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Preguntas
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 h-1 w-16 rounded-full bg-sky-800"
          />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Las dudas más habituales antes de tu primera visita. Si te queda
            alguna, escribinos y te respondemos.
          </p>
        </div>

        <div
          className="reveal mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          data-reveal
          style={{ "--d": 1 }}
        >
          {items.map((item, index) => {
            const isOpen = abierta === index;
            return (
              <div
                key={`${item.pregunta}-${index}`}
                className="border-b border-slate-200 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setAbierta(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors sm:gap-4 sm:px-6 sm:py-4 sm:text-base ${
                    isOpen
                      ? "bg-sky-950 text-white"
                      : "text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.pregunta}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 sm:h-5 sm:w-5 ${
                      isOpen ? "rotate-180 text-sky-300" : "text-sky-800"
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  id={`faq-panel-${index}`}
                  hidden={!isOpen}
                  className="px-4 pb-3 pt-3 text-xs leading-6 text-slate-600 sm:px-6 sm:pb-4 sm:pt-4 sm:text-sm sm:leading-7"
                >
                  {item.respuesta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
