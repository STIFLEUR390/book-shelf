// main.js
// Application Collection de Livres OpenLibrary
// Recherche par défaut : 'harry poter'

const API_SEARCH = "https://openlibrary.org/search.json";
const API_COVER = "https://covers.openlibrary.org/b/";
const BOOKS_PER_PAGE = 20;
const BOOKS_PER_ROW = 4;

const searchInput = document.getElementById("search-input");
const filterType = document.getElementById("filter-type");
const filterYear = document.getElementById("filter-year");
const booksGrid = document.getElementById("books-grid");
const searchForm = document.getElementById("search-form");
const pagination = document.querySelector(".pagination");

let currentPage = 1;
let totalPages = 1;
let lastQuery = "";
let lastType = "";
let lastYear = "";

// Initialisation : recherche par défaut
window.addEventListener("DOMContentLoaded", () => {
  searchInput.value = "harry poter";
  fetchAndDisplayBooks("harry poter");
});

// Gestion du formulaire de recherche
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentPage = 1;
  fetchAndDisplayBooks(searchInput.value.trim());
});

// Gestion des filtres
filterType.addEventListener("change", () => {
  currentPage = 1;
  fetchAndDisplayBooks(searchInput.value.trim());
});
filterYear.addEventListener("change", () => {
  currentPage = 1;
  fetchAndDisplayBooks(searchInput.value.trim());
});

// Fonction principale pour récupérer et afficher les livres
async function fetchAndDisplayBooks(query) {
  booksGrid.innerHTML =
    '<div class="text-center py-5 w-100"><div class="spinner-border text-primary" role="status"></div></div>';
  lastQuery = query;
  lastType = filterType.value;
  lastYear = filterYear.value;

  // Construction de l'URL de recherche
  let url = `${API_SEARCH}?q=${encodeURIComponent(
    query
  )}&page=${currentPage}&limit=${BOOKS_PER_PAGE}`;
  if (lastType) url += `&subject=${encodeURIComponent(lastType)}`;
  if (lastYear) url += `&first_publish_year=${encodeURIComponent(lastYear)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur lors de la récupération des livres");
    const data = await res.json();
    displayBooks(data.docs);
    updatePagination(data.numFound);
    populateYears(data.docs);
  } catch (err) {
    booksGrid.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    pagination.innerHTML = "";
  }
}

// Affichage des livres dans la grille
function displayBooks(books) {
  if (!books || books.length === 0) {
    booksGrid.innerHTML =
      '<div class="alert alert-warning w-100">Aucun livre trouvé.</div>';
    return;
  }
  let html = "";
  books.slice(0, BOOKS_PER_PAGE).forEach((book, idx) => {
    const title = book.title || "Titre inconnu";
    const author =
      (book.author_name && book.author_name[0]) || "Auteur inconnu";
    const year = book.first_publish_year || "";
    // Recherche de la couverture
    let coverUrl = "https://placehold.co/200x250?text=Pas+de+couverture";
    if (book.cover_i) {
      coverUrl = `${API_COVER}id/${book.cover_i}-L.jpg`;
    } else if (book.isbn && book.isbn[0]) {
      coverUrl = `${API_COVER}isbn/${book.isbn[0]}-L.jpg`;
    }
    html += `
      <div class="col-md-3 mb-4">
        <div class="card book-card shadow-sm h-100">
          <img src="${coverUrl}" class="card-img-top" alt="Couverture du livre" onerror="this.onerror=null;this.src='https://placehold.co/200x250?text=Pas+de+couverture';">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${author}</p>
            <p class="card-text"><small class="text-muted">${year}</small></p>
          </div>
        </div>
      </div>
    `;
  });
  booksGrid.innerHTML = html;
}

// Mise à jour de la pagination
function updatePagination(totalBooks) {
  totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
  let html = "";
  html += `<li class="page-item${
    currentPage === 1 ? " disabled" : ""
  }"><a class="page-link" href="#" data-page="prev">Précédent</a></li>`;
  for (let i = 1; i <= totalPages && i <= 5; i++) {
    html += `<li class="page-item${
      currentPage === i ? " active" : ""
    }"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  if (totalPages > 5) {
    html += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
    html += `<li class="page-item${
      currentPage === totalPages ? " active" : ""
    }"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }
  html += `<li class="page-item${
    currentPage === totalPages ? " disabled" : ""
  }"><a class="page-link" href="#" data-page="next">Suivant</a></li>`;
  pagination.innerHTML = html;

  // Gestion des clics sur la pagination
  pagination.querySelectorAll("a.page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page === "prev" && currentPage > 1) {
        currentPage--;
        fetchAndDisplayBooks(lastQuery);
      } else if (page === "next" && currentPage < totalPages) {
        currentPage++;
        fetchAndDisplayBooks(lastQuery);
      } else if (!isNaN(page)) {
        currentPage = parseInt(page);
        fetchAndDisplayBooks(lastQuery);
      }
    });
  });
}

// Générer dynamiquement la liste des années disponibles
function populateYears(books) {
  const years = new Set();
  books.forEach((book) => {
    if (book.first_publish_year) years.add(book.first_publish_year);
  });
  const yearsArr = Array.from(years).sort((a, b) => b - a);
  filterYear.innerHTML =
    '<option value="">Année</option>' +
    yearsArr.map((y) => `<option value="${y}">${y}</option>`).join("");
  // Rétablir la sélection si déjà choisie
  if (lastYear) filterYear.value = lastYear;
}
