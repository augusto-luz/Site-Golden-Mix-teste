// api/banners.js
// Gerencia os "banners" do site: espaços de design com formato fixo (oval do hero,
// arte promocional, oval "sobre") e os 4 cards de destaque da home ("favoritos"),
// que além da imagem também têm título, categoria e preço — tudo editável no admin,
// sem alterar forma/layout/CSS.
//
// GET    /api/banners            -> lista todos os slots (público)
// PUT    /api/banners            -> atualiza um slot (exige senha admin)
// DELETE /api/banners?slot=hero  -> remove a imagem do slot, voltando ao ícone padrão (exige senha admin)

const { sql } = require('@vercel/postgres');
<<<<<<< HEAD
=======
const { compararSenhaSegura, aplicarRateLimit, validarEsquemaUrlImagem, primeiroValor } = require('./_lib/security');
>>>>>>> d70e05d (backup de segurança pentest)

// Slots fixos correspondentes às formas já existentes no design.
// Não é possível criar slots novos por aqui de propósito — isso manteria o layout intacto.
// hasProductFields = true → o slot também tem título/categoria/preço editáveis (os "favoritos").
const SLOTS = [
  { slot: 'hero', label: 'Banner principal (topo da home)', hasProductFields: false },
  { slot: 'promo', label: 'Banner promocional — Coleção Conjuntos', hasProductFields: false },
  { slot: 'about', label: 'Imagem da seção "Sobre a Golden Mix"', hasProductFields: false },
  { slot: 'favorito-1', label: 'Destaque 1', hasProductFields: true, defTitulo: 'Anel Solitário Cravejado', defCategoria: 'aneis', defPreco: 49.90 },
  { slot: 'favorito-2', label: 'Destaque 2', hasProductFields: true, defTitulo: 'Colar Ponto de Luz', defCategoria: 'colares', defPreco: 64.90 },
  { slot: 'favorito-3', label: 'Destaque 3', hasProductFields: true, defTitulo: 'Brinco Argola Texturizada', defCategoria: 'brincos', defPreco: 39.90 },
  { slot: 'favorito-4', label: 'Destaque 4', hasProductFields: true, defTitulo: 'Pulseira Riviera', defCategoria: 'pulseiras', defPreco: 79.90 },
];
const SLOTS_VALIDOS = SLOTS.map(s => s.slot);
const CATEGORIAS_VALIDAS = ['aneis', 'colares', 'brincos', 'pulseiras', 'conjuntos', 'pingentes', 'broches'];
<<<<<<< HEAD
=======
const LIMITE_TITULO = 200;
const LIMITE_URL = 2000;
>>>>>>> d70e05d (backup de segurança pentest)

let tabelaVerificada = false;

async function garantirTabela() {
  if (tabelaVerificada) return;
  await sql`
    CREATE TABLE IF NOT EXISTS banners (
      slot TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      imagem_url TEXT,
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  // Migração segura para bancos já existentes (quem já tinha só a imagem dos banners).
  await sql`ALTER TABLE banners ADD COLUMN IF NOT EXISTS titulo TEXT;`;
  await sql`ALTER TABLE banners ADD COLUMN IF NOT EXISTS categoria TEXT;`;
  await sql`ALTER TABLE banners ADD COLUMN IF NOT EXISTS preco NUMERIC(10,2);`;

  // Garante que os slots fixos sempre existam, já com os textos originais como
  // valor padrão nos "favoritos" (não sobrescreve o que já tiver sido cadastrado).
  for (const s of SLOTS) {
    await sql`
      INSERT INTO banners (slot, label, imagem_url, titulo, categoria, preco)
      VALUES (${s.slot}, ${s.label}, NULL, ${s.defTitulo || null}, ${s.defCategoria || null}, ${s.defPreco || null})
      ON CONFLICT (slot) DO NOTHING;
    `;
  }
  tabelaVerificada = true;
}

function verificarSenha(req) {
  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado) {
    return { ok: false, status: 500, error: 'ADMIN_PASSWORD não configurado nas variáveis de ambiente do servidor.' };
  }
  const recebida = req.headers['x-admin-password'];
<<<<<<< HEAD
  if (!recebida || recebida !== esperado) {
=======
  if (!compararSenhaSegura(recebida, esperado)) {
>>>>>>> d70e05d (backup de segurança pentest)
    return { ok: false, status: 401, error: 'Senha administrativa inválida ou ausente.' };
  }
  return { ok: true };
}

<<<<<<< HEAD
=======
function limitar(texto, tamanho) {
  return String(texto || '').slice(0, tamanho);
}

>>>>>>> d70e05d (backup de segurança pentest)
module.exports = async function handler(req, res) {
  try {
    await garantirTabela();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM banners ORDER BY slot;`;
      const comMeta = rows.map(r => {
        const def = SLOTS.find(s => s.slot === r.slot);
        return { ...r, hasProductFields: !!(def && def.hasProductFields) };
      });
      return res.status(200).json(comMeta);
    }

