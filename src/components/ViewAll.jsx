import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import MediaCard from "./MediaCard";

export default function ViewAll() {
  const location = useLocation();
  // Values passed from the Discover row "View All" link
  const title = location.state?.title;
  const endpoint = location.state?.endpoint;

  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFullList = async () => {
      // Guard route access when no state/endpoint is available
      if (!endpoint) return;

      try {
        let response = await fetch(endpoint);

        // Basic retry for temporary Jikan rate limiting
        if (response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          response = await fetch(endpoint);
        }

        const data = await response.json();
        setMedia(data.data || []);
      } catch (error) {
        console.error("Error fetching view all:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullList();
  }, [endpoint]);

  // Fallback UI if this page is opened directly without route state
  if (!endpoint) {
    return (
      <div className="text-center mt-32 text-zinc-500">
        <p className="text-xl mb-4">Oops! We lost the data.</p>
        <Link
          to="/"
          className="text-red-600 hover:text-red-500 font-bold px-6 py-2 border border-red-600 rounded transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 mt-8 mb-12">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <Link
          to="/"
          className="text-zinc-500 hover:text-zinc-300 transition text-sm font-semibold uppercase tracking-wider"
        >
          ← Back
        </Link>
        <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-3 uppercase tracking-wider">
          {title}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-32">
          <div className="animate-pulse text-xl text-zinc-600 font-bold tracking-widest uppercase">
            Loading Data...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {media.map((manga) => (
            <MediaCard
              key={manga.mal_id}
              id={manga.mal_id}
              title={manga.title}
              type={manga.type}
              status={manga.status}
              imageUrl={manga.images?.webp?.image_url}
              isSavedPage={false}
            />
          ))}
        </div>
      )}
    </main>
  );
}
