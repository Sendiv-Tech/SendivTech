/* ===========================
   SENDIVTECH — APP.JS
   Handles: Navbar, Projects, Contact Form, Admin Login, Animations
   =========================== */

// ── Utility ──────────────────────────────────────────
// Using 'goTo' to avoid collision with native window.scrollTo(x,y)
function goTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function $(id) { return document.getElementById(id); }

function showEl(id) { const e=$(id); if(e) e.classList.remove('hidden'); }
function hideEl(id) { const e=$(id); if(e) e.classList.add('hidden'); }

// ── Storage helpers ───────────────────────────────────
const DB = {
  getProjects() {
    try { return JSON.parse(localStorage.getItem('st_projects') || '[]'); } catch { return []; }
  },
  getLogo() { return localStorage.getItem('st_logo') || null; },
  // Auth: use localStorage with 8-hour session expiry
  isAdmin() {
    const ts = parseInt(localStorage.getItem('st_admin_ts') || '0', 10);
    return ts > 0 && (Date.now() - ts) < 8 * 60 * 60 * 1000; // 8 hours
  },
  setAdmin() { localStorage.setItem('st_admin_ts', String(Date.now())); },
  logout() { localStorage.removeItem('st_admin_ts'); }
};

// ── Navbar scroll effect ─────────────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ── Hamburger menu ────────────────────────────────────
(function initHamburger() {
  const btn = $('hamburger');
  const links = $('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
    });
  });
})();

// ── Logo display ──────────────────────────────────────
function renderLogo() {
  const logo = DB.getLogo();
  const targets = [
    { wrap: 'navLogo', imgId: 'navLogoImg', textId: null, textEl: $('navLogo') },
    { wrap: 'footerLogoWrap', imgId: 'footerLogoImg', textId: null, textEl: $('footerLogoWrap') }
  ];
  if (!logo) return;
  targets.forEach(t => {
    const wrap = $(t.wrap);
    if (!wrap) return;
    // Check if image already injected
    let img = wrap.querySelector('img');
    if (!img) {
      // Hide text, inject image
      const textEl = wrap.querySelector('.logo-text');
      if (textEl) textEl.style.display = 'none';
      img = document.createElement('img');
      img.id = t.imgId || 'logoImg_' + t.wrap;
      img.alt = 'SendivTech Logo';
      img.style.cssText = 'height:36px;width:auto;object-fit:contain;border-radius:6px;';
      wrap.insertBefore(img, wrap.firstChild);
    }
    img.src = logo;
  });
}

// ── Projects rendering ────────────────────────────────
const CAT_ICONS = { web: '🖥️', video: '🎬', poster: '🎨', other: '📁' };
const CAT_LABELS = { web: 'Web Design', video: 'Video', poster: 'Poster', other: 'Other', all: 'All' };

function renderProjects(filter = 'all') {
  const grid = $('projectsGrid');
  const empty = $('noProjects');
  if (!grid) return;

  const projects = DB.getProjects();
  const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = filtered.map(p => `
    <div class="proj-card fade-up" data-id="${p.id}" onclick="openProject('${p.id}')">
      ${p.image
        ? `<img class="proj-img" src="${p.image}" alt="${p.title}" loading="lazy"/>`
        : `<div class="proj-img-placeholder">${CAT_ICONS[p.cat] || '📁'}</div>`
      }
      <div class="proj-info">
        <div class="proj-cat">${CAT_LABELS[p.cat] || p.cat}</div>
        <h3>${p.title}</h3>
        <p>${(p.desc || '').slice(0, 100)}${(p.desc||'').length > 100 ? '…' : ''}</p>
        <span class="proj-view-btn">View Project →</span>
      </div>
    </div>
  `).join('');

  observeFadeUps();
}

function openProject(id) {
  const projects = DB.getProjects();
  const p = projects.find(x => x.id === id);
  if (!p) return;

  const modal = $('projModalContent');
  const overlay = $('projOverlay');
  if (!modal || !overlay) return;

  modal.innerHTML = `
    <button class="modal-x" onclick="closeProjModal()">✕</button>
    ${p.image
      ? `<img class="pm-img" src="${p.image}" alt="${p.title}"/>`
      : `<div class="pm-img-placeholder">${CAT_ICONS[p.cat] || '📁'}</div>`
    }
    <div class="pm-cat">${CAT_LABELS[p.cat] || p.cat}</div>
    <h2 class="pm-title">${p.title}</h2>
    <p class="pm-desc">${p.desc || 'A project by SendivTech.'}</p>
    ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="pm-link">View Live →</a>` : ''}
  `;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeProjModal() {
  const overlay = $('projOverlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// Project filters
(function initFilters() {
  const btns = document.querySelectorAll('.pf-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.cat);
    });
  });
})();

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = $('projOverlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeProjModal();
    });
  }
});

// ── Contact Form ──────────────────────────────────────
(function initContactForm() {
  const form = $('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    hideEl('formSuccess');
    hideEl('formError');

    const name = $('cf-name')?.value.trim();
    const email = $('cf-email')?.value.trim();
    const service = $('cf-service')?.value;
    const message = $('cf-message')?.value.trim();

    // Basic validation
    let valid = true;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !service || !message) valid = false;
    if (email && !emailRe.test(email)) valid = false;

    if (!valid) {
      showEl('formError');
      return;
    }

    // Submit (mailto fallback — works without a backend)
    const subject = encodeURIComponent(`New Project Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${$('cf-phone')?.value || 'N/A'}\nService: ${service}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:info@sendivtech.in?subject=${subject}&body=${body}`;

    // Show success
    showEl('formSuccess');
    form.reset();
  });
})();

// ── Admin Login Modal ─────────────────────────────────
(function initAdminLogin() {
  const trigger = $('adminTrigger');
  const overlay = $('adminOverlay');
  const closeBtn = $('adminClose');
  const loginBtn = $('loginBtn');
  const errEl = $('loginErr');

  if (!trigger || !overlay) return;

  trigger.addEventListener('click', () => {
    if (DB.isAdmin()) {
      window.location.href = 'admin.html';
    } else {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });

  closeBtn?.addEventListener('click', closeAdminModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAdminModal(); });

  function closeAdminModal() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (errEl) errEl.classList.add('hidden');
  }

  $('ap')?.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn?.click(); });

  loginBtn?.addEventListener('click', () => {
    const user = $('au')?.value.trim();
    const pass = $('ap')?.value;

    // Default credentials (change in admin.html settings)
    const storedUser = localStorage.getItem('st_adminUser') || 'admin';
    const storedPass = localStorage.getItem('st_adminPass') || 'sendivtech2024';

    if (user === storedUser && pass === storedPass) {
      DB.setAdmin();
      closeAdminModal();
      window.location.href = 'admin.html';
    } else {
      if (errEl) errEl.classList.remove('hidden');
      $('ap').value = '';
      $('ap').focus();
    }
  });
})();

// ── Intersection Observer (fade-up) ──────────────────
function observeFadeUps() {
  const els = document.querySelectorAll('.fade-up:not(.visible)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('visible'));
  }
}

// ── Init on load ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderLogo();
  renderProjects();
  observeFadeUps();

  // Add fade-up to section elements
  document.querySelectorAll('.svc-card, .why-card, .testi-card, .proc-step, .sec-head')
    .forEach((el, i) => {
      el.classList.add('fade-up');
      el.style.transitionDelay = (i % 4 * 0.08) + 's';
    });
  observeFadeUps();
});