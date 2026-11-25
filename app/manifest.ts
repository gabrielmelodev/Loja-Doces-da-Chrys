import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Doces da Chrys · Encomendas",
    short_name: "Doces da Chrys",
    description: "Escolha seus doces e faça sua encomenda pelo WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#8f0f16",
    theme_color: "#8f0f16",
    lang: "pt-BR",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
