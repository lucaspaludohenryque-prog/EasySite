/**
 * Easy Sites | Landing page behavior
 * - Header glass state and active section highlight (IntersectionObserver, no scroll listeners)
 * - Mobile menu with focus handling and Escape support
 * - Scroll reveal for step, bento and plan groups
 * - Portfolio carousel controls and testimonial slider
 * - Budget simulator that sends the summary through WhatsApp
 */

const CONFIG = {
  // Número de WhatsApp no formato internacional, só dígitos: 55 + DDD + número.
  whatsapp: '5500000000000',
  types: {
    landing: { label: 'Landing page', base: 497, includedPages: 1, pageCost: 0, days: 5 },
    institucional: { label: 'Site institucional', base: 997, includedPages: 5, pageCost: 120, days: 7 },
    loja: { label: 'Loja virtual', base: 1797, includedPages: 5, pageCost: 150, days: 15 },
  },
  extras: {
    logo: { label: 'Criação de logotipo', price: 350, days: 2 },
    textos: { label: 'Textos profissionais', price: 250, days: 1 },
    agendamento: { label: 'Agendamento online', price: 400, days: 2 },
    blog: { label: 'Blog', price: 300, days: 1 },
    seo: { label: 'SEO avançado', price: 300, days: 1 },
    idiomas: { label: 'Versão em inglês', price: 450, days: 3 },
  },
  expressRate: 0.3,
  maintenanceMonthly: 59,
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

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  // Stagger siblings inside the same group.
  const groups = new Map();
  items.forEach((item) => {
    const siblings = groups.get(item.parentElement) || [];
    item.style.setProperty('--i', siblings.length);
    siblings.push(item);
    groups.set(item.parentElement, siblings);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

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
  document.querySelectorAll('[data-whatsapp="contact"]').forEach((link) => {
    link.href = whatsappUrl('Olá, Easy Sites! Quero saber mais sobre a criação de um site para o meu negócio.');
  });

  document.querySelectorAll('[data-plan]').forEach((link) => {
    link.href = whatsappUrl(`Olá, Easy Sites! Tenho interesse no plano ${link.dataset.plan}. Podemos conversar?`);
    link.target = '_blank';
    link.rel = 'noopener';
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

  let displayedTotal = 0;
  let frame = null;

  const read = () => {
    const typeKey = form.elements.type.value;
    const type = CONFIG.types[typeKey];
    const pages = typeKey === 'landing' ? 1 : Number(range.value);
    const extraPages = Math.max(0, pages - type.includedPages);
    const extras = [...form.querySelectorAll('input[name="extras"]:checked')]
      .map((input) => ({ key: input.value, ...CONFIG.extras[input.value] }));
    const express = form.elements.deadline.value === 'express';
    const maintenance = document.getElementById('sim-maintenance').checked;
    return { typeKey, type, pages, extraPages, extras, express, maintenance };
  };

  const calculate = (state) => {
    const pagesCost = state.extraPages * state.type.pageCost;
    const extrasCost = state.extras.reduce((sum, extra) => sum + extra.price, 0);
    const subtotal = state.type.base + pagesCost + extrasCost;
    const expressCost = state.express ? Math.round(subtotal * CONFIG.expressRate) : 0;

    let days = state.type.days
      + Math.ceil(state.extraPages / 3)
      + state.extras.reduce((sum, extra) => sum + extra.days, 0);
    if (state.express) days = Math.max(3, Math.ceil(days * 0.6));

    return {
      pagesCost,
      expressCost,
      total: subtotal + expressCost,
      monthly: state.maintenance ? CONFIG.maintenanceMonthly : 0,
      days,
    };
  };

  const animateTotal = (target) => {
    if (frame) cancelAnimationFrame(frame);
    if (prefersReducedMotion) {
      displayedTotal = target;
      totalEl.textContent = brl.format(target);
      return;
    }
    const start = displayedTotal;
    const startTime = performance.now();
    const duration = 500;
    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      displayedTotal = Math.round(start + (target - start) * eased);
      totalEl.textContent = brl.format(displayedTotal);
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
    const state = read();
    const result = calculate(state);

    const isLanding = state.typeKey === 'landing';
    range.disabled = isLanding;
    const fill = ((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
    range.style.setProperty('--fill', `${isLanding ? 0 : fill}%`);
    rangeOutput.textContent = state.pages === 1 ? '1 página' : `${state.pages} páginas`;
    rangeHelp.textContent = isLanding
      ? 'A landing page tem 1 página longa com todas as seções.'
      : `${state.type.includedPages} páginas inclusas. Cada página extra custa ${brl.format(state.type.pageCost)}.`;

    const lines = [line(state.type.label, brl.format(state.type.base))];
    if (state.extraPages > 0) {
      lines.push(line(`${state.extraPages} página${state.extraPages > 1 ? 's' : ''} extra${state.extraPages > 1 ? 's' : ''}`, brl.format(result.pagesCost)));
    }
    state.extras.forEach((extra) => lines.push(line(extra.label, brl.format(extra.price))));
    if (state.express) lines.push(line('Entrega expressa', brl.format(result.expressCost)));
    linesEl.replaceChildren(...lines);

    animateTotal(result.total);
    monthlyEl.hidden = !state.maintenance;
    monthlyEl.textContent = `+ ${brl.format(result.monthly)}/mês de manutenção`;
    deliveryEl.textContent = `Entrega em até ${result.days} dias úteis`;

    return { state, result };
  };

  const validateField = (input) => {
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    const valid = input.value.trim().length >= 2;
    input.setAttribute('aria-invalid', String(!valid));
    if (error) error.hidden = valid;
    return valid;
  };

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
      (nameOk ? businessInput : nameInput).focus();
      return;
    }

    const { state, result } = render();
    const extrasText = state.extras.length ? state.extras.map((extra) => extra.label).join(', ') : 'Nenhum';
    const message = [
      `Olá, Easy Sites! Meu nome é ${nameInput.value.trim()}, do negócio ${businessInput.value.trim()}.`,
      'Fiz uma simulação no site:',
      `- Tipo: ${state.type.label}`,
      `- Páginas: ${state.pages}`,
      `- Adicionais: ${extrasText}`,
      `- Prazo: ${state.express ? 'Expresso' : 'Normal'} (até ${result.days} dias úteis)`,
      `- Manutenção mensal: ${state.maintenance ? 'Sim' : 'Não'}`,
      `- Total estimado: ${brl.format(result.total)}${state.maintenance ? ` + ${brl.format(result.monthly)}/mês` : ''}`,
      'Podemos conversar?',
    ].join('\n');

    window.open(whatsappUrl(message), '_blank', 'noopener');
  });

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
  initQuotes();
  initWhatsappLinks();
  initSimulator();
  initYear();
});
