# Controle de estoque e produção — Doces da Chrys

O arquivo que controla as opções exibidas no aplicativo é:

`public/config/controle-producao.json`

Ele pode ser editado sem alterar os componentes ou o código da aplicação. Depois de salvar a alteração no projeto e publicar a nova versão, o aplicativo carrega os novos valores.

## O que pode ser alterado

- `prazoEncomendas`: último dia para aceitar encomendas (formato `AAAA-MM-DD`). Está configurado para **24/12/2026**.
- `taxaEntrega`: valor cobrado quando o cliente seleciona entrega. Está configurado em **R$ 10,00**. Para retirada, a taxa é automaticamente zerada.
- `entregaAtiva`: permite manter a opção de entrega ativa ou desativá-la no controle da loja.
- `controleProducao.capacidadeDiaria`: campo de referência para a capacidade planejada da produção.
- `produtos`: preços P/G, quantidade de estoque e disponibilidade de cada sabor.

## Como ajustar estoque e disponibilidade

Os números iniciais de 20 unidades por sabor são apenas valores de referência para configurar o projeto; substitua-os pelo estoque/capacidade real antes de divulgar o aplicativo.

Exemplo de um sabor:

```json
"Limão": { "estoque": 8, "ativo": true }
```

- Para informar que restam 8 unidades, altere `estoque` para `8`.
- Para esgotar o sabor, altere `estoque` para `0`.
- Para ocultar temporariamente a venda, altere `ativo` para `false`.
- Para reabrir, use `ativo: true` e informe o estoque disponível.

Os preços também podem ser alterados diretamente nos campos `P` e `G` de cada categoria.

## Atenção sobre estoque compartilhado

Como esta versão envia pedidos pelo WhatsApp e ainda não possui banco de dados/API de pedidos, o estoque do JSON é um controle publicado pela loja: ele limita o que o aplicativo oferece, mas não baixa unidades automaticamente nem sincroniza reservas simultâneas entre celulares. Após confirmar um pedido no WhatsApp, a loja deve atualizar o estoque neste arquivo e publicar a alteração. Para baixa automática e capacidade diária compartilhada, será necessário integrar um painel administrativo com banco de dados.

## Publicação da alteração

1. Abra `public/config/controle-producao.json` no editor ou no GitHub.
2. Altere somente os valores necessários, mantendo as aspas, vírgulas e chaves do JSON.
3. Salve e publique/deploy novamente o projeto.
4. Abra o aplicativo e confira os novos valores.

Não remova as chaves nem altere os nomes dos sabores sem atualizar também o cadastro do cardápio.
