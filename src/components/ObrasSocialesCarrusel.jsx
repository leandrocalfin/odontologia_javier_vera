const obras = [
  { nombre: "Galeno", archivo: "/obras-sociales/galeno.png", texto: true },
  { nombre: "Medifé", archivo: "/obras-sociales/medife.svg" },
  { nombre: "Omint", archivo: "/obras-sociales/omint.svg", texto: true },
  { nombre: "Swiss Medical", archivo: "/obras-sociales/swiss-medical.svg" },
  { nombre: "SanCor Salud", archivo: "/obras-sociales/sancor-salud.svg", texto: true },
  { nombre: "SMATA", archivo: "/obras-sociales/smata.png" },
  { nombre: "SOMU", archivo: "/obras-sociales/somu.png" },
  { nombre: "Jerárquicos", archivo: "/obras-sociales/jerarquicos.svg" },
  { nombre: "TV Salud", archivo: "/obras-sociales/tvsalud.png" },
  { nombre: "Gerdanna Salud", archivo: "/obras-sociales/gerdanna.png", sinChip: true },
  { nombre: "ADOS", archivo: "/obras-sociales/ados.png" },
  { nombre: "OSDOP", archivo: "/obras-sociales/osdop.png" },
  { nombre: "OSPJN", archivo: "/obras-sociales/ospjn.png" },
  { nombre: "Obra Social del Personal Marítimo", archivo: "/obras-sociales/ospm.png", sinChip: true },
  { nombre: "OSALARA", archivo: "/obras-sociales/osalara.png" },
  { nombre: "OSPATRONES", archivo: "/obras-sociales/ospatrones.svg", texto: true },
];

export default function ObrasSocialesCarrusel() {
  const doble = [...obras, ...obras];

  return (
    <section
      aria-label="Obras sociales y prepagas que atendemos"
      className="mt-12 w-full bg-sky-950 sm:mt-16"
    >
      <div className="px-4 pt-6 text-center sm:pt-7">
        <h3>
          <span className="font-sans text-lg font-semibold uppercase tracking-[0.15em] text-white sm:text-xl lg:text-2xl">
            Coberturas Médicas
          </span>
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
          Trabajamos con las principales Obras Sociales y Prepagas
        </p>
      </div>
      <div className="overflow-hidden py-4 sm:py-5">
        <div className="animate-marquee flex w-max items-center whitespace-nowrap motion-reduce:animate-none hover:[animation-play-state:paused]">
          {doble.map((obra, i) => (
            <span
              key={`${obra.archivo}-${i}`}
              aria-hidden={i >= obras.length}
              className="flex shrink-0 items-center px-6 sm:px-8"
            >
              {obra.sinChip ? (
                <img
                  src={obra.archivo}
                  alt={obra.nombre}
                  width="536"
                  height="122"
                  className="h-9 w-auto object-contain sm:h-10"
                />
              ) : (
                <span className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5">
                  <img
                    src={obra.archivo}
                    alt={obra.nombre}
                    width="200"
                    height="72"
                    className="h-6 w-auto object-contain sm:h-7"
                  />
                  {obra.texto && (
                    <span className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">
                      {obra.nombre}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
