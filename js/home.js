document.addEventListener('DOMContentLoaded', () => {
  showMessage('featuredMessage', 'Loading products...');
  showMessage('favoritesMessage', 'Loading favorites...');

  fetchProducts()
    .then(products => {
      document.getElementById('productCount').textContent = products.length;
      const categories = [...new Set(products.map(p => p.category))];
      document.getElementById('categoryCount').textContent = categories.length;

      const featured = [...new Map(products.map(product => [product.category, product])).values()].slice(0, 4);
      const featuredContainer = document.getElementById('featuredProducts');
      featuredContainer.innerHTML = featured.map(product => renderProductCard(product)).join('');
      clearMessage('featuredMessage');

      const favoriteIds = getFavorites();
      const favoriteContainer = document.getElementById('favoriteProducts');
      renderFavorites(products, favoriteIds);
      favoriteContainer.addEventListener('click', event => {
        const button = event.target.closest('.favorite-remove-button');
        if (!button) return;

        const productId = Number(button.dataset.id);
        const updatedFavorites = getFavorites().filter(id => id !== productId);
        saveFavorites(updatedFavorites);
        renderFavorites(products, updatedFavorites);
      });
    })
    .catch(error => {
      showMessage('featuredMessage', 'Could not load products. Please try again later.', 'error');
      showMessage('favoritesMessage', 'Could not load favorites.', 'error');
    });
});

function renderFavorites(products, favoriteIds) {
  const favoriteContainer = document.getElementById('favoriteProducts');
  if (favoriteIds.length === 0) {
    showMessage('favoritesMessage', 'Save the finds you love and they will be waiting here.');
    favoriteContainer.innerHTML = '';
    return;
  }

  const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));
  if (favoriteProducts.length === 0) {
    showMessage('favoritesMessage', 'Your favorite products are no longer available.');
    favoriteContainer.innerHTML = '';
    return;
  }

  favoriteContainer.innerHTML = favoriteProducts
    .map(product => renderProductCard(product, true))
    .join('');
  clearMessage('favoritesMessage');
}