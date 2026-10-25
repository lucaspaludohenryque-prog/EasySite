/**
 * Easy Sites | Landing page behavior
 * - Header glass state and active section highlight (IntersectionObserver, no scroll listeners)
 * - Mobile menu with focus handling and Escape support
 * - Scroll reveal with 100ms cascading stagger for step, bento, portfolio, testimonials and plans
 * - Portfolio carousel controls and interactive detail modal (Lightbox)
 * - Budget simulator that sends the summary through WhatsApp
 */

const WHATSAPP_NUMBER = '5541997225030';

const CONFIG = {
  // Número de WhatsApp no formato internacional, só dígitos: 55 + DDD + número.
  whatsapp: WHATSAPP_NUMBER,
  types: {
    landing: { label: 'Landing page (1 página)', base: 147, includedPages: 1, pageCost: 20, days: 5 },
    institucional: { label: 'Site institucional (até 5 seções)', base: 197, includedPages: 5, pageCost: 20, days: 7 },
    completo: { label: 'Site completo (Catálogo & Pedidos)', base: 247, includedPages: 5, pageCost: 20, days: 7 },
    loja: { label: 'Site completo (Catálogo & Pedidos)', base: 247, includedPages: 5, pageCost: 20, days: 7 },
  },
  extras: {
    whatsapp: { label: 'Botão WhatsApp com mensagem pronta', price: 0, days: 0 },
    seo: { label: 'Perfil Google + SEO Local', price: 30, days: 1 },
    textos: { label: 'Criação de textos profissionais', price: 20, days: 1 },
    catalogo: { label: 'Cardápio / Catálogo interativo', price: 30, days: 1 },
    agendamento: { label: 'Formulário / Agendamento no WhatsApp', price: 25, days: 1 },
    // Legado para compatibilidade
    logo: { label: 'Criação de logotipo', price: 0, days: 0 },
    blog: { label: 'Blog', price: 0, days: 0 },
    idiomas: { label: 'Versão em inglês', price: 0, days: 0 },
  },
  expressRate: 0.3,
  maintenanceMonthly: 29,
};

const PLAN_MESSAGES = {
  Essencial: 'Olá! Vim pelo site da Easy Sites e quero contratar o Plano Essencial de R$ 147.',
  Profissional: 'Olá! Vim pelo site da Easy Sites e quero contratar o Plano Profissional de R$ 197.',
  Completo: 'Olá! Vim pelo site da Easy Sites e quero contratar o Plano Completo de R$ 247.',
  Premium: 'Olá! Vim pelo site da Easy Sites e quero contratar o Plano Completo de R$ 247.',
};

const GENERAL_QUESTION_MESSAGE = 'Olá! Vim pelo site da Easy Sites e gostaria de fazer um orçamento para o meu site.';

const PORTFOLIO_PROJECTS = {
  jaja: {
    title: 'Jajá Banho e Tosa',
    niche: 'Pet shop',
    img: 'assets/img/portfolio-jaja-banho-tosa.jpg',
    alt: 'Página inicial do site Jajá Banho e Tosa',
    delivered: [
      'Agendamento rápido de banho e tosa integrado direto ao WhatsApp',
      'Tabela interativa de serviços e pacotes com preços transparentes',
      'Configuração completa de SEO Local e Perfil da Empresa no Google',
    ],
  },
  padaria: {
    title: 'Padaria Novo Horizonte',
    niche: 'Padaria e Confeitaria',
    img: 'assets/img/portfolio-padaria-novo-horizonte.jpg',
    alt: 'Página inicial do site Padaria Novo Horizonte',
    delivered: [
      'Cardápio digital mobile-first com fotos em alta definição dos produtos',
      'Botão de encomenda rápida para retirada no balcão sem filas',
      'Presença destacada no Google Maps com horários e rotas atualizados',
    ],
  },
  doces: {
    title: 'Doces da Ká',
    niche: 'Confeitaria Artesanal',
    img: 'assets/img/portfolio-doces-da-ka.jpg',
    alt: 'Página inicial do site Doces da Ká',
    delivered: [
      'Vitrine visual com catálogo de bolos decorados e doces gourmet',
      'Botão de encomenda rápida com reserva de datas comemorativas',
      'Integração direta com o Instagram e atendimento via WhatsApp',
    ],
  },
  clinica: {
    title: 'Clínica Sorriso Vivo',
    niche: 'Clínica Odontológica (Projeto Conceito)',
    img: 'assets/img/portfolio-clinica-sorriso-vivo.jpg',
    alt: 'Página inicial do projeto conceito Clínica Sorriso Vivo',
    delivered: [
      'Apresentação clara dos tratamentos odontológicos e equipe médica',
      'Botão para triagem e agendamento de avaliação inicial no WhatsApp',
      'Estratégia de SEO local para atrair pacientes da sua região',
    ],
  },
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

document.documentElement.classList.add('js');

function whatsappUrl(message) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* ---------- Icons ---------- */
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ---------- Header ---------- */
function initHeader() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('topo');
  if (!header || !sentinel) return;

  new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(sentinel);

  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const header = document.getElementById('site-header');
  if (!toggle || !menu || !header) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.querySelector('a')?.focus();
    } else {
      menu.classList.remove('is-open');
      menu.hidden = true;
    }
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (mq) => {
    if (mq.matches) setOpen(false);
  });
}

