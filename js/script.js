const API_URL = 'https://dummyjson.com/products';
const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/USD';
let rate = null;
let rateUpdatedAt = null;

function loadExchangeRate() {
  fetch(EXCHANGE_RATE_URL)
    .then(response => {
      if (!response.ok) throw new Error('Exchange rate service returned an error.');
      return response.json();
    })
    .then(data => {
      const sypRate = data.rates && Number(data.rates.SYP);
      if (
            data.result !== 'success' ||
            data.base_code !== 'USD' ||
            !Number.isFinite(sypRate) ||
            sypRate <= 0
          ) {
            throw new Error('Exchange rate service returned invalid USD/SYP data.');
          }

      rate = sypRate;
      rateUpdatedAt = data.time_last_update_utc;
      refresh2Prices();
      updateExchangeRateStatus();
      document.dispatchEvent(new Event('shopFlowRateUpdated'));
    })
    .catch(error => {
      console.error('Could not load the USD/SYP reference rate:', error);
      refresh2Prices();
      updateExchangeRateStatus(error);
      document.dispatchEvent(new Event('shopFlowRateUpdated'));
    });
}
const sypFormatter = new Intl.NumberFormat('en-US');

function formatSypPrice(usdPrice) {
  if (rate === null) return 'SYP rate unavailable';
  return `≈ SYP ${sypFormatter.format(Math.round(usdPrice * rate))} (reference estimate)`;
}


function render2Price(price) {
  return `<span class="2-price"><span class="price-usd">${formatPrice(price)}</span><span class="price-syp" data-usd-price="${price}">${rate === null ? 'Loading SYP estimate…' : formatSypPrice(price)}</span></span>`;
}

function refresh2Prices() {
  document.querySelectorAll('.price-syp[data-usd-price]').forEach(element => {
    element.textContent = formatSypPrice(Number(element.dataset.usdPrice));
  });
}

function updateExchangeRateStatus(error = null) {
  const status = document.getElementById('currencyRateStatus');
  if (!status) return;

  if (rate !== null) {
    const updatedAt = new Date(rateUpdatedAt);
    const date = Number.isNaN(updatedAt.getTime())
      ? 'date unavailable'
      : updatedAt.toLocaleString();
    status.textContent = `SYP shown at the latest API reference rate, updated ${date}. It may differ from local cash exchange rates.`;
  } else if (error) {
    status.textContent = 'USD/SYP rate is unavailable. Prices are shown in USD; try again when you have an internet connection.';
  } else {
    status.textContent = 'Loading the latest USD/SYP reference rate…';
  }
}

function getCart() {
  const data = localStorage.getItem('shopflow_cart');
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem('shopflow_cart', JSON.stringify(cart));
  updateCartCount();
}

function getFavorites() {
  const data = localStorage.getItem('shopflow_favorites');
  return data ? JSON.parse(data) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem('shopflow_favorites', JSON.stringify(favorites));
}

function getOrders() {
  const data = localStorage.getItem('shopflow_orders');
  return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
  localStorage.setItem('shopflow_orders', JSON.stringify(orders));
}

function updateCartCount() {
  const countElement = document.getElementById('cartCount');
  if (!countElement) return;
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  countElement.textContent = total;
}

function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('light')) {
    body.classList.remove('light');
    body.classList.add('dark');
    localStorage.setItem('shopflow_theme', 'dark');
  } else {
    body.classList.remove('dark');
    body.classList.add('light');
    localStorage.setItem('shopflow_theme', 'light');
  }
  updateThemeButton();
}

function loadTheme() {
  const saved = localStorage.getItem('shopflow_theme');
  if (saved === 'dark') {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
  updateThemeButton();
}

function updateThemeButton() {
  const themeButton = document.getElementById('themeButton');
  if (!themeButton) return;

  const isDark = document.body.classList.contains('dark');
  const icon = document.createElement('img');
  icon.className = 'icon';
  const assetPath = window.location.pathname.includes('/html/') ? '../assets/' : './assets/';
  icon.src = `${assetPath}${isDark ? 'icon-sun.svg' : 'icon-moon.svg'}`;
  icon.alt = '';
  themeButton.replaceChildren(icon);
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  themeButton.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

function formatPrice(price) {
  return '$' + price.toFixed(2);
}

function showMessage(elementId, text, type = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = 'message ' + type;
}

function clearMessage(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = '';
    el.className = 'message';
  }
}

function convertProduct(item) {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    description: item.description,
    category: item.category,
    image: item.thumbnail,
    rating: {
      rate: item.rating,
      count: Array.isArray(item.reviews) ? item.reviews.length : 0
    }
  };
}

function fetchProducts() {
  return fetch(API_URL + '?limit=100')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load products');
      return response.json();
    })
    .then(data => data.products.map(convertProduct));
}

function fetchOneProduct(id) {
  return fetch(API_URL + '/' + id)
    .then(response => {
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    })
    .then(item => convertProduct(item));
}

function renderStars(rating) {
  const full = Math.floor(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    const star = i < full ? 'icon-star-filled.svg' : 'icon-star-outline.svg';
    stars += `<img class="rating-star" src="../assets/${star}" alt="">`;
  }
  return `<span class="rating-stars" role="img" aria-label="${rating.toFixed(1)} out of 5 stars">${stars}</span>`;
}

function renderProductCard(product) {
  const detailsPage = window.location.pathname.includes('/html/')
    ? 'productDetails.html'
    : './html/productDetails.html';

  return `
    <a class="product-card" href="${detailsPage}?id=${product.id}">
      <div class="product-card-art">
        <span class="product-category">${product.category}</span>
        <span class="product-card-orbit" aria-hidden="true"></span>
        <img class="product-card-image" src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-card-body">
        <h3>${product.title}</h3>
        <div class="product-card-meta">
          <div class="rating">${renderStars(product.rating.rate)} </div>
          <span class="product-card-view" aria-hidden="true">DISCOVER ↗</span>
        </div>
        <div class="price">${render2Price(product.price)}</div>
      </div>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  updateCartCount();
  updateExchangeRateStatus();
  loadExchangeRate();
  const themeButton = document.getElementById('themeButton');
  if (themeButton) {
    themeButton.addEventListener('click', toggleTheme);
  }
});