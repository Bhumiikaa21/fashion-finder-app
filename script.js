// ===============================
// CONFIG
// ===============================

const API_BASE = "https://dummyjson.com/products/category";

const categories = {
  all: ["mens-shirts", "mens-shoes", "womens-dresses", "womens-shoes", "tops"],
  men: ["mens-shirts", "mens-shoes"],
  women: ["womens-dresses", "womens-shoes", "tops"]
};

let allProducts = [];
let filteredProducts = [];

// ===============================
// FETCH PRODUCTS (ONLY FASHION)
// ===============================

async function fetchFashionProducts(selected = "all") {
  try {
    const categoryList = categories[selected];

    const requests = categoryList.map(cat =>
      fetch(`${API_BASE}/${cat}`).then(res => res.json())
    );

    const results = await Promise.all(requests);

    // Combine all category products
    allProducts = results.flatMap(res => res.products);

    filteredProducts = [...allProducts];

    displayProducts(filteredProducts);

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts(products) {
  const container = document.getElementById("product-container");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<h2>No products found</h2>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const isWishlisted = isInWishlist(product.id);

    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>₹ ${product.price}</p>
      <p>⭐ ${product.rating}</p>
      <button onclick="toggleWishlist(${product.id})">
        ${isWishlisted ? "❤️ Remove" : "🤍 Wishlist"}
      </button>
    `;

    container.appendChild(card);
  });
}

// ===============================
// SEARCH
// ===============================

function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase();

  filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(query)
  );

  displayProducts(filteredProducts);
}

// ===============================
// SORT
// ===============================

function sortProducts(type) {
  let sorted = [...filteredProducts];

  if (type === "low-high") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (type === "high-low") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (type === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  }

  displayProducts(sorted);
}

// ===============================
// CATEGORY FILTER
// ===============================

function filterCategory(type) {
  fetchFashionProducts(type);
}

// ===============================
// WISHLIST (LOCAL STORAGE)
// ===============================

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function isInWishlist(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id) {
  let wishlist = getWishlist();

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
  } else {
    wishlist.push(id);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  displayProducts(filteredProducts);
}

// ===============================
// INITIAL LOAD
// ===============================

fetchFashionProducts();