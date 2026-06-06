/**
 * DBI CONSULTORES — MAIN.JS
 *
 * Módulos:
 *   1. Navbar: scroll state + menú móvil
 *   2. FAQ: acordeón accesible
 *   3. Reveal: animaciones de scroll
 *   4. Char counter: textarea
 *   5. Contacto: validación + envío seguro por mailto
 *   6. Footer year
 */

'use strict';

/* =============================================
   1. NAVBAR
   ============================================= */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const menu      = document.getElementById('navMenu');
  const navLinks  = menu ? menu.querySelectorAll('a') : [];

  if (!navbar || !toggle || !menu) return;

  // Scroll state
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Toggle mobile menu
  const openMenu = () => {
    menu.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
})();


/* =============================================
   2. FAQ ACCORDION
   ============================================= */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Collapse all others
      items.forEach(other => {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.classList.remove('open');
        }
      });

      // Toggle current
      const next = !isExpanded;
      btn.setAttribute('aria-expanded', String(next));
      answer.classList.toggle('open', next);
    });
  });
})();


/* =============================================
   3. SCROLL-REVEAL
   ============================================= */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.problem-card, .benefit-item, .project-card, .faq-item, .hero-content > *'
  );

  if (!targets.length) return;

  // Add reveal class
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings within same parent
    el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();


/* =============================================
   4. TEXTAREA CHAR COUNTER
   ============================================= */
(function initCharCount() {
  const textarea = document.getElementById('consulta');
  const counter  = document.getElementById('consulta-count');
  if (!textarea || !counter) return;

  const max = parseInt(textarea.getAttribute('maxlength'), 10) || 2000;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.style.color = len > max * 0.9 ? '#D42B2B' : '';
  });
})();


/* =============================================
   5. CONTACT FORM
   ============================================= */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const statusDiv  = document.getElementById('formStatus');
  if (!form || !submitBtn || !statusDiv) return;

  // ---- Sanitize: strip HTML tags from a string ----
  function sanitizeText(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  // ---- Plain text for email body (no HTML) ----
  function plainText(str) {
    return String(str).replace(/[<>&"'/]/g, ' ').trim();
  }

  // ---- Validators ----
  const validators = {
    nombre(val) {
      if (!val) return 'El nombre es obligatorio.';
      if (val.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
      if (val.length > 100) return 'El nombre no puede superar los 100 caracteres.';
      // Only letters, spaces, common accents, hyphens
      if (!/^[\p{L}\s\-'.]+$/u.test(val)) return 'El nombre contiene caracteres no válidos.';
      return null;
    },
    email(val) {
      if (!val) return 'El correo es obligatorio.';
      // RFC-5322-like basic check
      if (!/^[^\s@"'<>;,]+@[^\s@"'<>;,]+\.[^\s@"'<>;,]{2,}$/.test(val)) {
        return 'Ingresa un correo electrónico válido.';
      }
      if (val.length > 150) return 'El correo no puede superar los 150 caracteres.';
      return null;
    },
    telefono(val) {
      if (!val) return 'El teléfono es obligatorio.';
      const stripped = val.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?\d{7,15}$/.test(stripped)) return 'Ingresa un teléfono válido (ej: +56 9 1234 5678).';
      return null;
    },
    consulta(val) {
      if (!val) return 'La consulta es obligatoria.';
      if (val.length < 10) return 'La consulta debe tener al menos 10 caracteres.';
      if (val.length > 2000) return 'La consulta no puede superar los 2000 caracteres.';
      return null;
    }
  };

  // ---- Show / clear field error ----
  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (!field || !errorEl) return;
    if (message) {
      field.classList.add('error');
      errorEl.textContent = message;
    } else {
      field.classList.remove('error');
      errorEl.textContent = '';
    }
  }

  // ---- Validate all fields, return true if valid ----
  function validateForm(data) {
    let valid = true;
    Object.entries(validators).forEach(([field, fn]) => {
      const err = fn(data[field] || '');
      setFieldError(field, err);
      if (err) valid = false;
    });
    return valid;
  }

  // ---- Live validation on blur ----
  ['nombre', 'email', 'telefono', 'consulta'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const err = validators[id] ? validators[id](el.value.trim()) : null;
      setFieldError(id, err);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const err = validators[id] ? validators[id](el.value.trim()) : null;
        setFieldError(id, err);
      }
    });
  });

  // ---- Submit ----
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Honeypot check
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value.trim() !== '') {
      // Silent reject — bot detected
      showStatus('success', '¡Gracias! Nos pondremos en contacto a la brevedad.');
      form.reset();
      return;
    }

    // Collect & sanitize values
    const raw = {
      nombre:   document.getElementById('nombre')?.value.trim()   || '',
      empresa:  document.getElementById('empresa')?.value.trim()  || '',
      email:    document.getElementById('email')?.value.trim()    || '',
      telefono: document.getElementById('telefono')?.value.trim() || '',
      consulta: document.getElementById('consulta')?.value.trim() || '',
    };

    // Validate
    if (!validateForm(raw)) return;

    // Sanitize for display / header injection prevention
    const safe = {
      nombre:   plainText(raw.nombre),
      empresa:  plainText(raw.empresa),
      email:    plainText(raw.email),
      telefono: plainText(raw.telefono),
      consulta: plainText(raw.consulta),
    };

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    clearStatus();

    /**
     * MÉTODO DE ENVÍO — mailto:
     *
     * Este método abre el cliente de correo predeterminado con los datos
     * del formulario pre-completados. Es la opción más simple y segura
     * para un HTML estático sin servidor backend.
     *
     * PARA PRODUCCIÓN: reemplaza este bloque por una llamada fetch()
     * a tu backend (Node/PHP/Python) o a un servicio como EmailJS,
     * Formspree, o AWS SES para envío sin abrir el cliente de correo.
     *
     * Dirección de destino — cambia por la dirección real:
     */
    const DEST_EMAIL = 'contacto@dbiconsultores.cl';

    const subject = encodeURIComponent(
      `Consulta desde sitio web — ${safe.nombre}${safe.empresa ? ' / ' + safe.empresa : ''}`
    );

    const body = encodeURIComponent(
      `Nombre: ${safe.nombre}\n` +
      `Empresa: ${safe.empresa || '(no indicada)'}\n` +
      `Teléfono: ${safe.telefono}\n` +
      `Correo: ${safe.email}\n\n` +
      `Consulta:\n${safe.consulta}`
    );

    const mailtoURL = `mailto:${DEST_EMAIL}?subject=${subject}&body=${body}`;

    // Small delay for UX feedback
    setTimeout(() => {
      try {
        window.location.href = mailtoURL;
        showStatus(
          'success',
          '✓ Se abrió tu cliente de correo con el mensaje listo. ¡Revisa la ventana del correo y envíalo!'
        );
        form.reset();
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        document.getElementById('consulta-count').textContent = '0 / 2000';
      } catch (err) {
        showStatus(
          'error-status',
          'Hubo un problema al abrir tu cliente de correo. Por favor escríbenos directamente a contacto@dbiconsultores.cl'
        );
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    }, 600);
  });

  function showStatus(type, message) {
    statusDiv.className = `form-status ${type}`;
    statusDiv.textContent = message;
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearStatus() {
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';
  }
})();


/* =============================================
   6. FOOTER YEAR
   ============================================= */
(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();
