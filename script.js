
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const app = $("#app");
  const navigation = $("#navigation");
  const toast = $("#toast");

  const STORAGE = {
    budget: "wedplan-v2-budget",
    guests: "wedplan-v2-guests",
    tasks: "wedplan-v2-tasks",
    favourites: "wedplan-v2-favourites",
    weddingDate: "wedplan-v2-date"
  };

  const categories = [
    "Venue",
    "Catering",
    "Photography",
    "Outfits",
    "Decor",
    "Other"
  ];

  const defaultTasks = [
    { id: "t1", text: "Choose the wedding date", category: "Planning", done: false },
    { id: "t2", text: "Shortlist wedding venues", category: "Venue", done: false },
    { id: "t3", text: "Set the wedding budget", category: "Budget", done: false },
    { id: "t4", text: "Create the guest list", category: "Guests", done: false },
    { id: "t5", text: "Choose a colour palette", category: "Decor", done: false }
  ];

  const vendors = [
    {
      id: "v1",
      name: "The Grand Palace",
      category: "Venue",
      description: "A regal setting for unforgettable celebrations.",
      image: "photo-1519167758481-83f550bb49b3",
      location: "Example venue listing",
      price: "Contact for pricing"
    },
    {
      id: "v2",
      name: "Petals & Promises",
      category: "Decor",
      description: "Romantic floral styling and elegant tablescapes.",
      image: "photo-1478146896981-b80fe463b330",
      location: "Example decor listing",
      price: "Contact for pricing"
    },
    {
      id: "v3",
      name: "Golden Hour Studio",
      category: "Photography",
      description: "Candid moments and timeless wedding portraits.",
      image: "photo-1537633552985-df8429e8048b",
      location: "Example photography listing",
      price: "Contact for pricing"
    },
    {
      id: "v4",
      name: "The Celebration Table",
      category: "Catering",
      description: "Thoughtfully curated menus for your special day.",
      image: "photo-1414235077428-338989a2e8c0",
      location: "Example catering listing",
      price: "Contact for pricing"
    },
    {
      id: "v5",
      name: "The Bridal Atelier",
      category: "Outfits",
      description: "Graceful wedding looks with beautiful details.",
      image: "photo-1599643478518-a784e5dc4c8f",
      location: "Example bridal listing",
      price: "Contact for pricing"
    },
    {
      id: "v6",
      name: "Ever After Films",
      category: "Photography",
      description: "Cinematic storytelling for your wedding memories.",
      image: "photo-1511285560929-80b456fea0bc",
      location: "Example film listing",
      price: "Contact for pricing"
    }
  ];

  const gallery = [
    {
      title: "The Ceremony",
      subtitle: "A beautiful beginning",
      image: "photo-1519741497674-611481863552"
    },
    {
      title: "Floral Dreams",
      subtitle: "Flowers in full bloom",
      image: "photo-1478146896981-b80fe463b330"
    },
    {
      title: "Golden Details",
      subtitle: "The little things that matter",
      image: "photo-1519167758481-83f550bb49b3"
    },
    {
      title: "The Celebration",
      subtitle: "Gathered with your favourite people",
      image: "photo-1464366400600-7168b8af9bc3"
    },
    {
      title: "Bridal Elegance",
      subtitle: "Your moment to shine",
      image: "photo-1537633552985-df8429e8048b"
    },
    {
      title: "A Sweet Table",
      subtitle: "A little indulgence",
      image: "photo-1511795409834-ef04bbd61622"
    }
  ];

  function load(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Unable to save data. Check your browser storage settings.");
      return false;
    }
  }

  function readMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : 0;
  }

  function money(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function photo(id, width = 800) {
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  function feedback(id, message, isError = false) {
    const element = $("#" + id);
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("error", isError);
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8);
  }

  function validArray(key, fallback, validate) {
    const value = load(key, fallback);
    return Array.isArray(value) ? value.filter(validate) : fallback;
  }

  let budget = load(STORAGE.budget, {
    total: 1000000,
    expenses: []
  });

  if (!budget || typeof budget !== "object" || Array.isArray(budget)) {
    budget = { total: 1000000, expenses: [] };
  }

  budget.total = readMoney(budget.total);
  budget.expenses = Array.isArray(budget.expenses)
    ? budget.expenses.filter(item =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        categories.includes(item.category)
      ).map(item => ({
        id: item.id,
        name: item.name.slice(0, 120),
        category: item.category,
        planned: readMoney(item.planned),
        actual: readMoney(item.actual)
      }))
    : [];

  let guests = validArray(STORAGE.guests, [], guest =>
    guest &&
    typeof guest.id === "string" &&
    typeof guest.name === "string"
  ).map(guest => ({
    id: guest.id,
    name: guest.name.slice(0, 120),
    status: ["Pending", "Accepted", "Declined"].includes(guest.status)
      ? guest.status : "Pending"
  }));

  let tasks = validArray(STORAGE.tasks, defaultTasks, task =>
    task &&
    typeof task.id === "string" &&
    typeof task.text === "string"
  ).map(task => ({
    id: task.id,
    text: task.text.slice(0, 180),
    category: typeof task.category === "string" ? task.category : "General",
    done: Boolean(task.done)
  }));

  let favourites = load(STORAGE.favourites, []);
  if (!Array.isArray(favourites)) favourites = [];
  favourites = favourites.filter(id => vendors.some(vendor => vendor.id === id));

  function persistBudget() {
    return save(STORAGE.budget, budget);
  }

  function persistGuests() {
    return save(STORAGE.guests, guests);
  }

  function persistTasks() {
    return save(STORAGE.tasks, tasks);
  }

  function persistFavourites() {
    return save(STORAGE.favourites, favourites);
  }

  function pageURL(page) {
    return page === "dashboard" ? "index.html" : "?page=" + encodeURIComponent(page);
  }

  function link(page, text, className = "") {
    return `<a class="${className}" href="${pageURL(page)}">${text}</a>`;
  }

  function pageHeading(eyebrow, title, description = "") {
    return `
      <div class="page-heading">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        ${description ? `<p class="muted">${description}</p>` : ""}
      </div>
    `;
  }

  function stat(label, value, icon, note = "") {
    return `
      <article class="card stat-card">
        <span class="stat-icon">${icon}</span>
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        <div class="muted small">${note}</div>
      </article>
    `;
  }

  function imageCard(item) {
    return `
      <article class="photo-card">
        <img src="${photo(item.image, 900)}"
          alt="${escapeHTML(item.title)} wedding inspiration"
          loading="lazy">
        <div class="photo-info">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.subtitle)}</p>
        </div>
      </article>
    `;
  }

  function vendorCard(vendor) {
    const isSaved = favourites.includes(vendor.id);
    return `
      <article class="card vendor-card" data-category="${vendor.category}">
        <img class="vendor-image"
          src="${photo(vendor.image, 800)}"
          alt="${escapeHTML(vendor.name)} inspiration photo"
          loading="lazy">
        <div class="vendor-body">
          <span class="vendor-category">${escapeHTML(vendor.category)}</span>
          <h3>${escapeHTML(vendor.name)}</h3>
          <p>${escapeHTML(vendor.description)}</p>
          <p>${escapeHTML(vendor.price)}</p>
          <div class="button-row">
            <button class="btn btn-small favorite ${isSaved ? "active" : ""}"
              data-action="favorite" data-id="${vendor.id}"
              aria-pressed="${isSaved}">
              ${isSaved ? "♥ Saved" : "♡ Save"}
            </button>
            <button class="btn btn-small btn-outline"
              data-action="vendor-contact" data-id="${vendor.id}">
              Enquire
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function budgetTotals() {
    const planned = budget.expenses.reduce((sum, item) => sum + item.planned, 0);
    const actual = budget.expenses.reduce((sum, item) => sum + item.actual, 0);
    return {
      planned,
      actual,
      remaining: budget.total - actual,
      percentage: budget.total > 0
        ? Math.min(100, actual / budget.total * 100) : 0
    };
  }

  function weddingDate() {
    const value = load(STORAGE.weddingDate, "");
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) return null;

    date.setHours(0, 0, 0, 0);
    return date;
  }

  function daysUntilWedding() {
    const target = weddingDate();
    if (!target) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  function renderDashboard() {
    const totals = budgetTotals();
    const completed = tasks.filter(task => task.done).length;
    const taskProgress = tasks.length
      ? Math.round(completed / tasks.length * 100) : 0;
    const accepted = guests.filter(guest => guest.status === "Accepted").length;
    const days = daysUntilWedding();
    const date = weddingDate();

    return `
      <section class="hero">
        <div class="hero-content">
          <span class="eyebrow">Your journey to forever begins here</span>
          <h1>A beautiful day.<br>A lifetime of love.</h1>
          <p>Every detail, every little dream, every moment that makes your day yours. Let's plan it together.</p>
          <div class="hero-date">${date
            ? "Your special day · " + date.toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric"
              })
            : "Your dream day is waiting to be planned ♡"}</div>
          <div class="button-row">
            ${link("checklist", "Start planning", "btn btn-gold")}
            ${link("countdown", "Set your date", "btn btn-outline")}
          </div>
        </div>
      </section>

      <div class="section-title">
        <h2>Your wedding at a glance</h2>
        <span class="muted small">Your personal planning dashboard</span>
      </div>

      <div class="grid grid-4">
        ${stat("Overall budget", money(budget.total), "₹", "Your spending limit")}
        ${stat("Actual spending", money(totals.actual), "↗", "Recorded expenses")}
        ${stat("Guest list", guests.length, "♧", accepted + " confirmed attendance")}
        ${stat("Tasks completed", completed + "/" + tasks.length, "♡", "Your planning progress")}
      </div>

      <div class="grid grid-2" style="margin-top:20px">
        <section class="card">
          <div class="section-title" style="margin-top:0">
            <h2>Planning progress</h2>
            <strong>${taskProgress}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill wine" style="width:${taskProgress}%"></div>
          </div>
          <p class="muted small">${completed} of ${tasks.length} tasks completed.</p>
          ${link("checklist", "View checklist →", "btn btn-outline")}
        </section>

        <section class="card">
          <span class="eyebrow">A little reminder</span>
          <h2>Your countdown</h2>
          <p class="countdown-number" style="font-size:36px;margin:12px 0">
            ${days === null ? "♡" : days > 0 ? days + " days" : days === 0 ? "Today!" : "Celebrated ♡"}
          </p>
          <p class="muted small">${date
            ? date.toLocaleDateString("en-IN", {day:"numeric", month:"long", year:"numeric"})
            : "Choose a date to start your countdown."}</p>
          ${link("countdown", "Manage wedding date →", "btn btn-outline")}
        </section>
      </div>

      <div class="section-title">
        <h2>Little things to do next</h2>
        ${link("checklist", "View all tasks →", "muted small")}
      </div>
      <section class="card task-list">
        ${tasks.filter(task => !task.done).slice(0, 4).map(task => `
          <div class="task-item">
            <input type="checkbox" data-action="toggle-task" data-id="${task.id}"
              aria-label="Complete ${escapeHTML(task.text)}">
            <span class="task-text">${escapeHTML(task.text)}</span>
            <span class="task-category">${escapeHTML(task.category)}</span>
          </div>
        `).join("") || '<p class="empty-state">Everything is checked off. Take a breath and celebrate! ♡</p>'}
      </section>

      <div class="section-title">
        <h2>Save a little inspiration</h2>
        ${link("gallery", "Explore gallery →", "muted small")}
      </div>
      <div class="gallery-grid">
        ${gallery.slice(0, 3).map(imageCard).join("")}
      </div>
    `;
  }

  function renderBudget() {
    const totals = budgetTotals();

    return `
      <div class="container">
        ${pageHeading("THE FINER DETAILS", "Your wedding budget", "Keep every rupee accounted for, from the big decisions to the little details.")}

        <section class="card" style="margin-bottom:20px">
          <form id="budgetTotalForm">
            <div class="field">
              <label for="totalBudget">Your overall budget (₹)</label>
              <input id="totalBudget" name="total" type="number" min="0"
                step="1" required value="${budget.total}">
            </div>
            <button class="btn" type="submit">Save overall budget</button>
            <p id="budgetFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>

        <div class="grid grid-3">
          ${stat("Planned expenses", money(totals.planned), "◇", "Your estimated costs")}
          ${stat("Actual expenses", money(totals.actual), "↗", "Amounts recorded so far")}
          ${stat("Budget remaining", money(totals.remaining), "₹", totals.remaining < 0 ? "Over budget — review expenses" : "Available from overall budget")}
        </div>

        <section class="card" style="margin-top:20px">
          <div class="section-title" style="margin-top:0">
            <h2>Spending progress</h2>
            <strong>${totals.percentage.toFixed(0)}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${totals.remaining < 0 ? "wine" : ""}" style="width:${totals.percentage}%"></div>
          </div>
          <p class="muted small">The overall budget is independent of the sum of category estimates.</p>
        </section>

        <div class="section-title">
          <h2>Expense details</h2>
        </div>

        <section class="card">
          <form id="expenseForm">
            <div class="form-grid">
              <div class="field">
                <label for="expenseName">Expense name</label>
                <input id="expenseName" name="name" maxlength="120" required placeholder="e.g. Reception venue">
              </div>
              <div class="field">
                <label for="expenseCategory">Category</label>
                <select id="expenseCategory" name="category">
                  ${categories.map(category => `<option>${category}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="expensePlanned">Planned amount (₹)</label>
                <input id="expensePlanned" name="planned" type="number" min="0" step="1" required placeholder="0">
              </div>
              <div class="field">
                <label for="expenseActual">Actual amount (₹)</label>
                <input id="expenseActual" name="actual" type="number" min="0" step="1" value="0" required>
              </div>
            </div>
            <button class="btn" type="submit">+ Add expense</button>
            <p id="expenseFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>

        <section class="card" style="margin-top:20px">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Expense</th><th>Category</th><th>Planned</th><th>Actual</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${budget.expenses.map(item => `
                  <tr>
                    <td>${escapeHTML(item.name)}</td>
                    <td>${escapeHTML(item.category)}</td>
                    <td>${money(item.planned)}</td>
                    <td>${money(item.actual)}</td>
                    <td><button class="btn btn-danger btn-small" data-action="delete-expense" data-id="${item.id}">Delete</button></td>
                  </tr>
                `).join("") || '<tr><td colspan="5" class="empty-state">No expenses yet. Add your first expense above.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function renderGuests() {
    const accepted = guests.filter(guest => guest.status === "Accepted").length;
    const pending = guests.filter(guest => guest.status === "Pending").length;
    const declined = guests.filter(guest => guest.status === "Declined").length;

    return `
      <div class="container">
        ${pageHeading("YOUR FAVOURITE PEOPLE", "The guest list", "A place for everyone you want to share your special day with.")}

        <div class="grid grid-3">
          ${stat("Total guests", guests.length, "♧", "Everyone on your list")}
          ${stat("Attending", accepted, "♡", "Confirmed yes")}
          ${stat("Awaiting reply", pending, "…", declined + " declined")}
        </div>

        <section class="card" style="margin-top:20px">
          <h2>Add a guest</h2>
          <form id="guestForm">
            <div class="form-grid">
              <div class="field">
                <label for="guestName">Guest's full name</label>
                <input id="guestName" name="name" required maxlength="120" placeholder="Enter guest name">
              </div>
              <div class="field">
                <label for="guestStatus">RSVP status</label>
                <select id="guestStatus" name="status">
                  <option>Pending</option>
                  <option>Accepted</option>
                  <option>Declined</option>
                </select>
              </div>
            </div>
            <button class="btn" type="submit">+ Add guest</button>
            <p id="guestFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>

        <section class="card" style="margin-top:20px">
          <div class="section-title" style="margin-top:0">
            <h2>Your invitations</h2>
            <span class="muted small">${guests.length} people</span>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>RSVP</th><th>Actions</th></tr></thead>
              <tbody>
                ${guests.map(guest => `
                  <tr>
                    <td>${escapeHTML(guest.name)}</td>
                    <td>
                      <select data-action="guest-status" data-id="${guest.id}"
                        aria-label="RSVP status for ${escapeHTML(guest.name)}">
                        ${["Pending", "Accepted", "Declined"].map(status =>
                          `<option ${guest.status === status ? "selected" : ""}>${status}</option>`
                        ).join("")}
                      </select>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-outline btn-small" data-action="edit-guest" data-id="${guest.id}">Edit</button>
                        <button class="btn btn-danger btn-small" data-action="delete-guest" data-id="${guest.id}">Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join("") || '<tr><td colspan="3" class="empty-state">Your guest list will appear here. Add your first guest above ♡</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function renderChecklist() {
    const completed = tasks.filter(task => task.done).length;
    const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

    return `
      <div class="container">
        ${pageHeading("ONE LITTLE STEP AT A TIME", "Your wedding checklist", "Every big day is made up of little things. Keep track of each one here.")}

        <section class="card">
          <div class="section-title" style="margin-top:0">
            <h2>Your progress</h2><strong>${percentage}%</strong>
          </div>
          <div class="progress-track"><div class="progress-fill wine" style="width:${percentage}%"></div></div>
          <p class="muted small">${completed} completed · ${tasks.length - completed} still to do</p>
        </section>

        <section class="card" style="margin-top:20px">
          <h2>Add a task</h2>
          <form id="taskForm">
            <div class="form-grid">
              <div class="field">
                <label for="taskText">What needs doing?</label>
                <input id="taskText" name="text" required maxlength="180" placeholder="e.g. Book the florist">
              </div>
              <div class="field">
                <label for="taskCategory">Category</label>
                <select id="taskCategory" name="category">
                  ${["Planning", "Venue", "Budget", "Guests", "Decor", "Outfits", "Catering", "Photography", "Other"].map(item => `<option>${item}</option>`).join("")}
                </select>
              </div>
            </div>
            <button class="btn" type="submit">+ Add task</button>
            <p id="taskFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>

        <section class="card" style="margin-top:20px">
          <div class="section-title" style="margin-top:0"><h2>All your tasks</h2></div>
          <div class="task-list">
            ${tasks.map(task => `
              <div class="task-item ${task.done ? "done" : ""}">
                <input type="checkbox" data-action="toggle-task" data-id="${task.id}"
                  ${task.done ? "checked" : ""}
                  aria-label="Mark ${escapeHTML(task.text)} complete">
                <span class="task-text">${escapeHTML(task.text)}</span>
                <span class="task-category">${escapeHTML(task.category)}</span>
                <button class="btn btn-danger btn-small" data-action="delete-task" data-id="${task.id}">×</button>
              </div>
            `).join("") || '<p class="empty-state">Your checklist is empty. Add your first task above.</p>'}
          </div>
        </section>
      </div>
    `;
  }

  function renderGallery() {
    return `
      <div class="container">
        ${pageHeading("A LITTLE INSPIRATION", "Moments worth dreaming about", "Discover ceremony settings, flowers, tablescapes and details to inspire your celebration.")}
        <div class="gallery-grid">
          ${gallery.map(imageCard).join("")}
        </div>
        <section class="card" style="margin-top:24px">
          <h2>Make it your own</h2>
          <p class="muted">Use these photographs as inspiration for your colour palette, venue styling, flowers and photography mood board.</p>
          ${link("vendors", "Explore wedding vendors →", "btn")}
        </section>
      </div>
    `;
  }

  function renderVendors() {
    const filters = ["All", "Venue", "Decor", "Photography", "Catering", "Outfits"];
    return `
      <div class="container">
        ${pageHeading("THE PEOPLE BEHIND THE MAGIC", "Wedding vendor directory", "Explore sample vendor listings and save the ideas you love. These are illustrative listings, not verified local businesses.")}
        <div class="filter-row">
          ${filters.map((filter, index) => `
            <button class="filter-chip ${index === 0 ? "active" : ""}"
              data-action="filter-vendors" data-filter="${filter}">${filter}</button>
          `).join("")}
        </div>
        <div class="grid grid-3" id="vendorGrid">
          ${vendors.map(vendorCard).join("")}
        </div>
        <p id="vendorFeedback" class="feedback" aria-live="polite"></p>
        <section class="card" style="margin-top:24px">
          <h2>Found your favourite?</h2>
          <p class="muted">Save vendors to keep track of your ideas. Use the enquiry button to start a contact draft.</p>
          ${link("contact", "Contact WedPlan →", "btn btn-outline")}
        </section>
      </div>
    `;
  }

  function renderCountdown() {
    const date = weddingDate();
    const days = daysUntilWedding();
    const value = load(STORAGE.weddingDate, "");
    let headline = "Your date, your magic ♡";
    let description = "Choose your wedding date and let the countdown begin.";

    if (days !== null) {
      if (days > 0) {
        headline = days + (days === 1 ? " day to forever ♡" : " days to forever ♡");
        description = "Every day brings you a little closer to your beautiful beginning.";
      } else if (days === 0) {
        headline = "It's your big day! ♡";
        description = "Take a breath, soak it all in, and celebrate your love.";
      } else {
        headline = "Your forever has begun ♡";
        description = "Your chosen wedding date has passed. Congratulations!";
      }
    }

    const today = new Date();
    const minDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    return `
      <div class="container">
        ${pageHeading("THE BIG DAY IS GETTING CLOSER", "A countdown to forever", "One special date. A thousand little moments to look forward to.")}
        <section class="countdown-panel">
          <span class="eyebrow">Until your next chapter</span>
          <div class="countdown-number">${headline}</div>
          <p class="countdown-date muted">${description}</p>
          ${date ? `<p>${date.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>` : ""}
          <form id="dateForm" style="max-width:430px;margin:25px auto 0;text-align:left">
            <div class="field">
              <label for="weddingDate">Choose your wedding date</label>
              <input id="weddingDate" name="date" type="date" required min="${minDate}" value="${escapeHTML(typeof value === "string" ? value : "")}">
            </div>
            <button class="btn btn-gold" type="submit">Save wedding date ♡</button>
            <p id="dateFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>
        <section class="grid grid-2" style="margin-top:22px">
          <article class="card"><h2>Before the big day</h2><p class="muted">Keep your checklist close, confirm your vendors and remember to leave yourself time to enjoy the journey.</p>${link("checklist", "Open checklist →", "btn btn-outline")}</article>
          <article class="card"><h2>Make the budget yours</h2><p class="muted">Track estimates and actual expenses so you can make decisions with confidence.</p>${link("budget", "Open budget →", "btn btn-outline")}</article>
        </section>
      </div>
    `;
  }

  function renderContact() {
    return `
      <div class="container">
        ${pageHeading("WE'D LOVE TO HEAR FROM YOU", "Let's talk wedding dreams", "Have a question, a lovely idea or a little feedback? Send a message below.")}
        <div class="contact-layout">
          <aside class="contact-aside">
            <span class="eyebrow">A note from us</span>
            <h2>Your story matters.</h2>
            <p>Every wedding is different. Use this form to jot down your questions or the ideas you'd like to explore.</p>
            <p>♡ Elegant details</p>
            <p>♡ Thoughtful planning</p>
            <p>♡ Your day, your way</p>
            <p class="small">This demo stores no messages on a server and does not send email.</p>
          </aside>
          <section class="card">
            <form id="contactForm">
              <div class="field">
                <label for="contactName">Your name</label>
                <input id="contactName" name="name" required maxlength="100" autocomplete="name" placeholder="Your full name">
              </div>
              <div class="field">
                <label for="contactEmail">Email address</label>
                <input id="contactEmail" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="field">
                <label for="contactSubject">What would you like to discuss?</label>
                <select id="contactSubject" name="subject" required>
                  <option value="">Choose a topic</option>
                  <option>Wedding planning</option>
                  <option>Vendor enquiry</option>
                  <option>Website feedback</option>
                  <option>Something else</option>
                </select>
              </div>
              <div class="field">
                <label for="contactMessage">Your message</label>
                <textarea id="contactMessage" name="message" required minlength="10" maxlength="3000" placeholder="Tell us what's on your mind..."></textarea>
              </div>
              <button class="btn" type="submit">Submit message ♡</button>
              <p id="contactFeedback" class="feedback" aria-live="polite"></p>
            </form>
          </section>
        </div>
      </div>
    `;
  }

  const pages = {
    dashboard: renderDashboard,
    budget: renderBudget,
    guests: renderGuests,
    checklist: renderChecklist,
    gallery: renderGallery,
    vendors: renderVendors,
    countdown: renderCountdown,
    contact: renderContact
  };

  function currentPage() {
    const page = new URLSearchParams(window.location.search).get("page");
    return Object.hasOwn(pages, page) ? page : "dashboard";
  }

  function render() {
    const page = currentPage();
    app.innerHTML = pages[page]();

    navigation.querySelectorAll("[data-page]").forEach(anchor => {
      const active = anchor.dataset.page === page;
      anchor.classList.toggle("active", active);
      if (active) anchor.setAttribute("aria-current", "page");
      else anchor.removeAttribute("aria-current");
    });

    navigation.classList.remove("open");
    const menuToggle = $("#menuToggle");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    if (menuToggle) menuToggle.textContent = "☰";
  }

  // Mobile navigation
  $("#menuToggle")?.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
    $("#menuToggle").setAttribute("aria-label",
      isOpen ? "Close navigation" : "Open navigation");
    $("#menuToggle").textContent = isOpen ? "×" : "☰";
  });

  // All page links use the same navigation handler.
  document.addEventListener("click", event => {
    const anchor = event.target.closest("a");
    if (!anchor || !anchor.matches("#navigation a, .brand, .footer-brand, #app a")) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    event.preventDefault();
    const target = new URL(href, window.location.href);
    history.pushState({}, "", target.pathname + target.search);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("popstate", render);

  // Form submissions
  document.addEventListener("submit", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    const data = new FormData(form);

    if (form.id === "budgetTotalForm") {
      budget.total = readMoney(data.get("total"));
      if (persistBudget()) {
        render();
        showToast("Overall budget saved ♡");
      }
    }

    if (form.id === "expenseForm") {
      const name = String(data.get("name") || "").trim();
      const planned = Number(data.get("planned"));
      const actual = Number(data.get("actual"));

      if (!name || !Number.isFinite(planned) || planned < 0 ||
          !Number.isFinite(actual) || actual < 0) {
        feedback("expenseFeedback", "Enter a name and valid non-negative amounts.", true);
        return;
      }

      budget.expenses.push({
        id: makeId("expense"),
        name: name.slice(0, 120),
        category: String(data.get("category")),
        planned,
        actual
      });

      if (persistBudget()) {
        render();
        showToast("Expense added successfully ♡");
      }
    }

    if (form.id === "guestForm") {
      const name = String(data.get("name") || "").trim();
      const status = String(data.get("status"));

      if (!name || !["Pending", "Accepted", "Declined"].includes(status)) {
        feedback("guestFeedback", "Please enter a guest name and valid RSVP status.", true);
        return;
      }

      guests.push({
        id: makeId("guest"),
        name: name.slice(0, 120),
        status
      });

      if (persistGuests()) {
        render();
        showToast("Guest added to your list ♡");
      }
    }

    if (form.id === "taskForm") {
      const text = String(data.get("text") || "").trim();
      if (!text) {
        feedback("taskFeedback", "Please enter a task description.", true);
        return;
      }

      tasks.push({
        id: makeId("task"),
        text: text.slice(0, 180),
        category: String(data.get("category") || "General"),
        done: false
      });

      if (persistTasks()) {
        render();
        showToast("New task added ♡");
      }
    }

    if (form.id === "dateForm") {
      const value = String(data.get("date") || "");
      const [year, month, day] = value.split("-").map(Number);
      const parsed = new Date(year, month - 1, day);
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      parsed.setHours(0, 0, 0, 0);

      if (!valid || parsed < today) {
        feedback("dateFeedback", "Please choose today or a future date.", true);
        return;
      }

      if (save(STORAGE.weddingDate, value)) {
        render();
        showToast("Wedding date saved. Let the countdown begin! ♡");
      }
    }

    if (form.id === "contactForm") {
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const subject = String(data.get("subject") || "");
      const message = String(data.get("message") || "").trim();

      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          !subject || message.length < 10) {
        feedback("contactFeedback", "Please check your name, email, topic and message (at least 10 characters).", true);
        return;
      }

      // Front-end demo only: no email or server submission takes place.
      form.reset();
      feedback("contactFeedback",
        "Thank you! Your message passed validation. This demo does not send or store messages on a server.");
      showToast("Thank you for your feedback ♡");
    }
  });

  // Click and change interactions
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "delete-expense") {
      budget.expenses = budget.expenses.filter(item => item.id !== id);
      if (persistBudget()) {
        render();
        showToast("Expense removed.");
      }
    }

    if (action === "delete-guest") {
      guests = guests.filter(guest => guest.id !== id);
      if (persistGuests()) {
        render();
        showToast("Guest removed.");
      }
    }

    if (action === "edit-guest") {
      const guest = guests.find(item => item.id === id);
      if (!guest) return;

      const name = window.prompt("Edit guest name:", guest.name);
      if (name === null) return;

      const cleaned = name.trim();
      if (!cleaned) {
        showToast("Guest name cannot be empty.");
        return;
      }

      guest.name = cleaned.slice(0, 120);
      if (persistGuests()) {
        render();
        showToast("Guest details updated ♡");
      }
    }

    if (action === "delete-task") {
      tasks = tasks.filter(task => task.id !== id);
      if (persistTasks()) {
        render();
        showToast("Task removed.");
      }
    }

    if (action === "favorite") {
      if (favourites.includes(id)) {
        favourites = favourites.filter(item => item !== id);
      } else {
        favourites.push(id);
      }

      if (persistFavourites()) {
        render();
        showToast(favourites.includes(id)
          ? "Vendor added to favourites ♡"
          : "Vendor removed from favourites.");
      }
    }

    if (action === "filter-vendors") {
      const filter = button.dataset.filter;
      navigation.querySelectorAll("[data-page]").forEach(() => {});

      document.querySelectorAll("[data-action='filter-vendors']").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.filter === filter);
      });

      document.querySelectorAll(".vendor-card").forEach(card => {
        card.hidden = filter !== "All" && card.dataset.category !== filter;
      });
    }

    if (action === "vendor-contact") {
      const vendor = vendors.find(item => item.id === id);
      if (!vendor) return;

      history.pushState({}, "", pageURL("contact"));
      render();

      const subject = $("#contactSubject");
      const message = $("#contactMessage");

      if (subject) subject.value = "Vendor enquiry";
      if (message) {
        message.value = "I would like to enquire about " + vendor.name + ".\n\nPlease share more information about your services and pricing.";
        message.focus();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Enquiry draft prepared. Add your details to continue.");
    }
  });

  document.addEventListener("change", event => {
    const element = event.target;
    const action = element.dataset.action;
    const id = element.dataset.id;

    if (action === "guest-status") {
      const guest = guests.find(item => item.id === id);
      if (!guest) return;

      if (!["Pending", "Accepted", "Declined"].includes(element.value)) return;
      guest.status = element.value;

      if (persistGuests()) {
        render();
        showToast("RSVP response updated ♡");
      }
    }

    if (action === "toggle-task") {
      const task = tasks.find(item => item.id === id);
      if (!task) return;

      task.done = element.checked;
      if (persistTasks()) {
        render();
        showToast(task.done ? "Task completed. Well done! ♡" : "Task marked as unfinished.");
      }
    }
  });

  $("#currentYear").textContent = String(new Date().getFullYear());
  render();
});