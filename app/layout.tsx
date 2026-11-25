import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterServiceWorker from "./components/register-sw";

export const metadata: Metadata = {
  title: "Doces da Chrys · Encomendas para o Natal",
  description: "Mousses, cheesecakes e pavês feitos sob encomenda para a sua ceia. Escolha o sabor, o tamanho e peça pelo WhatsApp.",
  applicationName: "Doces da Chrys",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Doces da Chrys" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#8f0f16" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><RegisterServiceWorker />{children}</body></html>;
}
