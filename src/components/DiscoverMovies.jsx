import { useState, useEffect } from 'react';

export default function DiscoverMovies() {
  const [trending, setTrending] = useState([]);
  const [acclaimed, setAcclaimed] = useState([]);
  const [action, setAction] = useState([]);
  const [thriller, setThriller] = useState([]);
  const [romance, setRomance] = useState([]);
  const [animated, setAnimated] = useState([]);
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
          thrillerRes, 
          romanceRes, 
          animatedRes,
          topRatedRes
        ] = await Promise.all([
          fetch('https://api.themoviedb.org/3/trending/movie/week?language=en-US', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/movie?language=en-US&primary_release_year=2023&sort_by=vote_average.desc&vote_count.gte=1500', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=28', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=53', fetchOptions), 
          fetch('https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=10749', fetchOptions),
          fetch('https://api.themoviedb.org/3/discover/movie?language=en-US&with_genres=16', fetchOptions),
          fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', fetchOptions)
        ]);

        setTrending((await trendingRes.json()).results);
        setAcclaimed((await acclaimedRes.json()).results);
        setAction((await actionRes.json()).results);
        setThriller((await thrillerRes.json()).results);
        setRomance((await romanceRes.json()).results);
        setAnimated((await animatedRes.json()).results);
        setTopRated((await topRatedRes.json()).results);
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
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=false&language=en-US&page=1`, fetchOptions);
      setSearchResults((await response.json()).results);
      setIsSearching(true);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const MovieCard = ({ movie }) => (
    <div className="group relative rounded-lg overflow-hidden bg-transparent cursor-pointer flex-none w-32 sm:w-40 md:w-48 transition-transform duration-300 hover:scale-105">
      {movie.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          className="w-full h-auto object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-48 md:h-72 bg-zinc-800 rounded-lg flex items-center justify-center text-center p-2 text-xs text-zinc-500">
          No Image
        </div>
      )}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-4 pointer-events-none rounded-lg">
        <h2 className="text-white font-bold text-xs sm:text-sm truncate">{movie.title}</h2>
        <p className="text-cyan-400 text-[10px] sm:text-xs mt-1">
          {movie.vote_average === 0 || !movie.vote_average 
            ? "Not Released" 
            : `⭐ ${movie.vote_average.toFixed(1)}/10`}
        </p>
      </div>
    </div>
  );

  const MovieRow = ({ title, movies }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </div>
  );

  if (loading && !isSearching) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto flex gap-2">
        <input 
          type="text" 
          placeholder="Search for a movie..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button type="submit" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">
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
              searchResults.map(movie => <MovieCard key={movie.id} movie={movie} />)
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">No movies found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <MovieRow title="Trending This Week" movies={trending} />
          <MovieRow title="Critically Acclaimed" movies={acclaimed} />
          <MovieRow title="Action Blockbusters" movies={action} />
          <MovieRow title="Animated Features" movies={animated} />
          <MovieRow title="Nail-Biting Thrillers" movies={thriller} />
          <MovieRow title="Romance & Drama" movies={romance} />
          <MovieRow title="All-Time Top Rated" movies={topRated} />
        </div>
      )}
    </div>
  );
}