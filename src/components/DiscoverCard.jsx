import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function DiscoverCard({ id, title, imageUrl }) {
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    const checkTracked = async () => {
      const { data } = await supabase.from('tracked_manga').select('id').eq('id', id);
      if (data && data.length > 0) {
        setIsTracked(true);
      }
    };
    checkTracked();
  }, [id]);

  const handleSave = async () => {
    try {
      setIsTracked(true); 

      const newManga = { 
        id, title, type: 'Manga', status: 'Unknown', imageUrl, 
        trackingStatus: 'Reading', rating: 0, notes: '' 
      };
      
      const { error } = await supabase.from('tracked_manga').insert([newManga]);
      
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
    <div className="flex flex-col gap-2 group w-36 md:w-44 flex-shrink-0 cursor-pointer snap-start">
      <div className="relative h-56 md:h-64 rounded-lg overflow-hidden shadow-md">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-50" />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">No Image</div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {isTracked ? (
            <span className="bg-zinc-900/90 text-zinc-300 px-3 py-1.5 rounded text-sm font-semibold border border-zinc-700 pointer-events-auto shadow-lg">
              ✓ Tracked
            </span>
          ) : (
            <button 
              onClick={handleSave} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-bold shadow-lg pointer-events-auto transform hover:scale-105 transition"
            >
              + Track
            </button>
          )}
        </div>
      </div>
      <h3 className="text-sm font-medium text-zinc-400 truncate transition group-hover:text-zinc-100" title={title}>
        {title}
      </h3>
    </div>
  );
}