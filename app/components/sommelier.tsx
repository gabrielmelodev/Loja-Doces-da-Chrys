"use client";
import { useState } from "react";
import Image from "next/image";

type Cat = { id: string; nome: string; itens: { sabor: string; imagem: string }[] };
const TAGS: Record<string, string[]> = {
  "mousse:Limão": ["citrico", "leve"], "mousse:Morango": ["frutas", "leve"], "mousse:Maracujá": ["citrico", "frutas", "leve"],
  "cheesecake:Morango": ["frutas", "crocante"], "cheesecake:Maracujá": ["citrico", "crocante", "frutas"], "cheesecake:Creme de Ninho": ["doce", "cremoso", "crocante"],
  "pave:Tradicional": ["doce", "cremoso"], "pave:Abacaxi": ["frutas", "cremoso"], "pave:Morango": ["frutas", "doce", "cremoso"],
};
const QUIZ: { q: string; o: [string, string[]][] }[] = [
  { q: "Qual é o clima da sua ceia?", o: [["🕯️ Aconchegante", ["doce", "cremoso"]], ["🧊 Fresquinha", ["citrico", "leve"]], ["✨ Bem festiva", ["frutas"]]] },
  { q: "Qual textura você ama?", o: [["Cremosa", ["cremoso"]], ["Leve e aerada", ["leve"]], ["Com base crocante", ["crocante"]]] },
  { q: "E o sabor?", o: [["Bem docinho", ["doce"]], ["Frutado", ["frutas"]], ["Azedinho", ["citrico"]]] },
];

export default function Sommelier({ menu, onPick }: { menu: Cat[]; onPick: (cat: string, flavor: string) => void }) {
  const [tags, setTags] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const done = step >= QUIZ.length;
  let best: { cat: Cat; sabor: string; imagem: string } | null = null;
  if (done) {
    let score = -1;
    for (const cat of menu) for (const it of cat.itens) {
      const s = (TAGS[`${cat.id}:${it.sabor}`] || []).filter((t) => tags.includes(t)).length;
      if (s > score) { score = s; best = { cat, sabor: it.sabor, imagem: it.imagem }; }
    }
  }
  return (
    <section className="sommelier" aria-live="polite">
      <span className="kicker">Sommelier de sobremesas</span>
      <h2>Qual doce é a cara da sua ceia?</h2>
      {!done ? (
        <>
          <p className="q">{QUIZ[step].q}</p>
          <div className="opts">{QUIZ[step].o.map(([label, t]) => <button key={label} type="button" onClick={() => { setTags((c) => [...c, ...t]); setStep(step + 1); }}>{label}</button>)}</div>
          <div className="dots">{QUIZ.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
        </>
      ) : best && (
        <div className="result">
          <Image src={best.imagem} alt={`${best.cat.nome} de ${best.sabor}`} width={210} height={140} unoptimized />
          <div><small>Combina com você</small><strong>{best.cat.nome} de {best.sabor}</strong>
            <button type="button" className="cta" onClick={() => onPick(best!.cat.id, best!.sabor)}>Quero esse!</button>
            <button type="button" className="again" onClick={() => { setTags([]); setStep(0); }}>Refazer</button></div>
        </div>
      )}
    </section>
  );
}
