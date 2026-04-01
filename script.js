// ================= API CONFIG =================
const API_BASE = "https://dummyjson.com/products/category";

const categories = {
  all: ["mens-shirts", "mens-shoes", "womens-dresses", "womens-shoes", "tops"],
  men: ["mens-shirts", "mens-shoes"],
  women: ["womens-dresses", "womens-shoes", "tops"]
};

let allProducts = [];
let filteredProducts = [];

// ================= FETCH PRODUCTS =================
async function fetchProducts(type = "all") {
  try {
    const categoryList = categories[type];

    const requests = categoryList.map(cat =>
      fetch(`${API_BASE}/${cat}`).then(res => res.json())
    );

    const results = await Promise.all(requests);

    allProducts = results.flatMap(r => r.products);
    filteredProducts = [...allProducts];

    displayProducts(filteredProducts);

  } catch (err) {
    console.error(err);
  }
}

// ================= DISPLAY =================
function displayProducts(products) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    const isWish = isInWishlist(p.id);

    card.innerHTML = `
      <img src="${p.thumbnail}">
      <h4>${p.title}</h4>
      <p>₹ ${p.price}</p>
      <p>⭐ ${p.rating}</p>
      <button onclick="toggleWishlist(${p.id})">
        ${isWish ? "❤️ Remove" : "🤍 Wishlist"}
      </button>
    `;

    grid.appendChild(card);
  });
}

// ================= SEARCH =================
document.getElementById("searchInput").addEventListener("input", () => {
  const query = document.getElementById("searchInput").value.toLowerCase();

  filteredProducts = allProducts.filter(p =>
    p.title.toLowerCase().includes(query)
  );

  displayProducts(filteredProducts);
});

// ================= SORT =================
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

// ================= FILTER =================
function filterCategory(type) {
  fetchProducts(type);
}

// ================= WISHLIST =================
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function isInWishlist(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id) {
  let list = getWishlist();

  if (list.includes(id)) {
    list = list.filter(i => i !== id);
  } else {
    list.push(id);
  }

  localStorage.setItem("wishlist", JSON.stringify(list));
  displayProducts(filteredProducts);
}

// ================= DARK MODE =================
const toggleBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleBtn.textContent = "☀️";
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    toggleBtn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    toggleBtn.textContent = "🌙";
  }
});

// ================= INIT =================
fetchProducts();