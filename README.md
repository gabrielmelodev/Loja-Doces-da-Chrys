# Doces da Chrys — aplicativo mobile-first

Projeto em Next.js com Tailwind CSS e Framer Motion, desenvolvido com foco principal em celulares. A experiência inclui navegação inferior confortável para o polegar, botões com áreas de toque maiores, imagens adaptadas à tela, suporte a áreas seguras de aparelhos com recorte e opção de instalação como aplicativo (PWA).

## Requisitos
- Node.js 20.9 ou superior

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador. Para testar a instalação PWA e o cache offline, use uma versão HTTPS publicada ou `localhost`.

## Gerar versão de produção

```bash
npm run build
npm start
```

## Instalar no celular

Publique o projeto em HTTPS. No Android, abra o endereço no Chrome e use **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

O service worker mantém as imagens do cardápio em cache para consultas posteriores. O envio do pedido pelo WhatsApp exige conexão com a internet.

## Controle de estoque, produção e prazo de encomendas

As configurações comerciais ficam em `public/config/controle-producao.json`. Consulte `CONTROLE-ESTOQUE-PRODUCAO.md` para editar prazo de encomendas (24/12/2026), taxa de entrega (R$ 10,00), preços, estoque por sabor e disponibilidade sem alterar o código da aplicação.

Após modificar esse JSON, publique/deploy novamente o projeto para que os clientes recebam a configuração atualizada. Os estoques iniciais de 20 unidades por sabor são valores de referência e devem ser ajustados pela loja para refletir a produção real.

**Limitação desta versão:** como os pedidos são encaminhados ao WhatsApp sem uma API/banco de dados de pedidos, o aplicativo não baixa estoque automaticamente nem coordena pedidos simultâneos. A loja deve atualizar o JSON após confirmar pedidos. Baixa automática e limite diário compartilhado exigem backend com banco de dados.

## Novidades desta versão

- **Neve interativa** (`app/components/snow-globe.tsx`): a neve foge do dedo/mouse, acompanha a inclinação do celular e voa quando ele é sacudido (no iPhone, o primeiro toque pede a permissão de movimento).
- **Contagem regressiva** (`countdown.tsx`) até o prazo definido em `public/config/controle-producao.json`.
- **Sommelier de sobremesas** (`sommelier.tsx`): 3 perguntas indicam o doce ideal e já adicionam ao carrinho.
- **Cartão de Natal para presente**: no checkout, o cliente escreve o recado, vê a prévia do cartão e a mensagem vai no pedido do WhatsApp.
"# Loja-Doces-da-Chrys" 
