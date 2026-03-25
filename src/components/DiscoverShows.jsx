import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const [
          trendingRes, 
          acclaimedRes, 
          actionRes, 
          sciFiRes, 
          dramaRes, 
          trendingAnimeRes,
          topAnimatedRes,
          koreanRes,
          topRatedRes
        ] = await Promise.all([
          // 1. General Trending
          fetch('https://api.themoviedb.org/3/trending/tv/week?language=en-US', fetchOptions),
          
          // 2. Acclaimed
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=vote_average.desc&vote_count.gte=1000', fetchOptions),
          
          // 3, 4, 5. Live-Action Only (Action, Sci-Fi/Fantasy, Drama)
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=10759&without_genres=16', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=10765&without_genres=16', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=18&without_genres=16', fetchOptions), 
          
          // 6. Trending Anime (Animation + Japanese Language)
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=16&with_original_language=ja&sort_by=popularity.desc', fetchOptions), 
          
          // 7. All-Time Highest Rated Animated (High vote count + Animation)
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_genres=16&sort_by=vote_average.desc&vote_count.gte=500', fetchOptions),
          
          // 8. K-Dramas (Korean Language + Popularity)
          fetch('https://api.themoviedb.org/3/discover/tv?language=en-US&with_original_language=ko&sort_by=popularity.desc', fetchOptions),
          
          // 9. All-Time Top Rated
          fetch('https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1', fetchOptions)
        ]);

        setTrending((await trendingRes.json()).results);
        setAcclaimed((await acclaimedRes.json()).results);
        setAction((await actionRes.json()).results);
        setSciFi((await sciFiRes.json()).results);
        setDrama((await dramaRes.json()).results);
        setTrendingAnime((await trendingAnimeRes.json()).results); 
        setTopAnimated((await topAnimatedRes.json()).results); 
        setKoreanDramas((await koreanRes.json()).results);
        setTopRated((await topRatedRes.json()).results);
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
      setSearchResults((await response.json()).results);
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

  const ShowCard = ({ show }) => (
    <div className="group relative rounded-lg overflow-hidden bg-transparent cursor-pointer flex-none w-32 sm:w-40 md:w-48 transition-transform duration-300 hover:scale-105">
      {show.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
          alt={show.name} 
          className="w-full h-auto object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-48 md:h-72 bg-zinc-800 rounded-lg flex items-center justify-center text-center p-2 text-xs text-zinc-500">
          No Image
        </div>
      )}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-4 pointer-events-none rounded-lg">
        <h2 className="text-white font-bold text-xs sm:text-sm truncate">{show.name}</h2>
        <p className="text-purple-400 text-[10px] sm:text-xs mt-1">
          {show.vote_average === 0 || !show.vote_average 
            ? "Not Released" 
            : `⭐ ${show.vote_average.toFixed(1)}/10`}
        </p>
      </div>
    </div>
  );

  const ShowRow = ({ title, shows }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {shows.map(show => <ShowCard key={show.id} show={show} />)}
      </div>
    </div>
  );

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto flex gap-2">
        <input 
          type="text" 
          placeholder="Search for a TV show..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors">
          Search
        </button>
        {isSearching && (
          <button type="button" onClick={clearSearch} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors">
            Clear
          </button>
        )}
      </form>

      {isSearching ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5 md:gap-6">
            {searchResults.length > 0 ? (
              searchResults.map(show => <ShowCard key={show.id} show={show} />)
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">No shows found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <ShowRow title="Trending This Week" shows={trending} />
          <ShowRow title="Critically Acclaimed" shows={acclaimed} />
          
          {/* Live Action Only */}
          <ShowRow title="Action & Adventure" shows={action} />
          <ShowRow title="Sci-Fi & Fantasy" shows={sciFi} />
          <ShowRow title="Gripping Dramas" shows={drama} />
          
          {/* The Animation / Asian Hub */}
          <ShowRow title="Trending Anime" shows={trendingAnime} />
          <ShowRow title="All-Time Highest Rated Animated" shows={topAnimated} />
          <ShowRow title="K-Dramas & Asian Sensations" shows={koreanDramas} />
          
          {/* The Anchor */}
          <ShowRow title="All-Time Top Rated" shows={topRated} />
        </div>
      )}
    </div>
  );
}