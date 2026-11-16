"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_CONTENT,
  buildWhatsAppUrgencias,
} from "@/lib/contenido";
import { logoutAction } from "../app/(site)/admin/actions";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Tratamientos", href: "/#tratamientos" },
  { label: "Preguntas", href: "/#preguntas" },
  { label: "Contacto", href: "/#contacto" },
];

export default function NavBar({ contacto }) {
  const data = contacto ?? DEFAULT_CONTENT.contacto;
  const waUrgencias = buildWhatsAppUrgencias(data);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [seccion, setSeccion] = useState("inicio");
  const [adminMenu, setAdminMenu] = useState(false);
  // Detección de sesión de administrador en el cliente: el sitio público
  // queda estático (ISR) y solo quien navega con sesión ve el avatar.
  const [esAdmin, setEsAdmin] = useState(false);
  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!supabaseBrowser) return;
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session) return;
        const { data, error } = await supabaseBrowser.rpc("is_admin");
        if (vivo && !error && data === true) setEsAdmin(true);
      } catch {
        // sin conexión: no se muestra el avatar de administrador
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // Cerrar el menú de administrador al navegar o con Escape
  useEffect(() => { setAdminMenu(false); }, [pathname]);
  useEffect(() => {
    if (!adminMenu) return;
    const onKey = (e) => { if (e.key === "Escape") setAdminMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adminMenu]);

  // Al hacer scroll hacia abajo el navbar se vuelve translúcido
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy: marca la sección visible (Inicio / Nosotros / Tratamientos / Preguntas / Contacto)
  useEffect(() => {
    const onScroll = () => {
      const offset = 96; // altura del navbar + margen
      const nosotros = document.getElementById("nosotros");
      const tratamientos = document.getElementById("tratamientos");
      const preguntas = document.getElementById("preguntas");
      const contacto = document.getElementById("contacto");
      let actual = "inicio";
      if (nosotros && nosotros.getBoundingClientRect().top <= offset)
        actual = "nosotros";
      if (tratamientos && tratamientos.getBoundingClientRect().top <= offset)
        actual = "tratamientos";
      if (preguntas && preguntas.getBoundingClientRect().top <= offset)
        actual = "preguntas";
      if (contacto && contacto.getBoundingClientRect().top <= offset)
        actual = "contacto";
      setSeccion(actual);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Recalcular al cambiar de ruta (SPA), cuando el DOM ya está montado.
    const raf = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const isActive = (href) => {
    if (href === "/#nosotros") return seccion === "nosotros";
    if (href === "/#tratamientos") return seccion === "tratamientos";
    if (href === "/#preguntas") return seccion === "preguntas";
    if (href === "/#contacto") return seccion === "contacto";
    if (href === "/") return pathname === "/" && seccion === "inicio";
    return pathname === href;
  };

  // Si ya estamos en el inicio, evitamos la navegación de Next para que el
  // scroll suave no se corte y llegue hasta arriba de todo.
  const irAlInicio = (e) => {
    if (pathname !== "/") return;
    e.preventDefault();
    if (window.location.hash) {
      window.history.replaceState(null, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-transparent bg-white/55 backdrop-blur-lg"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1 py-1.5 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:px-8 xl:gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Consultorio Odontológico Javier Vera — Inicio"
          onClick={irAlInicio}
        >
          <Image
            src="/logoPrincipal.png"
            alt="Consultorio Odontológico Javier Vera"
            width={375}
            height={557}
            className="h-11 w-auto sm:h-18"
          />
          <span className="flex flex-col leading-tight font-display font-bold text-slate-900">
            <span className="text-[15px] tracking-tight sm:text-xl">
              Consultorio
              <br className="sm:hidden" /> Odontológico
            </span>
            <span className="mt-0.5 text-[11px] tracking-widest sm:text-base">
              JAVIER VERA
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.href === "/" ? irAlInicio : undefined}
                className={`rounded-full px-4 py-2.5 text-base font-semibold transition-colors ${
                  active
                    ? "bg-sky-100 text-black"
                    : "text-black hover:bg-slate-100 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA urgencias: visible siempre, al lado del menú mobile */}
        <div className="ml-auto shrink-0">
          <a
            href={waUrgencias}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-red-700 sm:gap-2 sm:px-5 sm:py-2 sm:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 animate-blink"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Urgencias 24 Hs.
          </a>
        </div>

        {/* Avatar de administrador: solo dentro del panel, solo desktop */}
        {esAdmin && (
          <div className="relative hidden shrink-0 xl:block">
            <button
              type="button"
              onClick={() => setAdminMenu((v) => !v)}
              aria-label="Menú de administrador"
              aria-haspopup="true"
              aria-expanded={adminMenu}
              className="block h-11 w-11 overflow-hidden rounded-full border-2 border-sky-500 shadow-sm transition hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Javier_Vera.jpg" alt="Javier Vera" className="h-full w-full object-cover object-[center_18%]" />
            </button>
            {adminMenu && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  tabIndex={-1}
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setAdminMenu(false)}
                />
                <div role="menu" className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <p className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Administrador
                  </p>
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setAdminMenu(false)}
                    className="block px-4 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Ir al panel
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-left text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 xl:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full w-full border-b border-slate-200 bg-white shadow-xl xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-2 text-center sm:px-6">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    setOpen(false);
                    if (item.href === "/") irAlInicio(e);
                  }}
                  className={`block w-full rounded-lg px-4 py-1.5 text-center text-sm font-semibold transition-colors ${
                    active
                      ? "bg-sky-100 text-black"
                      : "text-black hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Acceso de administrador: solo con sesión activa, en el menú mobile */}
            {esAdmin && (
              <div className="mt-0.5 border-t border-slate-200 pt-1.5">
                <p className="px-4 pb-0.5 pt-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Administrador
                </p>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Ir al panel
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="mt-0.5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </form>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
