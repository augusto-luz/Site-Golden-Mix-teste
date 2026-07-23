// api/produtos.js
// Endpoint CRUD de produtos — Vercel Serverless Function + Neon (via @vercel/postgres)
//
// GET    /api/produtos        -> lista todos os produtos (público, usado no site)
// POST   /api/produtos        -> cria produto (exige senha admin)
// PUT    /api/produtos        -> atualiza produto (exige senha admin, precisa de "id" no body)
// DELETE /api/produtos?id=1   -> remove produto (exige senha admin)

const { sql } = require('@vercel/postgres');

let tabelaVerificada = false;

async function garantirTabela() {
  if (tabelaVerificada) return;
  await sql`
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      preco NUMERIC(10,2) NOT NULL DEFAULT 0,
      categoria TEXT NOT NULL DEFAULT 'colares',
      descricao TEXT DEFAULT '',
      imagem_url TEXT DEFAULT '',
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  // Migração segura: adiciona as colunas da 2ª e 3ª foto em bancos já existentes
  // (quem já tinha o site no ar antes de o produto ter 3 fotos).
  await sql`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_url_2 TEXT DEFAULT '';`;
  await sql`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_url_3 TEXT DEFAULT '';`;
  tabelaVerificada = true;
}

function verificarSenha(req) {
  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado) {
    return { ok: false, status: 500, error: 'ADMIN_PASSWORD não configurado nas variáveis de ambiente do servidor.' };
  }
  const recebida = req.headers['x-admin-password'];
  if (!recebida || recebida !== esperado) {
    return { ok: false, status: 401, error: 'Senha administrativa inválida ou ausente.' };
  }
  return { ok: true };
}

module.exports = async function handler(req, res) {
  try {
    await garantirTabela();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM produtos ORDER BY criado_em DESC, id DESC;`;
      return res.status(200).json(rows);
    }

    // A partir daqui, todas as operações alteram dados e exigem a senha do admin
    const auth = verificarSenha(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const nome = (body.nome || '').trim();
      const categoria = (body.categoria || '').trim();
      const precoNum = parseFloat(body.preco);
      const descricao = (body.descricao || '').trim();
      const imagemUrl = (body.imagem_url || '').trim();
      const imagemUrl2 = (body.imagem_url_2 || '').trim();
      const imagemUrl3 = (body.imagem_url_3 || '').trim();

      if (!nome || !categoria || isNaN(precoNum) || !imagemUrl) {
        return res.status(400).json({ error: 'Preencha nome, preço válido, categoria e ao menos a foto principal.' });
      }

      const { rows } = await sql`
        INSERT INTO produtos (nome, preco, categoria, descricao, imagem_url, imagem_url_2, imagem_url_3)
        VALUES (${nome}, ${precoNum}, ${categoria}, ${descricao}, ${imagemUrl}, ${imagemUrl2}, ${imagemUrl3})
        RETURNING *;
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const id = parseInt(body.id, 10);
      const nome = (body.nome || '').trim();
      const categoria = (body.categoria || '').trim();
      const precoNum = parseFloat(body.preco);
      const descricao = (body.descricao || '').trim();
      const imagemUrl = (body.imagem_url || '').trim();
      const imagemUrl2 = (body.imagem_url_2 || '').trim();
      const imagemUrl3 = (body.imagem_url_3 || '').trim();

      if (!id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório para atualizar.' });
      }
      if (!nome || !categoria || isNaN(precoNum) || !imagemUrl) {
        return res.status(400).json({ error: 'Preencha nome, preço válido, categoria e ao menos a foto principal.' });
      }

      const { rows } = await sql`
        UPDATE produtos
        SET nome = ${nome}, preco = ${precoNum}, categoria = ${categoria},
            descricao = ${descricao}, imagem_url = ${imagemUrl},
            imagem_url_2 = ${imagemUrl2}, imagem_url_3 = ${imagemUrl3}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const id = parseInt(req.query.id, 10);
      if (!id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório para excluir.' });
      }
      await sql`DELETE FROM produtos WHERE id = ${id};`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Método não permitido.' });

  } catch (err) {
    console.error('Erro em /api/produtos:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.', detail: String(err && err.message || err) });
  }
};
