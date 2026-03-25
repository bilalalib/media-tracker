import { useState } from "react";

export default function MediaCard({
  id,
  title,
  type,
  imageUrl,
  trackingStatus,
  rating,
  notes,
  category, // 'manga', 'book', 'movie', or 'show'
  onRemove,
  onUpdate,
}) {
  // Local UI state for notes accordion
  const [showNotes, setShowNotes] = useState(false);

  // Category-driven theme color
  const themeColor =
    category === "manga"
      ? "red"
      : category === "book"
        ? "emerald"
        : category === "movie"
          ? "cyan"
          : "purple";

  // Adjust action labels for manga vs screen media
  const activeVerb =
    category === "manga" || category === "book" ? "Reading" : "Watching";
  const planVerb =
    category === "manga" || category === "book"
      ? "Plan to Read"
      : "Plan to Watch";

  return (
    <div
      className={`bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-${themeColor}-500/50 transition group flex flex-col shadow-md h-full`}
    >
      <div className="h-56 sm:h-64 bg-zinc-800 relative flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer" // Helps avoid blocked image referrers on some sources
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold text-sm">
            No Cover
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="font-bold text-sm sm:text-base truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
            {type}
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-end gap-2">
          <select
            value={trackingStatus || activeVerb}
            onChange={(e) => onUpdate(id, "trackingStatus", e.target.value)}
            className={`w-full bg-zinc-800 text-xs sm:text-sm text-zinc-300 border border-zinc-700 rounded px-2 py-1.5 focus:outline-none focus:border-${themeColor}-500`}
          >
            <option value={activeVerb}>{activeVerb}</option>
            <option value={planVerb}>{planVerb}</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>

          <select
            value={rating || 0}
            onChange={(e) => onUpdate(id, "rating", Number(e.target.value))}
            className={`w-full bg-zinc-800 text-xs sm:text-sm text-zinc-300 border border-zinc-700 rounded px-2 py-1.5 focus:outline-none focus:border-${themeColor}-500`}
          >
            <option value={0}>Unrated</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                ⭐ {num} / 10
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-xs py-1.5 rounded border border-zinc-700 transition flex justify-between px-3"
          >
            <span>📝 {notes ? "Edit Notes" : "Add Notes"}</span>
            <span>{showNotes ? "▲" : "▼"}</span>
          </button>

          {showNotes && (
            <textarea
              value={notes || ""}
              onChange={(e) => onUpdate(id, "notes", e.target.value)}
              placeholder="Your thoughts..."
              className={`w-full bg-zinc-950 text-xs text-zinc-300 border border-zinc-700 rounded px-2 py-2 h-20 resize-none focus:outline-none focus:border-${themeColor}-500 mt-1`}
              autoFocus
            />
          )}

          <button
            onClick={() => onRemove(id)}
            className="w-full bg-zinc-800 hover:bg-red-600 text-white font-semibold py-1.5 rounded transition text-xs mt-1"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
