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
      featuredContainer.innerHTML = featured.map(renderProductCard).join('');
      clearMessage('featuredMessage');

      const favoriteIds = getFavorites();
      const favoriteContainer = document.getElementById('favoriteProducts');
      if (favoriteIds.length === 0) {
        showMessage('favoritesMessage', 'Save the finds you love and they will be waiting here.');
        favoriteContainer.innerHTML = '';
      } else {
        const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));
        if (favoriteProducts.length === 0) {
          showMessage('favoritesMessage', 'Your favorite products are no longer available.');
          favoriteContainer.innerHTML = '';
        } else {
          favoriteContainer.innerHTML = favoriteProducts.map(renderProductCard).join('');
          clearMessage('favoritesMessage');
        }
      }
    })
    .catch(error => {
      showMessage('featuredMessage', 'Could not load products. Please try again later.', 'error');
      showMessage('favoritesMessage', 'Could not load favorites.', 'error');
    });
});