/* ---------- Scroll reveal (Cascade stagger) ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  // Stagger siblings inside the same group.
  const groups = new Map();
  items.forEach((item) => {
    const parent = item.parentElement;
    const siblings = groups.get(parent) || [];
    item.style.setProperty('--i', siblings.length);
    siblings.push(item);
    groups.set(parent, siblings);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((item) => observer.observe(item));
}

/* ---------- Portfolio carousel ---------- */
function initPortfolio() {
  const track = document.getElementById('portfolio-track');
  const prev = document.getElementById('portfolio-prev');
  const next = document.getElementById('portfolio-next');
  if (!track || !prev || !next) return;

  const step = () => {
    const card = track.querySelector('.project');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
  };

  const behavior = prefersReducedMotion ? 'auto' : 'smooth';
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));

  const cards = [...track.querySelectorAll('.project')];
  const first = cards[0];
  const last = cards[cards.length - 1];
  if (!first || !last) return;

  const edgeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target === first) prev.disabled = entry.intersectionRatio > 0.95;
      if (entry.target === last) next.disabled = entry.intersectionRatio > 0.95;
    });
  }, { root: track, threshold: [0, 0.95, 1] });

  edgeObserver.observe(first);
  edgeObserver.observe(last);
}

/* ---------- Portfolio details modal (Lightbox) ---------- */
function initPortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('modal-close-btn');
  const ctaBtn = document.getElementById('modal-cta-btn');
  const imgEl = document.getElementById('modal-project-img');
  const nicheEl = document.getElementById('modal-project-niche');
  const titleEl = document.getElementById('modal-project-title');
  const deliveredEl = document.getElementById('modal-project-delivered');

  let lastFocusedElement = null;

  const open = (projectId) => {
    const project = PORTFOLIO_PROJECTS[projectId];
    if (!project) return;

    lastFocusedElement = document.activeElement;
    imgEl.src = project.img;
    imgEl.alt = project.alt;
    nicheEl.textContent = project.niche;
    titleEl.textContent = project.title;

    deliveredEl.innerHTML = project.delivered
      .map((item) => `<li><i data-lucide="check"></i><span>${item}</span></li>`)
      .join('');

    if (ctaBtn) {
      const customMsg = `Olá! Vim pelo site da Easy Sites e gostei muito do projeto ${project.title} (${project.niche}). Quero um site assim no meu negócio!`;
      ctaBtn.href = whatsappUrl(customMsg);
    }

    initIcons();

    modal.classList.remove('modal-hidden');
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.add('modal-hidden');
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }, 320);
  };

  // Open triggers on buttons and card preview click
  document.querySelectorAll('[data-open-project]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      open(btn.dataset.openProject);
    });
  });

  document.querySelectorAll('.project[data-project]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      open(card.dataset.project);
    });
  });

  closeBtn?.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden && modal.classList.contains('is-open')) {
      close();
    }
  });

  ctaBtn?.addEventListener('click', () => {
    close();
  });
}

