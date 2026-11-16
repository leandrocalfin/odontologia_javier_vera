"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export default function GaleriaNosotros({ items }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const pointerStart = useRef(null);
  const videoRef = useRef(null);

  const list = items && items.length ? items : [];
  const TOTAL = list.length;
  const VIDEO_INDEX = list.findIndex((item) => item.tipo === "video");

  const goTo = useCallback(
    (index) => {
      if (!TOTAL) return;
      setActive(((index % TOTAL) + TOTAL) % TOTAL);
    },
    [TOTAL]
  );

  const prev = useCallback(() => {
    setActive((current) => (current - 1 + TOTAL) % TOTAL);
  }, [TOTAL]);

  const next = useCallback(() => {
    setActive((current) => (current + 1) % TOTAL);
  }, [TOTAL]);

  // Si se cambia de slide, el video se pausa (no sigue sonando de fondo).
  useEffect(() => {
    if (active === VIDEO_INDEX) return;
    const video = videoRef.current;
    if (video && !video.paused) video.pause();
  }, [active, VIDEO_INDEX]);

  const reproducir = () => {
    videoRef.current?.play().catch(() => {});
  };

  // Deslizar con el dedo o el mouse (horizontal).
  const onPointerDown = (event) => {
    if (event.target.closest?.("video")) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    if (event.target.closest?.("video") || !pointerStart.current) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (!TOTAL) return null;

  return (
    <div className="w-full">
      {/* Imagen / video principal */}
      <div
        role="group"
        aria-roledescription="carrusel"
        aria-label="Fotos y video del consultorio"
        className="group relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-3xl bg-slate-950 shadow-xl ring-1 ring-slate-900/10"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        onPointerLeave={() => {
          pointerStart.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {list.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              aria-hidden={index !== active}
              className="relative h-full w-full shrink-0"
            >
              {item.tipo === "video" ? (
                <>
                  <video
                    ref={videoRef}
                    src={item.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-slate-950 object-contain"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                  />
                  {index === active && !playing && (
                    <button
                      type="button"
                      onClick={reproducir}
                      aria-label="Reproducir video"
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-colors hover:bg-slate-950/30"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-sky-950 shadow-lg ring-1 ring-slate-900/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="ml-1 h-7 w-7"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Flechas */}
        <button
          type="button"
          onClick={prev}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sky-950 shadow-md ring-1 ring-slate-900/10 backdrop-blur transition-colors hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Foto siguiente"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sky-950 shadow-md ring-1 ring-slate-900/10 backdrop-blur transition-colors hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Contador */}
        <p
          aria-live="polite"
          className="absolute bottom-3 right-3 rounded-full bg-slate-950/60 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur"
        >
          {active + 1} / {TOTAL}
        </p>
      </div>

      {/* Miniaturas */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {list.map((item, index) => {
          const isActive = index === active;
          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={
                item.tipo === "video"
                  ? "Ver video del consultorio"
                  : `Ver foto ${index + 1} de ${TOTAL}`
              }
              aria-current={isActive ? "true" : undefined}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl transition-all duration-200 ${
                isActive
                  ? "opacity-100 ring-2 ring-sky-800 ring-offset-2 ring-offset-white"
                  : "opacity-60 ring-1 ring-slate-900/10 hover:opacity-100"
              }`}
            >
              {item.tipo === "video" ? (
                <>
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                    tabIndex={-1}
                    className="pointer-events-none h-full w-full bg-slate-950 object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white ring-1 ring-white/50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-0.5 h-4 w-4"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                </>
              ) : (
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
