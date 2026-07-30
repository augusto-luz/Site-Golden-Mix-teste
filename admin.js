/* Golden Mix Semijoias — Painel Administrativo (CRUD de produtos) */

<<<<<<< HEAD
=======
/* ---- Segurança: escapa texto antes de inserir via innerHTML e valida links de imagem ----
   Protege o próprio painel: se algum dado malicioso chegar ao banco (ex: por uma falha
   futura em outro ponto), ele aparece como texto normal aqui, nunca como HTML/JS ativo —
   isso evita que um XSS "roube" a senha guardada em sessionStorage. */
function escapeHtml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function sanitizeImgUrl(url) {
  try {
    var u = new URL(url, location.href);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch (e) { /* URL inválida */ }
  return '';
}

>>>>>>> d70e05d (backup de segurança pentest)
const AUTH_KEY = 'gm_admin_password';
let localProducts = [];

/* ---------------- Login / logout ---------------- */

function mostrarLogin() {
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('admin-app').style.display = 'none';
}

function mostrarPainel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
}

function getSenhaAtual() {
  return sessionStorage.getItem(AUTH_KEY) || '';
}

function encerrarSessao() {
  sessionStorage.removeItem(AUTH_KEY);
  mostrarLogin();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const senha = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.style.display = 'none';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: senha })
    });

    if (res.ok) {
      sessionStorage.setItem(AUTH_KEY, senha);
      document.getElementById('admin-password').value = '';
      mostrarPainel();
      loadProducts();
      loadBanners();
    } else {
      errorEl.textContent = 'Senha incorreta. Tente novamente.';
      errorEl.style.display = 'block';
    }
  } catch (err) {
    errorEl.textContent = 'Não foi possível conectar ao servidor. Tente novamente.';
    errorEl.style.display = 'block';
  }
});

document.getElementById('btn-logout').addEventListener('click', encerrarSessao);

/* ---------------- CRUD de produtos ---------------- */

const CATEGORIA_ORDEM = [
  { value: 'aneis', label: 'Anéis' },
  { value: 'colares', label: 'Colares' },
  { value: 'brincos', label: 'Brincos' },
  { value: 'pulseiras', label: 'Pulseiras' },
  { value: 'conjuntos', label: 'Conjuntos' },
  { value: 'pingentes', label: 'Pingentes' },
  { value: 'broches', label: 'Broches' }
];

async function loadProducts() {
  const container = document.getElementById('products-groups');
  container.innerHTML = '<p class="msg-empty">Carregando...</p>';

  try {
    const res = await fetch('/api/produtos');
    if (!res.ok) throw new Error('Erro ao carregar produtos (' + res.status + ')');
    localProducts = await res.json();
    renderProductGroups(localProducts);
  } catch (err) {
    container.innerHTML = '<p class="msg-empty">Erro ao carregar produtos. Verifique a conexão com o banco de dados.</p>';
    console.error(err);
  }
}

