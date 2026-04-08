/* ─── Scroll Animations & Interactions ─── */

// ── Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Intersection Observer for reveal animations
const revealTargets = [
  '.manifesto-inner',
  '.product-card',
  '.about-text',
  '.about-visual',
  '.journal-card',
];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
});

// ── Contact form handler
function handleSubmit(e) {
  e.preventDefault();
  const success = document.getElementById('form-success');
  const btn = document.getElementById('form-submit');

  btn.textContent = '...';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    e.target.reset();
    success.classList.add('show');
    btn.textContent = 'Skicka beställning';
    btn.style.pointerEvents = '';

    setTimeout(() => success.classList.remove('show'), 5000);
  }, 800);
}

// ── Smooth active nav highlight on scroll
const sections = ['hero', 'collection', 'about', 'journal', 'contact'];
const navMap = {
  'collection': 'nav-collection',
  'about': 'nav-about',
  'journal': 'nav-journal',
  'contact': 'nav-contact',
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
      if (navMap[id]) {
        const activeLink = document.getElementById(navMap[id]);
        if (activeLink) activeLink.style.color = 'var(--gold)';
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});
