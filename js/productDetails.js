document.addEventListener('DOMContentLoaded', () => {
  showMessage('productMessage', 'Loading product...');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showMessage('productMessage', 'Product not found.', 'error');
    return;
  }

  fetchOneProduct(id)
    .then(product => {
      clearMessage('productMessage');
      renderProductDetail(product);
    })
    .catch(() => {
      showMessage('productMessage', 'Could not load product. Please try again later.', 'error');
    });
});

function renderProductDetail(product) {
  const container = document.getElementById('productDetail');
  const favorites = getFavorites();
  const isFavorite = favorites.includes(product.id);

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-art">
        <span class="product-card-category product-detail-category">${product.category}</span>
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h1>${product.title}</h1>
        <p class="price">${render2Price(product.price)}</p>
        <p class="description">${product.description}</p>
        <p class="detail-rating"><strong>Rating:</strong> ${renderStars(product.rating.rate)} <span>(${product.rating.count} reviews)</span></p>
        <div style="margin-top: 20px;">
          <input type="number" id="quantityInput" class="quantity-input" value="1" min="1" aria-label="Quantity">
          <button id="addToCartButton" class="main-button">Add to Cart</button>
          <button id="favoriteButton" class="secondary-button${isFavorite ? ' is-favorite' : ''}"><img class="icon" src="../assets/icon-heart.svg" alt=""><span>${isFavorite ? 'Remove Favorite' : 'Add to Favorite'}</span></button>
        </div>
        <p class="message" id="actionMessage" style="margin-top: 12px;"></p>
      </div>
    </div>
  `;

  document.getElementById('addToCartButton').addEventListener('click', () => {
    const quantityInput = document.getElementById('quantityInput');
    const quantity = Number(quantityInput.value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      showMessage('actionMessage', 'Quantity must be a whole number greater than zero.', 'error');
      quantityInput.focus();
      return;
    }
    addToCart(product, quantity);
    showMessage('actionMessage', 'Added to cart!', 'success');
  });

  document.getElementById('favoriteButton').addEventListener('click', () => {
    toggleFavorite(product.id);
    const favs = getFavorites();
    const nowFav = favs.includes(product.id);
    const favoriteButton = document.getElementById('favoriteButton');
    favoriteButton.classList.toggle('is-favorite', nowFav);
    favoriteButton.querySelector('span').textContent = nowFav ? 'Remove Favorite' : 'Add to Favorite';
    showMessage('actionMessage', nowFav ? 'Added to favorites!' : 'Removed from favorites.', 'success');
  });
}

function addToCart(product, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError('Cart quantity must be a positive whole number.');
  }

  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }
  saveCart(cart);
}

function toggleFavorite(productId) {
  let favorites = getFavorites();
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId);
  } else {
    favorites.push(productId);
  }
  saveFavorites(favorites);
}