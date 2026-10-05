let allProducts = [];
let currentPage = 1;
const productsPerPage = 12;

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts()
    .then(products => {
      allProducts = products;
      fillCategories(products);
      renderProducts();
      clearMessage('productsMessage');
    })
    .catch(() => {
      showMessage('productsMessage', 'Could not load products. Please try again later.', 'error');
    });

  document.getElementById('searchInput').addEventListener('input', () => renderProducts(true));
  document.getElementById('categorySelect').addEventListener('change', () => renderProducts(true));
  document.getElementById('sortSelect').addEventListener('change', () => renderProducts(true));
  document.getElementById('previousPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
    }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    renderProducts();
  });
});

function fillCategories(products) {
  const select = document.getElementById('categorySelect');
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function renderProducts(resetPage = false) {
  if (resetPage) currentPage = 1;
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categorySelect').value;
  const sort = document.getElementById('sortSelect').value;

  let filtered = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(search);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'name') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating.rate - a.rating.rate);
  }

  const container = document.getElementById('productList');
  const pagination = document.getElementById('productsPagination');
  if (filtered.length === 0) {
    showMessage('productsMessage', 'No products match your search.');
    container.innerHTML = '';
    pagination.hidden = true;
    document.getElementById('pageIndicator').textContent = '';
    document.getElementById('previousPage').disabled = true;
    document.getElementById('nextPage').disabled = true;
  } else {
    const totalPages = Math.ceil(filtered.length / productsPerPage);
    currentPage = Math.min(currentPage, totalPages);
    const startIndex = (currentPage - 1) * productsPerPage;
    const pageProducts = filtered.slice(startIndex, startIndex + productsPerPage);

    clearMessage('productsMessage');
    container.innerHTML = pageProducts.map(product => renderProductCard(product)).join('');
    pagination.hidden = totalPages <= 1;
    document.getElementById('pageIndicator').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('previousPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
  }
}