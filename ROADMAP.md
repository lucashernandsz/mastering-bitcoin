# Bitcoin Strategy Lab — Roadmap de Projeto e Aprendizado

> Um projeto para aprender TypeScript, React e Node.js (via Vercel) construindo algo real:
> uma ferramenta que compara estratégias de compra de Bitcoin contra o DCA (Dollar Cost
> Averaging) e compara taxas entre corretoras.

Este documento é o seu mapa. Ele explica **o que construir, em que ordem, e por que cada
decisão técnica é a decisão certa para quem está aprendendo**. Sempre que uma escolha de
arquitetura aparecer, vou justificar o porquê — não só "use X", mas "use X porque Y, e a
alternativa Z tem esse trade-off".

> ⚡ **Atualização: prazo de hoje, 5 horas.** As seções abaixo (1 em diante) descrevem a
> versão completa/ideal do projeto, para depois. O que você vai construir **hoje** é o
> "PLANO DE SPRINT" logo abaixo — uma versão cortada de propósito para caber no tempo,
> mantendo os dois recursos pedidos (backtest vs. DCA + comparador de exchanges) de pé,
> publicados, funcionando. Cortar escopo sob prazo é, em si, uma habilidade de engenharia
> — veja a seção "O que ficou de fora e por quê" para entender cada corte.

---

## 0. PLANO DE SPRINT — hoje, 5 horas (MVP)

Ambiente já pronto (Node + GitHub), então vamos direto ao ponto. Blocos de tempo — siga
na ordem, e se algum bloco estourar o tempo, corte primeiro o polimento, nunca o "está no
ar e funciona".

| Bloco | Tempo | Entrega |
|---|---|---|
| **0. Setup** | 15 min | Projeto Next.js criado, no GitHub, já com 1º deploy vazio na Vercel funcionando |
| **1. Motor DCA + dados de preço** | 45 min | Rota que busca histórico de BTC (com cache) + função pura `runBacktest` para DCA |
| **2. Backtest genérico (Strategy Pattern)** | 45 min | Motor generalizado + 1 estratégia extra ("compra na queda") |
| **3. Aba de Backtest (UI)** | 60 min | Formulário simples + gráfico comparando estratégia escolhida vs. DCA |
| **4. Aba de Exchanges (UI + API)** | 60 min | Busca preço em 2–3 exchanges + tabela de taxas fixa + ranking de custo efetivo |
| **5. Polimento + deploy final** | 30 min | Navegação entre abas, loading/erro básicos, confirmar deploy de produção |
| **Buffer** | 15 min | Absorver imprevistos (sempre vai ter um) |

Total: 270 min de trabalho + 30 min de buffer = 300 min (5h).

### O que ficou de fora hoje — e por quê (para você não achar que "esqueci")

Isto é **dívida técnica deliberada**: eu sei exatamente o que está sendo cortado e por
quê, o que é bem diferente de simplesmente não fazer. É a diferença entre "MVP com plano"
e "gambiarra".

- **TanStack Query → adiado, uso `fetch` + `useState`/`useEffect` puro.** A lib economiza
  código depois, mas tem custo de setup e de aprendizado agora. Hoje o ganho não compensa
  o tempo. Fica como próximo passo natural (ver roadmap completo, seção 3.4).
- **Estado da estratégia na URL → adiado.** É ótimo pra compartilhar link, mas não é
  essencial pra a ferramenta *funcionar* hoje. `useState` resolve.
- **Suite de testes com Vitest → reduzida a 1 teste de sanidade do DCA.** Testes valem
  muito, mas escrever a suíte completa custa tempo que hoje vale mais em ter as duas abas
  no ar. Vamos escrever o mínimo que garante que a matemática do DCA não está errada
  (é o único ponto onde um bug seria realmente grave).
- **Taxas de exchange via API → viram uma tabela fixa no código.** Na prática, a maioria
  das exchanges não expõe taxa de maker/taker por API pública de forma simples mesmo — só
  o preço (ticker) é público e fácil. Então buscamos o **preço ao vivo** via API, e
  combinamos com uma **tabela de fees mantida por você no código** (`lib/exchanges/fees.ts`).
  Isso não é "feio", é a modelagem correta do que realmente é dinâmico (preço) vs. o que é
  quase-estático (taxas mudam raramente).
