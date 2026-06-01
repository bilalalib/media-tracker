# 🎬 My Media Tracker

> A comprehensive, unified dashboard designed to streamline the discovery, search, and management of multimedia content across Movies, Television Series, Manga, and Literature. 

**Live Demo:** https://media-tracker-rust.vercel.app

<img width="1499" height="929" alt="dashboard" src="https://github.com/user-attachments/assets/3248583a-5f77-4f90-b966-b267fcf0abe7" />

## 📌 Project Overview
My Media Tracker aggregates diverse entertainment databases into a single, highly responsive user interface. Engineered with performance and UX as primary objectives, the application features dynamic discovery rows, infinitely paginated grid views, and real-time state synchronization. By abstracting the complexities of multiple third-party APIs, it delivers a seamless, unified tracking experience.

---

## ✨ Core Features & Architecture

### 🌍 Universal Discovery Engine
The application utilizes tailored data-fetching strategies optimized for each specific medium:
* **🎬 Cinematic & Television (TMDB API):** Delivers dynamically generated, horizontally scrollable interfaces for trending content, critical acclaim, and precise genre categorization.
* **📖 Literature (Hybrid Engine):** Combines the **New York Times Bestseller API** for high-resolution asset retrieval with highly customized **Google Books API** queries to curate classic and fantasy literature. Implements a proprietary "One-Book-Per-Author" algorithmic filter to ensure diverse content presentation and eliminate redundant search results (e.g., study guides).
* **🏴‍☠️ Manga & Manhwa (Jikan API v4):** Features a custom asynchronous, sequential loading protocol with automated retry logic. This architecture effectively mitigates strict HTTP 429 rate-limiting constraints, ensuring uninterrupted data retrieval and UI stability.

### ↺ Dynamic Pagination Engine
The "View All" routing opens a dedicated, responsive grid layout powered by an intelligent pagination engine that adapts its logic based on the active data source:
* Parses and respects TMDB page limit boundaries.
* Calculates and dynamically applies Google Books index offsets.
* Actively filters duplicate entity IDs during sequential loads and intelligently disables pagination when the endpoint dataset is exhausted.

### ⚡ Real-Time State Synchronization
Built leveraging custom JavaScript Event Listeners (syncMediaState), the application ensures immediate state propagation. Modifying the tracking status of an entity in one component instantly updates all matching DOM nodes across the application architecture without requiring component re-renders or additional network requests.

### 🗄️ Data Export & Portability
Users maintain full ownership of their tracking databases via a robust export engine:
* **Visual PDF:** Generates structured, print-ready documents utilizing `jsPDF`.
* **Data CSV:** Spreadsheet-ready exports mapped from PostgreSQL tables.
* **Raw JSON:** Unmodified data structures for developer backups and portability.

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite), React Router v6, Tailwind CSS
* **Backend & Authentication:** Supabase (PostgreSQL, Row Level Security)
* **External APIs:** TMDB API, Jikan v4 API, NYT Books API, Google Books API

---

## 🚀 Installation & Setup

### 1. Clone the repository
    git clone https://github.com/bilalalib/media-tracker.git
    cd media-tracker

### 2. Install dependencies
    npm install

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and define the following environment variables:

#### Supabase Configuration
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

#### External APIs
    VITE_TMDB_READ_TOKEN=your_tmdb_read_access_token
    VITE_NYT_API_KEY=your_new_york_times_api_key
    VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key

*(Note: The Jikan API utilized in this project does not currently require authentication keys.)*

### 4. Initialize the development server
    npm run dev

---

## 💡 Future Roadmap
- [ ] Implement user-to-user sharing protocols (Public profiles via Supabase RLS).
- [ ] Develop advanced client-side filtering (Sort tracked entities by user rating or timestamp).
- [ ] Refine mobile viewport breakpoints for the primary dashboard components.

## 🤝 Contributing
Contributions, issue reports, and feature requests are welcome. Please visit the issues page at https://github.com/bilalalib/media-tracker/issues to report bugs or propose enhancements.

## 📄 License
This project is distributed under the MIT License.
