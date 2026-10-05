document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');

  if (cart.length === 0) {
    showMessage('cartMessage', 'Your cart is empty.');
    container.innerHTML = '';
    summary.innerHTML = '';
    return;
  }

  clearMessage('cartMessage');
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <h3>${item.title}</h3>
        <p class="price">${render2Price(item.price)}</p>
      </div>
      <div class="cart-item-actions">
        <label class="quantity-label" for="quantity-${item.id}">Qty</label>
        <input type="number" class="quantity-input" id="quantity-${item.id}" value="${item.quantity}" min="1" step="1" inputmode="numeric" data-id="${item.id}" aria-label="Quantity for ${item.title}">
        <button class="remove-button" type="button" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summary.innerHTML = `
    <div class="cart-summary">
      <p><span>Items total</span><span>${render2Price(subtotal)}</span></p>
      <p><span>Delivery fee</span><span>Confirmed by phone</span></p>
      <p class="total"><span>Pay on delivery</span><span>${render2Price(subtotal)} <small>+ delivery</small></span></p>
      <p class="delivery-note">Your delivery fee will be confirmed with you before dispatch.</p>
      <a href="checkout.html" class="main-button" style="display:block; text-align:center; margin-top:16px;">Proceed to Checkout</a>
    </div>
  `;

  container.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', event => {
      const id = Number(event.currentTarget.dataset.id);
      const quantity = Number(event.currentTarget.value);
      if (!Number.isSafeInteger(quantity) || quantity < 1) {
        const item = getCart().find(cartItem => cartItem.id === id);
        event.currentTarget.value = item ? item.quantity : 1;
        showMessage('cartMessage', 'Quantity must be a whole number greater than zero.', 'error');
        return;
      }
      updateQuantity(id, quantity);
    });
  });

  container.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', event => {
      removeItem(Number(event.currentTarget.dataset.id));
    });
  });
}

function updateQuantity(id, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return;
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
    renderCart();
  }
}

function removeItem(id) {
  const cart = getCart();
  if (!cart.some(item => item.id === id)) return;
  const updatedCart = cart.filter(item => item.id !== id);
  saveCart(updatedCart);
  renderCart();
}