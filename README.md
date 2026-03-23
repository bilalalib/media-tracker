# Media Tracker

A full-stack web application designed to discover and track manga and manhwa. Built with a modern, responsive UI, secure user authentication, and a real-time cloud database.

**Live Demo:** https://media-tracker-rust.vercel.app

## Features

* **Discover Dashboard:** Browse dynamically generated rows of Trending Now, All-Time Popular, and a top 100 list.
* **Search & Add:** Instantly search the global database and add series to your personal list with a single click.
* **Cloud Synchronization:** Your tracked media is saved to a PostgreSQL cloud database, accessible from any device.
* **Secure Authentication:** User sign-ups and logins handled via secure, encrypted tokens with Row Level Security (RLS) ensuring absolute data privacy.
* **Responsive Design:** Fully optimized for both desktop and mobile viewing with a premium dark-mode aesthetic.

## Tech Stack

* **Frontend:** React (Vite), JavaScript, Tailwind CSS, React Router
* **Backend / Database:** Supabase (PostgreSQL, Authentication)
* **External API:** Jikan API (Unofficial MyAnimeList API)
* **Deployment:** Vercel

## Future Roadmap

While currently focused on manga and manhwa, the architecture is designed to scale into a universal media tracker. Future updates will include integrations for tracking movies and TV series using the TMDB API.

## Running Locally

To run this project on your local machine:

1. Clone the repository:

   git clone https://github.com/bilalalib/media-tracker.git

2. Install dependencies:
    
    npm install

3. Create a .env.local file in the root directory and add your Supabase keys:

    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Start the development server:

    npm run dev