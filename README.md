[README.md](https://github.com/user-attachments/files/31870116/README.md)
# 🔐 Painel Admin — Murillo Brinquedos

Painel administrativo para gerenciar as reservas feitas no [Sistema de Reservas Pula-Pula](../Projeto-pula-pula-main), com controle de pagamentos, edição manual de valores e gráfico de lucro mensal.

## Funcionalidades

- **Login simples** por senha para acessar o painel.
- **Listagem de reservas** em tempo real (via Firebase), com data da festa, cliente, contato direto no WhatsApp, brinquedo, valor e frete.
- **Filtro por mês da festa**.
- **Cartões de resumo**: total no mês, total recebido, total a receber e lucro (total − frete).
- **Controle de pagamento**: marcar reserva como PAGO/PENDENTE com um clique.
- **Edição manual de valores**: botão ✏️ em cada linha permite corrigir o valor total e o frete de qualquer reserva diretamente no painel.
- **Exclusão de reservas**.
- **Gráfico de lucro por mês** (Chart.js), com filtro para exibir:
  - Somente o lucro (total − frete);
  - Somente o total de frete;
  - Ambos lado a lado.

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks/build step).
- [Firebase Realtime Database](https://firebase.google.com/docs/database) para ler/atualizar as reservas.
- [Chart.js](https://www.chartjs.org/) (via CDN) para o gráfico de lucro.

## Estrutura

```
administrador-pula-pula-main/
└── index.html   # painel completo (HTML + CSS + JS)
```

## Como usar

1. Abra o `index.html` em um navegador ou hospede em um serviço de páginas estáticas (GitHub Pages, Netlify, Vercel etc.).
2. As credenciais do Firebase já estão configuradas e apontam para o **mesmo banco de dados** usado pelo site de reservas do cliente — por isso os dois projetos precisam usar o mesmo `firebaseConfig`.
3. **Senha padrão de acesso**: `123` (definida na função `logar()`). Altere antes de publicar o projeto em produção.

> ⚠️ **Atenção de segurança**: a senha e as credenciais do Firebase ficam expostas no código-fonte (front-end puro). Isso é aceitável para uso interno/pessoal, mas não protege os dados de alguém com conhecimento técnico. Para um cenário mais seguro, considere configurar regras de segurança no Firebase (Firebase Rules) restringindo leitura/escrita, e/ou mover a autenticação para o Firebase Authentication.

## Cálculo do lucro

O lucro exibido nos cartões e no gráfico é calculado como:

```
lucro = valorTotal - frete
```

Esses dois valores vêm de cada registro salvo no nó `reservas` do Firebase (ver modelo de dados no README do [site de reservas](../Projeto-pula-pula-main)).

> **Reservas antigas**: registros criados antes da adição do campo `frete` não têm esse valor salvo e serão tratados como frete `R$ 0,00` nos cálculos e no gráfico. Use o botão de edição (✏️) para corrigir manualmente essas reservas, se necessário.

## Personalização

- **Senha de acesso**: altere a string `"123"` dentro da função `logar()`.
- **Meses/filtros**: as opções do filtro de mês estão no `<select id="filtro-mes">`.
- **Cores e estilo**: todo o CSS está no `<style>` no topo do arquivo.

## Projeto relacionado

- [Sistema de Reservas (site do cliente)](../Projeto-pula-pula-main) — onde as reservas são criadas e o campo `frete` é gerado.
