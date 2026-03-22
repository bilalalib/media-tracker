import { useState, useEffect } from "react";
import DiscoverCard from "./DiscoverCard";
import { Link } from 'react-router-dom'

export default function MediaRow({ title, endpoint }) {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = await fetch(endpoint)
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          response = await fetch(endpoint)
        }

        const data = await response.json()
        if (data.data) {
          setMedia(data.data.slice(0, 15))
        }
        setIsLoading(false)
      } catch (error) {
        console.error(`Error fetching ${title}:`, error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [endpoint, title])

  if (isLoading) {
    return (
      <div className="mb-10 h-72 animate-pulse bg-zinc-900/30 rounded-xl"></div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-sm font-bold text-zinc-300 tracking-wider uppercase">
          {title}
        </h2>
        <Link 
          to={`/view/${title.toLowerCase().replace(/\s+/g, '-')}`} 
          state={{ title: title, endpoint: endpoint }} 
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition"
        >
          View All
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {media.map((manga) => (
          <DiscoverCard
            key={manga.mal_id}
            id={manga.mal_id}
            title={manga.title}
            imageUrl={manga.images?.webp?.image_url}
          />
        ))}
      </div>
    </div>
  );
}
