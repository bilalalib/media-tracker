import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import MediaCard from "./MediaCard";
import { supabase } from "../supabase";

export default function MyList() {
  // Route tab: manga, movies, shows, or undefined
  const { tab } = useParams();
  const navigate = useNavigate();

  // Default to unified collection view
  const activeTab = tab || "all";

  const [savedMedia, setSavedMedia] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Default");
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchMyList(activeTab);
      } else {
        setIsLoading(false);
      }
    });
    // Re-fetch when tab route changes
  }, [activeTab]);

  const fetchMyList = async (currentTab) => {
    setIsLoading(true);
    setSavedMedia([]);

    // Fetch one table and normalize shape for shared UI
    const fetchTable = async (tableName, itemCategory) => {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
      }
      return data.map((item) => ({
        id: itemCategory === "manga" ? item.id : item.tmdb_id,
        title: item.title,
        imageUrl: item.imageUrl || item.image_url,
        trackingStatus:
          item.trackingStatus ||
          item.tracking_status ||
          (itemCategory === "manga" ? "Reading" : "Watching"),
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

    if (currentTab === "all") {
      // Load all categories in parallel
      const [mangas, movies, shows] = await Promise.all([
        fetchTable("tracked_manga", "manga"),
        fetchTable("tracked_movies", "movie"),
        fetchTable("tracked_shows", "show"),
      ]);
      // Merge into one collection
      setSavedMedia([...mangas, ...movies, ...shows]);
    } else {
      // Load only the selected category
      let tableName = "tracked_manga";
      let itemCategory = "manga";
      if (currentTab === "movies") {
        tableName = "tracked_movies";
        itemCategory = "movie";
      }
      if (currentTab === "shows") {
        tableName = "tracked_shows";
        itemCategory = "show";
      }

      const data = await fetchTable(tableName, itemCategory);
      setSavedMedia(data);
    }

    setIsLoading(false);
  };

  const handleTabSwitch = (newTab) => {
    setActiveFilter("All");
    // Keep tab in URL so views are shareable/bookmarkable
    if (newTab === "all") navigate("/mylist");
    else navigate(`/mylist/${newTab}`);
  };

  const handleRemoveFromList = async (idToRemove) => {
    // Find source table from item category
    const itemToDelete = savedMedia.find(
      (i) => String(i.id) === String(idToRemove),
    );
    if (!itemToDelete) return;

    // Optimistic UI update
    setSavedMedia((prev) =>
      prev.filter((item) => String(item.id) !== String(idToRemove)),
    );

    // Delete from mapped table
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

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(idColumn, idToRemove);
    if (error) console.error("Error deleting:", error);
  };

  const handleUpdate = async (idToUpdate, field, newValue) => {
    const itemToUpdate = savedMedia.find(
      (i) => String(i.id) === String(idToUpdate),
    );
    if (!itemToUpdate) return;

    setSavedMedia((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(idToUpdate))
          return { ...item, [field]: newValue };
        return item;
      }),
    );

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
    if (field === "trackingStatus" && itemToUpdate.category !== "manga")
      dbField = "tracking_status";

    const { error } = await supabase
      .from(tableName)
      .update({ [dbField]: newValue })
      .eq(idColumn, idToUpdate);
    if (error) console.error("Error updating:", error);
  };

  // Filter options vary in "all" vs category-specific views
  const filterOptions =
    activeTab === "all"
      ? ["All", "In Progress", "Completed", "Planned", "Dropped"]
      : [
          "All",
          activeTab === "manga" ? "Reading" : "Watching",
          "Completed",
          activeTab === "manga" ? "Plan to Read" : "Plan to Watch",
          "Dropped",
        ];

  let processedMedia = savedMedia.filter((item) => {
    if (activeFilter === "All") return true;

    // Map unified labels to underlying tracking statuses
    if (activeTab === "all") {
      if (activeFilter === "In Progress")
        return (
          item.trackingStatus === "Reading" ||
          item.trackingStatus === "Watching"
        );
      if (activeFilter === "Planned")
        return (
          item.trackingStatus === "Plan to Read" ||
          item.trackingStatus === "Plan to Watch"
        );
      if (activeFilter === "Completed")
        return item.trackingStatus === "Completed";
      if (activeFilter === "Dropped")
        return (
          item.trackingStatus === "Dropped" || item.trackingStatus === "On Hold"
        );
    }

    return item.trackingStatus === activeFilter;
  });

  // Optional rating sort
  if (sortBy === "Highest Rated") {
    processedMedia.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "Lowest Rated") {
    processedMedia.sort((a, b) => (a.rating || 0) - (b.rating || 0));
  }

  if (!isLoading && !session) {
    return (
      <main className="max-w-xl mx-auto px-6 mt-32 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          You are not logged in
        </h2>
        <p className="text-zinc-400 mb-8">
          Please sign in or create an account to view your collection.
        </p>
        <Link
          to="/account"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
        >
          Go to Account Page
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 mt-8 mb-12">
      {/* Top-level list tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10">
        <button
          onClick={() => handleTabSwitch("all")}
          className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-colors text-sm sm:text-base ${activeTab === "all" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
        >
          All Media
        </button>
        <button
          onClick={() => handleTabSwitch("manga")}
          className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-colors text-sm sm:text-base ${activeTab === "manga" ? "bg-red-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
        >
          Manga
        </button>
        <button
          onClick={() => handleTabSwitch("movies")}
          className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-colors text-sm sm:text-base ${activeTab === "movies" ? "bg-cyan-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
        >
          Movies
        </button>
        <button
          onClick={() => handleTabSwitch("shows")}
          className={`px-4 sm:px-6 py-2 rounded-full font-bold transition-colors text-sm sm:text-base ${activeTab === "shows" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}
        >
          TV Shows
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2
          className={`text-xl font-semibold border-l-4 pl-3 ${activeTab === "all" ? "border-zinc-100" : activeTab === "manga" ? "border-red-600" : activeTab === "movies" ? "border-cyan-600" : "border-purple-600"}`}
        >
          My Tracked{" "}
          {activeTab === "all"
            ? "Collection"
            : activeTab === "manga"
              ? "Manga"
              : activeTab === "movies"
                ? "Movies"
                : "Shows"}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition duration-200 border ${
                  activeFilter === option
                    ? activeTab === "all"
                      ? "bg-zinc-100 border-zinc-100 text-zinc-900"
                      : activeTab === "manga"
                        ? "bg-red-600 border-red-600 text-white"
                        : activeTab === "movies"
                          ? "bg-cyan-600 border-cyan-600 text-white"
                          : "bg-purple-600 border-purple-600 text-white"
                    : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-zinc-500"
            >
              <option value="Default">Sort: Default</option>
              <option value="Highest Rated">Sort: Highest Rated</option>
              <option value="Lowest Rated">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 mt-20 animate-pulse text-xl">
          Loading your collection...
        </div>
      ) : processedMedia.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">Your list is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {processedMedia.map((item) => (
            <MediaCard
              // Prefix key with category to avoid cross-type ID collisions
              key={`${item.category}-${item.id}`}
              id={item.id}
              title={item.title}
              type={item.type}
              imageUrl={item.imageUrl}
              trackingStatus={item.trackingStatus}
              rating={item.rating}
              notes={item.notes}
              category={item.category}
              onRemove={handleRemoveFromList}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </main>
  );
}