- **RSI, médias móveis e estratégias mais sofisticadas → adiadas.** Uma estratégia extra
  além do DCA (ex: "compra na queda de X%") já prova o Strategy Pattern funcionando.
  Adicionar mais uma depois é só criar mais um arquivo — o motor não muda.

Se sobrar tempo em algum bloco, essas são as primeiras coisas a adicionar, nessa ordem.

---

## 1. O que o projeto faz (visão de produto)

Duas grandes áreas (abas):

1. **Backtest de Estratégias** — você escolhe uma estratégia de compra (ex: comprar toda
   sexta-feira, comprar quando o preço cai X% da máxima, comprar quando o RSI está baixo,
   comprar um valor fixo todo dia 5 do mês), define parâmetros (data inicial, valor por
   compra, frequência, condições), roda contra dados históricos reais de BTC, e vê o
   resultado: quanto BTC você teria acumulado, preço médio de compra, retorno total.
   **Essa estratégia é sempre comparada lado a lado com um DCA simples** (o baseline
   "ingênuo": compra o mesmo valor, sempre, sem tentar cronometrar o mercado).

2. **Comparador de Corretoras** — busca o preço do BTC em várias exchanges (Binance,
   Coinbase, Kraken, etc.) junto das taxas de cada uma (spread, taxa maker/taker, taxa
   fixa), e calcula o **custo efetivo** de comprar um valor X em cada corretora, ordenando
   da mais barata para a mais cara.

O motivo de eu descrever o produto antes da tecnologia: **em engenharia de software boa,
a arquitetura nasce dos requisitos, não o contrário.** Vamos usar esse projeto para você
sentir isso na prática — cada decisão técnica abaixo existe porque resolve um problema
real que o produto tem.

---

## 2. O que você vai aprender (e por que isso importa)

| Tema | Onde aparece no projeto | Por que é importante no mercado |
|---|---|---|
| TypeScript (tipos, interfaces, generics) | Modelar `PriceCandle`, `Strategy`, `Trade`, `Exchange` | Hoje é o padrão de fato em times de frontend/fullstack; evita bugs silenciosos |
| React (componentes, hooks, estado) | Formulários de estratégia, gráficos, abas | Base de praticamente todo frontend moderno |
| Server-side logic (API Routes / Route Handlers) | Buscar preços, calcular backtest no servidor | Ensina o modelo "serverless", como o backend moderno é entregue |
| Fetch de dados externos e cache | Preços históricos, preços de exchanges | Todo produto real depende de APIs de terceiros — rate limit, cache e resiliência são essenciais |
| Modelagem de domínio | Strategy Pattern para as estratégias de compra | Ensina abstração e polimorfismo de um jeito que faz sentido, não artificial |
| Testes automatizados | Motor de backtest (lógica pura) | Lógica financeira errada = bug caro; testes dão confiança |
| Deploy e CI/CD | Vercel + GitHub | Todo profissional precisa saber publicar e iterar com segurança |
| Estado derivado vs. estado guardado | Parâmetros de estratégia na URL | Um dos conceitos mais mal-entendidos em React júnior |

---

## 3. Arquitetura escolhida — e o porquê de cada peça

### 3.1 Next.js (App Router) + TypeScript, deploy na Vercel

**Decisão:** um único projeto Next.js, full-stack (frontend React + backend em Route
Handlers), hospedado na Vercel.

**Por quê, e não React puro + um servidor Express separado?**

- **Menos fricção operacional.** Com dois projetos separados você precisa rodar dois
  servidores localmente, resolver CORS entre eles, ter dois deploys, duas configurações de
  ambiente. Isso é *acidental complexity* — trabalho que não te ensina nada sobre o domínio
  do problema, só sobre "colar duas coisas". Para aprender, você quer *essential
  complexity*: os conceitos que realmente importam.
- **Vercel foi desenhada para Next.js** (mesma empresa). `git push` já vira deploy, cada
  Pull Request ganha uma URL de preview automática, variáveis de ambiente são geridas no
  painel. Isso te dá CI/CD de verdade sem você precisar configurar pipelines do zero —
  você aprende o *conceito* de deploy contínuo sem a dor de configurar o primeiro do
  zero (isso você faz depois, num projeto 2).
- **Route Handlers = funções serverless.** Cada arquivo `route.ts` dentro de `app/api/...`
  vira uma função que roda sob demanda, isolada, sem servidor "sempre ligado" para você
  gerenciar. É assim que boa parte do backend moderno é entregue (AWS Lambda, Cloudflare
  Workers, Vercel Functions) — você já sai aprendendo o modelo que o mercado usa.
