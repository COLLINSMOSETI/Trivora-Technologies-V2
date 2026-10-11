const API_BASE = window.TRIVORA_API_BASE || 'http://localhost:5000/api';
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
if (mainNav) mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));
const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  const service = document.querySelector('[name="service"]'); if (service) { const wanted = link.dataset.service; const option = [...service.options].find(o => o.textContent === wanted || o.value === wanted); if (option) service.value = option.value; }
}));
const form = document.getElementById('contactForm');
if (form) form.addEventListener('submit', async e => {
  e.preventDefault(); const status = document.getElementById('formStatus'); const btn = document.getElementById('submitBtn');
  status.classList.remove('error'); status.textContent = ''; btn.disabled = true; btn.textContent = 'Sending enquiry…';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(`${API_BASE}/inquiries`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not submit your enquiry.');
    status.textContent = 'Thanks! Your enquiry has been received. The Trivora team can follow up with you.'; form.reset();
  } catch (error) { status.classList.add('error'); status.textContent = `${error.message} If this continues, email trivoratechnologies1@gmail.com or call us directly.`; }
  finally { btn.disabled = false; btn.innerHTML = 'Send project enquiry <span>↗</span>'; }
});


// Scroll-led interactions: progress, section-aware navigation, gentle reveals and back-to-top.
(() => {
  const progress = document.querySelector('#scrollProgress span');
  const header = document.querySelector('.site-header');
  const topButton = document.getElementById('backToTop');
  const navLinks = [...document.querySelectorAll('#mainNav a[href^="#"]')];
  let ticking = false;
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (topButton) topButton.classList.toggle('visible', window.scrollY > 560);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateScrollUI); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  updateScrollUI();
  if (topButton) topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  const revealTargets = document.querySelectorAll('.section-heading, .about-panel, .team-feature, .service-card, .process-step, .work-banner, .price-card, .pricing-side, .faq-intro, .faq-item, .contact-copy, .contact-form');
  revealTargets.forEach((el, i) => { el.classList.add('js-reveal'); el.style.transitionDelay = `${Math.min((i % 4) * 70, 210)}ms`; });
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
    const sectionTargets = [...document.querySelectorAll('main section[id]')];
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-28% 0px -60% 0px', threshold: 0 });
    sectionTargets.forEach(section => sectionObserver.observe(section));
  } else revealTargets.forEach(el => el.classList.add('is-visible'));

  // Keep FAQ interactions accordion-like while remaining keyboard-accessible via native details.
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach(other => { if (other !== item) other.open = false; });
  }));
})();
