"use client";
import { useEffect, useState } from "react";

export default function DeadlineCountdown({ deadline }: { deadline: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(`${deadline}T23:59:59-03:00`).getTime();
    const tick = () => setLeft(end - Date.now());
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [deadline]);
  if (left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const parts: [number, string][] = [[Math.floor(s / 86400), "dias"], [Math.floor((s % 86400) / 3600), "horas"], [Math.floor((s % 3600) / 60), "min"], [s % 60, "seg"]];
  return (
    <div className="countdown" role="timer" aria-label="Tempo restante para encomendas">
      <small>Faltam para encerrar as encomendas</small>
      <div>{parts.map(([n, l]) => <span key={l}><b>{String(n).padStart(2, "0")}</b>{l}</span>)}</div>
      <em>❄ Sopre a neve com o dedo ou sacuda o celular</em>
    </div>
  );
}
