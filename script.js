/* ============================================================
   SAILS Advisory — script.js
   - Mobile nav toggle
   - Smooth scroll close on link click
   - IntersectionObserver reveal animations
   - Form submit feedback (Netlify Forms via AJAX)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    const closeMenu = () => {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };

    // Close menu when a link is clicked (mobile)
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close if user resizes up to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 880) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Contact form (Netlify Forms AJAX) ---------- */
  const form = document.querySelector('form[name="contact"]');
  if (form) {
    const status = form.querySelector('.form__status');

    form.addEventListener('submit', async (e) => {
      // Honeypot — silently bail if filled
      const hp = form.querySelector('[name="bot-field"]');
      if (hp && hp.value) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      form.classList.add('is-submitting');
      if (status) {
        status.textContent = '';
        status.className = 'form__status';
      }

      const data = new FormData(form);
      const body = new URLSearchParams(data).toString();

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        if (!res.ok) throw new Error('Network response was not ok');

        form.reset();
        if (status) {
          status.textContent = "Got it. I'll get back to you within one business day.";
          status.classList.add('is-success');
        }
      } catch (err) {
        if (status) {
          status.textContent = "Something went wrong. Email me directly at matt@sailsadvisory.com.";
          status.classList.add('is-error');
        }
      } finally {
        form.classList.remove('is-submitting');
      }
    });
  }
})();
