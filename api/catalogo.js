// api/catalogo.js
// Gera um catálogo em PDF das peças já cadastradas, na hora, sempre atualizado
// com o banco de dados — sem depender de arquivo estático que fica desatualizado.
//
// GET /api/catalogo                       -> catálogo com todas as peças
// GET /api/catalogo?categoria=aneis        -> catálogo só da categoria (aneis, colares,
//                                             brincos, pulseiras, conjuntos, pingentes, broches)
// GET /api/catalogo?download=1             -> força o download em vez de abrir no navegador
//
// A própria URL funciona como "link de acesso": quem abrir vê/baixa o PDF direto,
// sem precisar de senha (é um catálogo de vitrine, pensado para ser compartilhado).

const { sql } = require('@vercel/postgres');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
<<<<<<< HEAD
=======
const { aplicarRateLimit, validarUrlImagemSegura, primeiroValor } = require('./_lib/security');
>>>>>>> d70e05d (backup de segurança pentest)

// Carregado com rede de segurança: se o sharp não conseguir carregar por algum motivo
// específico do ambiente de deploy, o catálogo continua sendo gerado normalmente,
// só sem as fotos (em vez de o endpoint inteiro quebrar com erro 500).
let sharp = null;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Não foi possível carregar o módulo sharp — o catálogo será gerado sem fotos:', e && e.message);
}

const CORES = {
  creamHeader: '#efeee6',
  cream: '#f8f3e9',
  creamDeep: '#ecdfc2',
  goldLight: '#efd89b',
  gold: '#c9a24d',
  goldDeep: '#8a5e22',
  ink: '#241b12',
  inkSoft: '#5c5040',
  white: '#fffdf8'
};

const CATEGORIA_LABELS = {
  aneis: 'Anéis', colares: 'Colares', brincos: 'Brincos',
  pulseiras: 'Pulseiras', conjuntos: 'Conjuntos', pingentes: 'Pingentes',
  broches: 'Broches'
};

const WHATSAPP = '5592984602401';

// Fontes padrão do PDF (embutidas no próprio pdfkit, sem precisar de arquivo externo).
// FONT_DISPLAY* fazem o papel da fonte serifada de destaque do site (Cormorant Garamond);
// FONT_BODY* fazem o papel da fonte sem serifa dos textos (Jost).
const FONT_DISPLAY = 'Times-Bold';
const FONT_DISPLAY_REG = 'Times-Roman';
const FONT_BODY = 'Helvetica';
const FONT_BODY_BOLD = 'Helvetica-Bold';

// Muitos anúncios do Mercado Livre (e de outros marketplaces) bloqueiam pedidos de
// imagem que não pareçam vir de um navegador de verdade, e costumam servir WebP por
// padrão (que o pdfkit não sabe ler sozinho). Por isso simulamos um navegador aqui
// e sempre convertemos a imagem baixada para PNG antes de colocar no PDF.
const HEADERS_IMAGEM = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Referer': 'https://www.mercadolivre.com.br/'
};

// Limite de tempo total dedicado a baixar/converter fotos, para sobrar tempo de
// gerar o PDF em si dentro do limite de execução da função serverless.
const ORCAMENTO_TEMPO_IMAGENS_MS = 7000;
// Quantas fotos baixamos ao mesmo tempo (evita sobrecarregar a função e o servidor de origem).
const CONCORRENCIA_IMAGENS = 12;

async function buscarProdutos(categoria) {
  if (categoria && categoria !== 'todos') {
    const { rows } = await sql`SELECT * FROM produtos WHERE categoria = ${categoria} ORDER BY categoria, nome;`;
    return rows;
  }
  const { rows } = await sql`SELECT * FROM produtos ORDER BY categoria, nome;`;
  return rows;
}

