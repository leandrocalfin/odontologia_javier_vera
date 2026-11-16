"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Reveal() {
  const pathname = usePathname();

  // Re-escanea en cada cambio de ruta: el layout no se desmonta en la
  // navegación del lado del cliente, así que un useEffect con [] solo
  // observa los elementos del primer render y los que llegan después
  // (p. ej. al volver del admin al inicio) quedaban invisibles.
  useEffect(() => {
    const items = Array.from(document.querySelectorAll("[data-reveal]:not(.is-visible)"));
    if (!items.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observer.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
