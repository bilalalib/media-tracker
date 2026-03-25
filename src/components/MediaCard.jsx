import { useState } from "react";

export default function MediaCard({
  id,
  title,
  type,
  imageUrl,
  trackingStatus,
  rating,
  notes,
  category,
  onRemove,
  onUpdate,
}) {
  const [showNotes, setShowNotes] = useState(false);

  const themeColor =
    category === "manga"
      ? "red"
      : category === "movie"
        ? "cyan"
        : category === "show"
          ? "purple"
          : "emerald";
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
      {/* SHRINK 1: Reduced mobile height from h-56 to h-40 */}
      <div className="aspect-[2/3] w-full bg-zinc-800 relative flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold text-xs sm:text-sm">
            No Cover
          </div>
        )}
      </div>

      {/* SHRINK 2: Tightened mobile padding from p-3 to p-2 */}
      <div className="p-2 sm:p-4 flex flex-col flex-grow">
        <div className="mb-2 sm:mb-3">
          {/* SHRINK 3: Scaled down mobile text sizes */}
          <h3
            className="font-bold text-xs sm:text-base line-clamp-2 leading-tight"
            title={title}
          >
            {title}
          </h3>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 uppercase tracking-wider font-semibold">
            {type}
          </p>
        </div>

        {/* SHRINK 4: Reduced the gap between buttons on mobile */}
        <div className="flex-grow flex flex-col justify-end gap-1.5 sm:gap-2">
          <select
            value={trackingStatus || activeVerb}
            onChange={(e) => onUpdate(id, "trackingStatus", e.target.value)}
            // SHRINK 5: Made inputs drastically smaller on mobile
            className={`w-full bg-zinc-800 text-[10px] sm:text-sm text-zinc-300 border border-zinc-700 rounded px-1 py-1 sm:px-2 sm:py-1.5 focus:outline-none focus:border-${themeColor}-500`}
          >
            <option value={activeVerb}>{activeVerb}</option>
            <option value={planVerb}>{planVerb}</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>

          <select
            value={rating || 0}
            onChange={(e) => onUpdate(id, "rating", Number(e.target.value))}
            className={`w-full bg-zinc-800 text-[10px] sm:text-sm text-zinc-300 border border-zinc-700 rounded px-1 py-1 sm:px-2 sm:py-1.5 focus:outline-none focus:border-${themeColor}-500`}
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
            className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs py-1 sm:py-1.5 rounded border border-zinc-700 transition flex justify-between px-2 sm:px-3"
          >
            <span>📝 Notes</span>
            <span>{showNotes ? "▲" : "▼"}</span>
          </button>

          {showNotes && (
            <textarea
              value={notes || ""}
              onChange={(e) => onUpdate(id, "notes", e.target.value)}
              placeholder="Thoughts..."
              className={`w-full bg-zinc-950 text-[10px] sm:text-xs text-zinc-300 border border-zinc-700 rounded px-2 py-1.5 h-12 sm:h-20 resize-none focus:outline-none focus:border-${themeColor}-500`}
              autoFocus
            />
          )}

          <button
            onClick={() => onRemove(id)}
            className="w-full bg-zinc-800 hover:bg-red-600 text-white font-semibold py-1 sm:py-1.5 rounded transition text-[10px] sm:text-xs"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
