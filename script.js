// ---------------- CONFIG
const CONFIG = {
  NEWSAPI_KEY: "d0f7e171576a4a8a8a98383149590e8d", // Replace with your NewsAPI.org key
  country: "us",
  pageSize: 12,
};

// ---------------- Dummy data fallback
const dummyArticles = [
  {
    title: "Global leaders meet to discuss climate action",
    description: "A short summary of the meeting and commitments.",
    url: "#",
    urlToImage: "https://images.unsplash.com/photo-1506277882587-9b6d8a4b07c2",
    source: { name: "Demo Times" },
    publishedAt: "2025-10-01T09:00:00Z",
  },
  {
    title: "New advances in battery tech promise longer EV ranges",
    description: "Researchers announced a new cell chemistry...",
    url: "#",
    urlToImage: "https://images.unsplash.com/photo-1549921296-3d3f9f0b9d32",
    source: { name: "Science Daily" },
    publishedAt: "2025-09-30T12:30:00Z",
  },
];

// ---------------- Helpers
function timeAgo(iso) {
  const then = new Date(iso);
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return diff + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// ---------------- Render
function renderArticles(articles) {
  const wrap = document.getElementById("articles");
  wrap.innerHTML = "";
  if (!articles || articles.length === 0) {
    wrap.innerHTML = "<p>No articles found.</p>";
    return;
  }
  articles.forEach((a) => {
    const card = el("article", "card");
    const img = document.createElement("img");
    img.src =
      a.urlToImage || "https://via.placeholder.com/600x400?text=No+Image";
    const body = el("div", "body");
    const h3 = el("h3");
    h3.textContent = a.title;
    const meta = el("div", "meta");
    meta.textContent = `${a.source?.name || "Unknown"} • ${timeAgo(
      a.publishedAt
    )}`;
    const p = el("p");
    p.textContent = a.description || "";
    const read = el("div", "read");
    const open = el("button", "btn");
    open.textContent = "Open";
    open.onclick = () => window.open(a.url, "_blank");
    read.append(open);
    body.append(h3, meta, p, read);
    card.append(img, body);
    wrap.append(card);
  });
}

function renderTrending(articles) {
  const ul = document.getElementById("trending-list");
  ul.innerHTML = "";
  articles.slice(0, 5).forEach((a) => {
    const li = document.createElement("li");
    const ael = document.createElement("a");
    ael.href = a.url;
    ael.textContent = a.title;
    ael.target = "_blank";
    li.append(ael);
    ul.append(li);
  });
}

// ---------------- Fetch
async function fetchTopHeadlines({ category = null, q = null } = {}) {
  const status = document.getElementById("status");
  status.textContent = "Loading...";

  if (!CONFIG.NEWSAPI_KEY || CONFIG.NEWSAPI_KEY === "YOUR_NEWSAPI_KEY") {
    status.textContent = "Demo mode — sample articles";
    return { articles: dummyArticles };
  }

  const params = new URLSearchParams({
    pageSize: CONFIG.pageSize,
    country: CONFIG.country,
    apiKey: CONFIG.NEWSAPI_KEY,
  });
  if (category && category !== "general") params.set("category", category);
  if (q) params.set("q", q);

  try {
    const url = `https://newsapi.org/v2/top-headlines?${params}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      url
    )}`;

    const res = await fetch(proxyUrl);
    const data = await res.json();

    if (!data.articles) throw new Error("Invalid data");
    status.textContent = `Showing ${data.articles.length} articles`;
    return data;
  } catch {
    status.textContent = "Error — using sample data";
    return { articles: dummyArticles };
  }
}

// ---------------- Load
async function load({ category = null, q = null } = {}) {
  const res = await fetchTopHeadlines({ category, q });
  renderArticles(res.articles);
  renderTrending(res.articles);
}

// ---------------- Events
document.getElementById("refresh").addEventListener("click", () => {
  const active = document.querySelector(".category.active");
  load({
    category: active?.dataset.cat,
    q: document.getElementById("search").value,
  });
});
document.getElementById("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") load({ q: e.target.value });
});
document.querySelectorAll(".category").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".category")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    load({ category: btn.dataset.cat });
  });
});

// Initial load
load();
