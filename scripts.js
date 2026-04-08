/* ─── Scent Privé — scripts.js ─── */

/* ==========================
   CART SYSTEM (localStorage)
   ========================== */
function getCart() {
  try { return JSON.parse(localStorage.getItem('scentprive_cart')) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('scentprive_cart', JSON.stringify(cart));
}
function addToCart(name, price, size) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: Number(price), size, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  openCart();
}
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartUI();
}
function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Update count badges
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = cart.reduce((s, i) => s + i.qty, 0);
  });

  // Update panel
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-price');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Varukorgen är tom.</p>';
  } else {
    itemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${item.size}</span>
        </div>
        <div class="cart-item-right">
          <span>${item.price * item.qty} kr</span>
          <button class="cart-remove" data-index="${idx}" aria-label="Ta bort">✕</button>
        </div>
      </div>
    `).join('');

    // Remove buttons
    itemsEl.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.index)));
    });
  }

  if (totalEl) totalEl.textContent = `${total} kr`;
}

function openCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (!panel) return;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (!panel) return;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  overlay.hidden = true;
  document.body.style.overflow = '';
}

/* Bind cart triggers */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Open cart from header
  document.querySelectorAll('#nav-cart').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  });
  // Close
  const closeBtn = document.getElementById('cart-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);

  // Add to cart button (product page)
  const addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const selectedSize = document.querySelector('input[name="size"]:checked');
      const size = selectedSize ? selectedSize.value : '6ml';
      addToCart(
        addBtn.dataset.productName,
        addBtn.dataset.productPrice,
        size
      );
    });
  }
});

/* ==========================
   NAVBAR SCROLL
   ========================== */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ==========================
   SCROLL REVEAL
   ========================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ==========================
   FAQ ACCORDION
   ========================== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      if (other.nextElementSibling) other.nextElementSibling.hidden = true;
    });
    btn.setAttribute('aria-expanded', String(!expanded));
    if (btn.nextElementSibling) btn.nextElementSibling.hidden = expanded;
  });
});

/* ==========================
   PD ACCORDION
   ========================== */
document.querySelectorAll('.pd-accordion-title').forEach(title => {
  title.addEventListener('click', () => {
    const content = title.nextElementSibling;
    const isOpen = title.classList.contains('active');
    document.querySelectorAll('.pd-accordion-title').forEach(t => {
      t.classList.remove('active');
      if (t.nextElementSibling) t.nextElementSibling.style.display = 'none';
    });
    if (!isOpen) {
      title.classList.add('active');
      if (content) content.style.display = 'block';
    }
  });
  // Close by default
  if (title.nextElementSibling) title.nextElementSibling.style.display = 'none';
});
