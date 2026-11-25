"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SnowGlobe from "./components/snow-globe";
import DeadlineCountdown from "./components/countdown";
import Sommelier from "./components/sommelier";

type CategoryId = "mousse" | "cheesecake" | "pave";
type Size = "P" | "G";
type Product = { id: string; category: CategoryId; categoryName: string; flavor: string; size: Size; price: number };
type MenuItem = { sabor: string; descricao: string; imagem: string; estoque: number; ativo: boolean };
type Category = { id: CategoryId; nome: string; P: number; G: number; itens: MenuItem[] };
type StoreConfig = {
  prazoEncomendas: string;
  taxaEntrega: number;
  entregaAtiva: boolean;
  controleProducao: { capacidadeDiaria: number; observacao?: string };
  produtos: Record<CategoryId, { P: number; G: number; itens: Record<string, { estoque: number; ativo: boolean }> }>;
};

const MENU: Category[] = [
  { id: "mousse", nome: "Mousse", P: 140, G: 160, itens: [
    { sabor: "Limão", descricao: "Creme clássico e refrescante, preparado com uma base suave e o toque cítrico do limão, resultando em uma mousse leve, equilibrada e cheia de aroma.", imagem: "/images/mousse-1.jpg", estoque: 20, ativo: true },
    { sabor: "Morango", descricao: "Creme tradicional de textura leve e aveludada, preparado com uma base doce e enriquecido com morangos frescos, que realçam seu sabor natural e irresistível.", imagem: "/images/mousse-2.jpg", estoque: 20, ativo: true },
    { sabor: "Maracujá", descricao: "Creme aerado e delicado, elaborado com uma base cremosa e maracujá puro, proporcionando frescor e um contraste elegante entre doçura e acidez.", imagem: "/images/mousse-3.jpg", estoque: 20, ativo: true },
  ] },
  { id: "cheesecake", nome: "Cheesecake", P: 150, G: 180, itens: [
    { sabor: "Morango", descricao: "Um clássico irresistível: base amanteigada crocante, creme delicadamente cremoso e uma generosa cobertura de morangos frescos em calda artesanal.", imagem: "/images/cheesecake-1.jpg", estoque: 20, ativo: true },
    { sabor: "Maracujá", descricao: "Perfeitamente equilibrado entre doçura e acidez, combina um creme suave com o sabor vibrante do maracujá puro. Finalizado com calda artesanal e sementes crocantes.", imagem: "/images/cheesecake-2.jpg", estoque: 20, ativo: true },
    { sabor: "Creme de Ninho", descricao: "Cremoso, delicado e marcante: um recheio suave inspirado no sabor inconfundível do Leite Ninho, sobre uma base crocante amanteigada, finalizado com uma leve chuva de leite em pó.", imagem: "/images/cheesecake-3.jpg", estoque: 20, ativo: true },
  ] },
  { id: "pave", nome: "Pavê", P: 140, G: 170, itens: [
    { sabor: "Tradicional", descricao: "Camadas suaves de biscoito delicadamente embebidas em leite, intercaladas por um creme aveludado e finalizadas com uma ganache de chocolate brilhante.", imagem: "/images/pave-1.jpg", estoque: 20, ativo: true },
    { sabor: "Abacaxi", descricao: "Creme leve com abacaxi caramelizado, entrelaçado por camadas de biscoito e finalizado com um creme branco aerado, decorado com pedaços extras de abacaxi caramelizado.", imagem: "/images/pave-2.jpg", estoque: 20, ativo: true },
    { sabor: "Morango", descricao: "Creme leve combinado a morangos frescos, disposto em camadas harmoniosas de biscoito e finalizado com um delicado toque de geleia artesanal.", imagem: "/images/pave-3.jpg", estoque: 20, ativo: true },
  ] },
];

