import "./globals.css";
import { Space_Grotesk, Fraunces } from "next/font/google";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata = {
  title: "Order Console",
  description: "Gestión de pedidos conectada a microservicios Rails"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${space.variable} ${fraunces.variable}`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
