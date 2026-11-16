export const metadata = {
  title: "Aviso Legal — Consultorio Odontológico Javier Vera",
  description:
    "Información legal y de titularidad del Consultorio Odontológico Javier Vera, Río Gallegos, Santa Cruz.",
};

export default function AvisoLegal() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Aviso Legal
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Última actualización: noviembre de 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm sm:p-8">
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Responsable del sitio
            </h2>
            <p className="mt-2">
              Consultorio Odontológico Javier Vera, con domicilio en Emilia
              Rodiño de Clark 795, Río Gallegos, Santa Cruz (CP 9400),
              Argentina. Teléfono de recepción: 2966-449813. Urgencias 24 hs:
              2966-234055. Atendemos de lunes a sábados de 08:00 a 20:00 hs.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Propiedad intelectual
            </h2>
            <p className="mt-2">
              Los contenidos de este sitio (textos, fotografías, logotipo y
              diseño) pertenecen a Consultorio Odontológico Javier Vera o a
              sus respectivos titulares. Queda prohibida la reproducción,
              distribución o comunicación pública, total o parcial, sin
              autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Contenido informativo
            </h2>
            <p className="mt-2">
              La información publicada en este sitio tiene carácter general y
              orientador; no sustituye la consulta profesional presencial ni
              constituye diagnóstico médico. Ante cualquier duda sobre tu
              salud bucal, consultá a un profesional matriculado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Legislación aplicable
            </h2>
            <p className="mt-2">
              Este aviso se rige por la ley argentina. Para cualquier
              controversia derivada del uso de este sitio, las partes se
              someten a los tribunales ordinarios de Río Gallegos, Santa Cruz.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
