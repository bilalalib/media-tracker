import { useState, useEffect } from "react";
import MediaRow from "./MediaRow";
import DiscoverCard from "./DiscoverCard";

export default function DiscoverMovies() {
  // Dashboard rows shown on the discover page
  const [trending, setTrending] = useState([]);
  const [acclaimed, setAcclaimed] = useState([]);
  const [action, setAction] = useState([]);
  const [thriller, setThriller] = useState([]);
  const [romance, setRomance] = useState([]);
  const [animated, setAnimated] = useState([]);
  const [topRated, setTopRated] = useState([]);

  // Search + loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // TMDB auth header for all requests
  const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
  const fetchOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  };

  // Normalize API results for reusable card UI
  const formatData = (items) => {
    if (!items) return [];
    return items.map((item) => ({
      ...item,
      imageUrl: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
    }));
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        // Fetch all dashboard sections in parallel for faster initial load
        const [
          trendingRes,
          acclaimedRes,
          actionRes,
          thrillerRes,
          romanceRes,
          animatedRes,
          topRatedRes,
        ] = await Promise.all([
          fetch(
            "https://api.themoviedb.org/3/trending/movie/week?language=en-US",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/discover/movie?language=en-US&primary_release_year=2023&sort_by=vote_average.desc&vote_count.gte=1500",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=28",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=53",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=10749",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=16",
            fetchOptions,
          ),
          fetch(
            "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
            fetchOptions,
          ),
        ]);

        setTrending(formatData((await trendingRes.json()).results));
        setAcclaimed(formatData((await acclaimedRes.json()).results));
        setAction(formatData((await actionRes.json()).results));
        setThriller(formatData((await thrillerRes.json()).results));
        setRomance(formatData((await romanceRes.json()).results));
        setAnimated(formatData((await animatedRes.json()).results));
        setTopRated(formatData((await topRatedRes.json()).results));
      } catch (error) {
        console.error("Error fetching movie dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Blank query exits search mode and shows dashboard rows
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=false&language=en-US&page=1`,
        fetchOptions,
      );
      setSearchResults(formatData((await response.json()).results));
      setIsSearching(true);
    } catch (error) {
      console.error("Error searching movies:", error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
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
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
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
              searchResults.map((movie) => (
                <DiscoverCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  imageUrl={movie.imageUrl}
                  category="movie"
                />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">
                No movies found.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <MediaRow
            title="Trending This Week"
            items={trending}
            category="movie"
            endpoint="https://api.themoviedb.org/3/trending/movie/week?language=en-US"
          />
          <MediaRow
            title="Critically Acclaimed"
            items={acclaimed}
            category="movie"
            endpoint="https://api.themoviedb.org/3/discover/movie?language=en-US&primary_release_year=2023&sort_by=vote_average.desc&vote_count.gte=1500"
          />
          <MediaRow
            title="Action Blockbusters"
            items={action}
            category="movie"
            endpoint="https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=28"
          />
          <MediaRow
            title="Animated Features"
            items={animated}
            category="movie"
            endpoint="https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=16"
          />
          <MediaRow
            title="Nail-Biting Thrillers"
            items={thriller}
            category="movie"
            endpoint="https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=53"
          />
          <MediaRow 
            title="Romance & Drama" 
            items={romance} 
            category="movie" 
            endpoint="https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=10749"
          />
          <MediaRow
            title="All-Time Top Rated"
            items={topRated}
            category="movie"
            endpoint="https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1"
          />
        </div>
      )}
    </div>
  );
}
