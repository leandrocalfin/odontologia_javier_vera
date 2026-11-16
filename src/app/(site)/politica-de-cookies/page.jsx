export const metadata = {
  title: "Política de Cookies — Consultorio Odontológico Javier Vera",
  description:
    "Qué cookies usa y cuáles no usa este sitio, y cómo podés controlarlas desde tu navegador.",
};

export default function PoliticaCookies() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Política de Cookies
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Última actualización: noviembre de 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm sm:p-8">
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              En resumen
            </h2>
            <p className="mt-2">
              Este sitio no utiliza cookies de seguimiento ni de publicidad,
              ni analítica orientada al comportamiento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tecnologías que sí se usan
            </h2>
            <p className="mt-2">
              El sitio puede cargar recursos de terceros, que instalan sus
              propias cookies:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                Google Fonts: tipografías servidas desde la CDN de Google.
              </li>
              <li>
                Google Maps: el mapa embebido de la sede puede establecer
                cookies de terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Cómo controlarlas
            </h2>
            <p className="mt-2">
              Podés bloquear o eliminar cookies desde la configuración de tu
              navegador (buscar "privacidad y seguridad" o "cookies" en la
              ayuda del navegador). El sitio seguirá funcionando para pedir
              turno por WhatsApp o por teléfono incluso sin cookies.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