const WHATSAPP = "5561998474648";
const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const snowflakes = Array.from({ length: 30 }, (_, i) => ({ left: `${(i * 37 + 11) % 100}%`, fontSize: `${8 + ((i * 7) % 13)}px`, duration: `${8 + ((i * 11) % 10)}s`, delay: `${-((i * 13) % 15)}s` }));

function Bulbs() { return <div className="bulbs" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <span key={i} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />)}</div>; }

export default function HomePage() {
  const [sizes, setSizes] = useState<Partial<Record<CategoryId, Size>>>({});
  const [menu, setMenu] = useState<Category[]>(MENU);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  useEffect(() => {
    fetch("/config/controle-producao.json", { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("Não foi possível carregar o controle da loja"); return response.json() as Promise<StoreConfig>; })
      .then((config) => {
        setStoreConfig(config);
        setMenu(MENU.map((category) => {
          const settings = config.produtos?.[category.id];
          return { ...category, P: settings?.P ?? category.P, G: settings?.G ?? category.G,
            itens: category.itens.map((item) => ({ ...item, estoque: settings?.itens?.[item.sabor]?.estoque ?? item.estoque, ativo: settings?.itens?.[item.sabor]?.ativo ?? item.ativo })) };
        }));
      })
      .catch(() => setStoreConfig(null));
  }, []);
  const [cart, setCart] = useState<Product[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", fulfillment: "Entrega", street: "", number: "", neighborhood: "", complement: "", reference: "", date: "", time: "", payment: "Pix", notes: "", gift: "", giftTo: "", giftMsg: "" });
  const reduceMotion = useReducedMotion();
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);
  const quantity = cart.length;
  const deliveryFee = customer.fulfillment === "Entrega" ? (storeConfig?.taxaEntrega ?? 10) : 0;
  const finalTotal = total + deliveryFee;
  const orderDeadline = storeConfig?.prazoEncomendas ?? "2026-12-24";
  const deadlineReached = today() > orderDeadline;
  const dateIsValid = !!customer.date && customer.date >= today() && customer.date <= orderDeadline;
  const dateLimitLabel = orderDeadline.split("-").reverse().join("/");
  const updateCustomer = (field: keyof typeof customer, value: string) => setCustomer((current) => ({ ...current, [field]: value }));

  function addToCart(category: Category, flavor: string) {
    const item = category.itens.find((entry) => entry.sabor === flavor);
    const alreadyAdded = cart.filter((entry) => entry.category === category.id && entry.flavor === flavor).length;
    if (!item || !item.ativo || alreadyAdded >= item.estoque) return;
    const size = sizes[category.id] || "P";
    setCart((current) => [...current, { id: `${category.id}-${flavor}-${size}-${Date.now()}-${Math.random()}`, category: category.id, categoryName: category.nome, flavor, size, price: category[size] }]);
  }
  function recommend(categoryId: string, flavor: string) {
    const category = menu.find((c) => c.id === categoryId);
    if (category) addToCart(category, flavor);
  }
  function removeFromCart(id: string) { setCart((current) => current.filter((item) => item.id !== id)); }
  function sendOrder() {
    const needsAddress = customer.fulfillment === "Entrega";
    if (deadlineReached || !dateIsValid || !customer.name.trim() || !customer.phone.trim() || !customer.time || (needsAddress && (!customer.street.trim() || !customer.number.trim() || !customer.neighborhood.trim()))) return;
    const lines = cart.map((item) => `• ${item.categoryName} de ${item.flavor} — tamanho ${item.size} — ${brl(item.price)}`);
    const address = needsAddress ? `\n*Endereço:* ${customer.street}, ${customer.number} — ${customer.neighborhood}${customer.complement ? `, ${customer.complement}` : ""}${customer.reference ? `\n*Referência:* ${customer.reference}` : ""}` : "\n*Retirada:* combinar local com a loja";
    const message = `Olá! Gostaria de confirmar esta encomenda da Doces da Chrys.\n\n*MEU PEDIDO*\n${lines.join("\n")}\n\n*Subtotal dos produtos: ${brl(total)}*\n*Taxa de entrega: ${brl(deliveryFee)}*\n*TOTAL: ${brl(finalTotal)}*\n\n*DADOS DO CLIENTE*\n*Nome:* ${customer.name}\n*Telefone:* ${customer.phone}${address}\n*Data agendada:* ${customer.date.split("-").reverse().join("/")}\n*Horário desejado:* ${customer.time}\n*Forma de pagamento:* ${customer.payment}${customer.notes.trim() ? `\n*Observações:* ${customer.notes}` : ""}${customer.gift ? `\n\n*🎁 É PRESENTE!*\n*Para:* ${customer.giftTo || "—"}\n*Cartão de Natal:* ${customer.giftMsg || "—"}` : ""}\n\nPor favor, confirme a disponibilidade, o valor final e os detalhes para pagamento. Obrigado(a)!`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return <div className="min-h-screen">
    <SnowGlobe />
    <header className="site-header text-center">
      <Image className="banner" src="/images/banner.jpg" alt="Doces da Chrys, com luzinhas e árvore de Natal ao fundo" width={1080} height={518} priority unoptimized />
      <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: "easeOut" }}><span>Encomendas</span><em>para o</em><span className="nat">Natal</span></motion.h1>
      <p className="lead">Mousses, cheesecakes e pavês feitos sob encomenda para a sua ceia. Escolha seus sabores, monte o pedido e agende a entrega.</p>
      <div className="deadline-banner"><strong>🎄 Encomendas até 24/12</strong><span>Pedidos para produção de Natal sujeitos à disponibilidade.</span></div>
      <DeadlineCountdown deadline={orderDeadline} />
      <button className="cta" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>Escolher meus doces</button>
    </header>
    <Bulbs />
    <nav aria-label="Categorias" className="sticky-nav"><a href="#mousse">Mousse</a><a href="#cheesecake">Cheesecake</a><a href="#pave">Pavê</a></nav>

    <Sommelier menu={menu} onPick={recommend} />
    <main id="menu" className="menu-content">
      {menu.map((category, categoryIndex) => {
        const selected = sizes[category.id] || "P";
        return <motion.section id={category.id} key={category.id} initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.5, delay: categoryIndex * 0.04 }}>
          <div className="head"><h2>{category.nome}</h2><div className="sizes" role="group" aria-label={`Tamanho de ${category.nome}`}>{(["P", "G"] as Size[]).map((size) => <button key={size} type="button" aria-pressed={size === selected} onClick={() => setSizes((current) => ({ ...current, [category.id]: size }))}>{size}<span>{brl(category[size])}</span></button>)}</div></div>
          {category.itens.map((item, itemIndex) => <motion.article className="item" key={item.sabor} initial={reduceMotion ? false : { opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.35, delay: itemIndex * 0.06 }}>
            <Image className="foto" src={item.imagem} alt={`${category.nome} de ${item.sabor}`} width={210} height={140} loading="lazy" unoptimized />
            <div className="item-copy"><h3>{item.sabor}</h3><p>{item.descricao}</p><small className="stock-hint">{item.ativo && item.estoque > 0 ? `${Math.max(0, item.estoque - cart.filter((entry) => entry.category === category.id && entry.flavor === item.sabor).length)} unidades disponíveis` : "Indisponível no momento"}</small></div>
            <button className="order" type="button" disabled={!item.ativo || item.estoque <= cart.filter((entry) => entry.category === category.id && entry.flavor === item.sabor).length || deadlineReached} onClick={() => addToCart(category, item.sabor)}>{deadlineReached ? "Prazo encerrado" : !item.ativo || item.estoque <= cart.filter((entry) => entry.category === category.id && entry.flavor === item.sabor).length ? "Indisponível" : `Adicionar ${selected} · ${brl(category[selected])}`}</button>
          </motion.article>)}
        </motion.section>;
      })}
    </main>

    <AnimatePresence>
      {quantity > 0 && !checkoutOpen && <motion.div className="cart-dock" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}><div><strong>{quantity} {quantity === 1 ? "item" : "itens"} no pedido</strong><span>{brl(total)}</span></div><button onClick={() => setCheckoutOpen(true)}>Revisar e agendar <span>→</span></button></motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {checkoutOpen && <motion.div className="checkout-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}>
        <motion.section className="checkout-sheet" role="dialog" aria-modal="true" aria-labelledby="checkout-title" initial={reduceMotion ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}>
          <div className="checkout-top"><div><span className="checkout-kicker">DOCES DA CHRYS</span><h2 id="checkout-title">Finalizar encomenda</h2><p>Confira os itens e informe os dados para combinar seu pedido.</p></div><button className="close-checkout" onClick={() => setCheckoutOpen(false)} aria-label="Fechar">×</button></div>
          <div className="checkout-scroll">
            <div className="checkout-block"><h3>Seu pedido</h3>{cart.length === 0 ? <p className="empty-cart">Seu carrinho está vazio.</p> : cart.map((item) => <div className="cart-line" key={item.id}><div><strong>{item.categoryName} de {item.flavor}</strong><span>Tamanho {item.size} · {brl(item.price)}</span></div><button onClick={() => removeFromCart(item.id)} aria-label={`Remover ${item.flavor}`}>Remover</button></div>)}<div className="checkout-total"><span>Total dos produtos</span><strong>{brl(total)}</strong></div></div>
            <div className="checkout-block"><h3>Seus dados</h3><div className="form-grid"><label className="field full">Nome completo<input autoComplete="name" value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} placeholder="Como podemos chamar você?" required /></label><label className="field full">WhatsApp para contato<input type="tel" autoComplete="tel" value={customer.phone} onChange={(e) => updateCustomer("phone", e.target.value)} placeholder="(61) 9 9999-9999" required /></label></div></div>
            <div className="checkout-block"><h3>Como prefere receber?</h3><div className="choice-row"><button type="button" className={customer.fulfillment === "Entrega" ? "choice active" : "choice"} onClick={() => updateCustomer("fulfillment", "Entrega")}>♧ Entrega</button><button type="button" className={customer.fulfillment === "Retirada" ? "choice active" : "choice"} onClick={() => updateCustomer("fulfillment", "Retirada")}>⌂ Retirada</button></div>
              {customer.fulfillment === "Entrega" && <div className="form-grid address-grid"><label className="field full">Rua / Avenida<input autoComplete="street-address" value={customer.street} onChange={(e) => updateCustomer("street", e.target.value)} placeholder="Nome da rua ou avenida" required /></label><label className="field">Número<input value={customer.number} onChange={(e) => updateCustomer("number", e.target.value)} placeholder="Nº" required /></label><label className="field">Bairro<input autoComplete="address-level3" value={customer.neighborhood} onChange={(e) => updateCustomer("neighborhood", e.target.value)} placeholder="Seu bairro" required /></label><label className="field full">Complemento (opcional)<input value={customer.complement} onChange={(e) => updateCustomer("complement", e.target.value)} placeholder="Apto, casa, bloco..." /></label><label className="field full">Ponto de referência (opcional)<input value={customer.reference} onChange={(e) => updateCustomer("reference", e.target.value)} placeholder="Próximo a..." /></label><p className="address-note">Entrega em Formosa – GO. Taxa fixa de entrega: <strong>{brl(deliveryFee)}</strong>. A loja confirmará a cobertura do endereço informado.</p></div>}
            </div>
            <div className="checkout-block"><h3>Agende sua encomenda</h3><div className="form-grid"><label className="field">Data desejada<input type="date" min={today()} max={orderDeadline} value={customer.date} onChange={(e) => updateCustomer("date", e.target.value)} required /></label><label className="field">Horário desejado<input type="time" value={customer.time} onChange={(e) => updateCustomer("time", e.target.value)} required /></label></div><p className="field-hint">Prazo máximo para encomendas de Natal: <strong>{dateLimitLabel}</strong>. Escolha uma data até esse limite. A produção e o horário serão confirmados pela loja.</p>{deadlineReached && <p className="deadline-error">O prazo de encomendas para produção de Natal foi encerrado.</p>}{customer.date && customer.date > orderDeadline && <p className="deadline-error">Selecione uma data até {dateLimitLabel}.</p>}</div>
            <div className="checkout-block"><h3>Forma de pagamento</h3><div className="payment-options">{["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito"].map((method) => <button type="button" key={method} className={customer.payment === method ? "payment-option active" : "payment-option"} onClick={() => updateCustomer("payment", method)}><span className="payment-radio" />{method}</button>)}</div><p className="field-hint">O pagamento será combinado diretamente com a loja pelo WhatsApp.</p></div>
            <div className="checkout-block"><h3>🎁 É um presente?</h3><button type="button" className={`gift-toggle${customer.gift ? " on" : ""}`} aria-pressed={!!customer.gift} onClick={() => updateCustomer("gift", customer.gift ? "" : "1")}>{customer.gift ? "Sim, vai com cartão de Natal" : "Toque para enviar com cartão de Natal"}</button>{customer.gift && <><div className="form-grid"><label className="field full">Para quem?<input value={customer.giftTo} maxLength={40} onChange={(e) => updateCustomer("giftTo", e.target.value)} placeholder="Nome de quem vai receber" /></label><label className="field full">Mensagem do cartão<textarea rows={3} maxLength={160} value={customer.giftMsg} onChange={(e) => updateCustomer("giftMsg", e.target.value)} placeholder="Escreva um recado carinhoso..." /></label></div><div className="gift-card" aria-label="Prévia do cartão"><small>🎄 Cartão de Natal</small><strong>Para {customer.giftTo || "você"},</strong><p>{customer.giftMsg || "Sua mensagem aparece aqui."}</p><em>Com carinho, {customer.name.split(" ")[0] || "—"} · Doces da Chrys</em></div></>}</div>
            <div className="checkout-block"><h3>Alguma observação?</h3><label className="field"><span className="sr-only">Observações do pedido</span><textarea rows={3} value={customer.notes} onChange={(e) => updateCustomer("notes", e.target.value)} placeholder="Deixe aqui alguma informação importante..." /></label></div>
          </div>
          <div className="checkout-footer"><div className="checkout-total"><span>Produtos</span><strong>{brl(total)}</strong></div>{customer.fulfillment === "Entrega" && <div className="checkout-total"><span>Taxa de entrega</span><strong>{brl(deliveryFee)}</strong></div>}<div className="checkout-total grand-total"><span>Total do pedido</span><strong>{brl(finalTotal)}</strong></div><button className="whatsapp-submit" type="button" disabled={!cart.length || deadlineReached || !dateIsValid || !customer.name.trim() || !customer.phone.trim() || !customer.time || (customer.fulfillment === "Entrega" && (!customer.street.trim() || !customer.number.trim() || !customer.neighborhood.trim()))} onClick={sendOrder}><span>Enviar encomenda pelo WhatsApp</span><b>↗</b></button><small>Prazo de encomendas: até 24/12. Seu pedido será enviado para conferência e só estará confirmado após o retorno da loja.</small></div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>

    <footer><Bulbs /><p className="feliz">Feliz Natal! 🎄</p><p className="brand">Doces da Chrys</p><p>Av. Valeriano de Castro, nº 200 · St. Central, Formosa – GO, 73801-100<br /><strong>Tel: <a href="tel:+5561998474648">(61) 9-9847-4648</a></strong></p><p><strong>Observação:</strong> as imagens são meramente ilustrativas. Os produtos são servidos em travessas de acrílico.</p></footer>
  </div>;
}
