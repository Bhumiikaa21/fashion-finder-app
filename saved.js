const savedGrid = document.getElementById("savedGrid");
const toggleBtn = document.getElementById("darkModeToggle");

window.onload = () => {
    loadTheme();
    renderSaved();
};

function loadTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
        document.body.classList.add("light-mode");
        toggleBtn.textContent = "☀️";
    } else {
        toggleBtn.textContent = "🌙";
      }
}

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    if (isLight) {
        localStorage.setItem("theme", "light");
        toggleBtn.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "dark");
        toggleBtn.textContent = "🌙";
    }
});

function renderSaved() {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    savedGrid.innerHTML = "";

    if (favs.length === 0) {
    savedGrid.innerHTML = `<p style="text-align:center; color:var(--subtext); width:100%; padding:40px;">No saved items yet. Go back to explore history!</p>`;
    return;
    }

    favs.forEach((item) => {
    const card = document.createElement("div");
    card.className = "saved-card";

    card.innerHTML = `
    <div class="saved-header">
        <h2 class="saved-year">${item.year}</h2>
    </div>
    
    <p class="saved-text">
        ${item.text}
    </p>
          
    <div class="saved-actions">
        ${
            item.links?.[0]
            ? `<a href="${item.links[0].link}" target="_blank" class="wiki-link">Read more</a>`
            : "<span></span>"
        }
        <button class="remove-btn">Remove</button>
    </div>
    `;

    const removeBtn = card.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
        removeSaved(item.text);
    });

    savedGrid.appendChild(card);

    });
}

function removeSaved(text) {
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    favs = favs.filter(e => e.text !== text);
    localStorage.setItem("favorites", JSON.stringify(favs));
    renderSaved();
}