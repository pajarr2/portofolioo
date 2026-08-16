/**
 * Boozt Electric Portfolio - Vanilla JS Controller
 * High-performance, zero-dependency.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Header Scroll Effect & Active State ---
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link-item');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');

  const onScroll = () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileDrawer.querySelectorAll('.nav-link-item').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Active section indicator
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.2, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(sec => observer.observe(sec));


  // --- 2. Portfolio Category Filtering ---
  const filterBtns = document.querySelectorAll('.filter-btn-pill');
  const projectCards = document.querySelectorAll('.project-squircle-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal || cat?.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
        }
      });
    });
  });


  // --- 3. Project Preview Modal ---
  const modal = document.getElementById('projectModal');
  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTechStack = document.getElementById('modalTechStack');
  const modalClose = document.getElementById('modalCloseBtn');

  const openModal = (card) => {
    if (!modal) return;

    const img = card.querySelector('.project-card-thumbnail img');
    const category = card.querySelector('.project-category-chip');
    const title = card.querySelector('.project-item-title');
    const desc = card.querySelector('.project-item-desc');
    const chips = card.querySelectorAll('.proj-tech-chip');

    if (modalImg && img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt || title?.textContent || 'Work preview';
    }
    if (modalCategory && category) modalCategory.textContent = category.textContent;
    if (modalTitle && title) modalTitle.textContent = title.textContent;
    if (modalDesc && desc) modalDesc.textContent = desc.textContent;

    if (modalTechStack) {
      modalTechStack.innerHTML = '';
      chips.forEach(c => {
        const span = document.createElement('span');
        span.className = 'proj-tech-chip';
        span.textContent = c.textContent;
        modalTechStack.appendChild(span);
      });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  projectCards.forEach(card => {
    const trigger = card.querySelectorAll('.project-card-thumbnail, .btn-explore-project');
    trigger.forEach(el => {
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
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });


  // --- 4. 1-Click Copy Email ---
  const copyBtn = document.querySelector('.btn-copy-email');
  const toast = document.getElementById('toastNotification');

  const showToast = (msg) => {
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email') || 'pajarmaulana190@gmail.com';
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


  // --- 5. Contact Form Handler ---
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name') || '';
      const email = fd.get('email') || '';
      const message = fd.get('message') || '';

      const targetEmail = copyBtn?.getAttribute('data-email') || 'pajarmaulana190@gmail.com';
      const mailto = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent('Inquiry from ' + name)}&body=${encodeURIComponent(message + '\n\nSender Email: ' + email)}`;

      window.location.href = mailto;
      showToast('Opening default email client...');
    });
  }
});