<<<<<<< HEAD
=======
    if (aplicarRateLimit(req, res, { chave: 'banners-escrita', maxTentativas: 30, janelaMs: 60 * 1000 })) {
      return;
    }
>>>>>>> d70e05d (backup de segurança pentest)
    const auth = verificarSenha(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
<<<<<<< HEAD
      const slot = (body.slot || '').trim();
      const imagemUrl = (body.imagem_url || '').trim();
=======
      const slot = limitar((body.slot || '').trim(), 40);
      const imagemUrl = validarEsquemaUrlImagem(limitar((body.imagem_url || '').trim(), LIMITE_URL));
>>>>>>> d70e05d (backup de segurança pentest)
      const def = SLOTS.find(s => s.slot === slot);

      if (!def) {
        return res.status(400).json({ error: 'Slot de banner inválido.' });
      }

      if (def.hasProductFields) {
        // "Favoritos": edição total — título, categoria e preço, além da imagem.
<<<<<<< HEAD
        const titulo = (body.titulo || '').trim();
        const categoria = (body.categoria || '').trim();
        const precoNum = parseFloat(body.preco);

        if (!titulo || !categoria || isNaN(precoNum)) {
=======
        const titulo = limitar((body.titulo || '').trim(), LIMITE_TITULO);
        const categoria = limitar((body.categoria || '').trim(), 50);
        const precoNum = parseFloat(body.preco);

        if (!titulo || !categoria || isNaN(precoNum) || precoNum < 0 || precoNum > 1000000) {
>>>>>>> d70e05d (backup de segurança pentest)
          return res.status(400).json({ error: 'Preencha título, categoria e preço válido.' });
        }
        if (!CATEGORIAS_VALIDAS.includes(categoria)) {
          return res.status(400).json({ error: 'Categoria inválida.' });
        }
<<<<<<< HEAD
=======
        // A imagem é opcional nesta edição (pode só atualizar texto/preço), mas se
        // veio um valor não-vazio que não é um link http(s) válido, rejeitamos.
        if (body.imagem_url && String(body.imagem_url).trim() && !imagemUrl) {
          return res.status(400).json({ error: 'Link de imagem inválido — use um link http(s).' });
        }
>>>>>>> d70e05d (backup de segurança pentest)

        const { rows } = await sql`
          UPDATE banners
          SET titulo = ${titulo}, categoria = ${categoria}, preco = ${precoNum},
<<<<<<< HEAD
              imagem_url = COALESCE(NULLIF(${imagemUrl}, ''), imagem_url),
=======
              imagem_url = COALESCE(${imagemUrl}, imagem_url),
>>>>>>> d70e05d (backup de segurança pentest)
              atualizado_em = now()
          WHERE slot = ${slot}
          RETURNING *;
        `;
        return res.status(200).json({ ...rows[0], hasProductFields: true });
      }

      // Slots só de imagem (hero, promo, about)
      if (!imagemUrl) {
<<<<<<< HEAD
        return res.status(400).json({ error: 'Informe o link da imagem.' });
=======
        return res.status(400).json({ error: 'Informe um link de imagem http(s) válido.' });
>>>>>>> d70e05d (backup de segurança pentest)
      }
      const { rows } = await sql`
        UPDATE banners
        SET imagem_url = ${imagemUrl}, atualizado_em = now()
        WHERE slot = ${slot}
        RETURNING *;
      `;
      return res.status(200).json({ ...rows[0], hasProductFields: false });
    }

    if (req.method === 'DELETE') {
<<<<<<< HEAD
      const slot = (req.query.slot || '').trim();
=======
      const slot = limitar(primeiroValor(req.query.slot).trim(), 40);
>>>>>>> d70e05d (backup de segurança pentest)
      if (!SLOTS_VALIDOS.includes(slot)) {
        return res.status(400).json({ error: 'Slot de banner inválido.' });
      }
      const { rows } = await sql`
        UPDATE banners
        SET imagem_url = NULL, atualizado_em = now()
        WHERE slot = ${slot}
        RETURNING *;
      `;
      return res.status(200).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });

  } catch (err) {
    console.error('Erro em /api/banners:', err);
<<<<<<< HEAD
    return res.status(500).json({ error: 'Erro interno no servidor.', detail: String(err && err.message || err) });
=======
    return res.status(500).json({ error: 'Erro interno no servidor. Tente novamente em instantes.' });
>>>>>>> d70e05d (backup de segurança pentest)
  }
};
