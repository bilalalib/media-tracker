import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function DiscoverCard({
  id,
  title,
  imageUrl,
  category = "manga",
}) {
  const [isTracked, setIsTracked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // COPILOT DELETED THIS! We need it for the button colors!
  const themeColor = category === 'manga' ? 'red' : category === 'movie' ? 'cyan' : category === 'show' ? 'purple' : 'emerald';

  const getTableInfo = () => {
    if (category === "movie") return { name: "tracked_movies", idColumn: "tmdb_id" };
    if (category === "show") return { name: "tracked_shows", idColumn: "tmdb_id" };
    if (category === "book") return { name: "tracked_books", idColumn: "book_id" };
    return { name: "tracked_manga", idColumn: "id" };
  };

  useEffect(() => {
    let isMounted = true;

    const checkTracked = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        if (isMounted) setIsChecking(false);
        return;
      }

      const table = getTableInfo();
      
      const { data } = await supabase
        .from(table.name)
        .select(table.idColumn)
        .eq(table.idColumn, id)
        .eq('user_id', session.user.id)
        .limit(1); 

      if (isMounted) {
        if (data && data.length > 0) setIsTracked(true);
        setIsChecking(false); 
      }
    };

    checkTracked();

    const handleSync = (e) => {
      if (e.detail.id === id) setIsTracked(e.detail.isTracked);
    };
    
    window.addEventListener('syncMediaState', handleSync);

    return () => { 
      isMounted = false; 
      window.removeEventListener('syncMediaState', handleSync); 
    };
  }, [id, category]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isChecking) return; 

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert("Please sign in to track media.");
      return;
    }

    const table = getTableInfo(); 

    if (isTracked) {
      // --- UNTRACK ---
      setIsTracked(false);   
      window.dispatchEvent(new CustomEvent('syncMediaState', { detail: { id, isTracked: false } }));
         
      const { error } = await supabase
        .from(table.name)
        .delete()
        .eq(table.idColumn, id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error removing item:", error);
        alert("Database Error (Delete): " + error.message);
        setIsTracked(true); 
        window.dispatchEvent(new CustomEvent('syncMediaState', { detail: { id, isTracked: true } })); 
      }
    } else {
      // --- TRACK ---
      setIsTracked(true);
      window.dispatchEvent(new CustomEvent('syncMediaState', { detail: { id, isTracked: true } }));
      
      const safeTitle = title || 'Unknown Title';
      const safeImageUrl = imageUrl || '';

      let payload = {};
      if (category === 'manga') {
        payload = { user_id: user.id, id, title: safeTitle, type: 'Manga', status: 'Unknown', imageUrl: safeImageUrl, trackingStatus: 'Reading', rating: 0, notes: '' };
      } else if (category === 'book') {
        payload = { user_id: user.id, book_id: id, title: safeTitle, image_url: safeImageUrl, tracking_status: 'Reading', rating: 0, notes: '' };
      } else {
        payload = { user_id: user.id, tmdb_id: id, title: safeTitle, image_url: safeImageUrl, tracking_status: 'Watching', rating: 0, notes: '' };
      }

      const { error } = await supabase.from(table.name).insert([payload]);
      
      if (error) {
        console.error("Error saving item:", error);
        alert("Database Error (Save): " + error.message); 
        setIsTracked(false); 
        window.dispatchEvent(new CustomEvent('syncMediaState', { detail: { id, isTracked: false } })); 
      }
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
          <button
            onClick={handleSave}
            disabled={isChecking}
            className={`px-4 py-1.5 rounded text-xs sm:text-sm font-bold shadow-lg transform transition duration-200 ${
              isChecking
                ? "bg-zinc-800 text-zinc-500 cursor-wait pointer-events-auto"
                : isTracked
                ? "bg-zinc-800/95 text-zinc-300 border border-zinc-600 hover:bg-zinc-700 hover:text-white pointer-events-auto hover:scale-105"
                : `bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white pointer-events-auto hover:scale-105`
            }`}
          >
            {isChecking ? "..." : isTracked ? "✓ Tracked" : "+ Track"}
          </button>
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