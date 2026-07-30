// api/login.js
// Valida a senha do painel administrativo contra a variável de ambiente ADMIN_PASSWORD.
// Não emite token/sessão de servidor: o front-end guarda a senha em sessionStorage
// (apagada ao fechar a aba) e a reenvia no header "x-admin-password" em cada
// operação de escrita, que é revalidada em /api/produtos a cada chamada.

<<<<<<< HEAD
=======
const { compararSenhaSegura, aplicarRateLimit } = require('./_lib/security');

>>>>>>> d70e05d (backup de segurança pentest)
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

<<<<<<< HEAD
=======
  // Proteção contra força bruta: no máximo 6 tentativas a cada 5 minutos, por IP.
  // (Camada extra além do rate limit do Vercel Firewall — veja o README.)
  if (aplicarRateLimit(req, res, { chave: 'login', maxTentativas: 6, janelaMs: 5 * 60 * 1000 })) {
    return;
  }

>>>>>>> d70e05d (backup de segurança pentest)
  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado nas variáveis de ambiente do servidor.' });
  }

<<<<<<< HEAD
  const { password } = req.body || {};
  if (password && password === esperado) {
=======
  const body = req.body || {};
  const password = typeof body.password === 'string' ? body.password : '';

  if (compararSenhaSegura(password, esperado)) {
>>>>>>> d70e05d (backup de segurança pentest)
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Senha incorreta.' });
};
