// Dominio en producción: configurar la variable NEXT_PUBLIC_SITE_URL
// (ej: NEXT_PUBLIC_SITE_URL=https://www.odontologiajaviervera.com.ar)
// Si no está seteada, robots.txt apunta a example.com — avisará tras el deploy.
export default function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
