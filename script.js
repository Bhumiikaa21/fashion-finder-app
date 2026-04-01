// =====================
// GLOBAL VARIABLES
// =====================
let allProducts = [];

let state = {
  search: "",
  category: "all",
  sort: ""
};

// =====================
// FETCH PRODUCTS
// =====================
async function fetchProducts() {
  try {
    let men = await fetch("https://fakestoreapi.com/products/category/men's clothing")
      .then(res => res.json());

    let women = await fetch("https://fakestoreapi.com/products/category/women's clothing")
      .then(res => res.json());

    allProducts = [...men, ...women];

    updateUI(); // initial render
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchProducts();

// =====================
// UPDATE UI (MAIN LOGIC)
// =====================
function updateUI() {
  let filtered = [...allProducts];

  // 🔍 SEARCH
  if (state.search) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(state.search)
    );
  }

  // 🎯 FILTER
  if (state.category !== "all") {
    filtered = filtered.filter(item =>
      item.category.includes(state.category)
    );
  }

  // 🔃 SORT
  if (state.sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  displayProducts(filtered);
}

// =====================
// DISPLAY PRODUCTS
// =====================
function displayProducts(products) {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  products.map(product => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${product.image}" />
      <h3>${product.title}</h3>
      <p>₹${product.price}</p>
    `;

    container.appendChild(div);
  });
}

// =====================
// SEARCH (DEBOUNCED)
// =====================
let timeout;

document.getElementById("searchInput").addEventListener("input", function () {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    state.search = this.value.toLowerCase();
    updateUI();
  }, 300);
});

// =====================
// FILTER
// =====================
document.getElementById("categoryFilter").addEventListener("change", function () {
  state.category = this.value;
  updateUI();
});

// =====================
// SORT
// =====================
document.getElementById("sortOption").addEventListener("change", function () {
  state.sort = this.value;
  updateUI();
});



