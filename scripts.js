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
function addToCart(name, price, size, qty) {
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i => i.name === name && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price: Number(price), size, qty });
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
function updateQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  updateCartUI();
}
function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Update count badges (including mobile icon badge)
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => { el.textContent = totalQty; });
  const iconBadge = document.getElementById('cart-count-icon');
  if (iconBadge) iconBadge.textContent = totalQty;

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
          <div class="cart-qty-controls">
            <button class="cart-qty-btn cart-qty-minus" data-index="${idx}" aria-label="Minska">−</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button class="cart-qty-btn cart-qty-plus" data-index="${idx}" aria-label="Öka">+</button>
          </div>
          <span class="cart-item-price">${item.price * item.qty} kr</span>
          <button class="cart-remove" data-index="${idx}" aria-label="Ta bort">✕</button>
        </div>
      </div>
    `).join('');

    // Remove & qty buttons
    itemsEl.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.index)));
    });
    itemsEl.querySelectorAll('.cart-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => updateQty(Number(btn.dataset.index), -1));
    });
    itemsEl.querySelectorAll('.cart-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => updateQty(Number(btn.dataset.index), +1));
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

  // Open cart from header (desktop and mobile icon)
  document.querySelectorAll('#nav-cart, #nav-cart-icon').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  });
  // Close
  const closeBtn = document.getElementById('cart-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);

  // Hamburger menu
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  // Close mobile menu on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // ── Stripe Checkout ──────────────────────────────────────────────────────
  document.querySelectorAll('.cart-footer .btn-primary').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const cart = getCart();
      if (cart.length === 0) {
        alert('Varukorgen är tom. Lägg till en produkt först!');
        return;
      }

      // Show loading state
      const originalText = btn.textContent;
      btn.textContent = 'Laddar…';
      btn.disabled = true;

      try {
        const res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Okänt fel');
        }

        // Redirect to Stripe Hosted Checkout (replace förhindrar back-loop)
        window.location.replace(data.url);

      } catch (err) {
        console.error('Checkout error:', err);
        // Visa exakt felmeddelande för enklare felsökning
        alert('⚠️ Betalning misslyckades\n\nFelmeddelande: ' + err.message + '\n\nFörsök igen eller kontakta oss på Instagram @scentprive.se');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  });

  // Add to cart button (product page)
  const addBtn = document.getElementById('add-to-cart-btn');
  let currentQty = 1;

  if (addBtn) {
    // Quantity controls
    const qtyDisplay = document.getElementById('qty-display');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');

    if (qtyMinus && qtyPlus && qtyDisplay) {
      qtyMinus.addEventListener('click', () => {
        if (currentQty > 1) { currentQty--; qtyDisplay.textContent = currentQty; }
      });
      qtyPlus.addEventListener('click', () => {
        currentQty++;
        qtyDisplay.textContent = currentQty;
      });
    }

    // Size-based price update
    document.querySelectorAll('input[name="size"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const price = radio.dataset.price;
        addBtn.dataset.productPrice = price;
        const priceEl = document.getElementById('pd-price-display');
        if (priceEl) priceEl.innerHTML = `<strong>${price} kr</strong>`;
      });
    });

    addBtn.addEventListener('click', () => {
      const selectedSize = document.querySelector('input[name="size"]:checked');
      const size = selectedSize ? selectedSize.value : '6ml';
      const price = selectedSize ? selectedSize.dataset.price : addBtn.dataset.productPrice;
      addToCart(
        addBtn.dataset.productName,
        price,
        size,
        currentQty
      );
      currentQty = 1;
      if (document.getElementById('qty-display')) document.getElementById('qty-display').textContent = '1';
    });
  }
});

/* ==========================
   NAVBAR SCROLL
   ========================== */
const navbar = document.getElementById('navbar');
if (navbar) {
  const hasAnnounce = document.body.classList.contains('has-announce');
  if (!hasAnnounce) {
    navbar.classList.add('scrolled');
  }

  let prevScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    if (hasAnnounce) {
      navbar.classList.toggle('scrolled', currentY > 40);
    } else {
      navbar.classList.add('scrolled');
      // Smart navbar: göm vid scroll ner, visa vid scroll upp
      if (currentY > prevScrollY && currentY > 80) {
        navbar.classList.add('navbar-hidden');
      } else {
        navbar.classList.remove('navbar-hidden');
      }
    }
    prevScrollY = currentY;
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
