import { useState, useEffect } from 'react';
import MediaRow from './MediaRow';
import DiscoverCard from './DiscoverCard';

export default function DiscoverShows() {
  const [trending, setTrending] = useState([]);
  const [acclaimed, setAcclaimed] = useState([]);
  const [action, setAction] = useState([]);
  const [sciFi, setSciFi] = useState([]); 
  const [drama, setDrama] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]); 
  const [topAnimated, setTopAnimated] = useState([]); 
  const [koreanDramas, setKoreanDramas] = useState([]);
  const [topRated, setTopRated] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const TMDB_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
  const fetchOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_TOKEN}`
    }
  };

  const formatData = (items) => {
    if (!items) return [];
    return items.map(item => ({
      ...item,
      title: item.name,
      imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    }));
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const [
          trendingRes, acclaimedRes, actionRes, sciFiRes, dramaRes, trendingAnimeRes, topAnimatedRes, koreanRes, topRatedRes
        ] = await Promise.all([
          fetch('https://api.themoviedb.org/3/trending/tv/week?language=en-US', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=vote_average.desc&vote_count.gte=1000', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=10759&without_genres=16', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=10765&without_genres=16', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=18&without_genres=16', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=16&sort_by=vote_average.desc&vote_count.gte=500', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_original_language=ko&sort_by=popularity.desc', fetchOptions),
          fetch('https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1', fetchOptions)
        ]);

        setTrending(formatData((await trendingRes.json()).results));
        setAcclaimed(formatData((await acclaimedRes.json()).results));
        setAction(formatData((await actionRes.json()).results));
        setSciFi(formatData((await sciFiRes.json()).results));
        setDrama(formatData((await dramaRes.json()).results));
        setTrendingAnime(formatData((await trendingAnimeRes.json()).results)); 
        setTopAnimated(formatData((await topAnimatedRes.json()).results)); 
        setKoreanDramas(formatData((await koreanRes.json()).results));
        setTopRated(formatData((await topRatedRes.json()).results));
      } catch (error) {
        console.error("Error fetching TV dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/tv?query=${searchQuery}&include_adult=false&language=en-US&page=1`, fetchOptions);
      setSearchResults(formatData((await response.json()).results));
      setIsSearching(true);
    } catch (error) {
      console.error("Error searching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 w-full mt-8">
      <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto flex gap-2">
        <input 
          type="text" 
          placeholder="Search for a TV show..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors">Search</button>
        {isSearching && (
          <button type="button" onClick={clearSearch} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors">Clear</button>
        )}
      </form>

      {isSearching ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5 md:gap-6">
            {searchResults.length > 0 ? (
              searchResults.map(show => (
                <DiscoverCard key={show.id} id={show.id} title={show.title} imageUrl={show.imageUrl} category="show" />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">No shows found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <MediaRow title="Trending This Week" items={trending} category="show" />
          <MediaRow title="Critically Acclaimed" items={acclaimed} category="show" />
          <MediaRow title="Action & Adventure" items={action} category="show" />
          <MediaRow title="Sci-Fi & Fantasy" items={sciFi} category="show" />
          <MediaRow title="Gripping Dramas" items={drama} category="show" />
          <MediaRow title="Trending Anime" items={trendingAnime} category="show" />
          <MediaRow title="All-Time Highest Rated Animated" items={topAnimated} category="show" />
          <MediaRow title="K-Dramas & Asian Sensations" items={koreanDramas} category="show" />
          <MediaRow title="All-Time Top Rated" items={topRated} category="show" />
        </div>
      )}
    </div>
  );
}