- **Um único monorepo simples** também significa **um único lugar para tipos
  compartilhados**: o tipo `PriceCandle` que o backend produz é *o mesmo tipo* que o
  frontend consome. Isso elimina uma classe inteira de bugs de integração (o backend muda
  um campo, o frontend quebra em runtime) — o TypeScript te avisa em tempo de compilação.

**Trade-off honesto:** você está aprendendo o modelo "Next.js full-stack", que é opinativo
e específico da Vercel/Next. Mais pra frente, quando quiser aprender a desenhar um backend
"puro" (Express/Fastify, seu próprio servidor, sua própria infra), vale fazer um segundo
projeto assim de propósito. Mas para *este* projeto, o objetivo é aprender TS/React/Node
sem gastar energia em DevOps — então a escolha certa é a que reduz partes móveis.

### 3.2 TypeScript em tudo (não JavaScript)

**Por quê:** este projeto lida com **dinheiro e datas** — as duas categorias de bug mais
clássicas em software ("off-by-one" de data, string vs número em cálculo financeiro,
`undefined` passando despercebido). TypeScript não elimina bugs de lógica, mas elimina uma
categoria inteira de bugs de "tipo errado passou pra função errada", e isso é
particularmente valioso aqui: um `amount: string` que deveria ser `number` pode silenciosamente
fazer `"10" + "10"` virar `"1010"` em vez de `20`. Em JS puro isso só aparece rodando; em TS,
o editor recusa antes de você nem salvar o arquivo.

Você também vai aprender a **modelar o domínio com tipos** — isto é, usar `interface`/`type`
não como burocracia, mas como *documentação executável* do que uma estratégia, uma compra,
um candle de preço, realmente são.

### 3.3 De onde vêm os dados

- **Preços históricos do BTC** (para o backtest): APIs públicas como CoinGecko
  (`/coins/bitcoin/market_chart`) ou dados de candles da Binance (`/api/v3/klines`). Ambas
  têm limites de requisição.
- **Preços atuais + taxas por corretora** (para o comparador): endpoints públicos de cada
  exchange (ticker de preço) combinados com uma tabela de taxas que você mesmo vai manter
  (as taxas de maker/taker geralmente não vêm por API pública de forma simples — você vai
  documentar isso como dado semi-estático, o que é uma decisão de produto real, não uma
  limitação sua).

**Por que buscar esses dados no servidor (Route Handler) e não direto no componente
React do navegador?**

1. **CORS.** Muitas dessas APIs não liberam chamadas diretas do browser de qualquer
   origem. Fazendo a chamada no servidor, você contorna isso — o servidor não tem a
   mesma política de CORS que o navegador.
2. **Esconder e controlar.** Se um dia você usar uma API que exige chave secreta, essa
   chave *nunca* pode aparecer no código que roda no navegador (qualquer pessoa abre o
   DevTools e vê). No servidor, a chave fica em uma variável de ambiente que só a Vercel
   enxerga.
3. **Cache.** Se 100 pessoas abrirem seu site no mesmo minuto, você não quer fazer 100
   chamadas às APIs externas (vai bater rate limit rápido). Fazendo a busca no servidor,
   você pode cachear a resposta (o próprio Next.js tem cache de `fetch` embutido) e servir
   a mesma resposta pra todo mundo por alguns minutos.

Isso te ensina um padrão chamado **BFF — Backend for Frontend**: seu backend não é "a
fonte da verdade" dos dados (quem é a fonte são as exchanges), ele é uma camada fina que
agrega, protege e cacheia dados de terceiros para o frontend consumir de forma segura e
eficiente.

### 3.4 Estado no frontend: comece simples, evolua com propósito

- **`useState`/`useReducer`** para o formulário de configuração da estratégia (data
  inicial, frequência, valor). Comece aqui. Não pule direto para uma lib de estado
  global — você precisa sentir a dor real de "prop drilling" antes de entender por que
  uma lib resolveria algo.
- **Parâmetros da estratégia na URL (`useSearchParams`)**: em vez de guardar a
  configuração só em memória, guarde nos query params (`?estrategia=queda&limiar=10`).
  Isso ensina um conceito importante e subestimado: **a URL é estado**. Vantagens
  práticas: dá pra recarregar a página sem perder a configuração, dá pra *compartilhar
  um link* com uma estratégia específica já montada, e o botão "voltar" do navegador
  funciona naturalmente.
