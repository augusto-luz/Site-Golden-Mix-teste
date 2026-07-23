# Golden Mix Semijoias — Site Institucional

Site institucional/vitrine para a **Golden Mix Semijoias**, loja de semijoias banhadas a ouro em Manaus (AM). Como a marca ainda não tinha site, este projeto foi criado para apresentar a loja, as coleções e facilitar o contato via WhatsApp — sem depender de um sistema de e-commerce.

## ⚠️ Antes de tudo: como abrir este site corretamente

Este projeto tem **vários arquivos que dependem uns dos outros** (HTML + `style.css` + `main.js` + `logo.png`). Para funcionar, **todos precisam estar na mesma pasta**, exatamente como vieram no `.zip`.

**Não baixe os arquivos um por um pelo chat.** Se cada arquivo for salvo separadamente, o navegador perde a referência entre eles e o site abre "cru" (sem cor, sem layout, com links azuis sublinhados).

✅ Forma correta:
1. Baixe o arquivo `.zip` do projeto.
2. Extraia (descompacte) o `.zip` em uma pasta no seu computador.
3. Dentro da pasta extraída, dê duplo clique em `index.html`.

O site deve abrir já estilizado, com a paleta dourada, fontes e ícones.

```
golden-mix-site/
├── index.html            → Página inicial (home)
├── produtos.html         → Vitrine de coleções (filtro por categoria + peças do banco)
├── contato.html          → Loja física, mapa e formulário de contato
├── admin.html            → Painel administrativo (login + CRUD de peças)
├── admin.js              → Lógica do painel administrativo
├── style.css             → Todo o visual do site (cores, fontes, layout)
├── main.js               → Interações (menu mobile, FAQ, filtros, WhatsApp, vitrine dinâmica)
├── logo.png              → Logo oficial da marca (não foi alterada)
├── package.json          → Dependências (@vercel/postgres, pdfkit)
├── vercel.json           → Config extra da função do catálogo em PDF
├── .env.example          → Modelo das variáveis de ambiente necessárias
├── api/
│   ├── produtos.js       → API do catálogo de peças (GET público / POST, PUT, DELETE protegidos)
│   ├── banners.js        → API dos banners de imagem (GET público / PUT, DELETE protegidos)
│   ├── catalogo.js       → Gera o catálogo em PDF sob demanda (GET público)
│   └── login.js          → Valida a senha do painel administrativo
└── README.md              → Este arquivo
```

Todos os arquivos ficam **no mesmo nível de pasta** (sem subpastas) de propósito — isso reduz a chance de algo quebrar ao mover, hospedar ou compartilhar o projeto.

## 🎨 Identidade visual

- **Cores**: extraídas por amostragem direta da logo (tons de ouro champanhe a bronze sobre marfim). Estão centralizadas como variáveis no topo do `style.css` (`:root { --gold: ...; --ink: ...; }`), então dá para ajustar o tom em um lugar só.
- **Tipografia**: Cormorant Garamond (títulos, elegante e serifada) + Jost (textos, limpa e moderna), carregadas via Google Fonts.
- **Motivo visual**: a forma oval do brasão da logo se repete em botões, molduras de categoria e cards de produto, para dar unidade ao site.
- **Ilustrações de joias**: como a loja ainda não tinha fotos de produto em alta qualidade para o site, as peças (anéis, colares, brincos, pulseiras, conjuntos, pingentes) foram representadas com **ilustrações lineares em dourado**, no mesmo espírito do logotipo. Quando houver fotos reais das peças, recomendo substituí-las (veja abaixo).

## ✏️ O que você precisa revisar e ajustar antes de publicar

