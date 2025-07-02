const { createApp } = Vue;

createApp({
  data() {
    return {
      search: "harry poter",
      filterType: "",
      types: [
        "Fiction",
        "Non-fiction",
        "Fantasy",
        "Science Fiction",
        "Romance",
        "Thriller",
        "Histoire",
        "Biographie",
        "Jeunesse",
        "Policier",
        "Aventure",
        "Classique",
        "Poésie",
        "Philosophie",
        "Essai",
        "Manga",
        "BD",
        "Théâtre",
        "Science",
        "Religion",
        "Art",
        "Voyage",
        "Cuisine",
        "Santé",
        "Sport",
        "Informatique",
        "Économie",
        "Politique",
        "Société",
        "Éducation",
        "Humour",
        "Erotique",
        "Autre",
      ],
      filterYear: "",
      years: Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i),
      books: [],
      page: 1,
      totalPages: 1,
      loading: false,
      error: "",
      BOOKS_PER_PAGE: 20,
      API_SEARCH: "https://openlibrary.org/search.json",
      API_COVER: "https://covers.openlibrary.org/b/",
    };
  },
  computed: {
    visiblePages() {
      // Affiche max 5 pages, puis ... et la dernière si besoin
      let pages = [];
      if (this.totalPages <= 5) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i);
      } else {
        if (this.page <= 3) {
          pages = [1, 2, 3, 4, 5];
        } else if (this.page >= this.totalPages - 2) {
          pages = [
            this.totalPages - 4,
            this.totalPages - 3,
            this.totalPages - 2,
            this.totalPages - 1,
            this.totalPages,
          ];
        } else {
          pages = [
            this.page - 2,
            this.page - 1,
            this.page,
            this.page + 1,
            this.page + 2,
          ];
        }
      }
      return pages;
    },
  },
  methods: {
    async fetchBooks() {
      this.loading = true;
      this.error = "";
      this.books = [];
      let url = `${this.API_SEARCH}?q=${encodeURIComponent(this.search)}&page=${
        this.page
      }&limit=${this.BOOKS_PER_PAGE}`;
      if (this.filterType)
        url += `&subject=${encodeURIComponent(this.filterType)}`;
      if (this.filterYear)
        url += `&first_publish_year=${encodeURIComponent(this.filterYear)}`;
      try {
        const res = await fetch(url);
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des livres");
        const data = await res.json();
        this.books = data.docs;
        this.totalPages = Math.ceil(data.numFound / this.BOOKS_PER_PAGE);
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    searchBooks() {
      this.page = 1;
      this.fetchBooks();
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages || p === this.page) return;
      this.page = p;
      this.fetchBooks();
    },
    getCoverUrl(book) {
      if (book.cover_i) {
        return `${this.API_COVER}id/${book.cover_i}-L.jpg`;
      } else if (book.isbn && book.isbn[0]) {
        return `${this.API_COVER}isbn/${book.isbn[0]}-L.jpg`;
      }
      return "https://placehold.co/200x250?text=Pas+de+couverture";
    },
    onImgError(e) {
      e.target.src = "https://placehold.co/200x250?text=Pas+de+couverture";
    },
  },
  watch: {
    filterType() {
      this.page = 1;
      this.fetchBooks();
    },
    filterYear() {
      this.page = 1;
      this.fetchBooks();
    },
  },
  mounted() {
    this.fetchBooks();
  },
}).mount("#app");