- **TanStack Query (React Query)** para os dados que vêm do servidor (preços, resultado
  do backtest). Por quê uma lib e não só `fetch` + `useEffect`? Porque ela resolve, de
  graça, problemas que você *vai* recriar mal na mão: cache no cliente, refetch
  automático, estado de loading/erro padronizado, evitar chamadas duplicadas. Vale a
  pena aprender a ferramenta certa desde cedo aqui — é praticamente padrão de mercado.

### 3.5 Gráficos: Recharts

Recharts é construído sobre React (componentes, não uma API imperativa separada), curva
de aprendizado baixa, e o suficiente pro que você precisa (linha de evolução do preço,
linha de patrimônio acumulado por estratégia vs. DCA, barras comparando preço efetivo por
corretora).

### 3.6 O motor de backtest: Strategy Pattern

Este é o coração do projeto e o melhor lugar pra aprender **abstração de verdade** (não
abstração por capricho — uma que resolve um problema concreto).

O problema: você vai ter várias estratégias (DCA puro, "compra na queda", RSI, dia fixo do
mês, value averaging...). Todas elas fazem a mesma pergunta fundamental: **"dado um
histórico de preços e um dia, eu compro hoje, e se sim, quanto?"** Só a *resposta* muda.

Isso pede uma interface comum:

```ts
interface PriceCandle {
  date: string;      // ISO date, ex: "2024-03-15"
  close: number;      // preço de fechamento em USD
}

interface Trade {
  date: string;
  amountUsd: number;
  priceUsd: number;
  btcBought: number;
}

interface Strategy {
  id: string;
  label: string;
  // decide, dia a dia, se e quanto comprar
  decide(context: {
    today: PriceCandle;
    history: PriceCandle[]; // candles até "hoje", inclusive
    trades: Trade[];        // compras já feitas até aqui
  }): { amountUsd: number } | null; // null = não compra hoje
}
```

O motor de backtest (`runBacktest`) não sabe nada sobre RSI, quedas ou dias fixos — ele só
sabe iterar candles no tempo e perguntar `strategy.decide(...)` a cada dia. Isso é o
**princípio aberto/fechado**: você adiciona uma estratégia nova criando um novo arquivo que
implementa `Strategy`, sem tocar no motor. É a mesma ideia por trás de "plugins" em
qualquer sistema grande.