function renderProductGroups(lista) {
  const container = document.getElementById('products-groups');
  container.innerHTML = '';

  if (!lista.length) {
    container.innerHTML = '<p class="msg-empty">Nenhuma peça encontrada.</p>';
    return;
  }

  // Agrupa por categoria, na ordem definida acima; categorias desconhecidas vão para "Outros"
  const grupos = {};
  lista.forEach(p => {
    const chave = p.categoria || 'outros';
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(p);
  });

  const ordemChaves = CATEGORIA_ORDEM.map(c => c.value).concat(
    Object.keys(grupos).filter(k => !CATEGORIA_ORDEM.some(c => c.value === k))
  );

  ordemChaves.forEach(chave => {
    const itens = grupos[chave];
    if (!itens || !itens.length) return;

    const labelObj = CATEGORIA_ORDEM.find(c => c.value === chave);
    const label = labelObj ? labelObj.label : (chave.charAt(0).toUpperCase() + chave.slice(1));

    const details = document.createElement('details');
    details.className = 'category-group';
    details.open = lista.length <= 6; // com poucas peças, já abre tudo; senão fica recolhido

    const linhas = itens.map(p => {
      const extras = [p.imagem_url_2, p.imagem_url_3].filter(Boolean).length;
<<<<<<< HEAD
      return `
        <tr>
          <td><img src="${p.imagem_url}" alt="${p.nome}"></td>
          <td><strong>${p.nome}</strong>${extras ? `<br><small style="color:var(--ink-soft)">+${extras} foto${extras > 1 ? 's' : ''}</small>` : ''}</td>
          <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
          <td class="actions">
            <button class="btn-edit" onclick="editProduct(${p.id})">Editar</button>
            <button class="btn-delete" onclick="deleteProduct(${p.id})">Excluir</button>
=======
      const nomeSeguro = escapeHtml(p.nome);
      const fotoSegura = escapeHtml(sanitizeImgUrl(p.imagem_url));
      return `
        <tr>
          <td><img src="${fotoSegura}" alt="${nomeSeguro}"></td>
          <td><strong>${nomeSeguro}</strong>${extras ? `<br><small style="color:var(--ink-soft)">+${extras} foto${extras > 1 ? 's' : ''}</small>` : ''}</td>
          <td>R$ ${escapeHtml(parseFloat(p.preco).toFixed(2))}</td>
          <td class="actions">
            <button class="btn-edit" onclick="editProduct(${Number(p.id) || 0})">Editar</button>
            <button class="btn-delete" onclick="deleteProduct(${Number(p.id) || 0})">Excluir</button>
>>>>>>> d70e05d (backup de segurança pentest)
          </td>
        </tr>
      `;
    }).join('');

    details.innerHTML = `
<<<<<<< HEAD
      <summary>${label} <span class="count">${itens.length} peça${itens.length > 1 ? 's' : ''}</span></summary>
=======
      <summary>${escapeHtml(label)} <span class="count">${itens.length} peça${itens.length > 1 ? 's' : ''}</span></summary>
>>>>>>> d70e05d (backup de segurança pentest)
      <table>
        <thead><tr><th>Foto</th><th>Nome</th><th>Preço</th><th>Ações</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    `;

    container.appendChild(details);
  });
}

document.getElementById('products-search').addEventListener('input', (e) => {
  const termo = e.target.value.trim().toLowerCase();
  const filtrada = termo
    ? localProducts.filter(p => p.nome.toLowerCase().includes(termo))
    : localProducts;
  renderProductGroups(filtrada);
  if (termo) {
    // Com busca ativa, abre todos os grupos que tiverem resultado para facilitar achar a peça
    document.querySelectorAll('.category-group').forEach(d => { d.open = true; });
  }
});

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('prod-id').value;
  const errorEl = document.getElementById('form-error');
  const submitBtn = document.getElementById('btn-submit');
  errorEl.style.display = 'none';

  const payload = {
    nome: document.getElementById('prod-nome').value.trim(),
    preco: document.getElementById('prod-preco').value,
    categoria: document.getElementById('prod-categoria').value,
    descricao: document.getElementById('prod-desc').value.trim(),
    imagem_url: document.getElementById('prod-image-url').value.trim(),
    imagem_url_2: document.getElementById('prod-image-url-2').value.trim(),
    imagem_url_3: document.getElementById('prod-image-url-3').value.trim()
  };

  if (!payload.nome || !payload.preco || !payload.categoria || !payload.imagem_url) {
    errorEl.textContent = 'Preencha nome, preço, categoria e link da imagem.';
    errorEl.style.display = 'block';
    return;
  }

  const method = id ? 'PUT' : 'POST';
  if (id) payload.id = id;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Salvando...';

  try {
    const res = await fetch('/api/produtos', {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': getSenhaAtual()
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      errorEl.textContent = 'Sua sessão expirou. Faça login novamente.';
      errorEl.style.display = 'block';
      encerrarSessao();
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      errorEl.textContent = data.error || 'Não foi possível salvar a peça. Tente novamente.';
      errorEl.style.display = 'block';
      return;
    }

    resetForm();
    loadProducts();
  } catch (err) {
    errorEl.textContent = 'Erro de conexão com o servidor. Tente novamente.';
    errorEl.style.display = 'block';
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Salvar Peça';
  }
});

function editProduct(id) {
  const p = localProducts.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-nome').value = p.nome;
  document.getElementById('prod-preco').value = p.preco;
  document.getElementById('prod-categoria').value = p.categoria;
  document.getElementById('prod-desc').value = p.descricao || '';
  document.getElementById('prod-image-url').value = p.imagem_url;
  document.getElementById('prod-image-url-2').value = p.imagem_url_2 || '';
  document.getElementById('prod-image-url-3').value = p.imagem_url_3 || '';

  document.getElementById('form-title').textContent = 'Editar Peça';
  document.getElementById('btn-cancel').style.display = 'inline-block';
  document.getElementById('form-error').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id) {
  if (!confirm('Deseja realmente remover esta joia do catálogo?')) return;

  try {
    const res = await fetch(`/api/produtos?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': getSenhaAtual() }
    });

    if (res.status === 401) {
      alert('Sua sessão expirou. Faça login novamente.');
      encerrarSessao();
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Não foi possível excluir a peça.');
      return;
    }

    loadProducts();
  } catch (err) {
    alert('Erro de conexão com o servidor.');
    console.error(err);
  }
}

function resetForm() {
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('form-title').textContent = 'Nova Semijoia';
  document.getElementById('btn-cancel').style.display = 'none';
  document.getElementById('form-error').style.display = 'none';
}

/* ---------------- Banners (imagens dos espaços de destaque) ---------------- */

const CATEGORIAS_BANNER = [
  { value: 'aneis', label: 'Anéis' },
  { value: 'colares', label: 'Colares' },
  { value: 'brincos', label: 'Brincos' },
  { value: 'pulseiras', label: 'Pulseiras' },
  { value: 'conjuntos', label: 'Conjuntos' },
  { value: 'pingentes', label: 'Pingentes' },
  { value: 'broches', label: 'Broches' }
];

async function loadBanners() {
  const grid = document.getElementById('banners-grid');
  grid.innerHTML = '<p class="msg-empty">Carregando banners...</p>';

  try {
    const res = await fetch('/api/banners');
    if (!res.ok) throw new Error('Erro ao carregar banners (' + res.status + ')');
    const banners = await res.json();

    grid.innerHTML = '';

    banners.forEach(b => {
      const card = document.createElement('div');
      card.className = 'banner-card';

<<<<<<< HEAD
      const camposProduto = b.hasProductFields ? `
        <div class="field" style="text-align:left; margin-bottom:10px;">
          <label style="font-size:.7rem;">Título</label>
          <input type="text" data-titulo-input value="${b.titulo || ''}" placeholder="Nome da peça em destaque">
=======
      const tituloSeguro = escapeHtml(b.titulo || '');
      const labelSeguro = escapeHtml(b.label || '');
      const slotSeguro = escapeHtml(b.slot || '');
      const fotoSegura = escapeHtml(sanitizeImgUrl(b.imagem_url));

      const camposProduto = b.hasProductFields ? `
        <div class="field" style="text-align:left; margin-bottom:10px;">
          <label style="font-size:.7rem;">Título</label>
          <input type="text" data-titulo-input value="${tituloSeguro}" placeholder="Nome da peça em destaque">
>>>>>>> d70e05d (backup de segurança pentest)
        </div>
        <div class="field" style="text-align:left; margin-bottom:10px;">
          <label style="font-size:.7rem;">Categoria</label>
          <select data-categoria-input>
            ${CATEGORIAS_BANNER.map(c => `<option value="${c.value}" ${c.value === b.categoria ? 'selected' : ''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="field" style="text-align:left; margin-bottom:10px;">
          <label style="font-size:.7rem;">Preço (R$)</label>
<<<<<<< HEAD
          <input type="number" step="0.01" min="0" data-preco-input value="${b.preco !== null && b.preco !== undefined ? b.preco : ''}" placeholder="0.00">
=======
          <input type="number" step="0.01" min="0" data-preco-input value="${b.preco !== null && b.preco !== undefined ? escapeHtml(b.preco) : ''}" placeholder="0.00">
>>>>>>> d70e05d (backup de segurança pentest)
        </div>
      ` : '';

      card.innerHTML = `
<<<<<<< HEAD
        <span class="banner-slot-key">${b.slot}</span>
        <h4>${b.hasProductFields ? (b.titulo || b.label) : b.label}</h4>
        <div class="banner-preview" data-preview>
          ${b.imagem_url
            ? `<img src="${b.imagem_url}" alt="${b.label}">`
            : `<span>Sem imagem — usando o ícone padrão</span>`}
        </div>
        ${camposProduto}
        <input type="url" placeholder="Cole o link da imagem (Imgur, Postimages...)" value="${b.imagem_url || ''}" data-url-input>
=======
        <span class="banner-slot-key">${slotSeguro}</span>
        <h4>${b.hasProductFields ? (tituloSeguro || labelSeguro) : labelSeguro}</h4>
        <div class="banner-preview" data-preview>
          ${fotoSegura
            ? `<img src="${fotoSegura}" alt="${labelSeguro}">`
            : `<span>Sem imagem — usando o ícone padrão</span>`}
        </div>
        ${camposProduto}
        <input type="url" placeholder="Cole o link da imagem (Imgur, Postimages...)" value="${escapeHtml(b.imagem_url || '')}" data-url-input>
>>>>>>> d70e05d (backup de segurança pentest)
        <div class="banner-card-actions">
          <button type="button" class="btn-banner-save" data-action="save">Salvar</button>
          <button type="button" class="btn-banner-remove" data-action="remove">Remover imagem</button>
        </div>
        <p class="banner-msg" data-msg></p>
      `;

      const input = card.querySelector('[data-url-input]');
      const preview = card.querySelector('[data-preview]');
      const msgEl = card.querySelector('[data-msg]');
      const tituloInput = card.querySelector('[data-titulo-input]');
      const categoriaInput = card.querySelector('[data-categoria-input]');
      const precoInput = card.querySelector('[data-preco-input]');
      const cardTitle = card.querySelector('h4');

      function mostrarMsg(texto, tipo) {
        msgEl.textContent = texto;
        msgEl.className = 'banner-msg ' + tipo;
        msgEl.style.display = 'block';
      }

      card.querySelector('[data-action="save"]').addEventListener('click', async () => {
        const url = input.value.trim();
        const payload = { slot: b.slot, imagem_url: url };

        if (b.hasProductFields) {
          const titulo = tituloInput.value.trim();
          const categoria = categoriaInput.value;
          const preco = precoInput.value;

          if (!titulo || !categoria || preco === '') {
            mostrarMsg('Preencha título, categoria e preço.', 'error');
            return;
          }
          payload.titulo = titulo;
          payload.categoria = categoria;
          payload.preco = preco;
        } else if (!url) {
          mostrarMsg('Cole o link de uma imagem antes de salvar.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/banners', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': getSenhaAtual() },
            body: JSON.stringify(payload)
          });
          if (res.status === 401) { encerrarSessao(); return; }
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { mostrarMsg(data.error || 'Não foi possível salvar.', 'error'); return; }

<<<<<<< HEAD
          if (data.imagem_url) preview.innerHTML = `<img src="${data.imagem_url}" alt="${b.label}">`;
=======
          if (data.imagem_url) preview.innerHTML = `<img src="${escapeHtml(sanitizeImgUrl(data.imagem_url))}" alt="${escapeHtml(b.label)}">`;
>>>>>>> d70e05d (backup de segurança pentest)
          if (b.hasProductFields) cardTitle.textContent = data.titulo || b.label;
          mostrarMsg('Salvo com sucesso.', 'ok');
        } catch (err) {
          mostrarMsg('Erro de conexão com o servidor.', 'error');
        }
      });

      card.querySelector('[data-action="remove"]').addEventListener('click', async () => {
        try {
          const res = await fetch('/api/banners?slot=' + encodeURIComponent(b.slot), {
            method: 'DELETE',
            headers: { 'x-admin-password': getSenhaAtual() }
          });
          if (res.status === 401) { encerrarSessao(); return; }
          const data = await res.json().catch(() => ({}));
          if (!res.ok) { mostrarMsg(data.error || 'Não foi possível remover.', 'error'); return; }

          input.value = '';
          preview.innerHTML = '<span>Sem imagem — usando o ícone padrão</span>';
          mostrarMsg('Imagem removida — o ícone padrão voltou a ser exibido.', 'ok');
        } catch (err) {
          mostrarMsg('Erro de conexão com o servidor.', 'error');
        }
      });

      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<p class="msg-empty">Erro ao carregar banners. Verifique a conexão com o banco de dados.</p>';
    console.error(err);
  }
}

/* ---------------- Catálogo em PDF ---------------- */

function initCatalogo() {
  const select = document.getElementById('catalogo-categoria');
  CATEGORIA_ORDEM.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.value;
    opt.textContent = c.label;
    select.appendChild(opt);
  });

  const msgEl = document.getElementById('catalogo-msg');
  function mostrarMsgCatalogo(texto, tipo) {
    msgEl.textContent = texto;
    msgEl.className = 'banner-msg ' + tipo;
    msgEl.style.display = 'block';
  }

  function montarUrlCatalogo(download) {
    const categoria = select.value;
    const params = new URLSearchParams();
    if (categoria) params.set('categoria', categoria);
    if (download) params.set('download', '1');
    const qs = params.toString();
    return location.origin + '/api/catalogo' + (qs ? '?' + qs : '');
  }

  document.getElementById('btn-ver-catalogo').addEventListener('click', () => {
    window.open(montarUrlCatalogo(false), '_blank');
  });

  document.getElementById('btn-baixar-catalogo').addEventListener('click', () => {
    window.open(montarUrlCatalogo(true), '_blank');
  });

  document.getElementById('btn-copiar-link-catalogo').addEventListener('click', async () => {
    const url = montarUrlCatalogo(false);
    try {
      await navigator.clipboard.writeText(url);
      mostrarMsgCatalogo('Link copiado! Já pode colar no WhatsApp ou nas redes sociais.', 'ok');
    } catch (err) {
      mostrarMsgCatalogo('Não foi possível copiar automaticamente. Link: ' + url, 'error');
    }
  });
}

/* ---------------- Inicialização ---------------- */

document.addEventListener('DOMContentLoaded', function () {
  initCatalogo();
  if (getSenhaAtual()) {
    mostrarPainel();
    loadProducts();
    loadBanners();
  } else {
    mostrarLogin();
  }
});
