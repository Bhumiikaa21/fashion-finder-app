let allData = [];
let currentType = "Events";
let isFetching = false;

const timeline     = document.getElementById("timeline");
const monthSelect  = document.getElementById("monthSelect");
const daySelect    = document.getElementById("daySelect");
const todayBtn     = document.getElementById("todayBtn");
const tabs         = document.querySelectorAll(".tab");
const yearFilter   = document.getElementById("yearFilter");
const sortSelect   = document.getElementById("sort");
const searchInput  = document.getElementById("searchInput");
const toggleBtn    = document.getElementById("darkModeToggle");
const loader       = document.getElementById("loader");

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  setupMonthDropdown();
  setupDayDropdown();
  loadToday();
});

function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    toggleBtn.textContent = "☀️";
  } else {
    toggleBtn.textContent = "🌙";
  }
}

toggleBtn.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  toggleBtn.textContent = isLight ? "☀️" : "🌙";
});

function setupMonthDropdown() {
  monthSelect.addEventListener("change", function () {
    fillDayOptions();
    fetchData(monthSelect.value, daySelect.value);
  });
}

function setupDayDropdown() {
  fillDayOptions();
  daySelect.addEventListener("change", function () {
    fetchData(monthSelect.value, daySelect.value);
  });
}

function fillDayOptions() {
  const month = parseInt(monthSelect.value);
  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
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

function loadToday() {
  const today = new Date();
  monthSelect.value = today.getMonth() + 1;
  fillDayOptions();
  daySelect.value = today.getDate();
  fetchData(today.getMonth() + 1, today.getDate());
}

todayBtn.addEventListener("click", loadToday);

async function fetchData(month, day) {
  if (!month || !day || isFetching) return;

  isFetching = true;
  loader.classList.remove("hidden");
  timeline.innerHTML = "";

  try {
    const res = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
    if (!res.ok) throw new Error("Bad response");
    const data = await res.json();
    allData = data.data;
    applyFilters();
  } catch (err) {
    timeline.innerHTML = `<p style="text-align:center; color:red; padding:40px;">Failed to load data. Please check your connection.</p>`;
  }

  isFetching = false;
  loader.classList.add("hidden");
}

yearFilter.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

function applyFilters() {
  if (!allData || !allData[currentType]) return;

  let events = allData[currentType].map(function (e) {
    return { ...e, year: parseInt(e.year) };
  });

  // Filter by year
  const minYear = parseInt(yearFilter.value);
  if (minYear) {
    events = events.filter(function (e) { return e.year >= minYear; });
  }

  // Filter by search
  const search = searchInput.value.toLowerCase();
  if (search) {
    events = events.filter(function (e) {
      return e.text.toLowerCase().includes(search);
    });
  }

  // Sort
  const order = sortSelect.value;
  events.sort(function (a, b) {
    return order === "asc" ? a.year - b.year : b.year - a.year;
  });

  renderTimeline(events);
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    const type = tab.getAttribute("data-type");
    if (!type) return;

    tabs.forEach(function (t) { t.classList.remove("active"); });
    tab.classList.add("active");

    if (type === "Births") {
      currentType = "Deaths";
    } else if (type === "Deaths") {
      currentType = "Births";
    } else {
      currentType = type;
    }

    applyFilters();
  });
});

function renderTimeline(events) {
  timeline.innerHTML = "";

  if (events.length === 0) {
    timeline.innerHTML = `<p style="text-align:center; color:var(--subtext); padding:40px;">No events found for this criteria.</p>`;
    return;
  }

  events.forEach(function (event, index) {
    const side = index % 2 === 0 ? "left" : "right";
    const isSaved = isEventSaved(event.text);
    const previewText = event.text.length > 100 ? event.text.slice(0, 100) + "..." : event.text;

    const item = document.createElement("div");
    item.className = `timeline-item ${side}`;

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="content-card">
        <h2 class="year">${event.year}</h2>
        <div class="divider"></div>
        <p class="preview-text">${previewText}</p>
        <div class="extra-content">
          <p class="full-description">${event.text}</p>
          <div class="actions-row">
            ${event.links?.[0] ? `<a href="${event.links[0].link}" target="_blank" class="wiki-link" onclick="event.stopPropagation()">Read more</a>` : ""}
            <button class="save-btn ${isSaved ? "saved" : ""}">${isSaved ? "Saved" : "Save"}</button>
          </div>
        </div>
      </div>
    `;

    item.querySelector(".content-card").addEventListener("click", function () {
      this.classList.toggle("expanded");
    });

    item.querySelector(".save-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      toggleSave(this, event);
    });

    timeline.appendChild(item);

    setTimeout(function () { item.classList.add("show"); }, index * 70);
  });
}

function getSavedEvents() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function isEventSaved(text) {
  return getSavedEvents().some(function (e) { return e.text === text; });
}

function toggleSave(btn, event) {
  let favs = getSavedEvents();
  const exists = favs.findIndex(function (e) { return e.text === event.text; });

  if (exists > -1) {
    favs.splice(exists, 1);
    btn.classList.remove("saved");
    btn.textContent = "Save";
  } else {
    favs.push(event);
    btn.classList.add("saved");
    btn.textContent = "Saved";
  }

  localStorage.setItem("favorites", JSON.stringify(favs));
}