E o DCA, nesse desenho, é só *mais uma implementação de `Strategy`* — o que é
tecnicamente elegante e também resolve o requisito de produto ("sempre comparar com o
DCA") de graça: você roda o motor duas vezes, uma com a estratégia escolhida, outra com a
estratégia DCA, usando exatamente o mesmo motor e os mesmos dados.

### 3.7 Testes automatizados (Vitest)

O motor de backtest é **lógica pura** (nenhuma chamada de rede, nenhum React) — o tipo de
código mais fácil e mais valioso de testar. Vamos escrever testes tipo:

- "com preço constante, DCA de $10/dia por 10 dias compra exatamente $100 de BTC"
- "estratégia 'compra na queda de 10%' não compra em mercado subindo direto"

Isso ensina a diferença entre **testar lógica de negócio** (barato, rápido, alto valor) e
**testar UI** (mais caro, mais frágil) — uma distinção que muita gente júnior não faz e
acaba testando a coisa errada.

### 3.8 Estrutura de pastas proposta

```
bitcoin-strategy-lab/
├── app/
│   ├── (backtest)/
│   │   └── page.tsx              # aba de backtest de estratégias
│   ├── exchanges/
│   │   └── page.tsx              # aba de comparação de corretoras
│   ├── api/
│   │   ├── prices/route.ts       # proxy + cache de preços históricos
│   │   ├── backtest/route.ts     # roda o motor de backtest no servidor
│   │   └── exchanges/route.ts    # busca preço+fees de cada exchange
│   └── layout.tsx
├── lib/
│   ├── strategies/
│   │   ├── types.ts              # interface Strategy, PriceCandle, Trade
│   │   ├── dca.ts
│   │   ├── buyTheDip.ts
│   │   └── index.ts              # registro de estratégias disponíveis
│   ├── backtest/
│   │   ├── runBacktest.ts        # motor, função pura
│   │   └── runBacktest.test.ts
│   ├── exchanges/
│   │   ├── types.ts              # Exchange, FeeStructure
│   │   ├── binance.ts
│   │   ├── coinbase.ts
│   │   └── compare.ts            # calcula custo efetivo por exchange
│   └── data/
│       └── fetchPriceHistory.ts  # client de API externa, com cache
├── components/
│   ├── StrategyForm.tsx
│   ├── ComparisonChart.tsx
│   └── ExchangeTable.tsx
└── ...
```

Por que separar `app/` (rotas/UI) de `lib/` (lógica de domínio)? Porque **lógica de
negócio não deveria depender de React**. Se `runBacktest` não importa nada de `react` ou
`next`, você pode testá-lo isoladamente, reusá-lo em outro contexto (um script, um cron
job), e entender exatamente o que ele faz sem precisar renderizar nada. Essa separação —
"núcleo de domínio" vs. "camada de interface" — é um dos princípios de arquitetura mais
reaproveitáveis que existem, independente de framework.

---

## 4. Roadmap por fases

Cada fase tem um objetivo, tarefas concretas, e os conceitos que ela ensina. Siga na
ordem — cada fase depende da anterior estar funcionando, o que é de propósito: você quer
sempre ter algo rodando de ponta a ponta (feio, mas funcionando) em vez de construir tudo
em paralelo e só "juntar as peças" no fim.

### Fase 0 — Setup
- `npx create-next-app@latest` com TypeScript, App Router, ESLint, Tailwind (opcional,
  mas acelera estilização e vale a pena aprender).
- Configurar Git + repositório no GitHub.
- Conectar o repositório à Vercel (deploy automático a cada push).
- **Aprende:** ferramentas de scaffold, estrutura padrão de um projeto Next.js, o que é
  CI/CD "de graça" via Vercel + GitHub.

### Fase 1 — Dados históricos de preço
- Criar `app/api/prices/route.ts` que busca histórico diário de BTC/USD numa API pública
  e retorna um JSON tipado (`PriceCandle[]`).
- Adicionar cache (`fetch(url, { next: { revalidate: 3600 } })` — cache de 1h).
- Página simples que chama essa rota e desenha um gráfico de linha do preço histórico.
- **Aprende:** Route Handlers, `fetch` no servidor, cache do Next.js, tipagem de resposta
  de API, primeiro gráfico com Recharts.

### Fase 2 — Motor de DCA (lógica pura, sem UI)
- Implementar `lib/strategies/dca.ts` e `lib/backtest/runBacktest.ts`.
- Escrever testes com Vitest antes/junto da implementação.
- Rodar via um script simples (`ts-node` ou teste) — **ainda sem UI**.
- **Aprende:** TypeScript "de verdade" (tipos de domínio), testes automatizados,
  desenvolvimento orientado por lógica antes de interface (você só constrói UI para algo
  que você já sabe que calcula certo).

### Fase 3 — Motor de backtest genérico + 2ª estratégia
- Generalizar o motor para aceitar qualquer `Strategy`.
- Implementar uma segunda estratégia (ex: "compra na queda de X% da máxima local").
- Rota `app/api/backtest/route.ts` que recebe parâmetros (estratégia, datas, valor) e
  devolve o resultado calculado no servidor.
- **Aprende:** Strategy Pattern, design de API (o que a rota recebe, o que devolve, como
  validar entrada), separar "cálculo" de "transporte".

### Fase 4 — UI de comparação (a aba principal)
- Formulário para escolher estratégia + parâmetros (`StrategyForm.tsx`).
- Estado do formulário sincronizado com a URL (`useSearchParams`/`useRouter`).
- Busca do resultado via TanStack Query, chamando `app/api/backtest`.
- Gráfico comparando patrimônio acumulado: estratégia escolhida vs. DCA.
- Estados de loading, erro e "sem dados" tratados explicitamente na UI.
- **Aprende:** formulários controlados em React, estado derivado da URL, data fetching no
  cliente com cache, *tratamento de estado assíncrono* (loading/error/success — um padrão
  que aparece em praticamente toda aplicação real).

### Fase 5 — Aba de comparação de exchanges
- `lib/exchanges/*`: um adaptador por exchange, cada um implementando uma interface comum
  (`fetchPrice(): Promise<{ price: number }>`), mais uma tabela de taxas.
- `app/api/exchanges/route.ts`: chama todos os adaptadores em paralelo (`Promise.allSettled`,
  não `Promise.all` — se uma exchange falhar, as outras ainda devem aparecer).
- `lib/exchanges/compare.ts`: dado um valor de compra, calcula o custo efetivo em cada
  exchange e ordena.
- Tabela/UI mostrando o ranking, com indicação clara se algum dado falhou ao carregar.
- **Aprende:** padrão *adapter* (normalizar respostas heterogêneas numa interface comum),
  `Promise.allSettled` vs `Promise.all` (resiliência a falha parcial), design de UI para
  estados de erro parcial — muito realista e muito subestimado por quem está aprendendo.

### Fase 6 — Cache, performance e resiliência
- Cache de servidor mais deliberado (revalidação por rota, `stale-while-revalidate`).
- Rate limiting básico nas suas próprias rotas, se fizer sentido.
- Skeletons de carregamento (`loading.tsx` do App Router) em vez de telas em branco.
- **Aprende:** `loading.tsx`/Suspense do App Router, estratégias de cache HTTP, o que
  "stale-while-revalidate" realmente significa e por que é tão usado.

### Fase 7 — Testes e qualidade
- Cobrir o motor de backtest e os adaptadores de exchange com testes unitários.
- (Opcional, avançado) Um teste de ponta a ponta com Playwright: "usuário escolhe
  estratégia, vê gráfico".
- **Aprende:** pirâmide de testes (muitos testes unitários rápidos, poucos testes E2E
  lentos), o que vale a pena testar e o que não vale.

### Fase 8 — Deploy final e variáveis de ambiente
- Revisar variáveis de ambiente na Vercel (se alguma API exigir chave).
- Testar o preview deployment de uma branch antes de ir pra produção.
- **Aprende:** fluxo real de deploy profissional — branch → preview → revisão → merge →
  produção.

### Fase 9 (bônus, se quiser continuar depois)
- Persistir estratégias salvas (banco de dados — ótimo próximo passo para aprender
  Postgres/Prisma ou um KV store).
- Autenticação (NextAuth) para salvar estratégias por usuário.
- PWA / notificações.

---

## 5. Conceitos-chave que vão aparecer (glossário de referência rápida)

- **SSR vs. CSR vs. cache estático:** onde o HTML/dado é gerado — no servidor a cada
  request, no navegador, ou uma vez e reaproveitado. Você vai ver os três no mesmo
  projeto (a página de preços pode ser cacheada; o resultado de um backtest customizado
  é calculado sob demanda).
- **Route Handler / função serverless:** um arquivo de backend que roda isolado, sob
  demanda, sem "servidor sempre ligado" pra você administrar.
- **BFF (Backend for Frontend):** uma camada de backend fina cujo único trabalho é
  atender bem o seu frontend — agregando, protegendo e cacheando chamadas a serviços
  externos.
- **Strategy Pattern:** trocar "o que fazer" por uma interface comum, permitindo plugar
  comportamentos novos sem alterar quem os usa.
- **Adapter Pattern:** normalizar respostas diferentes (cada exchange devolve um JSON
  diferente) para uma forma comum que o resto do sistema entende.
- **Estado derivado vs. estado guardado:** nem tudo precisa de `useState` — se um valor
  pode ser calculado a partir de outro (ou vem da URL), guardá-lo duas vezes é fonte de
  bugs de dessincronia.
- **`Promise.all` vs `Promise.allSettled`:** o primeiro falha tudo se uma promise falhar;
  o segundo deixa você lidar com sucessos e falhas individualmente — crucial quando você
  depende de várias APIs de terceiros que podem cair.

---

## 6. Como usar este roadmap no dia a dia

Sugestão de ritmo: uma fase por sessão de estudo (não precisa ser um dia — pode ser uma
tarde). Ao final de cada fase, pare e me peça pra revisar o código dessa fase antes de
seguir — vou te dar feedback e explicar qualquer coisa que não fez sentido, sempre
conectando com o "porquê" e não só o "como". Se travar em algum conceito no meio do
caminho, é melhor parar ali e entender do que seguir sem entender — este projeto existe
para ensinar, não para terminar rápido.

**Próximo passo sugerido:** Fase 0 — quer que eu te guie na criação do projeto Next.js
agora, explicando cada opção que o `create-next-app` pergunta?
