import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";

export default function MediaGrid() {
  const [mediaList, setMediaList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We ask Jikan for the top 5 manga
        const response = await fetch(
          "https://api.jikan.moe/v4/top/manga?limit=5",
        );
        const json = await response.json();

        setMediaList(json.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6 border-l-4 border-red-600 pl-2">
        Currently Reading
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mediaList.map((manga) => (
          <MediaCard 
            key={manga.mal_id}
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