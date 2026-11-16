import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabaseServer";
import FormularioLogin from "./FormularioLogin";

export const metadata = {
  title: "Acceso — Consultorio Javier Vera · Panel",
  robots: { index: false, follow: false },
};

// Si ya hay sesión de admin no tiene sentido mostrar el formulario de nuevo.
export default async function AdminLogin() {
  const { isAdmin } = await getAdminUser().catch(() => ({ isAdmin: false }));
  if (isAdmin) redirect("/admin");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <FormularioLogin />
    </main>
  );
}
