document.addEventListener('DOMContentLoaded', () => {
  updateCheckoutAvailability();
  renderCheckoutSummary();
  renderOrders();

  document.getElementById('checkoutForm').addEventListener('submit', event => {
    event.preventDefault();
    placeOrder();
  });

  document.addEventListener('shopFlowRateUpdated', renderCheckoutSummary);
});

function updateCheckoutAvailability(preserveMessage = false) {
  const hasItems = getCart().length > 0;
  const formContainer = document.getElementById('checkoutFormContainer');
  formContainer.hidden = !hasItems;

  if (hasItems) {
    clearMessage('checkoutMessage');
  } else if (!preserveMessage) {
    showMessage('checkoutMessage', 'Your cart is empty. Add products before checking out.');
  }
}

function renderCheckoutSummary() {
  const cart = getCart();
  const summary = document.getElementById('checkoutSummary');
  if (!summary) return;

  if (cart.length === 0) {
    summary.innerHTML = '<p class="summary-empty">Your order summary will appear here when you add items to your cart.</p>';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summary.innerHTML = `
    <div class="checkout-summary-items">
      ${cart.map(item => `
        <div class="checkout-summary-item">
          <img src="${item.image}" alt="">
          <div><strong>${item.title}</strong><small>Qty ${item.quantity}</small></div>
          <span>${render2Price(item.price * item.quantity)}</span>
        </div>
      `).join('')}
    </div>
    <div class="checkout-summary-totals">
      <p><span>Items total</span><span>${render2Price(subtotal)}</span></p>
      <p><span>Delivery fee</span><span>Confirmed by phone</span></p>
      <p class="checkout-pay-total"><strong>Pay on delivery</strong><strong>${render2Price(subtotal)} <small>+ delivery</small></strong></p>
    </div>
    <p class="delivery-note">We’ll confirm delivery availability and the fee with you by phone before dispatch.</p>
  `;
}

function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showMessage('checkoutMessage', 'Your cart is empty.', 'error');
    updateCheckoutAvailability(true);
    return;
  }

  const customer = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    country: document.getElementById('country').value,
    region: document.getElementById('region').value.trim(),
    city: document.getElementById('city').value.trim(),
    address: document.getElementById('address').value.trim(),
    landmark: document.getElementById('landmark').value.trim(),
    email: document.getElementById('email').value.trim()
  };

  if (![customer.name, customer.phone, customer.country, customer.region, customer.city, customer.address].every(Boolean)) {
    showMessage('checkoutMessage', 'Please complete your name, phone, country, region, city, and delivery address.', 'error');
    return;
  }

  const normalizedPhone = customer.phone.replace(/[\s()-]/g, '');
  if (!/^\+?\d{8,15}$/.test(normalizedPhone)) {
    showMessage('checkoutMessage', 'Please enter a valid phone number, including the country code if available.', 'error');
    document.getElementById('phone').focus();
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    items: cart,
    subtotal,
    total: subtotal,
    deliveryFee: null,
    currency: 'USD',
    exchangeRateUsdToSyp: rate,
    paymentMethod: 'Cash on delivery',
    customer
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  localStorage.removeItem('shopflow_cart');
  updateCartCount();
  showMessage('checkoutMessage', ' order saved. Cash on delivery is selected', 'success');
  document.getElementById('checkoutForm').reset();
  updateCheckoutAvailability(true);
  renderCheckoutSummary();
  renderOrders();
}

function renderOrders() {
  const orders = getOrders();
  const container = document.getElementById('ordersList');

  if (orders.length === 0) {
    showMessage('ordersMessage', 'No previous orders.');
    container.innerHTML = '';
    return;
  }

  clearMessage('ordersMessage');
  container.innerHTML = orders.map(order => {
    const customer = order.customer || {};
    const destination = [customer.address, customer.landmark, customer.city, customer.region || customer.zip, customer.country]
      .filter(Boolean)
      .join(', ');
    const emailLine = customer.email ? ` · ${customer.email}` : '';

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-card-label">Shop Flow order</span>
            <h3>#${order.id}</h3>
          </div>
          <span class="order-status">${order.paymentMethod || 'Cash on delivery'}</span>
        </div>
        <p class="order-date">${order.date}</p>
        <div class="order-details">
          <p><strong>Customer</strong><span>${customer.name || 'Not provided'}<small>${customer.phone || 'No phone'}${emailLine}</small></span></p>
          <p><strong>Deliver to</strong><span>${destination || 'Address not saved'}</span></p>
        </div>
        <ul class="order-items">
          ${order.items.map(item => `
            <li><span>${item.title}<small>Qty ${item.quantity}</small></span><span>${renderOrderPrice(item.price * item.quantity, order.exchangeRateUsdToSyp)}</span></li>
          `).join('')}
        </ul>
        <div class="order-card-total"><span>Items total <small>Delivery fee confirmed by phone</small></span><strong>${renderOrderPrice(order.subtotal ?? order.total, order.exchangeRateUsdToSyp)}</strong></div>
      </div>
    `;
  }).join('');
}

function renderOrderPrice(price, orderRate) {
  if (!Number.isFinite(orderRate) || orderRate <= 0) return render2Price(price);

  const sypAmount = Math.round(price * orderRate);
  const formattedSyp = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(sypAmount);
  return `<span class="dual-price"><span class="price-usd">${formatPrice(price)}</span><span class="price-syp">≈ SYP ${formattedSyp} (reference estimate)</span></span>`;
}
