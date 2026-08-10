/* ============================================================
   SAILS · script.js
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

  /* ---------- Live CRO agent (homepage #agent) ---------- */
  const agentApp = document.getElementById('agentApp');
  if (agentApp) {
    const input = document.getElementById('agentInput');
    const submitBtn = document.getElementById('agentSubmit');
    const hp = document.getElementById('agentHp');
    const example = document.getElementById('agentExample');
    const messagesEl = document.getElementById('agentMessages');
    const working = document.getElementById('agentWorking');
    const workingText = document.getElementById('agentWorkingText');
    const followupRow = document.getElementById('agentFollowupRow');
    const followupInput = document.getElementById('agentFollowupInput');
    const followupSubmit = document.getElementById('agentFollowupSubmit');
    const vpPreviewEl = document.getElementById('agentVpPreview');
    const enablementPreviewEl = document.getElementById('agentEnablementPreview');

    const MESSAGE_LIMIT = 12;
    const WORKING_STEPS = ['Reading your positioning', 'Scoring your ICP clarity', 'Sizing the gap'];
    const META_DELIMITER = '<<<SAILS_META_JSON>>>';

    let transcript = [];
    let visitorId = null;
    try {
      visitorId = window.localStorage.getItem('sailsVisitorId');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.localStorage.setItem('sailsVisitorId', visitorId);
      }
    } catch (e) {
      // localStorage unavailable (private browsing, etc.), visitorId just stays null
    }

    function appendMessage(role, text) {
      const row = document.createElement('div');
      row.className = 'agent__message agent__message--' + role;
      if (role === 'assistant') {
        const label = document.createElement('p');
        label.className = 'agent__message-label';
        label.textContent = 'CRO Agent';
        row.appendChild(label);
      }
      const p = document.createElement('p');
      p.className = 'agent__message-text';
      p.textContent = text;
      row.appendChild(p);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return p;
    }

    function startWorking() {
      working.hidden = false;
      if (prefersReducedMotion) {
        workingText.textContent = WORKING_STEPS[WORKING_STEPS.length - 1];
        return () => { working.hidden = true; };
      }
      let i = 0;
      workingText.textContent = WORKING_STEPS[0];
      const timer = setInterval(() => {
        i = (i + 1) % WORKING_STEPS.length;
        workingText.textContent = WORKING_STEPS[i];
      }, 1400);
      return () => {
        clearInterval(timer);
        working.hidden = true;
      };
    }

    // Streaming parser: holds back up to (delimiter.length - 1) trailing
    // characters each call, in case the delimiter is split across chunks.
    function makeStreamSplitter(delimiter) {
      let mode = 'text';
      let pending = '';
      let metaText = '';
      return {
        push(chunk) {
          if (mode === 'meta') {
            metaText += chunk;
            return '';
          }
          pending += chunk;
          const idx = pending.indexOf(delimiter);
          if (idx !== -1) {
            const visible = pending.slice(0, idx);
            metaText += pending.slice(idx + delimiter.length);
            mode = 'meta';
            pending = '';
            return visible;
          }
          const safeLen = Math.max(0, pending.length - (delimiter.length - 1));
          const toEmit = pending.slice(0, safeLen);
          pending = pending.slice(safeLen);
          return toEmit;
        },
        finish() {
          const rest = pending;
          pending = '';
          return rest;
        },
        getMeta() {
          return metaText;
        },
      };
    }

    async function sendMessage(text) {
      const trimmed = (text || '').trim();
      if (!trimmed || transcript.length >= MESSAGE_LIMIT) return;

      if (example) example.hidden = true;
      messagesEl.hidden = false;

      transcript.push({ role: 'user', content: trimmed });
      appendMessage('user', trimmed);

      input.value = '';
      followupInput.value = '';
      input.disabled = true;
      submitBtn.disabled = true;
      followupInput.disabled = true;
      followupSubmit.disabled = true;

      const stopWorking = startWorking();
      const splitter = makeStreamSplitter(META_DELIMITER);
      let replyEl = null;
      let fullText = '';

      try {
        const res = await fetch('/.netlify/functions/cro-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: transcript, visitorId, hp: hp ? hp.value : '' }),
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const visible = splitter.push(chunk);
          if (visible) {
            if (!replyEl) {
              stopWorking();
              replyEl = appendMessage('assistant', '');
            }
            fullText += visible;
            replyEl.textContent = fullText;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        }

        const trailing = splitter.finish();
        if (trailing) {
          if (!replyEl) {
            stopWorking();
            replyEl = appendMessage('assistant', '');
          }
          fullText += trailing;
          replyEl.textContent = fullText;
        }

        if (!replyEl) stopWorking();

        transcript.push({ role: 'assistant', content: fullText });

        const metaRaw = splitter.getMeta();
        if (metaRaw) {
          try {
            const parsed = JSON.parse(metaRaw);
            if (parsed.vpPreview && vpPreviewEl) vpPreviewEl.textContent = parsed.vpPreview;
            if (parsed.enablementPreview && enablementPreviewEl) enablementPreviewEl.textContent = parsed.enablementPreview;
          } catch (e) {
            // Locked-card previews are a nice-to-have; the diagnosis above already shipped.
          }
        }
      } catch (err) {
        stopWorking();
        appendMessage('assistant', "I hit a snag on my end. Join the waitlist and I'll follow up directly.");
      } finally {
        input.disabled = false;
        submitBtn.disabled = false;
        followupInput.disabled = false;
        followupSubmit.disabled = false;
        if (transcript.length > 0 && transcript.length < MESSAGE_LIMIT) {
          followupRow.hidden = false;
        } else {
          followupRow.hidden = true;
        }
      }
    }

    submitBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
    followupSubmit.addEventListener('click', () => sendMessage(followupInput.value));
    followupInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage(followupInput.value);
      }
    });
  }

  /* ---------- Contact + waitlist forms (Netlify Forms AJAX) ---------- */
  const ajaxForms = [
    { form: document.querySelector('form[name="contact"]'), success: "Got it. I'll get back to you within one business day." },
    { form: document.querySelector('form[name="waitlist"]'), success: "You're on the list. I'll be in touch when access opens." },
  ];

  ajaxForms.forEach(({ form, success }) => {
    if (!form) return;
    const status = form.querySelector('.form__status');

    form.addEventListener('submit', async (e) => {
      // Honeypot: silently bail if filled
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
          status.textContent = success;
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
  });
})();
