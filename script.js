/* ================== ELEMENTS ================== */
const menu = document.getElementById("menu");
const page = document.getElementById("page");
const cheats = document.getElementById("cheats");
const tags = document.getElementById("tags");
const search = document.getElementById("search");
const settings = document.getElementById("settings");
const snow = document.getElementById("snow");

const themeToggle = document.getElementById("themeToggle");
const snowToggle = document.getElementById("snowToggle");

/* ================== STATE ================== */
let cheatsData = [];
let activeTag = null;
let snowEnabled = true;

/* ================== CATEGORY ================== */
function openCategory(type) {
  menu.classList.add("hidden");
  page.classList.remove("hidden");

  fetch(`${type}.json`)
    .then(res => res.json())
    .then(data => {
      cheatsData = data;
      activeTag = null;
      renderTags();
      renderCheats(cheatsData);
      search.value = "";
    });
}

/* ================== RENDER ================== */
function renderCheats(list) {
  cheats.innerHTML = "";

  list.forEach(c => {
    const el = document.createElement("div");
    el.className = "cheat";

    el.innerHTML = `
      <a href="${c.download}" target="_blank">Скачать</a>
      <h3>${formatName(c.name)}</h3>
      <p>${c.description}</p>
    `;

    cheats.appendChild(el);
  });
}

function formatName(parts) {
  return parts
    .map(p => `<span style="color:${p.color}">${p.text}</span>`)
    .join("");
}

function renderTags() {
  tags.innerHTML = "";
  const set = new Set();

  cheatsData.forEach(c => c.tags.forEach(t => set.add(t)));

  set.forEach(t => {
    const el = document.createElement("div");
    el.className = "tag";
    el.textContent = t;

    el.onclick = () => {
      activeTag = activeTag === t ? null : t;
      filterCheats();
    };

    tags.appendChild(el);
  });
}

/* ================== FILTER ================== */
function filterCheats() {
  const q = search.value.toLowerCase();

  const filtered = cheatsData.filter(c =>
    (c.description.toLowerCase().includes(q) ||
     c.tags.join(" ").toLowerCase().includes(q)) &&
    (!activeTag || c.tags.includes(activeTag))
  );

  renderCheats(filtered);
}

/* ================== NAVIGATION ================== */
function goBack() {
  page.classList.add("hidden");
  menu.classList.remove("hidden");
}

/* ================== SETTINGS ================== */
function toggleSettings() {
  settings.classList.toggle("hidden");
}

/* ================== THEME ================== */
themeToggle.onchange = () => {
  document.body.classList.toggle("light", themeToggle.checked);
  localStorage.setItem("theme", themeToggle.checked ? "light" : "dark");
};

/* ================== SNOW ================== */
snowToggle.onchange = () => {
  snowEnabled = snowToggle.checked;
  snow.style.display = snowEnabled ? "block" : "none";
  localStorage.setItem("snow", snowEnabled ? "on" : "off");
};

function startSnow() {
  const ctx = snow.getContext("2d");
  snow.width = innerWidth;
  snow.height = innerHeight;

  let flakes = Array.from({ length: 120 }, () => ({
    x: Math.random() * snow.width,
    y: Math.random() * snow.height,
    r: Math.random() * 2 + 1,
    s: Math.random() + 0.6
  }));

  function draw() {
    if (!snowEnabled) return;

    ctx.clearRect(0, 0, snow.width, snow.height);
    ctx.fillStyle = "white";

    flakes.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.s;
      if (f.y > snow.height) f.y = 0;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

function snowInit() {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();

  const isWinter =
    (m === 12 && day >= 15) ||
    (m === 1 && day <= 10);

  if (isWinter) {
    startSnow();
  } else {
    snow.style.display = "none";
  }
}

/* ================== LOAD SETTINGS ================== */
(function init() {
  // Theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.checked = true;
  }

  // Snow
  const savedSnow = localStorage.getItem("snow");
  if (savedSnow === "off") {
    snowEnabled = false;
    snowToggle.checked = false;
    snow.style.display = "none";
  }

  snowInit();
})();