/* ---------- Testimonials ---------- */
function initQuotes() {
  const quotes = [...document.querySelectorAll('#quotes .quote')];
  const prev = document.getElementById('quote-prev');
  const next = document.getElementById('quote-next');
  const count = document.getElementById('quote-count');
  if (quotes.length === 0 || !prev || !next || !count) return;

  let current = 0;
  const show = (index) => {
    current = (index + quotes.length) % quotes.length;
    quotes.forEach((quote, i) => {
      const active = i === current;
      quote.hidden = !active;
      quote.classList.toggle('is-active', active);
    });
    count.textContent = `${current + 1} de ${quotes.length}`;
  };

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
}

/* ---------- WhatsApp links ---------- */
function initWhatsappLinks() {
  // Plan CTAs
  document.querySelectorAll('[data-plan]').forEach((link) => {
    const plan = link.dataset.plan;
    const msg = PLAN_MESSAGES[plan] || `Olá! Vim pelo site da Easy Sites e quero contratar o Plano ${plan}.`;
    link.href = whatsappUrl(msg);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  // Floating button, footer and general contacts
  document.querySelectorAll('[data-whatsapp="contact"]').forEach((link) => {
    link.href = whatsappUrl(GENERAL_QUESTION_MESSAGE);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  ['wa-float', 'footer-whatsapp', 'final-cta-whatsapp'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.href = whatsappUrl(GENERAL_QUESTION_MESSAGE);
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });
}

/* ---------- Budget simulator ---------- */
function initSimulator() {
  const form = document.getElementById('sim-form');
  if (!form) return;

  const range = document.getElementById('sim-pages');
  const rangeOutput = document.getElementById('sim-pages-output');
  const rangeHelp = document.getElementById('sim-pages-help');
  const linesEl = document.getElementById('sim-lines');
  const totalEl = document.getElementById('sim-total');
  const monthlyEl = document.getElementById('sim-monthly');
  const deliveryEl = document.getElementById('sim-delivery');
  const nameInput = document.getElementById('sim-name');
  const businessInput = document.getElementById('sim-business');

  // Checkboxes
  const checkWhatsapp = document.getElementById('sim-extra-whatsapp');
  const checkSeo = document.getElementById('sim-extra-seo');
  const checkTextos = document.getElementById('sim-extra-textos');
  const checkCatalogo = document.getElementById('sim-extra-catalogo');
  const checkAgendamento = document.getElementById('sim-extra-agendamento');

  // Badges
  const badgeWhatsapp = document.getElementById('sim-badge-whatsapp');
  const badgeSeo = document.getElementById('sim-badge-seo');
  const badgeTextos = document.getElementById('sim-badge-textos');
  const badgeCatalogo = document.getElementById('sim-badge-catalogo');
  const badgeAgendamento = document.getElementById('sim-badge-agendamento');

  let displayedTotal = 197;
  let frame = null;
  let currentTypeKey = 'institucional';

  // Preserve user optional choices when inputs are available
  const userChecked = {
    seo: false,
    textos: false,
    catalogo: false,
    agendamento: false,
  };

  const syncTypeRules = (typeKey) => {
    // 1. WhatsApp is always included and disabled
    if (checkWhatsapp) {
      checkWhatsapp.checked = true;
      checkWhatsapp.disabled = true;
      if (badgeWhatsapp) {
        badgeWhatsapp.textContent = '(Grátis / Incluso - R$ 0)';
        badgeWhatsapp.className = 'badge--included';
      }
    }

    // 2. Rules based on type
    if (typeKey === 'landing') {
      // Range slider disabled at 1
      if (range) {
        range.value = '1';
        range.disabled = true;
      }

      // Checkboxes available as paid additions
      if (checkSeo) {
        checkSeo.disabled = false;
        checkSeo.checked = userChecked.seo;
        if (badgeSeo) {
          badgeSeo.textContent = '(+R$ 30)';
          badgeSeo.className = '';
        }
      }
      if (checkTextos) {
        checkTextos.disabled = false;
        checkTextos.checked = userChecked.textos;
        if (badgeTextos) {
          badgeTextos.textContent = '(+R$ 20)';
          badgeTextos.className = '';
        }
      }
      if (checkCatalogo) {
        checkCatalogo.disabled = false;
        checkCatalogo.checked = userChecked.catalogo;
        if (badgeCatalogo) {
          badgeCatalogo.textContent = '(+R$ 30)';
          badgeCatalogo.className = '';
        }
      }
      if (checkAgendamento) {
        checkAgendamento.disabled = false;
        checkAgendamento.checked = userChecked.agendamento;
        if (badgeAgendamento) {
          badgeAgendamento.textContent = '(+R$ 25)';
          badgeAgendamento.className = '';
        }
      }
    } else if (typeKey === 'institucional') {
      // Range slider enabled, base 5
      if (range) {
        range.disabled = false;
        if (Number(range.value) < 5) range.value = '5';
      }

      // SEO & Textos: automatically checked, disabled, (Incluso no plano • R$ 0)
      if (checkSeo) {
        checkSeo.checked = true;
        checkSeo.disabled = true;
        if (badgeSeo) {
          badgeSeo.textContent = '(Incluso no plano • R$ 0)';
          badgeSeo.className = 'badge--included';
        }
      }
      if (checkTextos) {
        checkTextos.checked = true;
        checkTextos.disabled = true;
        if (badgeTextos) {
          badgeTextos.textContent = '(Incluso no plano • R$ 0)';
          badgeTextos.className = 'badge--included';
        }
      }

      // Catálogo & Agendamento: available as paid additions
      if (checkCatalogo) {
        checkCatalogo.disabled = false;
        checkCatalogo.checked = userChecked.catalogo;
        if (badgeCatalogo) {
          badgeCatalogo.textContent = '(+R$ 30)';
          badgeCatalogo.className = '';
        }
      }
      if (checkAgendamento) {
        checkAgendamento.disabled = false;
        checkAgendamento.checked = userChecked.agendamento;
        if (badgeAgendamento) {
          badgeAgendamento.textContent = '(+R$ 25)';
          badgeAgendamento.className = '';
        }
      }
    } else if (typeKey === 'completo') {
      // Range slider enabled, base 5
      if (range) {
        range.disabled = false;
        if (Number(range.value) < 5) range.value = '5';
      }

      // All 4 checkboxes: automatically checked, disabled, (Incluso no plano • R$ 0)
      [
        { el: checkSeo, badge: badgeSeo },
        { el: checkTextos, badge: badgeTextos },
        { el: checkCatalogo, badge: badgeCatalogo },
        { el: checkAgendamento, badge: badgeAgendamento },
      ].forEach(({ el, badge }) => {
        if (el) {
          el.checked = true;
          el.disabled = true;
        }
        if (badge) {
          badge.textContent = '(Incluso no plano • R$ 0)';
          badge.className = 'badge--included';
        }
      });
    }

    currentTypeKey = typeKey;
  };

  const read = () => {
    const typeKey = form.elements.type ? form.elements.type.value : 'institucional';
    const type = CONFIG.types[typeKey] || CONFIG.types.institucional;
    const pages = typeKey === 'landing' ? 1 : Number(range ? range.value : 5);
    const extraPages = Math.max(0, pages - type.includedPages);

    const items = [
      {
        key: 'whatsapp',
        label: 'Botão WhatsApp com mensagem pronta',
        price: 0,
        included: true,
        text: 'Grátis / Incluso',
      },
    ];

    if (typeKey === 'landing') {
      if (checkSeo?.checked) {
        items.push({ key: 'seo', label: 'Perfil Google + SEO Local', price: 30, included: false, text: brl.format(30) });
      }
      if (checkTextos?.checked) {
        items.push({ key: 'textos', label: 'Criação de Textos Profissionais', price: 20, included: false, text: brl.format(20) });
      }
      if (checkCatalogo?.checked) {
        items.push({ key: 'catalogo', label: 'Cardápio / Catálogo Interativo', price: 30, included: false, text: brl.format(30) });
      }
      if (checkAgendamento?.checked) {
        items.push({ key: 'agendamento', label: 'Formulário / Agendamento WhatsApp', price: 25, included: false, text: brl.format(25) });
      }
    } else if (typeKey === 'institucional') {
      items.push({ key: 'seo', label: 'Perfil Google + SEO Local', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
      items.push({ key: 'textos', label: 'Criação de Textos Profissionais', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
      if (checkCatalogo?.checked) {
        items.push({ key: 'catalogo', label: 'Cardápio / Catálogo Interativo', price: 30, included: false, text: brl.format(30) });
      }
      if (checkAgendamento?.checked) {
        items.push({ key: 'agendamento', label: 'Formulário / Agendamento WhatsApp', price: 25, included: false, text: brl.format(25) });
      }
    } else if (typeKey === 'completo') {
      items.push({ key: 'seo', label: 'Perfil Google + SEO Local', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
      items.push({ key: 'textos', label: 'Criação de Textos Profissionais', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
      items.push({ key: 'catalogo', label: 'Cardápio / Catálogo Interativo', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
      items.push({ key: 'agendamento', label: 'Formulário / Agendamento WhatsApp', price: 0, included: true, text: 'Incluso no plano (R$ 0)' });
    }

    const express = form.elements.deadline ? form.elements.deadline.value === 'express' : false;
    const maintenanceInput = document.getElementById('sim-maintenance');
    const maintenance = maintenanceInput ? maintenanceInput.checked : false;

    return { typeKey, type, pages, extraPages, items, express, maintenance };
  };

  const calculate = (state) => {
    const pagesCost = state.extraPages * state.type.pageCost;
    const extrasCost = state.items.reduce((sum, item) => sum + item.price, 0);
    const subtotal = state.type.base + pagesCost + extrasCost;
    const expressCost = state.express ? Math.round(subtotal * CONFIG.expressRate) : 0;
    const total = subtotal + expressCost;

    let days = state.type.days;
    if (state.extraPages > 0) {
      days += Math.ceil(state.extraPages / 3);
    }
    if (state.express) {
      days = state.typeKey === 'landing' ? 3 : 5;
    }

    return {
      pagesCost,
      extrasCost,
      expressCost,
      subtotal,
      total,
      monthly: state.maintenance ? CONFIG.maintenanceMonthly : 0,
      days,
    };
  };

  const animateTotal = (target) => {
    if (frame) cancelAnimationFrame(frame);
    if (prefersReducedMotion) {
      displayedTotal = target;
      if (totalEl) totalEl.textContent = brl.format(target);
      return;
    }
    const start = displayedTotal;
    const startTime = performance.now();
    const duration = 400;
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      displayedTotal = Math.round(start + (target - start) * eased);
      if (totalEl) totalEl.textContent = brl.format(displayedTotal);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };

  const line = (label, value) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    const amount = document.createElement('span');
    name.textContent = label;
    amount.textContent = value;
    li.append(name, amount);
    return li;
  };

  const render = () => {
    const newTypeKey = form.elements.type ? form.elements.type.value : 'institucional';
    if (newTypeKey !== currentTypeKey) {
      syncTypeRules(newTypeKey);
    }

    const state = read();
    const result = calculate(state);

    const isLanding = state.typeKey === 'landing';
    if (range) {
      range.disabled = isLanding;
      const fill = ((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
      range.style.setProperty('--fill', `${isLanding ? 0 : fill}%`);
    }
    if (rangeOutput) {
      rangeOutput.textContent = state.pages === 1 ? '1 página' : `${state.pages} páginas`;
    }
    if (rangeHelp) {
      rangeHelp.textContent = isLanding
        ? 'A landing page tem 1 página única focada em conversão.'
        : `${state.type.includedPages} páginas inclusas no pacote base. Cada página adicional custa + ${brl.format(state.type.pageCost)}.`;
    }

    if (linesEl) {
      const lines = [line(state.type.label, brl.format(state.type.base))];
      if (state.extraPages > 0) {
        lines.push(line(`${state.extraPages} página${state.extraPages > 1 ? 's' : ''} adicional${state.extraPages > 1 ? 'is' : ''}`, brl.format(result.pagesCost)));
      }
      state.items.forEach((item) => {
        lines.push(line(item.label, item.text));
      });
      if (state.express) {
        lines.push(line('Entrega expressa (+30%)', brl.format(result.expressCost)));
      }
      linesEl.replaceChildren(...lines);
    }

    animateTotal(result.total);

    if (monthlyEl) {
      if (state.maintenance) {
        monthlyEl.hidden = false;
        monthlyEl.innerHTML = '<span class="summary__monthly-tag">+ R$ 29/mês após 30 dias</span>';
      } else {
        monthlyEl.hidden = true;
        monthlyEl.innerHTML = '';
      }
    }

    if (deliveryEl) {
      deliveryEl.textContent = `Entrega em até ${result.days} dias úteis`;
    }

    return { state, result };
  };

  const validateField = (input) => {
    if (!input) return true;
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    const valid = input.value.trim().length >= 2;
    input.setAttribute('aria-invalid', String(!valid));
    if (error) error.hidden = valid;
    return valid;
  };

  // Remember user selections when ticking checkboxes directly
  [checkSeo, checkTextos, checkCatalogo, checkAgendamento].forEach((chk) => {
    chk?.addEventListener('change', () => {
      if (!chk.disabled) {
        if (chk === checkSeo) userChecked.seo = chk.checked;
        if (chk === checkTextos) userChecked.textos = chk.checked;
        if (chk === checkCatalogo) userChecked.catalogo = chk.checked;
        if (chk === checkAgendamento) userChecked.agendamento = chk.checked;
      }
    });
  });

  form.addEventListener('input', (event) => {
    if (event.target === nameInput || event.target === businessInput) {
      if (event.target.getAttribute('aria-invalid') === 'true') validateField(event.target);
      return;
    }
    render();
  });

  form.addEventListener('change', render);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameOk = validateField(nameInput);
    const businessOk = validateField(businessInput);
    if (!nameOk || !businessOk) {
      (nameOk ? businessInput : nameInput)?.focus();
      return;
    }

    const { state, result } = render();
    const clientName = nameInput ? nameInput.value.trim() : '';
    const clientBusiness = businessInput ? businessInput.value.trim() : '';

    const inclusos = state.items.filter((item) => item.included).map((item) => item.label);
    const opcionais = state.items.filter((item) => !item.included).map((item) => `${item.label} (+${brl.format(item.price)})`);

    const message = [
      `Olá, Easy Sites! Meu nome é ${clientName}, do negócio ${clientBusiness}.`,
      `Gostaria de solicitar uma proposta com base na simulação do site:`,
      ``,
      `📌 Tipo de site: ${state.type.label} (${brl.format(state.type.base)})`,
      `📄 Páginas: ${state.pages} página(s)${state.extraPages > 0 ? ` (+${state.extraPages} adicional(is): ${brl.format(result.pagesCost)})` : ' (Inclusas no pacote)'}`,
      `✨ Inclusos no plano: ${inclusos.join(', ')}`,
      `➕ Adicionais contratados: ${opcionais.length ? opcionais.join(', ') : 'Nenhum'}`,
      `⏱️ Prazo de entrega: ${state.express ? 'Expresso (+30%)' : 'Normal'} (até ${result.days} dias úteis)`,
      `🔄 Manutenção mensal: ${state.maintenance ? 'Sim (+ R$ 29/mês após 30 dias grátis)' : 'Não selecionada'}`,
      ``,
      `💰 Total estimado: ${brl.format(result.total)}${state.maintenance ? ' + R$ 29/mês após 30 dias' : ''}`,
      ``,
      `Podemos conversar sobre o meu projeto?`,
    ].join('\n');

    window.open(whatsappUrl(message), '_blank', 'noopener');
  });

  // Initial setup: Institucional R$ 197
  syncTypeRules('institucional');
  render();
}

/* ---------- Footer year ---------- */
function initYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initHeader();
  initMobileMenu();
  initReveal();
  initPortfolio();
  initPortfolioModal();
  initQuotes();
  initWhatsappLinks();
  initSimulator();
  initYear();
});
