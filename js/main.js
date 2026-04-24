/* ============================================================
   E-PORTAFOLIO — Main JavaScript
   ============================================================ */

   document.addEventListener('DOMContentLoaded', () => {

    /* ── Elements ─────────────────────────────────────────────── */
    const sidebar   = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('overlay');
    const navItems  = document.querySelectorAll('.nav-item');
    const sections  = document.querySelectorAll('section[data-section]');
    const progFill  = document.getElementById('progress-fill');
    const reveals   = document.querySelectorAll('.reveal');
  
    /* ── Hamburger / Sidebar ──────────────────────────────────── */
    hamburger?.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  
    overlay?.addEventListener('click', closeSidebar);
  
    function closeSidebar() {
      hamburger?.classList.remove('open');
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    }
  
    /* ── Smooth scroll on nav click ───────────────────────────── */
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.target;
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          if (window.innerWidth <= 900) closeSidebar();
        }
      });
    });
  
    /* ── Active section highlight ─────────────────────────────── */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.section;
          navItems.forEach(n => {
            n.classList.toggle('active', n.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
  
    sections.forEach(s => observer.observe(s));
  
    /* ── Reading progress bar ─────────────────────────────────── */
    window.addEventListener('scroll', () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progFill) progFill.style.width = pct + '%';
    }, { passive: true });
  
    /* ── Reveal on scroll ─────────────────────────────────────── */
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px' });
  
    reveals.forEach(el => revealObserver.observe(el));
  
  });