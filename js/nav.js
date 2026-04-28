/* ============================================================
   E-PORTAFOLIO — Navigation helpers
   Keyboard accessibility, URL hash sync, active-section
   breadcrumb, and smooth-scroll enhancements.
   Runs after DOMContentLoaded (called from main.js or inline).
   ============================================================ */

(function () {
  'use strict';

  /* ── Wait for DOM ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init () {

    const sidebar   = document.getElementById('sidebar');
    const navItems  = document.querySelectorAll('.nav-item');
    const sections  = document.querySelectorAll('section[data-section]');

    if (!sidebar || !navItems.length) return;

    /* ── 1. Keyboard navigation inside sidebar ──────────────── */
    /*
       Arrow Up / Down moves focus between nav items.
       Enter / Space triggers a click on the focused item.
       Escape closes the mobile sidebar.
    */
    navItems.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      item.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown': {
            e.preventDefault();
            const next = navItems[index + 1] || navItems[0];
            next.focus();
            break;
          }
          case 'ArrowUp': {
            e.preventDefault();
            const prev = navItems[index - 1] || navItems[navItems.length - 1];
            prev.focus();
            break;
          }
          case 'Enter':
          case ' ': {
            e.preventDefault();
            item.click();
            break;
          }
          case 'Escape': {
            closeSidebar();
            document.getElementById('hamburger')?.focus();
            break;
          }
        }
      });
    });

    /* ── 2. Hash-based deep linking ─────────────────────────── */
    /*
       On page load, if the URL contains a hash that matches a
       section id, scroll to it immediately (without animation so
       the page starts at the right position).
    */
    function scrollToHash (hash, animate) {
      const target = document.querySelector(hash);
      if (!target) return;
      if (animate) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Instant jump on first load
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'instant' });
      }
    }

    if (window.location.hash) {
      // Small delay lets browser finish its own anchor jump first
      setTimeout(() => scrollToHash(window.location.hash, false), 0);
    }

    /* ── 3. Update URL hash on section change ───────────────── */
    /*
       Uses history.replaceState so navigating away and back
       restores the correct scroll position without adding
       unwanted entries to the browser history stack.
    */
    const hashObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) {
            history.replaceState(null, '', '#' + id);
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((s) => hashObserver.observe(s));

    /* ── 4. Active nav item on nav-item click (instant) ─────── */
    /*
       main.js uses an IntersectionObserver to set .active while
       scrolling. This function also sets it immediately on click
       so there's no visual lag before the observer fires.
    */
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
      });
    });

    /* ── 5. "Back to top" shortcut ──────────────────────────── */
    /*
       Double-pressing the Inicio nav item (00) scrolls back to
       the very top even if the hero section is already partially
       in view.
    */
    const homeItem = sidebar.querySelector('[data-target="hero"]');
    if (homeItem) {
      let lastClick = 0;
      homeItem.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastClick < 500) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClick = now;
      });
    }

    /* ── 6. Close sidebar helper (shared with main.js) ──────── */
    function closeSidebar () {
      const hamburger = document.getElementById('hamburger');
      const overlay   = document.getElementById('overlay');
      hamburger?.classList.remove('open');
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    }

    /* ── 7. Focus trap for mobile sidebar ───────────────────── */
    /*
       When the mobile sidebar is open, Tab and Shift+Tab should
       cycle only within the sidebar so keyboard users don't
       accidentally interact with hidden content.
    */
    sidebar.addEventListener('keydown', (e) => {
      if (!sidebar.classList.contains('open')) return;
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        sidebar.querySelectorAll('[tabindex="0"], a, button')
      ).filter((el) => !el.disabled);

      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* ── 8. Section progress tooltip on sidebar ─────────────── */
    /*
       Shows a small tooltip next to the active nav item with the
       percentage of the section scrolled, helping the user
       gauge how far they are in a long section.
    */
    let tooltip = document.createElement('div');
    tooltip.className = 'nav-tooltip';
    Object.assign(tooltip.style, {
      position:       'fixed',
      left:           'calc(var(--sidebar-w) + 8px)',
      background:     'var(--gold)',
      color:          '#fff',
      fontSize:       '.68rem',
      fontWeight:     '700',
      padding:        '.2em .6em',
      borderRadius:   '4px',
      pointerEvents:  'none',
      opacity:        '0',
      transition:     'opacity .25s',
      zIndex:         '200',
      whiteSpace:     'nowrap',
      letterSpacing:  '.06em',
      textTransform:  'uppercase',
    });
    document.body.appendChild(tooltip);

    window.addEventListener('scroll', updateTooltip, { passive: true });

    function updateTooltip () {
      // Find the section currently in view
      let current = null;
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= 0) {
          current = sec;
        }
      });

      if (!current) {
        tooltip.style.opacity = '0';
        return;
      }

      const rect     = current.getBoundingClientRect();
      const visible  = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      const pct      = Math.round(visible * 100);

      // Position tooltip next to active nav item
      const activeItem = sidebar.querySelector('.nav-item.active');
      if (activeItem && window.innerWidth > 900) {
        const itemRect = activeItem.getBoundingClientRect();
        tooltip.style.top     = (itemRect.top + itemRect.height / 2 - 10) + 'px';
        tooltip.textContent   = pct + '%';
        tooltip.style.opacity = '1';
      } else {
        tooltip.style.opacity = '0';
      }
    }

  } // end init

})();
