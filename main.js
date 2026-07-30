/* Golden Mix Semijoias — interações do site */

<<<<<<< HEAD
=======
/* ---- Segurança: escapa texto antes de inserir via innerHTML e valida links de imagem ----
   Nome/categoria de produto vêm do banco (cadastrados no admin). Mesmo sendo uma área
   protegida por senha, escapamos tudo aqui para que um eventual dado malicioso nunca
   vire HTML/JS executável para quem visita o site. */
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
  return ''; // link inválido/perigoso (ex: javascript:) — não renderiza
}

>>>>>>> d70e05d (backup de segurança pentest)
var WHATSAPP_NUMBER = '5592984602401'; // Número da loja, formato 55 + DDD + número

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Ano automático no rodapé ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Menu mobile ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  /* ---- Reveal on scroll (com rede de segurança: nunca deixa conteúdo escondido) ---- */
  function ativarReveal() {
    var revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
    if ('IntersectionObserver' in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
      // Rede de segurança: garante visibilidade mesmo se o observer falhar/perder o elemento
      setTimeout(function () {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }, 1800);
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }
  ativarReveal();

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- Filtro de categorias na vitrine de produtos ----
     Reconsultamos os cards toda vez que o filtro é ativado, para funcionar
     tanto com as peças estáticas quanto com as carregadas do banco depois. */
  var chips = document.querySelectorAll('.chip[data-filter]');
  function atualizarLinkCatalogo(filter) {
    var btnCatalogo = document.getElementById('btn-catalogo-pdf');
    if (!btnCatalogo) return;
    var url = '/api/catalogo?download=1';
    if (filter && filter !== 'todos') url += '&categoria=' + encodeURIComponent(filter);
    btnCatalogo.setAttribute('href', url);
  }
  function ativarFiltroCategorias() {
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.onclick = function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var filter = chip.getAttribute('data-filter');
        document.querySelectorAll('[data-category]').forEach(function (card) {
          var show = filter === 'todos' || card.getAttribute('data-category') === filter;
          card.style.display = show ? '' : 'none';
        });
        atualizarLinkCatalogo(filter);
      };
    });
  }
  ativarFiltroCategorias();

  /* ---- Botões "Comprar no WhatsApp" dos produtos ----
     Quando o botão pertence a um card de produto identificável (com id), a
     mensagem inclui também o link direto da peça, para o vendedor abrir e
     ver foto/preço com mais agilidade. */
  function configurarLinkDoCard(card) {
    if (!card.id) return;
    var btn = card.querySelector('[data-whatsapp-product]');
    if (btn && !btn.hasAttribute('data-whatsapp-link')) {
      btn.setAttribute('data-whatsapp-link', location.origin + location.pathname + '#' + card.id);
    }
  }
  document.querySelectorAll('.product-card[id]').forEach(configurarLinkDoCard);

  function ativarBotoesWhatsApp() {
    document.querySelectorAll('[data-whatsapp-product]').forEach(function (btn) {
      if (btn.dataset.wppBound) return; // evita ligar o mesmo botão duas vezes
      btn.dataset.wppBound = '1';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var product = btn.getAttribute('data-whatsapp-product');
        var link = btn.getAttribute('data-whatsapp-link');
        var msg = 'Olá! Vi no site da Golden Mix Semijoias e gostaria de saber mais sobre: ' + product;
        if (link) msg += '\nLink da peça: ' + link;
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
      });
    });
  }
  ativarBotoesWhatsApp();

  /* ---- Ao abrir a página com #produto-x ou #favorito-x na URL (vindo do link
     enviado no WhatsApp), rola até o card e destaca com um brilho temporário. */
  function destacarProdutoDaURL() {
    if (!location.hash) return;
    var alvo = document.getElementById(location.hash.slice(1));
    if (!alvo || !alvo.classList.contains('product-card')) return;
    setTimeout(function () {
      alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      alvo.classList.add('produto-destacado');
      setTimeout(function () { alvo.classList.remove('produto-destacado'); }, 2600);
    }, 350);
  }
  destacarProdutoDaURL();

  /* ---- Formulário de contato -> abre WhatsApp com a mensagem preenchida ---- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.querySelector('#name').value.trim();
      var phone = contactForm.querySelector('#phone').value.trim();
      var subject = contactForm.querySelector('#subject').value;
      var message = contactForm.querySelector('#message').value.trim();

      var text = 'Olá, meu nome é ' + name + '.\n' +
                 'Assunto: ' + subject + '\n' +
                 'Mensagem: ' + message + '\n' +
                 (phone ? ('Meu contato: ' + phone) : '');

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* ---- Banners de imagem editáveis (hero, promo, sobre, favoritos) ----
     Roda em qualquer página que tenha elementos [data-banner-slot]. Se não houver
     imagem cadastrada para o slot, mantém o ícone/design padrão como está. */
  var CATEGORIA_LABELS = {
    aneis: 'Anéis', colares: 'Colares', brincos: 'Brincos',
    pulseiras: 'Pulseiras', conjuntos: 'Conjuntos', pingentes: 'Pingentes',
    broches: 'Broches'
  };

  async function carregarBanners() {
    var alvos = document.querySelectorAll('[data-banner-slot]');
    if (!alvos.length) return;

    try {
      var response = await fetch('/api/banners');
      if (!response.ok) throw new Error('Falha ao buscar banners (' + response.status + ')');
      var banners = await response.json();

      var mapa = {};
      banners.forEach(function (b) { mapa[b.slot] = b; });

      alvos.forEach(function (el) {
        var slot = el.getAttribute('data-banner-slot');
        var banner = mapa[slot];
        if (!banner) return;

        // Imagem (se houver) — substitui só o ícone SVG padrão, preservando outros
        // elementos que possam existir dentro do slot (ex.: a badge "Destaque").
        if (banner.imagem_url) {
          var img = document.createElement('img');
          img.src = banner.imagem_url;
          img.alt = el.getAttribute('data-banner-alt') || '';
          img.loading = 'lazy';

          var svgAntigo = el.querySelector('svg');
          if (svgAntigo) svgAntigo.remove();
          el.insertBefore(img, el.firstChild);
          el.classList.add('has-banner-img');
        }

        // Título, categoria e preço (só existem para os cards de "favoritos")
        if (banner.hasProductFields) {
          var card = el.closest('.product-card');
          if (!card) return;

          if (banner.titulo) {
            var tituloEl = card.querySelector('h4');
            if (tituloEl) tituloEl.textContent = banner.titulo;
            var whatsBtn = card.querySelector('[data-whatsapp-product]');
            if (whatsBtn) whatsBtn.setAttribute('data-whatsapp-product', banner.titulo);
            el.setAttribute('data-banner-alt', banner.titulo);
          }
          if (banner.categoria) {
            var catEl = card.querySelector('.cat-label');
            if (catEl) catEl.textContent = CATEGORIA_LABELS[banner.categoria] || banner.categoria;
          }
          if (banner.preco !== null && banner.preco !== undefined) {
            var amountEl = card.querySelector('.product-price .amount');
            if (amountEl) amountEl.textContent = 'R$ ' + parseFloat(banner.preco).toFixed(2).replace('.', ',');
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      // Em caso de erro, mantém ícones e textos padrão já presentes no HTML.
    }
  }
  carregarBanners();

  /* ---- Carregamento automático da vitrine a partir do banco (Neon/Postgres) ----
     Só roda na página de produtos (produtos.html), que marca o grid com
     data-products-source="db". A home (index.html) mantém sua vitrine estática
     com peças em destaque escolhidas manualmente — isso é intencional. */
  async function carregarVitrineBanco() {
    var containerGrid = document.querySelector('[data-products-source="db"]');
    if (!containerGrid) return;

    try {
      var response = await fetch('/api/produtos');
      if (!response.ok) throw new Error('Falha ao buscar produtos (' + response.status + ')');
      var produtos = await response.json();

      if (produtos && produtos.length > 0) {
        containerGrid.innerHTML = ''; // Limpa as peças estáticas de exemplo

        produtos.forEach(function (p) {
          var itemCard = document.createElement('div');
          // Usa exatamente as mesmas classes do card estático (.product-card, .product-art,
          // .cat-label, .product-price) para manter o layout/design idêntico ao original.
          itemCard.className = 'product-card reveal is-visible';
          itemCard.id = 'produto-' + p.id;
          itemCard.setAttribute('data-category', p.categoria);

<<<<<<< HEAD
          var fotos = [p.imagem_url, p.imagem_url_2, p.imagem_url_3].filter(Boolean);
=======
          var fotos = [p.imagem_url, p.imagem_url_2, p.imagem_url_3].filter(Boolean).map(sanitizeImgUrl).filter(Boolean);
          var nomeSeguro = escapeHtml(p.nome);
          var categoriaSegura = escapeHtml(p.categoria);
>>>>>>> d70e05d (backup de segurança pentest)

          var pontosHtml = '';
          if (fotos.length > 1) {
            pontosHtml = '<div class="product-thumbs">' +
              fotos.map(function (url, i) {
<<<<<<< HEAD
                return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-img="' + url + '" aria-label="Ver foto ' + (i + 1) + '"></button>';
=======
                return '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-img="' + escapeHtml(url) + '" aria-label="Ver foto ' + (i + 1) + '"></button>';
>>>>>>> d70e05d (backup de segurança pentest)
              }).join('') +
              '</div>';
          }

<<<<<<< HEAD
          var linkProduto = location.origin + location.pathname + '#produto-' + p.id;

          itemCard.innerHTML =
            '<div class="product-art"><img src="' + fotos[0] + '" alt="' + p.nome + '" loading="lazy"></div>' +
            pontosHtml +
            '<p class="cat-label">' + p.categoria + '</p>' +
            '<h4>' + p.nome + '</h4>' +
            '<p class="product-price">' +
              '<span class="from">A partir de</span>' +
              '<span class="amount">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</span>' +
            '</p>' +
            '<button class="btn btn-outline btn-sm" data-whatsapp-product="' + p.nome + '" data-whatsapp-link="' + linkProduto + '">Comprar no WhatsApp</button>';
=======
          var linkProduto = location.origin + location.pathname + '#produto-' + encodeURIComponent(p.id);

          itemCard.innerHTML =
            '<div class="product-art"><img src="' + escapeHtml(fotos[0] || '') + '" alt="' + nomeSeguro + '" loading="lazy"></div>' +
            pontosHtml +
            '<p class="cat-label">' + categoriaSegura + '</p>' +
            '<h4>' + nomeSeguro + '</h4>' +
            '<p class="product-price">' +
              '<span class="from">A partir de</span>' +
              '<span class="amount">R$ ' + escapeHtml(parseFloat(p.preco).toFixed(2).replace('.', ',')) + '</span>' +
            '</p>' +
            '<button class="btn btn-outline btn-sm" data-whatsapp-product="' + nomeSeguro + '" data-whatsapp-link="' + escapeHtml(linkProduto) + '">Comprar no WhatsApp</button>';
>>>>>>> d70e05d (backup de segurança pentest)

          // Troca a foto principal ao clicar nos pontinhos, sem alterar a moldura do card
          var imgPrincipal = itemCard.querySelector('.product-art img');
          itemCard.querySelectorAll('.product-thumbs button').forEach(function (dot) {
            dot.addEventListener('click', function () {
              imgPrincipal.src = dot.getAttribute('data-img');
              itemCard.querySelectorAll('.product-thumbs button').forEach(function (d) { d.classList.remove('active'); });
              dot.classList.add('active');
            });
          });

          containerGrid.appendChild(itemCard);
        });

        // Reativa comportamentos para os elementos recém-criados
        ativarBotoesWhatsApp();
        ativarFiltroCategorias();
        ativarReveal();
        destacarProdutoDaURL();
      }
    } catch (error) {
      console.error('Erro ao carregar produtos do banco:', error);
      // Em caso de erro, mantém as peças estáticas de exemplo já presentes no HTML.
    }
  }

  carregarVitrineBanco();

});
