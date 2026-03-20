import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";

export default function MediaGrid({ searchQuery }) {
  const [mediaList, setMediaList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = 'https://api.jikan.moe/v4/top/manga?limit=10'
        
        if (searchQuery.length >= 3) {
          url = `https://api.jikan.moe/v4/manga?q=${searchQuery}&limit=10`
        }

        const response = await fetch(url)
        const json = await response.json()
        
        console.log("Raw API Response:", json); 

        if (json.data) {
          setMediaList(json.data)
        } else {
          console.warn("API didn't return data. We might be rate-limited!");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 500)
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6 border-l-4 border-red-600 pl-3">
        {searchQuery.length >= 3 ? `Search Results for "${searchQuery}"` : "Top Manga"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mediaList.map((manga) => (
          <MediaCard
            key={manga.mal_id}
            id={manga.mal_id}
            title={manga.title}
            type={manga.type}
            status={manga.status}
            imageUrl={manga.images.webp.image_url}
          />
        ))}
      </div>
    </main>
  );
}
