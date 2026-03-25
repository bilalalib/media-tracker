import { useState, useEffect } from "react";
import MediaRow from "./MediaRow";
import DiscoverCard from "./DiscoverCard";
import Top100List from "./Top100List";

export default function DiscoverManga() {
  // Dashboard buckets shown on the page
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [manhwa, setManhwa] = useState([]);

  // Search + page loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Normalize Jikan response to card-friendly shape
  const formatData = (items) => {
    if (!items) return [];
    return items.map((manga) => ({
      id: manga.mal_id,
      title: manga.title,
      imageUrl: manga.images?.webp?.image_url || null,
    }));
  };

  const fetchJikan = async (url) => {
    let response = await fetch(url);
    // Basic retry when Jikan rate-limits the request
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = await fetch(url);
    }
    const json = await response.json();
    return json.data ? json.data.slice(0, 15) : [];
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        // Space requests slightly to reduce 429 responses
        const trendingData = await fetchJikan(
          "https://api.jikan.moe/v4/manga?status=publishing&order_by=members&sort=desc&start_date=2021-01-01",
        );
        await new Promise((r) => setTimeout(r, 350));

        const popularData = await fetchJikan(
          "https://api.jikan.moe/v4/top/manga?filter=bypopularity",
        );
        await new Promise((r) => setTimeout(r, 350));

        const manhwaData = await fetchJikan(
          "https://api.jikan.moe/v4/manga?type=manhwa&order_by=members&sort=desc",
        );

        setTrending(formatData(trendingData));
        setPopular(formatData(popularData));
        setManhwa(formatData(manhwaData));
      } catch (error) {
        console.error("Error fetching manga dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Empty query resets back to dashboard mode
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJikan(
        `https://api.jikan.moe/v4/manga?q=${searchQuery}`,
      );
      setSearchResults(formatData(data));
      setIsSearching(true);
    } catch (error) {
      console.error("Error searching manga:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 w-full mt-8">
      <form
        onSubmit={handleSearch}
        className="mb-10 max-w-2xl mx-auto flex gap-2"
      >
        <input
          type="text"
          placeholder="Search for manga, manhwa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-red-600 transition-colors shadow-lg"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
        >
          Search
        </button>
        {isSearching && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {isSearching ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5 md:gap-6">
            {searchResults.length > 0 ? (
              searchResults.map((manga) => (
                <DiscoverCard
                  key={manga.id}
                  id={manga.id}
                  title={manga.title}
                  imageUrl={manga.imageUrl}
                  category="manga"
                />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">
                No manga found.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <MediaRow
            title="Trending Now"
            items={trending}
            endpoint="https://api.jikan.moe/v4/manga?status=publishing&order_by=members&sort=desc&start_date=2021-01-01"
            category="manga"
          />
          <MediaRow
            title="All Time Popular"
            items={popular}
            endpoint="https://api.jikan.moe/v4/top/manga?filter=bypopularity"
            category="manga"
          />
          <MediaRow
            title="Popular Manhwa"
            items={manhwa}
            endpoint="https://api.jikan.moe/v4/manga?type=manhwa&order_by=members&sort=desc"
            category="manga"
          />

          <Top100List />
        </div>
      )}
      <MediaRow title="Popular Manhwa" items={manhwa} category="manga" />
    </div>
  );
}
