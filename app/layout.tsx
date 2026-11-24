import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Código Cuántico",
  description: "Gestión de sesiones de terapia energética",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
