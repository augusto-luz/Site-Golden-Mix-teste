// api/_lib/security.js
// Utilitários de segurança compartilhados entre as funções serverless.
// Arquivos/pastas dentro de /api que começam com "_" não viram rota pública na Vercel —
// este módulo é só uma biblioteca interna, importada pelos outros endpoints.

const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');

/* ------------------------------------------------------------------ */
/* Comparação de senha resistente a "timing attack"                    */
/* ------------------------------------------------------------------ */
// Comparar senhas com "===" vaza informação pelo tempo de resposta (quanto mais
// caracteres batem no começo, mais rápido some/um pouco mais devagar dependendo da
// implementação). crypto.timingSafeEqual sempre leva o mesmo tempo, não importa
// o conteúdo, então um atacante não consegue "adivinhar" a senha caractere por caractere.
function compararSenhaSegura(recebida, esperada) {
  if (typeof recebida !== 'string' || typeof esperada !== 'string' || !recebida || !esperada) {
    return false;
  }
  const bufRecebida = Buffer.from(recebida, 'utf8');
  const bufEsperada = Buffer.from(esperada, 'utf8');

  if (bufRecebida.length !== bufEsperada.length) {
    // Mesmo em tamanhos diferentes, fazemos uma comparação de tempo constante
    // (contra si mesma) para não vazar o tamanho da senha certa via timing.
    crypto.timingSafeEqual(bufEsperada, bufEsperada);
    return false;
  }
  return crypto.timingSafeEqual(bufRecebida, bufEsperada);
}

/* ------------------------------------------------------------------ */
/* Rate limiting (best-effort, em memória)                             */
/* ------------------------------------------------------------------ */
// Isso NÃO substitui o rate limit de verdade (veja o Vercel Firewall no README) —
// funções serverless são efêmeras e cada instância tem sua própria memória, então
// isso só ajuda dentro de uma mesma instância "quente". Ainda assim, é uma camada a
// mais que dificulta ataques automatizados simples, sem precisar de nenhum serviço externo.
const _janelas = new Map(); // chave -> array de timestamps (ms)

// Normaliza parâmetros de query: a Vercel entrega array se o parâmetro repetir na URL
// (ex.: ?slot=a&slot=b) — sempre usamos só o primeiro valor, texto puro.
function primeiroValor(valor) {
  if (Array.isArray(valor)) return valor[0] || '';
  return valor || '';
}

function obterIp(req) {
  const encaminhado = req.headers['x-forwarded-for'];
  if (encaminhado) return String(encaminhado).split(',')[0].trim();
  if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
  return 'desconhecido';
}

// Retorna true se o limite foi excedido (ou seja, a requisição deve ser bloqueada).
function limiteExcedido(chave, maxTentativas, janelaMs) {
  const agora = Date.now();
  let lista = _janelas.get(chave) || [];
  lista = lista.filter(function (t) { return agora - t < janelaMs; });
  lista.push(agora);
  _janelas.set(chave, lista);

  // Faxina esporádica para não crescer sem limite em memória.
  if (_janelas.size > 5000) {
    for (const [k, v] of _janelas) {
      if (!v.length || agora - v[v.length - 1] > janelaMs) _janelas.delete(k);
    }
  }

  return lista.length > maxTentativas;
}

// Aplica rate limit e já responde 429 se necessário. Retorna true se BLOQUEOU
// (o handler que chamou deve parar de processar nesse caso).
function aplicarRateLimit(req, res, opcoes) {
  const chave = opcoes.chave + ':' + obterIp(req);
  if (limiteExcedido(chave, opcoes.maxTentativas, opcoes.janelaMs)) {
    res.setHeader('Retry-After', Math.ceil(opcoes.janelaMs / 1000));
    res.status(429).json({ error: 'Muitas requisições em pouco tempo. Tente novamente em alguns instantes.' });
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Proteção contra SSRF ao baixar imagens de URLs cadastradas          */
/* ------------------------------------------------------------------ */
// Usado onde o SERVIDOR faz o download de uma URL cadastrada (ex.: gerar o catálogo em
// PDF). Bloqueia esquemas que não sejam http/https e endereços internos/privados, para
// que uma URL maliciosa não seja usada para sondar a rede interna da Vercel/Neon.
function ipEhPrivadaOuInterna(ip) {
  if (net.isIP(ip) === 4) {
    const partes = ip.split('.').map(Number);
    if (partes[0] === 10) return true;
    if (partes[0] === 127) return true;
    if (partes[0] === 169 && partes[1] === 254) return true; // link-local / metadata (ex: 169.254.169.254)
    if (partes[0] === 172 && partes[1] >= 16 && partes[1] <= 31) return true;
    if (partes[0] === 192 && partes[1] === 168) return true;
    if (partes[0] === 0) return true;
    return false;
  }
  if (net.isIP(ip) === 6) {
    const low = ip.toLowerCase();
    if (low === '::1') return true;
    if (low.startsWith('fe80:')) return true;
    if (low.startsWith('fc') || low.startsWith('fd')) return true;
    if (low.startsWith('::ffff:')) {
      const v4 = low.split(':').pop();
      if (net.isIP(v4) === 4) return ipEhPrivadaOuInterna(v4);
    }
    return false;
  }
  return true; // formato não reconhecido: trata como não seguro por precaução
}

async function validarUrlImagemSegura(urlTexto) {
  let u;
  try {
    u = new URL(urlTexto);
  } catch (e) {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) return null;

  if (net.isIP(host)) {
    return ipEhPrivadaOuInterna(host) ? null : u.href;
  }

  try {
    const enderecos = await dns.lookup(host, { all: true });
    if (!enderecos.length || enderecos.some(function (e) { return ipEhPrivadaOuInterna(e.address); })) {
      return null;
    }
  } catch (e) {
    return null; // não conseguiu resolver o domínio: não arrisca
  }

  return u.href;
}

// Validação "leve" (sem DNS) usada ao simplesmente cadastrar/editar um link de imagem
// no admin — aqui o servidor só guarda a URL, não faz download dela, então basta
// garantir que é um esquema http/https válido (evita coisas como "javascript:").
function validarEsquemaUrlImagem(urlTexto) {
  try {
    const u = new URL(urlTexto);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  compararSenhaSegura,
  aplicarRateLimit,
  obterIp,
  primeiroValor,
  validarUrlImagemSegura,
  validarEsquemaUrlImagem
};
