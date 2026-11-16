// Dominio en producción: configurar la variable NEXT_PUBLIC_SITE_URL
// (ej: NEXT_PUBLIC_SITE_URL=https://www.odontologiajaviervera.com.ar)
export default function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  const lastmod = new Date();
  const legaless = [
    { path: "/aviso-legal", priority: 0.3 },
    { path: "/politica-de-privacidad", priority: 0.3 },
    { path: "/politica-de-cookies", priority: 0.3 },
  ];
  return [
    { url: `${base}/`, lastModified: lastmod, changeFrequency: "weekly", priority: 1 },
    ...legaless.map((l) => ({
      url: `${base}${l.path}`,
      lastModified: lastmod,
      changeFrequency: "yearly",
      priority: l.priority,
    })),
  ];
}
