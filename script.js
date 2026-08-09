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

  /* ---------- How It Works demo (homepage) ---------- */
  const demo = document.getElementById('howItWorks');
  if (demo) {
    const steps = Array.from(demo.querySelectorAll('.demo__step'));
    const panels = Array.from(demo.querySelectorAll('.demo__panel'));
    const agentText = document.getElementById('agentStatusText');
    const agentNote = document.getElementById('agentStepNote');
    const progressBar = document.getElementById('agentProgressBar');
    const agentMessages = [
      'CRO is reviewing your funnel',
      'VP of Sales is building your playbook',
      'Enablement Lead is drafting your outbound sequence',
    ];
    const AGENT_STEP_MS = 1150;

    let stepIndex = 0;
    let agentTimer = null;

    function runAgentSequence() {
      let sub = 0;
      const total = agentMessages.length;
      const setSub = (i) => {
        if (agentText) agentText.textContent = agentMessages[i];
        if (agentNote) agentNote.textContent = 'Step ' + (i + 1) + ' of ' + total;
        if (progressBar) progressBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
      };

      clearInterval(agentTimer);
      if (progressBar) progressBar.style.width = '0%';

      if (prefersReducedMotion) {
        setSub(total - 1);
        return;
      }

      setSub(0);
      agentTimer = setInterval(() => {
        sub++;
        if (sub >= total) {
          clearInterval(agentTimer);
          return;
        }
        setSub(sub);
      }, AGENT_STEP_MS);
    }

    function showStep(i) {
      stepIndex = i;
      steps.forEach((btn, idx) => {
        const active = idx === i;
        btn.classList.toggle('is-active', active);
        if (active) btn.setAttribute('aria-current', 'step');
        else btn.removeAttribute('aria-current');
      });
      panels.forEach((panel, idx) => {
        const active = idx === i;
        panel.classList.toggle('is-active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });
      if (i === 1) runAgentSequence();
      else clearInterval(agentTimer);
    }

    steps.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        showStep(idx);
      });
    });

    showStep(0);
  }

  /* ---------- Ask the CRO Agent (homepage, keyword-matched preview) ---------- */
  const ask = document.getElementById('askCro');
  if (ask) {
    const input = document.getElementById('askInput');
    const submitBtn = document.getElementById('askSubmit');
    const chips = Array.from(ask.querySelectorAll('.ask__chip'));
    const reply = document.getElementById('askReply');
    const replyDot = document.getElementById('askReplyDot');
    const replyText = document.getElementById('askReplyText');

    const BUCKETS = [
      {
        keys: ['slow', 'respond', 'follow up', 'cold', 'wait'],
        text: "Leads sitting more than five minutes lose half their conversion odds, and most teams take hours, not minutes. The CRO agent pulls your actual response times first: that's usually the single biggest leak before anything else gets fixed.",
      },
      {
        keys: ['quota', 'uneven', 'inconsistent', 'two reps', 'top rep'],
        text: "When some reps hit quota and others don't on the same leads, it's rarely a talent gap, it's a documentation gap. The CRO agent pulls win rates by rep to find where the top performer's approach diverges from everyone else's.",
      },
      {
        keys: ['pipeline', 'forecast', 'stall', 'stuck'],
        text: "Deals stalling in the same stage usually means the exit criteria for that stage were never defined. The CRO agent maps your pipeline stages against actual deal velocity to find where the bottleneck really sits.",
      },
      {
        keys: ['objection', 'price', 'competitor', 'losing'],
        text: "If the same objection keeps closing deals, that's a scripting problem, not a market problem. The CRO agent tags lost deals by objection type to see which one is actually costing the most revenue.",
      },
      {
        keys: ['hire', 'hiring', 'onboard', 'ramp'],
        text: "New reps ramping slowly almost always means there's no documented playbook to hand them, so they're rebuilding the founder's instincts from scratch. The CRO agent sizes how much that ramp time is costing before recommending a fix.",
      },
      {
        keys: ['playbook', 'document', 'system', 'process'],
        text: "What works usually lives in one person's head, not in a system the team can run. The CRO agent starts by documenting the exact motion that already closes deals, then hands it to the VP of Sales agent to teach it.",
      },
    ];
    const FALLBACK = "That's exactly the kind of gap the CRO agent is built to find. Run the Fit Diagnostic and it'll size where revenue is actually leaking in your funnel, not a generic framework.";

    function matchReply(value) {
      const q = value.toLowerCase();
      const bucket = BUCKETS.find((b) => b.keys.some((k) => q.includes(k)));
      return bucket ? bucket.text : FALLBACK;
    }

    function respond(value) {
      if (!value || !value.trim()) return;
      reply.hidden = false;
      replyText.textContent = '';
      if (replyDot) replyDot.style.display = '';

      const finish = () => {
        if (replyDot) replyDot.style.display = 'none';
        replyText.textContent = matchReply(value);
      };

      if (prefersReducedMotion) finish();
      else setTimeout(finish, 650);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent.trim();
        respond(input.value);
        input.focus();
      });
    });

    if (submitBtn) submitBtn.addEventListener('click', () => respond(input.value));
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          respond(input.value);
        }
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
