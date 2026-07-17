/* ============================================================
   SAILS Advisory — diagnostic.js
   Fit Diagnostic form: persists draft to localStorage as user fills it,
   submits to Netlify Forms via fetch, replaces form with success state.
   ============================================================ */

(function () {
  'use strict';

  const form = document.getElementById('diagnostic-form');
  if (!form) return;

  const status = form.querySelector('.diag-status');
  const STORAGE_KEY = 'sails-diagnostic-draft-v1';

  /* ---------- localStorage draft restore + save ---------- */
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      Object.entries(saved).forEach(([name, value]) => {
        const els = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
        els.forEach((el) => {
          if (el.type === 'radio') {
            if (el.value === value) el.checked = true;
          } else {
            el.value = value;
          }
        });
      });
    }
  } catch (e) {
    // ignore — bad JSON or no storage
  }

  const saveDraft = debounce(() => {
    try {
      const data = {};
      form.querySelectorAll('input, textarea').forEach((el) => {
        if (!el.name || el.name === 'bot-field') return;
        if (el.type === 'radio') {
          if (el.checked) data[el.name] = el.value;
        } else {
          if (el.value) data[el.name] = el.value;
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // storage full / disabled — ignore
    }
  }, 500);

  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  /* ---------- Submit handler ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot — silently bail if filled
    const hp = form.querySelector('[name="bot-field"]');
    if (hp && hp.value) return;

    form.classList.add('is-submitting');
    if (status) {
      status.textContent = '';
      status.className = 'diag-status';
    }

    // Build the form data Netlify expects
    const data = new FormData();
    data.append('form-name', 'fit-diagnostic');
    form.querySelectorAll('input, textarea').forEach((el) => {
      if (!el.name || el.name === 'bot-field') return;
      if (el.type === 'radio') {
        if (el.checked) data.append(el.name, el.value);
      } else {
        data.append(el.name, el.value);
      }
    });
    const body = new URLSearchParams(data).toString();

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) throw new Error('Network response was not ok');

      // Success: clear draft and render thank-you state
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      renderSuccess();
    } catch (err) {
      if (status) {
        status.textContent = "Something went wrong sending this. Email me at matt@sailsadvisory.com and we'll set up a time directly.";
        status.classList.add('is-error');
      }
      form.classList.remove('is-submitting');
    }
  });

  /* ---------- Success state ---------- */
  function renderSuccess() {
    const wrap = form.closest('.diag-wrap');
    if (!wrap) return;

    const success = document.createElement('div');
    success.className = 'diag-success';
    success.innerHTML = `
      <div class="diag-success__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 class="diag-success__h">Got it. I'll review this before our call.</h2>
      <p class="diag-success__msg">You'll hear back from me within one business day. In the meantime, the fastest path forward is to grab a time on my calendar.</p>

      <div class="diag-success__actions">
        <a href="https://calendar.app.google/x2MYasUSFXEeow459" class="btn btn--primary btn--lg" target="_blank" rel="noopener noreferrer">Book a Discovery Call <span aria-hidden="true">→</span></a>
      </div>

      <div class="diag-success__divider"></div>

      <p class="diag-success__sub"><strong>Want to do deeper prep before the call?</strong></p>
      <p class="diag-success__sub">Download the full diagnostic questionnaire and fill it out before we talk. It's 20 to 30 minutes of work, and it lets us skip the basics and get straight to the real conversation.</p>
      <p class="diag-success__sub">
        <a class="diag-success__link" href="../assets/SAILS%20-%20Sales%20Diagnostic%20Questionnaire%20-%20TEMPLATE.pdf" target="_blank" rel="noopener noreferrer">
          Download the full diagnostic (PDF) <span aria-hidden="true">→</span>
        </a>
      </p>
    `;

    wrap.replaceChild(success, form);
  }

  /* ---------- Helpers ---------- */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }
})();