| Item | Onde está | O que fazer |
|---|---|---|
| **Número de WhatsApp** | `main.js`, linha `var WHATSAPP_NUMBER = '5592000000000';` | Troque pelo número real da loja, no formato `55` + DDD + número (só números, sem espaços/símbolos). |
| **Preços e nomes de produtos** | `index.html` e `produtos.html` (seções de produtos) | Os valores e nomes de peças são **exemplos ilustrativos** para mostrar a estrutura da vitrine — substitua pelo catálogo real. |
| **Fotos dos produtos** | Cards de produto em `index.html` / `produtos.html` | Hoje usam ilustrações em SVG. Para usar fotos reais, troque o bloco `<div class="product-art">...</div>` por `<img src="fotos/nome-da-peca.jpg" alt="...">` e ajuste o CSS `.product-art img { width:100%; height:100%; object-fit:cover; border-radius:50%/46%; }`. |
| **Endereço e horário** | Aparecem em `index.html`, `produtos.html` e `contato.html` (topo, rodapé e seção "Sobre"/"Contato") | Já atualizados para: R. Paxiúbas, 99 - Dom Pedro, Manaus - AM, 69040-330 / Seg-Sex 09h-18h, Sáb 09h-15h. Se mudar de novo, atualize nos três arquivos. |
| **Instagram** | Links `https://www.instagram.com/goldenmixsemijoias/` | Confirme se o @ está correto — não tive acesso direto ao perfil para validar automaticamente. |
| **Mapa** (`contato.html`) | `<iframe src="https://www.google.com/maps?q=...">` | Já está usando o endereço corrigido. Funciona automaticamente com internet — não precisa de chave de API. |

## 📱 Responsividade

O site foi revisado para funcionar bem em celular, tablet/iPad e desktop, incluindo a correção de alguns bugs que atrapalhavam a experiência mobile:
- O botão de menu (☰) no celular estava caindo na posição errada do cabeçalho por causa de um problema no grid do header — corrigido.
- O botão "Comprar no WhatsApp" dos cards de produto podia estourar a lateral do card em telas pequenas — agora o texto quebra linha corretamente e, em telas muito estreitas, a vitrine passa para 1 coluna.
- Barra superior, tira de confiança ("Banhado a ouro", "Qualidade garantida"...) e grade do Instagram se reorganizam em telas pequenas para não ficar apertado.
- Painel admin: cabeçalho, formulários e grades de banners se ajustam em telas estreitas.

## 🔗 Link da peça na mensagem do WhatsApp

Ao clicar em "Comprar no WhatsApp" em qualquer peça (vitrine ou destaques da home), a mensagem enviada para a loja agora inclui, além do nome da peça, um link direto para ela no site. Ao abrir esse link, a página rola automaticamente até a peça e ela pisca uma borda dourada por alguns segundos — assim o vendedor já vê exatamente qual peça o cliente quer, com foto e preço, sem precisar perguntar de novo.

## 🆕 Categoria "Broches"

Adicionei Broches como uma sétima categoria, com a mesma configuração das demais: opção no formulário do admin, chip de filtro e cards de exemplo em `produtos.html`, item na grade "Encontre a peça perfeita" e na lista "Coleções" do rodapé (nas 3 páginas), ícone próprio no sprite SVG, e presente nos agrupamentos/seletores do painel admin.

## 📄 Catálogo em PDF

Criei um catálogo em PDF gerado **na hora** (não é um arquivo fixo que fica desatualizado) a partir das peças cadastradas no banco:

- **Endpoint:** `/api/catalogo` — busca os produtos, monta o PDF com a paleta dourada/creme do site e o logo real da marca, e devolve pronto.
- **Por categoria ou tudo:** `/api/catalogo?categoria=aneis` filtra só a categoria; sem esse parâmetro, traz todas as peças.
- **Link de acesso ou download:** abrir a URL normalmente mostra o PDF no navegador (dá pra copiar e compartilhar esse link); adicionando `&download=1` força o download direto.
- **Onde usar no site:**
  - Em `produtos.html`, o botão "Baixar catálogo em PDF" (acima da vitrine) já respeita o filtro de categoria ativo no momento.
  - No admin, a seção **"Catálogo em PDF"** deixa escolher a categoria e tem botões "Visualizar PDF", "Baixar PDF" e "Copiar link" — ideal para mandar pro cliente no WhatsApp.
