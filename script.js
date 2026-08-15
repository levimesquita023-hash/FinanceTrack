const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const categorySummary = document.getElementById("categorySummary");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");

const themeButton = document.getElementById("themeButton");

let transactions =
  JSON.parse(localStorage.getItem("financetrack_transactions")) || [];

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function saveTransactions() {
  localStorage.setItem(
    "financetrack_transactions",
    JSON.stringify(transactions)
  );
}

function generateId() {
  return Date.now();
}

function addTransaction(event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!description || amount <= 0) {
    alert("Preencha os dados corretamente.");
    return;
  }

  const transaction = {
    id: generateId(),
    description,
    amount,
    type,
    category,
    createdAt: new Date().toISOString()
  };

  transactions.unshift(transaction);

  saveTransactions();
  updateInterface();

  form.reset();

  typeInput.value = "income";
  categoryInput.value = "Salário";

  descriptionInput.focus();
}

function deleteTransaction(id) {
  transactions = transactions.filter(
    transaction => transaction.id !== id
  );

  saveTransactions();
  updateInterface();
}

function calculateSummary() {
  const income = transactions
    .filter(transaction => transaction.type === "income")
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

  const expense = transactions
    .filter(transaction => transaction.type === "expense")
    .reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

  const balance = income - expense;

  incomeElement.textContent = formatCurrency(income);
  expenseElement.textContent = formatCurrency(expense);
  balanceElement.textContent = formatCurrency(balance);
}

function renderTransactions() {
  const searchTerm = searchInput.value
    .trim()
    .toLowerCase();

  const selectedType = filterType.value;

  const filteredTransactions = transactions.filter(
    transaction => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm) ||
        transaction.category
          .toLowerCase()
          .includes(searchTerm);

      const matchesType =
        selectedType === "all" ||
        transaction.type === selectedType;

      return matchesSearch && matchesType;
    }
  );

  transactionList.innerHTML = "";

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `
      <div class="empty-state">
        Nenhuma transação encontrada.
      </div>
    `;

    return;
  }

  filteredTransactions.forEach(transaction => {
    const item = document.createElement("div");

    item.classList.add("transaction-item");

    const typeLabel =
      transaction.type === "income"
        ? "Receita"
        : "Despesa";

    const sign =
      transaction.type === "income"
        ? "+"
        : "-";

    item.innerHTML = `
      <div class="transaction-description">
        ${escapeHTML(transaction.description)}
      </div>

      <div class="transaction-category">
        ${escapeHTML(transaction.category)}
      </div>

      <div>
        <span
          class="transaction-type ${
            transaction.type === "income"
              ? "type-income"
              : "type-expense"
          }"
        >
          ${typeLabel}
        </span>
      </div>

      <div
        class="${
          transaction.type === "income"
            ? "value-income"
            : "value-expense"
        }"
      >
        ${sign} ${formatCurrency(transaction.amount)}
      </div>

      <div>
        <button
          class="delete-button"
          onclick="deleteTransaction(${transaction.id})"
          title="Excluir transação"
        >
          🗑️
        </button>
      </div>
    `;

    transactionList.appendChild(item);
  });
}

function renderCategorySummary() {
  const expenses = transactions.filter(
    transaction => transaction.type === "expense"
  );

  categorySummary.innerHTML = "";

  if (expenses.length === 0) {
    categorySummary.innerHTML = `
      <div class="empty-state">
        Nenhuma despesa registrada.
      </div>
    `;

    return;
  }

  const categories = {};

  expenses.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = 0;
    }

    categories[transaction.category] +=
      transaction.amount;
  });

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(
    ([category, total]) => {
      const item = document.createElement("div");

      item.classList.add("category-item");

      item.innerHTML = `
        <span class="category-name">
          ${escapeHTML(category)}
        </span>

        <span class="category-value">
          ${formatCurrency(total)}
        </span>
      `;

      categorySummary.appendChild(item);
    }
  );
}

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

function updateInterface() {
  calculateSummary();
  renderTransactions();
  renderCategorySummary();
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  const darkModeActive =
    document.body.classList.contains("dark");

  themeButton.textContent =
    darkModeActive ? "☀️" : "🌙";

  localStorage.setItem(
    "financetrack_theme",
    darkModeActive ? "dark" : "light"
  );
}

function loadTheme() {
  const savedTheme =
    localStorage.getItem("financetrack_theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeButton.textContent = "☀️";
  }
}

form.addEventListener(
  "submit",
  addTransaction
);

searchInput.addEventListener(
  "input",
  renderTransactions
);

filterType.addEventListener(
  "change",
  renderTransactions
);

themeButton.addEventListener(
  "click",
  toggleTheme
);

loadTheme();
updateInterface();