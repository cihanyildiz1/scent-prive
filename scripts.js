/* ─── Scent Privé — scripts.js ─── */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Scroll-reveal for .reveal elements
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Active nav link on scroll
const sections = [
  { id: 'collection', navId: 'nav-collection' },
  { id: 'identity',   navId: 'nav-identity'   }
];

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        // Ignorera varukorg från scroll-styling
        if (a.id !== 'nav-cart') {
          a.style.color = '';
        }
      });
      const match = sections.find(s => s.id === entry.target.id);
      if (match) {
        const link = document.getElementById(match.navId);
        if (link) link.style.color = 'var(--gold)';
      }
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => {
  const el = document.getElementById(s.id);
  if (el) navObserver.observe(el);
});