- Como o PDF é sempre gerado a partir do banco, ele nunca fica desatualizado: assim que você cadastra ou edita uma peça no admin, o próximo catálogo gerado já reflete a mudança.

**Detalhes técnicos que vale saber:**
- A geração usa a biblioteca `pdfkit` (adicionada ao `package.json`) e roda como função serverless — não precisa de nenhuma configuração extra além do deploy normal na Vercel.
- As fontes do PDF são as fontes padrão embutidas no gerador (uma serifada e uma sem serifa, no mesmo espírito da Cormorant Garamond + Jost do site), já que não é possível embutir arquivos de fonte de terceiros sem aumentar a complexidade do projeto. As cores, o logo e a estrutura visual seguem fielmente a identidade da Golden Mix.
- Cada foto de produto é baixada da URL cadastrada para entrar no PDF; se alguma imagem falhar ao carregar (link quebrado, fora do ar), o card do catálogo mostra a moldura oval lisa no lugar, sem quebrar a geração do restante do catálogo.
- Para catálogos com muitas peças (dezenas de fotos), o tempo de geração pode chegar perto do limite de 10 segundos do plano Hobby da Vercel; se isso acontecer, vale considerar o plano Pro ou otimizar o tamanho das fotos hospedadas.

## 🗂️ Peças agrupadas por categoria no admin

Para a lista de peças cadastradas não ficar comprida, o painel agora agrupa os produtos por categoria em blocos recolhíveis (clique no nome da categoria para abrir/fechar) e tem um campo de busca por nome no topo da lista.

## 📸 Fotos por produto

Cada peça no painel admin agora aceita **3 fotos**: uma capa (obrigatória) e duas fotos extras opcionais. Na vitrine (`produtos.html`), quando um produto tem mais de uma foto, aparecem pontinhos pequenos abaixo da imagem para o cliente trocar de foto sem sair do card — sem alterar o formato/moldura já usados no design.

> Se você já tinha produtos cadastrados antes dessa atualização, não precisa fazer nada: ao acessar `/api/produtos` pela primeira vez após o deploy, as novas colunas de foto são criadas automaticamente no banco, e as peças antigas continuam funcionando normalmente (só com 1 foto até você editar e adicionar as outras).

## 🗄️ Catálogo dinâmico (Vercel + Neon/Postgres)

O site agora tem um painel administrativo (`admin.html`) que salva as peças em um banco de dados Postgres (Neon), e a vitrine (`produtos.html`) busca essas peças automaticamente. Isso é feito por duas funções serverless em `/api`:

```
api/
├── produtos.js   → GET (público) / POST, PUT, DELETE (protegidos por senha)
├── banners.js    → GET (público) / PUT, DELETE (protegidos por senha)
└── login.js      → valida a senha do painel administrativo
```

### 🖼️ Banners de imagem (hero, promo, sobre e favoritos)

Além do catálogo, o painel admin tem uma seção **"Banners do site"** para colocar fotos reais nos espaços que hoje usam ilustrações/ícones dourados na home (`index.html`):

| Slot | Onde aparece |
|---|---|
| `hero` | Oval do topo da página inicial |
| `promo` | Banner "Coleção Conjuntos" |
| `about` | Oval da seção "Sobre a Golden Mix" |
| `favorito-1` a `favorito-4` | Os 4 cards de "Os favoritos da nossa loja" |

Os 4 cards de "favoritos" têm edição completa: além da imagem, dá para editar **título, categoria e preço** direto no painel — não precisa mexer no HTML.

Cada slot tem um **formato fixo** (o mesmo oval, retângulo ou moldura já usados no design) — trocar a imagem não altera cor, fonte, tamanho ou layout, só substitui o ícone pela foto. Se nenhuma imagem for cadastrada, o ícone padrão continua aparecendo normalmente.