async function baixarEConverterImagem(url, larguraPx, alturaPx) {
  if (!url || !sharp) return null;
  try {
<<<<<<< HEAD
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resposta = await fetch(url, { signal: controller.signal, headers: HEADERS_IMAGEM });
    clearTimeout(timeout);
    if (!resposta.ok) return null;

    const bufOriginal = Buffer.from(await resposta.arrayBuffer());
=======
    // Proteção contra SSRF: só baixa de http(s) público, nunca de IPs internos/privados
    // (isso impede que um link de imagem seja usado para o servidor "espiar" a rede
    // interna da Vercel/Neon, mesmo que esse link tenha vindo de um cadastro no admin).
    const urlSegura = await validarUrlImagemSegura(url);
    if (!urlSegura) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const resposta = await fetch(urlSegura, { signal: controller.signal, headers: HEADERS_IMAGEM, redirect: 'follow' });
    clearTimeout(timeout);
    if (!resposta.ok) return null;

    // Limite de tamanho por foto (12MB) — evita que uma imagem enorme (ou uma resposta
    // maliciosa) consuma memória demais da função serverless.
    const LIMITE_BYTES = 12 * 1024 * 1024;
    const tamanhoInformado = parseInt(resposta.headers.get('content-length') || '0', 10);
    if (tamanhoInformado && tamanhoInformado > LIMITE_BYTES) return null;

    const bufOriginal = Buffer.from(await resposta.arrayBuffer());
    if (bufOriginal.length > LIMITE_BYTES) return null;

>>>>>>> d70e05d (backup de segurança pentest)
    // Converte qualquer formato (WebP, AVIF, JPG, PNG...) para PNG. Usamos "contain"
    // (não "cover") para a peça inteira sempre aparecer, sem cortar nenhuma parte —
    // o espaço sobrando fica transparente, revelando o fundo oval creme já desenhado
    // atrás da foto no card, então não aparece nenhuma borda/caixa estranha.
    const bufPng = await sharp(bufOriginal)
      .rotate()
      .resize(larguraPx, alturaPx, {
        fit: 'contain',
        position: 'centre',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    return bufPng;
  } catch (err) {
    return null; // sem imagem: o card usa o fundo oval liso como no site
  }
}

// Baixa as imagens em lotes (em vez de todas de uma vez) e para de tentar novas
// assim que o orçamento de tempo acabar, devolvendo null para o restante — assim
// o catálogo sempre termina de gerar, mesmo que algumas fotos não deem tempo.
async function baixarImagensEmLotes(produtos, larguraPx, alturaPx) {
  const resultado = new Array(produtos.length).fill(null);
  const inicio = Date.now();
  let indice = 0;

  async function worker() {
    while (indice < produtos.length) {
      if (Date.now() - inicio > ORCAMENTO_TEMPO_IMAGENS_MS) return;
      const meuIndice = indice++;
      resultado[meuIndice] = await baixarEConverterImagem(produtos[meuIndice].imagem_url, larguraPx, alturaPx);
    }
  }

  const workers = [];
  for (let i = 0; i < CONCORRENCIA_IMAGENS; i++) workers.push(worker());
  await Promise.all(workers);
  return resultado;
}

function formatarPreco(preco) {
  return 'R$ ' + parseFloat(preco).toFixed(2).replace('.', ',');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

<<<<<<< HEAD
  try {
    const categoria = (req.query.categoria || '').trim().toLowerCase();
    const forcarDownload = req.query.download === '1';
=======
  // Este endpoint é público e caro (baixa fotos, gera PDF na hora) — limitamos para
  // evitar que alguém o use pra sobrecarregar a função ou estourar o uso na Vercel/Neon.
  if (aplicarRateLimit(req, res, { chave: 'catalogo', maxTentativas: 10, janelaMs: 60 * 1000 })) {
    return;
  }

  try {
    const categoria = primeiroValor(req.query.categoria).trim().toLowerCase().slice(0, 50);
    const forcarDownload = primeiroValor(req.query.download) === '1';
>>>>>>> d70e05d (backup de segurança pentest)

    const produtos = await buscarProdutos(categoria);
    const tituloCategoria = categoria && categoria !== 'todos'
      ? (CATEGORIA_LABELS[categoria] || (categoria.charAt(0).toUpperCase() + categoria.slice(1)))
      : 'Todas as coleções';

    const nomeArquivo = 'catalogo-golden-mix' + (categoria && categoria !== 'todos' ? '-' + categoria : '') + '.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', (forcarDownload ? 'attachment' : 'inline') + '; filename="' + nomeArquivo + '"');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 200;

    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false });
    doc.pipe(res);

    // ---------------- GRADE: medidas fixas (usadas tanto no recorte das fotos quanto no desenho) ----------------
    const margin = 40;
    const cols = 3;
    const gap = 16;
    const pageWidthA4 = 595.28; // A4 em pt — usado só para pré-calcular o recorte das imagens antes de abrir a página
    const cardW = (pageWidthA4 - margin * 2 - gap * (cols - 1)) / cols;
    const cardH = 210;
    const rowGap = 20;
    const topStart = 100;

    const imgAreaH = 112;
    const rx = cardW / 2 - 16;
    const ry = imgAreaH / 2;
    // Resolução 2x para as fotos saírem nítidas na impressão/zoom, não só na tela.
    const larguraPx = Math.round(rx * 2 * 2);
    const alturaPx = Math.round(ry * 2 * 2);

    // Baixa e converte todas as fotos antes de desenhar (em lotes, com orçamento de tempo).
    const buffersImagens = (produtos.length && sharp) ? await baixarImagensEmLotes(produtos, larguraPx, alturaPx) : [];

    // ---------------- CAPA ----------------
    doc.addPage({ size: 'A4', margin: 0 });
    const W = doc.page.width, H = doc.page.height;

    // Fundo claro igual ao do cabeçalho do site — é a mesma cor de fundo do logo.png,
    // então a logo se encaixa sem nenhuma "caixa" aparecendo atrás dela.
    doc.rect(0, 0, W, H).fill(CORES.creamHeader);
    doc.roundedRect(24, 24, W - 48, H - 48, 2).lineWidth(1).stroke(CORES.gold);

    const logoPath = path.join(process.cwd(), 'logo.png');
    try {
      if (fs.existsSync(logoPath)) {
        const logoSize = 190;
        doc.image(logoPath, W / 2 - logoSize / 2, 118, { width: logoSize, height: logoSize });
      }
    } catch (e) { /* segue sem logo se der algum erro de leitura */ }

    doc.fillColor(CORES.ink).font(FONT_DISPLAY).fontSize(30);
    doc.text('GOLDEN MIX', 0, 330, { align: 'center' });
    doc.fillColor(CORES.goldDeep).font(FONT_DISPLAY_REG).fontSize(14);
    doc.text('S E M I J O I A S', 0, 368, { align: 'center' });

    doc.moveTo(W / 2 - 60, 400).lineTo(W / 2 + 60, 400).lineWidth(1).stroke(CORES.goldDeep);

    doc.fillColor(CORES.goldDeep).font(FONT_BODY).fontSize(12);
    doc.text('C A T Á L O G O   D I G I T A L', 0, 434, { align: 'center' });
    doc.fillColor(CORES.inkSoft).font(FONT_BODY).fontSize(10);
    doc.text(tituloCategoria, 0, 454, { align: 'center' });

    doc.fillColor(CORES.inkSoft).font(FONT_BODY).fontSize(9);
    doc.text('Gerado em ' + new Date().toLocaleDateString('pt-BR') + '  ·  ' + produtos.length + ' peça' + (produtos.length !== 1 ? 's' : ''), 0, 474, { align: 'center' });

    doc.fillColor(CORES.goldDeep).font(FONT_BODY).fontSize(9);
    doc.text('goldenmixsemijoias  ·  Manaus/AM  ·  wa.me/' + WHATSAPP, 0, H - 60, { align: 'center' });

    // ---------------- SEM PRODUTOS ----------------
    if (!produtos.length) {
      doc.addPage({ size: 'A4', margin: 0 });
      doc.rect(0, 0, W, H).fill(CORES.cream);
      doc.fillColor(CORES.inkSoft).font(FONT_BODY).fontSize(13);
      doc.text('Nenhuma peça cadastrada nesta categoria no momento.', 60, 120, { width: W - 120, align: 'center' });
      finalizarComRodape(doc, W, H);
      doc.end();
      return;
    }

    // ---------------- GRADE DE PRODUTOS ----------------
    const bottomLimit = H - 55;
    let x = margin, y = topStart, col = 0;

    function novaPaginaGrade() {
      doc.addPage({ size: 'A4', margin: 0 });
      doc.rect(0, 0, W, H).fill(CORES.cream);
      doc.fillColor(CORES.ink).font(FONT_DISPLAY).fontSize(17);
      doc.text('Golden Mix Semijoias', margin, 38);
      doc.fillColor(CORES.goldDeep).font(FONT_BODY).fontSize(10);
      doc.text(tituloCategoria.toUpperCase(), margin, 44, { width: W - margin * 2, align: 'right' });
      doc.moveTo(margin, 62).lineTo(W - margin, 62).lineWidth(1).stroke(CORES.goldDeep);
      x = margin; y = topStart; col = 0;
    }

    novaPaginaGrade();

    for (let i = 0; i < produtos.length; i++) {
      const p = produtos[i];

      if (y + cardH > bottomLimit) {
        novaPaginaGrade();
      }

      // Cartão
      doc.roundedRect(x, y, cardW, cardH, 8).fillAndStroke(CORES.white, CORES.goldDeep);

      // Moldura oval da foto (mesmo espírito do .product-art do site)
      const cx = x + cardW / 2;
      const cyImg = y + 16 + imgAreaH / 2;

      doc.save();
      doc.ellipse(cx, cyImg, rx, ry).fill(CORES.creamDeep);
      doc.restore();

      const buf = buffersImagens[i];
      if (buf) {
        try {
          // A foto já saiu do sharp no tamanho exato da caixa, com a peça inteira visível
          // (sem cortar) e o espaço sobrando transparente — por isso o oval creme desenhado
          // acima já aparece por trás naturalmente, sem precisar de mais nada aqui.
          doc.save();
          doc.ellipse(cx, cyImg, rx, ry).clip();
          doc.image(buf, cx - rx, cyImg - ry, { width: rx * 2, height: ry * 2 });
          doc.restore();
        } catch (e) {
          // Se a imagem vier corrompida, mantém o fundo oval liso.
        }
      }

      let ty = y + 16 + imgAreaH + 12;
      doc.fillColor(CORES.goldDeep).font(FONT_BODY).fontSize(7.5);
      doc.text((CATEGORIA_LABELS[p.categoria] || p.categoria || '').toUpperCase(), x + 8, ty, { width: cardW - 16, align: 'center' });

      ty += 13;
      doc.fillColor(CORES.ink).font(FONT_DISPLAY).fontSize(11);
      doc.text(p.nome || '', x + 8, ty, { width: cardW - 16, align: 'center', height: 28, ellipsis: true });

      ty += 30;
      doc.fillColor(CORES.goldDeep).font(FONT_BODY_BOLD).fontSize(11);
      doc.text(formatarPreco(p.preco), x + 8, ty, { width: cardW - 16, align: 'center' });

      // Avança para o próximo slot da grade
      col++;
      if (col >= cols) {
        col = 0;
        x = margin;
        y += cardH + rowGap;
      } else {
        x += cardW + gap;
      }
    }

    finalizarComRodape(doc, W, H);
    doc.end();

  } catch (err) {
    console.error('Erro em /api/catalogo:', err);
    if (!res.headersSent) {
<<<<<<< HEAD
      res.status(500).json({ error: 'Erro ao gerar o catálogo.', detail: String(err && err.message || err) });
=======
      res.status(500).json({ error: 'Erro ao gerar o catálogo. Tente novamente em instantes.' });
>>>>>>> d70e05d (backup de segurança pentest)
    } else {
      res.end();
    }
  }
};

function finalizarComRodape(doc, W, H) {
  const paginas = doc.bufferedPageRange();
  for (let i = 0; i < paginas.count; i++) {
    if (i === 0) continue; // pula a capa
    doc.switchToPage(i);
    doc.fillColor('#5c5040').font('Helvetica').fontSize(8);
    doc.text(
      'Página ' + (i + 1) + ' de ' + paginas.count + '  ·  Fale conosco no WhatsApp para fechar seu pedido: wa.me/' + WHATSAPP,
      40, H - 34, { width: W - 80, align: 'center' }
    );
  }
}
