import "./globals.css";
import { Geist, Poppins, Inter } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Consultorio Odontológico Javier Vera",
  description:
    "Consultorio odontológico Javier Vera en Río Gallegos. Atención integral para toda la familia: prevención, estética, implantes y urgencias.",
  icons: {
    icon: "/favicon_logoPrincipal.png?v=2",
    shortcut: "/favicon_logoPrincipal.png?v=2",
    apple: "/favicon_logoPrincipal.png?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F8FB]">{children}</body>
    </html>
  );
}