### Passo a passo para publicar com banco de dados

1. **Suba o projeto para um repositório no GitHub** (ou importe a pasta direto na Vercel).
2. **Crie um projeto na [Vercel](https://vercel.com/)** apontando para esse repositório.
3. **Conecte um banco Neon**: no painel do projeto na Vercel, vá em **Storage → Create Database → Postgres (powered by Neon)** e conecte ao projeto. Isso cria automaticamente a variável de ambiente `POSTGRES_URL` usada em `api/produtos.js`.
4. **Configure a senha do admin**: em **Settings → Environment Variables**, adicione:
   - `ADMIN_PASSWORD` → a senha que você quer usar para entrar em `admin.html`.
5. **Faça o deploy.** A primeira vez que `/api/produtos` for chamado, a tabela `produtos` é criada automaticamente no banco (não precisa rodar nenhum script manual).
6. Acesse `seusite.vercel.app/admin.html`, faça login com a senha configurada e cadastre as peças.

> ⚠️ Sem as variáveis `POSTGRES_URL` e `ADMIN_PASSWORD` configuradas na Vercel, o painel admin e a vitrine dinâmica não funcionam — a API retorna erro explicando qual variável está faltando.

### 🔒 Sobre a senha do painel

- A senha fica guardada **apenas no servidor** (variável de ambiente `ADMIN_PASSWORD`), nunca no código.
- No navegador, ela fica em `sessionStorage` só enquanto a aba estiver aberta (some ao fechar a aba) e é reenviada em cada operação de salvar/editar/excluir, que o servidor confere novamente a cada chamada.
- Para trocar a senha, basta atualizar `ADMIN_PASSWORD` nas variáveis de ambiente da Vercel e fazer um novo deploy (ou apenas reiniciar as funções).

### Rodando localmente (opcional, para testar antes do deploy)

```bash
npm install -g vercel
vercel dev
```

A CLI vai pedir para linkar o projeto e vai puxar as variáveis de ambiente configuradas na Vercel (ou você pode criar um `.env` local com base no `.env.example`).

## 🚀 Como publicar o site na internet

O site é hospedado na **Vercel**, que serve os arquivos estáticos (`index.html`, `produtos.html`, etc.) e as funções serverless de `/api` juntas, sem precisar de servidor próprio:

1. Suba os arquivos para um repositório no GitHub.
2. Importe o repositório em [vercel.com/new](https://vercel.com/new).
3. Siga o passo a passo da seção **"Catálogo dinâmico"** acima para conectar o banco Neon e configurar a senha do admin.
4. Clique em **Deploy**.

> Se você só quiser publicar a parte visual do site (sem o CRUD dinâmico), qualquer hospedagem estática funciona (Hostinger, Netlify, GitHub Pages) — mas aí o painel `admin.html` e o carregamento automático de produtos não terão efeito, e a vitrine mostrará apenas as peças de exemplo já escritas no HTML.

## 🧩 Funcionalidades incluídas

- Menu responsivo (com versão mobile em hamburguer).
- Vitrine de produtos com filtro por categoria (`produtos.html`).
- Perguntas frequentes em acordeão (`index.html`).
- Botões "Comprar no WhatsApp" que abrem o WhatsApp com uma mensagem pronta, já citando a peça de interesse.
- Formulário de contato (`contato.html`) que monta a mensagem e abre o WhatsApp — não depende de servidor de e-mail.
- Mapa incorporado com o endereço da loja.

## 🛠 Possíveis próximos passos

- Substituir as ilustrações de produto por fotos reais das peças.
- Criar páginas individuais de produto, se o catálogo crescer.
- Integrar um catálogo dinâmico (ex: planilha ou pequeno CMS) caso o número de peças aumente muito.
- Adicionar avaliações reais de clientes (Google/Instagram) quando houver um volume representativo.

---

Desenvolvido como vitrine digital para a Golden Mix Semijoias — Manaus/AM.
