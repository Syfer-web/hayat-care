// ============================================
// HAYAT CARE — SITE JS
// ============================================

(function () {
  'use strict';

  // --- Mobile menu toggle ---
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
      mobileMenu.hidden = isOpen;
      mobileMenu.setAttribute('data-open', String(!isOpen));
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        mobileMenu.hidden = true;
        mobileMenu.setAttribute('data-open', 'false');
      });
    });
  }

  // --- Footer year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Smooth scroll for hash links ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('siteHeader')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Contact form ---
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Time guard — bots submit instantly
  const formLoadedAt = Date.now();
  // Honeypot present in HTML

  const submitBtn = document.getElementById('cf-submit');
  const successBox = document.getElementById('cf-success');
  const errorBox = document.getElementById('cf-error');

  // Replace FORM_ID_PLACEHOLDER with your real Formspree form ID.
  // Sign up free at https://formspree.io — paste your form ID below.
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/FORM_ID_PLACEHOLDER';
  const HAS_FORMSPREE = !FORMSPREE_ENDPOINT.includes('FORM_ID_PLACEHOLDER');

  function setFieldError(field, on) {
    if (on) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }

  function validate() {
    let valid = true;
    ['cf-name', 'cf-email', 'cf-phone'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ok = el.checkValidity() && el.value.trim().length > 0;
      setFieldError(el, !ok);
      if (!ok) valid = false;
    });
    const consent = document.getElementById('cf-consent');
    if (consent && !consent.checked) valid = false;
    return valid;
  }

  function openMailtoFallback(data) {
    const subject = encodeURIComponent('Hayat Care enquiry from ' + (data.name || 'website visitor'));
    const body = encodeURIComponent(
      'Name: ' + (data.name || '') + '\n' +
      'Email: ' + (data.email || '') + '\n' +
      'Phone: ' + (data.phone || '') + '\n' +
      'Postcode: ' + (data.postcode || '') + '\n' +
      'Relationship: ' + (data.relationship || '') + '\n\n' +
      'Message:\n' + (data.message || '')
    );
    window.location.href = 'mailto:enquiries@hayatcare.co.uk?subject=' + subject + '&body=' + body;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successBox.hidden = true;
    errorBox.hidden = true;

    if (!validate()) {
      // Scroll to first invalid field
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Honeypot
    if (form.elements['_gotcha'] && form.elements['_gotcha'].value) {
      successBox.hidden = false;
      form.reset();
      return;
    }

    // Time guard — if submitted < 2s after page load, treat as bot
    if (Date.now() - formLoadedAt < 2000) {
      successBox.hidden = false;
      form.reset();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      if (HAS_FORMSPREE) {
        const r = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!r.ok) throw new Error('Formspree rejected submission');
      } else {
        // No Formspree configured — open mail client
        openMailtoFallback(data);
        // Give the mailto a moment, then show success
        await new Promise(res => setTimeout(res, 600));
      }
      successBox.hidden = false;
      form.reset();
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error('Form submission error:', err);
      openMailtoFallback(data);
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Clear invalid state on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => setFieldError(el, false));
    el.addEventListener('change', () => setFieldError(el, false));
  });
})();
