// api/login.js
// Valida a senha do painel administrativo contra a variável de ambiente ADMIN_PASSWORD.
// Não emite token/sessão de servidor: o front-end guarda a senha em sessionStorage
// (apagada ao fechar a aba) e a reenvia no header "x-admin-password" em cada
// operação de escrita, que é revalidada em /api/produtos a cada chamada.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado nas variáveis de ambiente do servidor.' });
  }

  const { password } = req.body || {};
  if (password && password === esperado) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Senha incorreta.' });
};
