
let allProducts = [];
let filteredProducts = [];
let cartCount = 0;


const grid          = document.getElementById('product-grid');
const loading       = document.getElementById('loading');
const noResults     = document.getElementById('no-results');
const searchInput   = document.getElementById('search-input');
const searchBtn     = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');
const sortFilter    = document.getElementById('sort-filter');
const resultCount   = document.getElementById('result-count');
const cartCountEl   = document.getElementById('cart-count');

// ===========================
//  FETCH PRODUCTS FROM API
// ===========================
async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    if (!res.ok) throw new Error('Failed to fetch');
    allProducts = await res.json();
    populateCategories();
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
  } catch (err) {
    loading.textContent = 'Failed to load products. Please try again later.';
    console.error(err);
  }
}

// ===========================
//  POPULATE CATEGORY DROPDOWN
// ===========================
function populateCategories() {
  const categories = [...new Set(allProducts.map(p => p.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// ===========================
//  RENDER PRODUCT CARDS
// ===========================
function renderProducts(products) {
  loading.classList.add('hidden');
  grid.innerHTML = '';

  if (products.length === 0) {
    noResults.classList.remove('hidden');
    resultCount.textContent = 0;
    return;
  }

  noResults.classList.add('hidden');
  resultCount.textContent = products.length;

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.animationDelay = `${index * 40}ms`;

    const stars = getStars(product.rating.rate);

    card.innerHTML = `
      <div class="card-img">
        <img src="${product.image}" alt="${product.title}" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <p class="card-title">${product.title}</p>
        <div class="card-rating">
          <span class="stars">${stars}</span>
          <span>${product.rating.rate} (${product.rating.count})</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="add-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    card.querySelector('.add-btn').addEventListener('click', () => addToCart(product.id));
    grid.appendChild(card);
  });
}

// ===========================
//  STAR RATING HELPER
// ===========================
function getStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}


function addToCart(id) {
  cartCount++;
  cartCountEl.textContent = cartCount;

  // Button flash feedback
  const btn = document.querySelector(`.add-btn[data-id="${id}"]`);
  if (btn) {
    const original = btn.textContent;
    btn.textContent = '✓ Added';
    btn.style.background = '#2d8a4e';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 1000);
  }
}


function applyFilters() {
  const query    = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort     = sortFilter.value;

  let result = allProducts.filter(p => {
    const matchSearch   = p.title.toLowerCase().includes(query) ||
                          p.description.toLowerCase().includes(query);
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  if (sort === 'low-high')  result.sort((a, b) => a.price - b.price);
  if (sort === 'high-low')  result.sort((a, b) => b.price - a.price);

  filteredProducts = result;
  renderProducts(filteredProducts);
}

// ===========================
//  EVENT LISTENERS
// ===========================
searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
categoryFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

// ===========================
//  INIT
// ===========================
fetchProducts();
