import { useState, useEffect } from "react";

export default function MediaCard({
  id,
  title,
  type,
  status,
  imageUrl,
  isSavedPage,
  onRemove,
  trackingStatus,
  rating,
  notes,
  onUpdate,
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    if (!isSavedPage) {
      const storedString = localStorage.getItem("nexus_tracker_list");
      if (storedString) {
        const existingList = JSON.parse(storedString);
        const alreadySaved = existingList.some(
          (item) => String(item.id) === String(id),
        );
        setIsTracked(alreadySaved);
      }
    }
  }, [id, isSavedPage]);

  const handleSave = () => {
    try {
      const storedString = localStorage.getItem("nexus_tracker_list");
      let existingList = storedString ? JSON.parse(storedString) : [];

      const newMangaToSave = {
        id,
        title,
        type,
        status,
        imageUrl,
        trackingStatus: "Reading",
        rating: 0,
        notes: "",
      };

      const updatedList = [...existingList, newMangaToSave];
      localStorage.setItem("nexus_tracker_list", JSON.stringify(updatedList));

      setIsTracked(true);
    } catch (error) {
      console.error("CRASH DURING SAVE:", error);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition group flex flex-col shadow-md h-full">
      <div className="h-64 bg-zinc-800 relative cursor-pointer flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold text-xl">
            No Cover
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="font-bold text-lg truncate" title={title}>
            {title}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {type} • {status}
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-end gap-2">
          {isSavedPage ? (
            <>
              <select
                value={trackingStatus || "Reading"}
                onChange={(e) => onUpdate(id, "trackingStatus", e.target.value)}
                className="w-full bg-zinc-800 text-sm text-zinc-300 border border-zinc-700 rounded px-2 py-1.5 focus:outline-none focus:border-red-600"
              >
                <option value="Reading">Reading</option>
                <option value="Plan to Read">Plan to Read</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              <select
                value={rating || 0}
                onChange={(e) => onUpdate(id, "rating", Number(e.target.value))}
                className="w-full bg-zinc-800 text-sm text-zinc-300 border border-zinc-700 rounded px-2 py-1.5 focus:outline-none focus:border-red-600"
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
                className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 text-sm py-1.5 rounded border border-zinc-700 transition flex justify-between px-3"
              >
                <span>📝 {notes ? "Edit Notes" : "Add Notes"}</span>
                <span>{showNotes ? "▲" : "▼"}</span>
              </button>

              {showNotes && (
                <textarea
                  value={notes || ""}
                  onChange={(e) => onUpdate(id, "notes", e.target.value)}
                  placeholder="Type your thoughts here..."
                  className="w-full bg-zinc-950 text-sm text-zinc-300 border border-zinc-700 rounded px-2 py-2 h-24 resize-none focus:outline-none focus:border-red-600 mt-1"
                  autoFocus
                />
              )}

              <button
                onClick={() => onRemove(id)}
                className="w-full bg-zinc-800 hover:bg-red-600 text-white font-semibold py-1.5 rounded transition text-sm mt-2"
              >
                Remove
              </button>
            </>
          ) : isTracked ? (
            <button
              disabled
              className="mt-4 w-full bg-zinc-800 text-zinc-500 font-semibold py-2 rounded cursor-not-allowed border border-zinc-700"
            >
              ✓ In Your List
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
            >
              Track Series
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
