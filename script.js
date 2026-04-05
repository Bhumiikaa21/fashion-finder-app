// 🔹 GLOBAL STATE
let allData = [];
let currentType = "Events";
let isFetching = false; // Guard to prevent duplicate API calls

// 🔹 ELEMENTS
const timeline = document.getElementById("timeline");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const todayBtn = document.getElementById("todayBtn");
const tabs = document.querySelectorAll(".tab");
const yearFilter = document.getElementById("yearFilter");
const sortSelect = document.getElementById("sort");
const searchInput = document.getElementById("searchInput");
const toggleBtn = document.getElementById("darkModeToggle");
const loader = document.getElementById("loader");

// 🔹 INITIALIZATION & LIFECYCLE
function initApp() {
  loadTheme();
  initDateDropdowns();
  
  // Initial data load if needed
  if (!timeline.children.length && !isFetching) {
    loadToday();
  }
}

// Handle initial load
document.addEventListener("DOMContentLoaded", initApp);

// Handle back/forward cache (bfcache) and navigation back
window.addEventListener("pageshow", (event) => {
  // If the page was restored from cache or timeline is empty, ensure data is present
  if (!timeline.children.length && !isFetching) {
    // We check if dropdowns are already initialized; if not, initApp will handle it
    if (monthSelect.value && daySelect.value) {
      fetchData(monthSelect.value, daySelect.value);
    } else {
      loadToday();
    }
  }
});

// Handle tab switching or returning to the app
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !timeline.children.length && !isFetching) {
    if (monthSelect.value && daySelect.value) {
      fetchData(monthSelect.value, daySelect.value);
    } else {
      loadToday();
    }
  }
});

// 🔹 THEME (Light/Dark)
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

// 🔹 DATE DROPDOWNS
function initDateDropdowns() {
  // Populate days
  updateDayOptions();

  monthSelect.addEventListener("change", () => {
    updateDayOptions();
    fetchData(monthSelect.value, daySelect.value);
  });

  daySelect.addEventListener("change", () => {
    fetchData(monthSelect.value, daySelect.value);
  });
}

function updateDayOptions() {
  const month = parseInt(monthSelect.value);
  const year = new Date().getFullYear(); // Use current year for leap year check
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const currentDay = daySelect.value;
  daySelect.innerHTML = "";
  
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    daySelect.appendChild(option);
  }
  
  if (currentDay && currentDay <= daysInMonth) {
    daySelect.value = currentDay;
  }
}

// 🔹 LOAD TODAY
function loadToday() {
  const today = new Date();
  monthSelect.value = today.getMonth() + 1;
  updateDayOptions();
  daySelect.value = today.getDate();
  fetchData(today.getMonth() + 1, today.getDate());
}

// 🔹 FETCH DATA
async function fetchData(month, day) {
  if (!month || !day || isFetching) return;
  
  try {
    isFetching = true;
    loader.classList.remove("hidden");
    timeline.innerHTML = "";

    const res = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
    if (!res.ok) throw new Error("Network response was not ok");
    
    const data = await res.json();
    allData = data.data;
    applyFilters();

  } catch (err) {
    console.error("Fetch error:", err);
    timeline.innerHTML = `<p style="text-align:center; color:red; padding: 40px;">Failed to load data. Please check your connection.</p>`;
  } finally {
    isFetching = false;
    loader.classList.add("hidden");
  }
}

// 🔹 APPLY FILTERS
function applyFilters() {
  if (!allData || !allData[currentType]) return;
  
  let events = [...allData[currentType]];

  // Convert year
  events.forEach(e => e.year = parseInt(e.year));

  // Year filter
  const yearVal = parseInt(yearFilter.value);
  if (yearVal) {
    events = events.filter(e => e.year >= yearVal);
  }

  // Search filter
  const searchVal = searchInput.value.toLowerCase();
  if (searchVal) {
    events = events.filter(e =>
      e.text.toLowerCase().includes(searchVal)
    );
  }

  // Sort
  const sort = sortSelect.value;
  events.sort((a, b) =>
    sort === "asc" ? a.year - b.year : b.year - a.year
  );

  renderTimeline(events);
}

// 🔹 RENDER TIMELINE
function renderTimeline(events) {
  timeline.innerHTML = "";

  if (events.length === 0) {
    timeline.innerHTML = `<p style="text-align:center; color:var(--subtext); padding:40px;">No events found for this criteria.</p>`;
    return;
  }

  events.forEach((event, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const isSaved = checkIfSaved(event.text);

    const item = document.createElement("div");
    item.className = `timeline-item ${side}`;

    item.innerHTML = `
      <div class="timeline-dot"></div>

      <div class="content-card">
        <h2 class="year">${event.year}</h2>
        <div class="divider"></div>

        <p class="preview-text">
          ${event.text.slice(0, 120)}...
        </p>

        <div class="extra-content">
          <p>${event.text}</p>

          <div class="actions-row">
            ${
              event.links?.[0]
                ? `<a href="${event.links[0].link}" target="_blank" class="wiki-link" onclick="event.stopPropagation()">Read more</a>`
                : ""
            }

            <button class="save-btn ${isSaved ? 'saved' : ''}">
              ${isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    `;

    // 🔥 Expand logic
    const card = item.querySelector(".content-card");
    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    // 🔹 Save logic
    const saveBtn = item.querySelector(".save-btn");
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSave(saveBtn, event);
    });

    timeline.appendChild(item);

    // 🔹 Animation
    setTimeout(() => {
      item.classList.add("show");
    }, index * 70);
  });
}

// 🔹 TODAY BUTTON
todayBtn.addEventListener("click", loadToday);

// 🔹 TABS
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    currentType = tab.dataset.type;
    applyFilters();
  });
});

// 🔹 FILTER EVENTS
yearFilter.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// 🔹 SAVE LOGIC
function checkIfSaved(text) {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  return favs.some(e => e.text === text);
}

function toggleSave(btn, event) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const index = favs.findIndex(e => e.text === event.text);

  if (index > -1) {
    // Unsave
    favs.splice(index, 1);
    btn.classList.remove("saved");
    btn.textContent = "Save";
  } else {
    // Save
    favs.push(event);
    btn.classList.add("saved");
    btn.textContent = "Saved";
  }

  localStorage.setItem("favorites", JSON.stringify(favs));
}
