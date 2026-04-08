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
  { id: 'identity',   navId: 'nav-identity'   },
  { id: 'benefits',   navId: 'nav-benefits'   },
  { id: 'contact',    navId: 'nav-contact'    },
];

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
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

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  const btn     = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  btn.textContent = '...';
  btn.style.opacity = '0.6';
  btn.style.pointerEvents = 'none';
  setTimeout(() => {
    e.target.reset();
    success.classList.add('show');
    btn.textContent = 'Skicka beställning';
    btn.style.opacity = '';
    btn.style.pointerEvents = '';
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 900);
}
