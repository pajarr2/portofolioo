/**
 * Greenprint Portfolio — Vanilla JS controller
 * Zero dependencies. Every behavior degrades gracefully without JS.
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const staticMode = new URLSearchParams(window.location.search).has('static');
  if (staticMode) document.documentElement.classList.add('static-mode');

  /* ---------------------------------------------------------------------
     1. Header scroll state + active nav link
     --------------------------------------------------------------------- */
  const header = $('.site-header');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');
  const mobileToggle = $('.mobile-menu-btn');
  const mobileDrawer = $('.mobile-nav-drawer');

  const updateActiveSection = () => {
    const probe = window.scrollY + (header ? header.offsetHeight : 0) + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach((sec) => {
      if (sec.offsetTop <= probe) current = sec;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', isActive);
    });
  };

  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
    updateProgress();
    updateActiveSection();
  };

  /* ---------------------------------------------------------------------
     2. Scroll progress hairline
     --------------------------------------------------------------------- */
  const progress = $('.scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     3. Mobile drawer
     --------------------------------------------------------------------- */
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });

    $$('a', mobileDrawer).forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------------
      4. Active section indicator (scroll-based, deterministic)
     --------------------------------------------------------------------- */
  updateActiveSection();

  /* ---------------------------------------------------------------------
     5. Theme inversion toggle (persisted)
     --------------------------------------------------------------------- */
  const themeToggle = $('.theme-toggle');
  if (themeToggle) {
    const root = document.documentElement;
    const syncPressed = () => {
      themeToggle.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'inverted'));
    };
    syncPressed();

    themeToggle.addEventListener('click', () => {
      root.classList.add('theme-transition');
      const inverted = root.getAttribute('data-theme') === 'inverted';
      if (inverted) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'inverted');
      }
      try {
        localStorage.setItem('pajar-theme', inverted ? 'paper' : 'inverted');
      } catch (e) { /* storage unavailable */ }
      syncPressed();
      window.setTimeout(() => root.classList.remove('theme-transition'), 380);
    });
  }

  /* ---------------------------------------------------------------------
     6. Custom cursor (fine pointers only, respects reduced motion)
     --------------------------------------------------------------------- */
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const cursorDot = $('.cursor-dot');
  const cursorRing = $('.cursor-ring');

  if (finePointer && !reduceMotion && cursorDot && cursorRing) {
    document.documentElement.classList.add('has-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorVisible = false;

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorVisible) {
        cursorVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        document.body.classList.add('cursor-on');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));
    document.addEventListener('mouseenter', () => {
      if (cursorVisible) document.body.classList.add('cursor-on');
    });

    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;

      const isText = t.closest('input, textarea');
      document.body.classList.toggle('cursor-text', Boolean(isText));

      const isInteractive = t.closest('a, button, .filter-btn, .project-thumb, label');
      document.body.classList.toggle('cursor-hover', Boolean(isInteractive) && !isText);

      const isDarkZone = t.closest('[data-cursor-dark], .section--deep, .band');
      document.body.classList.toggle('cursor-dark', Boolean(isDarkZone));
    });
  }

  /* ---------------------------------------------------------------------
     7. Hero metric count-up (final text always exact)
     --------------------------------------------------------------------- */
  const metrics = $$('[data-count]');

  const countUp = (el) => {
    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const match = node.textContent.match(/^(\D*)(\d+)(\D*)$/);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits, 10);
    if (!Number.isFinite(target)) return;

    const duration = 1000;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = prefix + Math.round(eased * target) + (suffix || '');
      if (p < 1) requestAnimationFrame(tick);
      else node.textContent = prefix + target + (suffix || '');
    };
    requestAnimationFrame(tick);
  };

  if (metrics.length && 'IntersectionObserver' in window && !reduceMotion && !staticMode) {
    const metricObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        metricObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    metrics.forEach((el) => metricObserver.observe(el));
  }

  /* ---------------------------------------------------------------------
     8. Scroll reveal (staggered per parent group)
     --------------------------------------------------------------------- */
  const revealEls = $$('[data-reveal]');

  revealEls.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = $$('[data-reveal]', parent).filter((s) => s.parentElement === parent);
    el.style.setProperty('--stagger', siblings.indexOf(el));
  });

  if (revealEls.length && 'IntersectionObserver' in window && !staticMode) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => {
      el.classList.add('is-revealed');
      if (staticMode) {
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  /* ---------------------------------------------------------------------
     9. Portfolio filtering with FLIP animation
     --------------------------------------------------------------------- */
  const filterBtns = $$('.filter-btn');
  const projectCards = $$('.project-card');
  const flipEase = 'cubic-bezier(0.22, 0.8, 0.36, 1)';

  const matchesFilter = (card, value) => {
    const cat = card.getAttribute('data-category') || '';
    return value === 'all' || cat.split(/\s+/).includes(value);
  };

  const applyFilter = (value) => {
    const visibleBefore = new Map();
    projectCards.forEach((card) => {
      visibleBefore.set(card, !card.classList.contains('is-hidden'));
    });

    const firstRects = new Map();
    if (!reduceMotion) {
      projectCards.forEach((card) => {
        if (!card.classList.contains('is-hidden')) firstRects.set(card, card.getBoundingClientRect());
      });
    }

    projectCards.forEach((card) => {
      card.classList.toggle('is-hidden', !matchesFilter(card, value));
    });

    if (reduceMotion) return;

    requestAnimationFrame(() => {
      projectCards.forEach((card) => {
        if (card.classList.contains('is-hidden')) return;

        const wasVisible = visibleBefore.get(card);
        if (!wasVisible) {
          card.animate(
            [{ opacity: 0, transform: 'translateY(14px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
            { duration: 340, easing: flipEase }
          );
          return;
        }

        const first = firstRects.get(card);
        if (!first) return;
        const last = card.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (!dx && !dy) return;

        card.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: 420, easing: flipEase }
        );
      });
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.getAttribute('data-filter') || 'all');
    });
  });

  /* ---------------------------------------------------------------------
     10. Project preview modal
     --------------------------------------------------------------------- */
  const modal = $('#projectModal');
  const modalImg = $('#modalImg');
  const modalCategory = $('#modalCategory');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalTechStack = $('#modalTechStack');
  const modalClose = $('#modalCloseBtn');
  let lastFocused = null;

  const openModal = (card) => {
    if (!modal) return;

    const img = $('.project-thumb img', card);
    const category = $('.project-chip', card);
    const title = $('.project-title', card);
    const desc = $('.project-desc', card);
    const chips = $$('.tag--mono', card);

    if (modalImg && img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt || (title ? title.textContent : 'Work preview');
    }
    if (modalCategory && category) modalCategory.textContent = category.textContent;
    if (modalTitle && title) modalTitle.textContent = title.textContent;
    if (modalDesc && desc) modalDesc.textContent = desc.textContent;

    if (modalTechStack) {
      modalTechStack.innerHTML = '';
      chips.forEach((c) => {
        const span = document.createElement('span');
        span.className = 'tag tag--mono';
        span.textContent = c.textContent;
        modalTechStack.appendChild(span);
      });
    }

    lastFocused = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  projectCards.forEach((card) => {
    $$('.project-thumb, .btn-explore', card).forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(card);
      });
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
  });

  /* ---------------------------------------------------------------------
     11. One-click copy email + toast
     --------------------------------------------------------------------- */
  const copyBtn = $('.btn-copy-email');
  const toast = $('#toastNotification');

  const showToast = (msg) => {
    if (!toast) return;
    const msgEl = $('.toast-msg', toast);
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
const email = copyBtn.getAttribute('data-email') || 'pajarr2302@gmail.com';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast('Email copied to clipboard!');
      } catch (err) {
        showToast('Direct email: ' + email);
      }
    });
  }
  /* ---------------------------------------------------------------------
     12. Contact form -> Resend (via /api/contact)
     --------------------------------------------------------------------- */
  const form = $('#contactForm');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');

    const setSubmitting = (on) => {
      if (!submitBtn) return;
      submitBtn.disabled = on;
      if (!submitBtn.dataset.label) submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = on ? 'Sending…' : submitBtn.dataset.label;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const message = String(fd.get('message') || '').trim();
      const company = String(fd.get('company') || '').trim();

      setSubmitting(true);
      try {
        const r = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message, company }),
        });

        if (!r.ok) {
          let detail = '';
          try {
            const resData = await r.json();
            detail = resData.detail || resData.error || '';
            console.error('Contact error:', resData);
          } catch (err) { /* ignore */ }
          throw new Error(detail || `HTTP ${r.status}`);
        }

        form.reset();
        showToast('Message sent. I\'ll get back to you soon.');
      } catch (err) {
        showToast('Send failed. Email me directly: pajarr2302@gmail.com');
      } finally {
        setSubmitting(false);
      }
    });
  }
});