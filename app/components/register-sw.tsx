"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // A instalação continua funcionando mesmo se o cache offline falhar.
      });
    }
  }, []);

  return null;
}
