export const metadata = {
  title: "Política de Privacidad — Consultorio Odontológico Javier Vera",
  description:
    "Cómo tratamos tus datos personales en Consultorio Odontológico Javier Vera: finalidades, derechos de acceso y supresión, y seguridad.",
};

export default function PoliticaPrivacidad() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Última actualización: noviembre de 2026
        </p>

        <div className="mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm sm:p-8">
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Responsable del tratamiento
            </h2>
            <p className="mt-2">
              Consultorio Odontológico Javier Vera, Emilia Rodiño de Clark
              795, Río Gallegos, Santa Cruz (CP 9400), Argentina. Recepción:
              2966-449813. Urgencias 24 hs: 2966-234055.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Datos que recopilamos
            </h2>
            <p className="mt-2">
              A través del formulario de contacto de este sitio, del WhatsApp
              y de la línea telefónica podemos obtener: nombre y apellido,
              teléfono/celular, correo electrónico y el contenido
              (informativo) del mensaje que nos envíes. No recopilamos datos
              clínicos detallados por estos canales: te pedimos evitar
              diagnósticos, estudios o medicación precisa en tus mensajes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Finalidades y base legal
            </h2>
            <p className="mt-2">
              Tratamos tus datos únicamente para: responder tu consulta,
              gestionar la reserva de turnos, confirmarlos con un recordatorio
              previo y atender urgencias. El tratamiento se apoya en el
              consentimiento del titular (Ley 25.326) y en nuestro interés
              legítimo de prestar atención odontológica con la calidad y
              seguridad esperadas. No vendemos, cedemos ni compartimos datos
              con terceros, salvo obligación legal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tiempo de conservación
            </h2>
            <p className="mt-2">
              Los datos de contacto se conservan solo durante el tiempo
              necesario para gestionar tu consulta y turno, y para cumplir con
              los registros que exige la normativa sanitaria. Luego se
              suprimen o anonimizan.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tus derechos
            </h2>
            <p className="mt-2">
              Podés ejercer tus derechos de acceso, rectificación, supresión y
              oposición (Ley 25.326) en cualquier momento comunicándote con
              nosotros por teléfono, WhatsApp o presencialmente en el
              consultorio. Respondemos en plazos razonables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Seguridad
            </h2>
            <p className="mt-2">
              Aplicamos medidas razonables de seguridad de la información
              (acceso restringido, control de equipos y de registros
              clínicos). Aun así, ningún sistema digital es 100 % seguro:
              cualquier incidencia se comunicará oportunamente.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
