import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function DiscoverCard({
  id,
  title,
  imageUrl,
  category = "manga",
}) {
  // UI state for whether this item is already saved
  const [isTracked, setIsTracked] = useState(false);

  // Resolve table/ID mapping by content type
  const getTableInfo = () => {
    if (category === "movie")
      return { name: "tracked_movies", idColumn: "tmdb_id" };
    if (category === "show")
      return { name: "tracked_shows", idColumn: "tmdb_id" };
    return { name: "tracked_manga", idColumn: "id" };
  };

  useEffect(() => {
    // On card load/change, check if item already exists in DB
    const checkTracked = async () => {
      const table = getTableInfo();

      const { data } = await supabase
        .from(table.name)
        .select(table.idColumn)
        .eq(table.idColumn, id);
      if (data && data.length > 0) {
        setIsTracked(true);
      }
    };
    checkTracked();
  }, [id, category]);

  const handleSave = async () => {
    try {
      // Optimistic UI: show tracked state immediately
      setIsTracked(true);
      const table = getTableInfo();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let payload;

      // Manga schema differs from movie/show schema
      if (category === "manga") {
        payload = {
          id,
          title,
          type: "Manga",
          status: "Unknown",
          imageUrl,
          trackingStatus: "Reading",
          rating: 0,
          notes: "",
        };
      } else {
        payload = {
          user_id: user?.id,
          tmdb_id: id,
          title: title,
          image_url: imageUrl,
        };
      }

      const { error } = await supabase.from(table.name).insert([payload]);

      if (error) {
        console.error("Supabase Save Error:", error);
        setIsTracked(false);
        alert("Failed to save to cloud.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-2 group w-32 sm:w-40 md:w-48 flex-shrink-0 cursor-pointer snap-start transition-transform duration-300 hover:scale-105">
      <div className="relative h-48 sm:h-60 md:h-72 rounded-lg overflow-hidden shadow-md bg-transparent">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition duration-300 group-hover:brightness-50"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs text-center p-2">
            No Image
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-100 bg-black/30 md:bg-transparent md:opacity-0 group-hover:opacity-100 md:group-hover:bg-black/40 transition-all duration-300 pointer-events-none">
          {isTracked ? (
            <span className="bg-zinc-900/90 text-cyan-400 px-3 py-1.5 rounded text-xs sm:text-sm font-semibold border border-zinc-700 pointer-events-auto shadow-lg">
              ✓ Tracked
            </span>
          ) : (
            <button
              onClick={handleSave}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-xs sm:text-sm font-bold shadow-lg pointer-events-auto transform hover:scale-105 transition"
            >
              + Track
            </button>
          )}
        </div>
      </div>
      <h3
        className="text-xs sm:text-sm font-medium text-zinc-400 truncate transition group-hover:text-zinc-100"
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}
