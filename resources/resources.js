/* ============================================================
   SAILS Advisory — resources.js
   Gated download form: submits to Netlify Forms via fetch,
   shows inline success state, auto-triggers file download.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Category filter tabs ---------- */
  const tabBar = document.getElementById('resTabs');
  if (tabBar) {
    const cards = document.querySelectorAll('.resource-card');
    tabBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.res-tab');
      if (!btn) return;
      tabBar.querySelectorAll('.res-tab').forEach((t) => t.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');
      cards.forEach((card) => {
        card.hidden = filter !== 'all' && card.getAttribute('data-category') !== filter;
      });
    });
  }

  const forms = document.querySelectorAll('.resource-form');

  forms.forEach((form) => {
    const status = form.querySelector('.resource-form__status');
    const downloadPath = form.getAttribute('data-download');
    const resourceName = form.getAttribute('data-resource') || 'Resource';
    // Each form sets its own Netlify form name via data-form-name.
    // Fallback to kpi-tracker-request for backward compatibility with the original card.
    const formName = form.getAttribute('data-form-name') || 'kpi-tracker-request';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — silently bail if filled
      const hp = form.querySelector('[name="bot-field"]');
      if (hp && hp.value) return;

      form.classList.add('is-submitting');
      if (status) {
        status.textContent = '';
        status.className = 'resource-form__status';
      }

      // Build the form data Netlify expects
      const data = new FormData();
      data.append('form-name', formName);
      data.append('resource', resourceName);
      form.querySelectorAll('input').forEach((input) => {
        if (input.name && input.name !== 'bot-field') {
          data.append(input.name, input.value);
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

        // Success: replace the form with a thank-you state + auto-trigger download
        renderSuccess(form, downloadPath, resourceName);

        // Trigger the actual download
        if (downloadPath) {
          const a = document.createElement('a');
          a.href = downloadPath;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (err) {
        if (status) {
          status.textContent = "Something went wrong. Email me at matt@sailsadvisory.com and I'll send it directly.";
          status.classList.add('is-error');
        }
        form.classList.remove('is-submitting');
      }
    });
  });

  function renderSuccess(form, downloadPath, resourceName) {
    const card = form.closest('.resource-card__body');
    if (!card) return;

    const success = document.createElement('div');
    success.className = 'resource-success';
    success.innerHTML = `
      <div class="resource-success__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h3 class="resource-success__h">On its way.</h3>
      <p class="resource-success__msg">The download should start automatically. If it doesn't, <a href="${downloadPath}" download>click here to grab it</a>.</p>
      <p class="resource-success__sub">Want a hand reading your numbers once you've filled it in? <a href="https://calendar.app.google/x2MYasUSFXEeow459" target="_blank" rel="noopener noreferrer">Book a 30-minute discovery call.</a></p>
    `;

    form.replaceWith(success);
  }
})();
