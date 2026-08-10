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

  /* ---------- Agent card expand (homepage #engagement) ---------- */
  const agentDetail = document.getElementById('agentDetail');
  const agentCards = document.querySelectorAll('.agentcard[data-agent]');

  if (agentDetail && agentCards.length) {
    const panels = agentDetail.querySelectorAll('.agentdetail__panel[data-panel]');
    let openAgent = null;

    const closeAll = () => {
      agentCards.forEach((c) => {
        c.setAttribute('aria-expanded', 'false');
        c.classList.remove('is-active');
      });
      panels.forEach((p) => {
        p.classList.remove('is-animate');
        p.hidden = true;
      });
      agentDetail.hidden = true;
      openAgent = null;
    };

    const openAgentPanel = (name, card) => {
      panels.forEach((p) => {
        const match = p.dataset.panel === name;
        p.hidden = !match;
        p.classList.remove('is-animate');
      });
      agentCards.forEach((c) => {
        const match = c.dataset.agent === name;
        c.setAttribute('aria-expanded', String(match));
        c.classList.toggle('is-active', match);
      });
      agentDetail.hidden = false;
      openAgent = name;
      // Force layout, then add the animate class on the next frame so the
      // reveal transitions replay from their closed state every time.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const activePanel = agentDetail.querySelector(`.agentdetail__panel[data-panel="${name}"]`);
          if (activePanel) activePanel.classList.add('is-animate');
        });
      });
    };

    agentCards.forEach((card) => {
      card.addEventListener('click', () => {
        const name = card.dataset.agent;
        if (openAgent === name) {
          closeAll();
        } else {
          openAgentPanel(name, card);
        }
      });
    });
  }

  /* ---------- Live CRO agent controller (shared by #agent and the floating bubble) ---------- */
  const MESSAGE_LIMIT = 12;
  const WORKING_STEPS = ['Reading your positioning', 'Scoring your ICP clarity', 'Sizing the gap'];
  const META_DELIMITER = '<<<SAILS_META_JSON>>>';

  let sharedVisitorId = null;
  try {
    sharedVisitorId = window.localStorage.getItem('sailsVisitorId');
    if (!sharedVisitorId) {
      sharedVisitorId = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem('sailsVisitorId', sharedVisitorId);
    }
  } catch (e) {
    // localStorage unavailable (private browsing, etc.), visitorId just stays null
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

  // els: { input, submitBtn, hp, example, messagesEl, working, workingText,
  //        followupRow, followupInput, followupSubmit, vpPreviewEl, enablementPreviewEl }
  // example, followupRow/Input/Submit, and the preview elements are optional.
  function createAgentChat(els) {
    let transcript = [];

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
      els.messagesEl.appendChild(row);
      els.messagesEl.scrollTop = els.messagesEl.scrollHeight;
      return p;
    }

    function startWorking() {
      els.working.hidden = false;
      if (prefersReducedMotion) {
        els.workingText.textContent = WORKING_STEPS[WORKING_STEPS.length - 1];
        return () => { els.working.hidden = true; };
      }
      let i = 0;
      els.workingText.textContent = WORKING_STEPS[0];
      const timer = setInterval(() => {
        i = (i + 1) % WORKING_STEPS.length;
        els.workingText.textContent = WORKING_STEPS[i];
      }, 1400);
      return () => {
        clearInterval(timer);
        els.working.hidden = true;
      };
    }

    async function sendMessage(text) {
      const trimmed = (text || '').trim();
      if (!trimmed || transcript.length >= MESSAGE_LIMIT) return;

      if (els.example) els.example.hidden = true;
      els.messagesEl.hidden = false;

      transcript.push({ role: 'user', content: trimmed });
      appendMessage('user', trimmed);

      els.input.value = '';
      if (els.followupInput) els.followupInput.value = '';
      els.input.disabled = true;
      els.submitBtn.disabled = true;
      if (els.followupInput) els.followupInput.disabled = true;
      if (els.followupSubmit) els.followupSubmit.disabled = true;

      const stopWorking = startWorking();
      const splitter = makeStreamSplitter(META_DELIMITER);
      let replyEl = null;
      let fullText = '';

      try {
        const res = await fetch('/.netlify/functions/cro-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: transcript, visitorId: sharedVisitorId, hp: els.hp ? els.hp.value : '' }),
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
            els.messagesEl.scrollTop = els.messagesEl.scrollHeight;
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
            if (parsed.vpPreview && els.vpPreviewEl) {
              els.vpPreviewEl.textContent = parsed.vpPreview;
              if (els.vpCard) els.vpCard.hidden = false;
            }
            if (parsed.enablementPreview && els.enablementPreviewEl) {
              els.enablementPreviewEl.textContent = parsed.enablementPreview;
              if (els.enablementCard) els.enablementCard.hidden = false;
            }
            if (els.handoff && (parsed.vpPreview || parsed.enablementPreview)) els.handoff.hidden = false;
          } catch (e) {
            // Handoff previews are a nice-to-have; the diagnosis above already shipped.
          }
        }
      } catch (err) {
        stopWorking();
        appendMessage('assistant', "I hit a snag on my end. Join the waitlist and I'll follow up directly.");
      } finally {
        els.input.disabled = false;
        els.submitBtn.disabled = false;
        if (els.followupInput) els.followupInput.disabled = false;
        if (els.followupSubmit) els.followupSubmit.disabled = false;
        if (els.followupRow) {
          els.followupRow.hidden = !(transcript.length > 0 && transcript.length < MESSAGE_LIMIT);
        }
      }
    }

    els.submitBtn.addEventListener('click', () => sendMessage(els.input.value));
    els.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage(els.input.value);
      }
    });
    if (els.followupSubmit && els.followupInput) {
      els.followupSubmit.addEventListener('click', () => sendMessage(els.followupInput.value));
      els.followupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage(els.followupInput.value);
        }
      });
    }

    return { sendMessage };
  }

  /* ---------- Floating agent bubble (every page, including homepage) ---------- */
  const agentBubble = document.getElementById('agentBubble');
  if (agentBubble) {
    const launcher = document.getElementById('agentBubbleLauncher');
    const panel = document.getElementById('agentBubblePanel');
    const closeBtn = document.getElementById('agentBubbleClose');

    if (panel) {
      createAgentChat({
        input: document.getElementById('agentBubbleInput'),
        submitBtn: document.getElementById('agentBubbleSubmit'),
        hp: document.getElementById('agentBubbleHp'),
        messagesEl: document.getElementById('agentBubbleMessages'),
        working: document.getElementById('agentBubbleWorking'),
        workingText: document.getElementById('agentBubbleWorkingText'),
        vpPreviewEl: document.getElementById('agentBubbleVpPreview'),
        enablementPreviewEl: document.getElementById('agentBubbleEnablementPreview'),
        vpCard: document.getElementById('agentBubbleVpCard'),
        enablementCard: document.getElementById('agentBubbleEnablementCard'),
        handoff: document.getElementById('agentBubbleHandoff'),
      });

      const openPanel = () => {
        panel.hidden = false;
        launcher.setAttribute('aria-expanded', 'true');
        agentBubble.classList.add('is-open');
        const input = document.getElementById('agentBubbleInput');
        if (input) input.focus();
      };
      const closePanel = () => {
        panel.hidden = true;
        launcher.setAttribute('aria-expanded', 'false');
        agentBubble.classList.remove('is-open');
        launcher.focus();
      };

      launcher.addEventListener('click', () => {
        if (panel.hidden) openPanel(); else closePanel();
      });
      if (closeBtn) closeBtn.addEventListener('click', closePanel);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hidden) closePanel();
      });

      // Any other trigger on the page (e.g. the CRO agent card's "Try it
      // live" button) can just open the same bubble instead of duplicating
      // the chat experience.
      document.querySelectorAll('[data-open-agent-bubble]').forEach((btn) => {
        btn.addEventListener('click', openPanel);
      });
    }
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
