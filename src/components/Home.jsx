import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MediaCard from "./MediaCard";
import { supabase } from "../supabase";

export default function Home() {
  // Auth + page loading state
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard datasets
  const [stats, setStats] = useState({
    manga: 0,
    movies: 0,
    shows: 0,
    books: 0,
    total: 0,
  });
  const [inProgress, setInProgress] = useState([]);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [allMedia, setAllMedia] = useState([]); // Source list used by update/remove handlers

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchDashboardData();
      else setIsLoading(false);
    });
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    // Fetch one table and normalize shape for shared card UI
    const fetchTable = async (tableName, itemCategory) => {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) return [];
      return data.map((item) => ({
        id:
          itemCategory === "manga"
            ? item.id
            : itemCategory === "book"
              ? item.book_id
              : item.tmdb_id,
        title: item.title,
        imageUrl: item.imageUrl || item.image_url,
        trackingStatus:
          item.trackingStatus ||
          item.tracking_status ||
          (itemCategory === "manga" || itemCategory === "book"
            ? "Reading"
            : "Watching"),
        rating: item.rating || 0,
        notes: item.notes || "",
        type:
          item.type ||
          (itemCategory === "movie"
            ? "Movie"
            : itemCategory === "show"
              ? "TV Show"
              : "Manga"),
        category: itemCategory,
      }));
    };

    const [mangas, movies, shows, books] = await Promise.all([
      fetchTable("tracked_manga", "manga"),
      fetchTable("tracked_movies", "movie"),
      fetchTable("tracked_shows", "show"),
      fetchTable("tracked_books", "book"),
    ]);

    const combined = [...mangas, ...movies, ...shows, ...books];
    setAllMedia(combined);

    // Aggregate quick stats for dashboard cards
    setStats({
      manga: mangas.length,
      movies: movies.length,
      shows: shows.length,
      books: books.length,
      total: combined.length,
    });

    // "Jump Back In" includes active progress items
    setInProgress(
      combined.filter(
        (item) =>
          item.trackingStatus === "Reading" ||
          item.trackingStatus === "Watching",
      ),
    );

    // "Hall of Fame" highlights top-rated entries
    setHallOfFame(
      combined
        .filter((item) => item.rating >= 9)
        .sort((a, b) => b.rating - a.rating),
    );

    setIsLoading(false);
  };

  // Keep dashboard cards interactive
  const handleRemove = async (idToRemove) => {
    const itemToDelete = allMedia.find(
      (i) => String(i.id) === String(idToRemove),
    );
    if (!itemToDelete) return;

    // Optimistic UI update
    setInProgress((prev) =>
      prev.filter((item) => String(item.id) !== String(idToRemove)),
    );
    setHallOfFame((prev) =>
      prev.filter((item) => String(item.id) !== String(idToRemove)),
    );
    setAllMedia((prev) =>
      prev.filter((item) => String(item.id) !== String(idToRemove)),
    );

    let tableName = "tracked_manga";
    let idColumn = "id";
    if (itemToDelete.category === "movie") {
      tableName = "tracked_movies";
      idColumn = "tmdb_id";
    }
    if (itemToDelete.category === "show") {
      tableName = "tracked_shows";
      idColumn = "tmdb_id";
    }
    if (itemToDelete.category === "book") {
      tableName = "tracked_books";
      idColumn = "book_id";
    }

    await supabase.from(tableName).delete().eq(idColumn, idToRemove);
    fetchDashboardData(); // Refresh stats + derived rows
  };

  const handleUpdate = async (idToUpdate, field, newValue) => {
    const itemToUpdate = allMedia.find(
      (i) => String(i.id) === String(idToUpdate),
    );
    if (!itemToUpdate) return;

    let tableName = "tracked_manga";
    let idColumn = "id";
    let dbField = field;

    if (itemToUpdate.category === "movie") {
      tableName = "tracked_movies";
      idColumn = "tmdb_id";
    }
    if (itemToUpdate.category === "show") {
      tableName = "tracked_shows";
      idColumn = "tmdb_id";
    }
    if (itemToUpdate.category === "book") {
      tableName = "tracked_books";
      idColumn = "book_id";
    }
    if (field === "trackingStatus" && itemToUpdate.category !== "manga")
      dbField = "tracking_status";

    await supabase
      .from(tableName)
      .update({ [dbField]: newValue })
      .eq(idColumn, idToUpdate);
    fetchDashboardData(); // Refresh derived sections after edits
  };

  if (!isLoading && !session) {
    return (
      <main className="max-w-xl mx-auto px-6 mt-32 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Welcome to Media Tracker
        </h2>
        <p className="text-zinc-400 mb-8 text-lg">
          Your ultimate hub for Manga, Movies, TV Shows, and Books.
        </p>
        <Link
          to="/account"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
        >
          Sign In to Start Tracking
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 mt-8 mb-12">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-500"></div>
        </div>
      ) : (
        <>
          {/* Analytics Stat Cards */}
          <div className="flex flex-wrap gap-4 mb-12">
            {/* Total Tracked always shows */}
            <div className="flex-1 min-w-[140px] bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
              <span className="text-zinc-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2 text-center">
                Total Tracked
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {stats.total}
              </span>
            </div>

            {/* Conditionally render the rest only if they are > 0! */}
            {stats.manga > 0 && (
              <div className="flex-1 min-w-[140px] bg-zinc-900 border border-red-900/50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center hover:border-red-600 transition-colors">
                <span className="text-red-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                  Manga
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {stats.manga}
                </span>
              </div>
            )}

            {stats.movies > 0 && (
              <div className="flex-1 min-w-[140px] bg-zinc-900 border border-cyan-900/50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center hover:border-cyan-600 transition-colors">
                <span className="text-cyan-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                  Movies
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {stats.movies}
                </span>
              </div>
            )}

            {stats.shows > 0 && (
              <div className="flex-1 min-w-[140px] bg-zinc-900 border border-purple-900/50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center hover:border-purple-600 transition-colors">
                <span className="text-purple-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                  Shows
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {stats.shows}
                </span>
              </div>
            )}

            {stats.books > 0 && (
              <div className="flex-1 min-w-[140px] bg-zinc-900 border border-emerald-900/50 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center hover:border-emerald-600 transition-colors">
                <span className="text-emerald-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                  Books
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {stats.books}
                </span>
              </div>
            )}
          </div>

          {/* Jump Back In row */}
          {inProgress.length > 0 && (
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide uppercase border-l-4 border-zinc-100 pl-3">
                  Jump Back In
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {inProgress.map((item) => (
                  <div
                    key={`in-progress-${item.category}-${item.id}`}
                    className="w-44 sm:w-56 flex-shrink-0"
                  >
                    <MediaCard
                      {...item}
                      onRemove={handleRemove}
                      onUpdate={handleUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hall of Fame row */}
          {hallOfFame.length > 0 && (
            <div className="mb-12">
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-500 tracking-wide uppercase border-l-4 border-yellow-500 pl-3">
                  Hall of Fame
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {hallOfFame.map((item) => (
                  <div
                    key={`hof-${item.category}-${item.id}`}
                    className="w-44 sm:w-56 flex-shrink-0"
                  >
                    <MediaCard
                      {...item}
                      onRemove={handleRemove}
                      onUpdate={handleUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
