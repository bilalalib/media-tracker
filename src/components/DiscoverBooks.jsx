import { useState, useEffect } from 'react';
import MediaRow from './MediaRow';
import DiscoverCard from './DiscoverCard';

export default function DiscoverBooks() {
  // NYT State
  const [currentHits, setCurrentHits] = useState([]);
  const [manga, setManga] = useState([]);
  
  // Google Curated State
  const [allTimeClassics, setAllTimeClassics] = useState([]);
  const [modernEpics, setModernEpics] = useState([]);
  const [sciFiLegends, setSciFiLegends] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const NYT_KEY = import.meta.env.VITE_NYT_API_KEY;

  // NYT Formatter (Beautiful Covers)
  const formatNYTData = (books) => {
    if (!books) return [];
    return books.map(book => ({
      id: book.primary_isbn13 || book.primary_isbn10, 
      title: book.title,
      imageUrl: book.book_image || null, 
    }));
  };

  // Google Formatter (With our custom High-Res Cover Hack!)
  const formatGoogleData = (items) => {
    if (!items) return [];
    return items.map(book => {
      let cover = book.volumeInfo?.imageLinks?.thumbnail || null;
      if (cover) {
        cover = cover.replace('http:', 'https:'); 
        cover = cover.replace('&edge=curl', ''); // Kills the ugly page curl
        cover = cover.replace('zoom=1', 'zoom=3'); // Forces higher resolution!
      }
      return {
        id: book.id,
        title: book.volumeInfo?.title || 'Unknown Title',
        imageUrl: cover,
      };
    }).filter(book => book.imageUrl); // Drops books without covers
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const nytCurrentReq = fetch(`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_KEY}`);
        const nytMangaReq = fetch(`https://api.nytimes.com/svc/books/v3/lists/current/graphic-books-and-manga.json?api-key=${NYT_KEY}`);

        // Using strict 'intitle' queries ensures we get the EXACT books we want!
        const classicsQuery = 'intitle:"To Kill a Mockingbird"+OR+intitle:"1984"+OR+intitle:"The Great Gatsby"+OR+intitle:"Pride and Prejudice"+OR+intitle:"Fahrenheit 451"';
        const epicsQuery = 'intitle:"Harry Potter"+OR+intitle:"The Hunger Games"+OR+intitle:"Percy Jackson"+OR+intitle:"The Maze Runner"+OR+intitle:"Twilight"';
        const scifiQuery = 'intitle:"Dune"+OR+intitle:"The Lord of the Rings"+OR+intitle:"A Game of Thrones"+OR+intitle:"The Martian"+OR+intitle:"Project Hail Mary"';

        const classicsReq = fetch(`https://www.googleapis.com/books/v1/volumes?q=${classicsQuery}&printType=books&maxResults=15`);
        const epicsReq = fetch(`https://www.googleapis.com/books/v1/volumes?q=${epicsQuery}&printType=books&maxResults=15`);
        const scifiReq = fetch(`https://www.googleapis.com/books/v1/volumes?q=${scifiQuery}&printType=books&maxResults=15`);

        const [currentRes, mangaRes, classicsRes, epicsRes, scifiRes] = await Promise.all([
          nytCurrentReq, nytMangaReq, classicsReq, epicsReq, scifiReq
        ]);

        setCurrentHits(formatNYTData((await currentRes.json()).results?.books));
        setManga(formatNYTData((await mangaRes.json()).results?.books));
        setAllTimeClassics(formatGoogleData((await classicsRes.json()).items));
        setModernEpics(formatGoogleData((await epicsRes.json()).items));
        setSciFiLegends(formatGoogleData((await scifiRes.json()).items));

      } catch (error) {
        console.error("Error fetching book dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    if (NYT_KEY) fetchDashboards();
  }, [NYT_KEY]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setIsSearching(false); return; }

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&printType=books&maxResults=30`);
      const data = await response.json();
      setSearchResults(formatGoogleData(data.items));
      setIsSearching(true);
    } catch (error) {
      console.error("Error searching books:", error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 w-full mt-8">
      <form onSubmit={handleSearch} className="mb-10 max-w-2xl mx-auto flex gap-2">
        <input
          type="text"
          placeholder="Search for any book or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
        <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">Search</button>
        {isSearching && (
          <button type="button" onClick={clearSearch} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors">Clear</button>
        )}
      </form>

      {isSearching ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5 md:gap-6">
            {searchResults.length > 0 ? (
              searchResults.map(book => (
                <DiscoverCard key={book.id} id={book.id} title={book.title} imageUrl={book.imageUrl} category="book" />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-10">No books found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <MediaRow title="Current NYT Bestsellers" items={currentHits} category="book" endpoint={`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_KEY}`} />
          <MediaRow title="Graphic Books & Manga" items={manga} category="book" endpoint={`https://api.nytimes.com/svc/books/v3/lists/current/graphic-books-and-manga.json?api-key=${NYT_KEY}`} />
          <MediaRow title="All-Time Classics" items={allTimeClassics} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=intitle:"To Kill a Mockingbird"+OR+intitle:"1984"+OR+intitle:"The Great Gatsby"+OR+intitle:"Pride and Prejudice"+OR+intitle:"Fahrenheit 451"&printType=books&maxResults=40`} />
          <MediaRow title="Modern Epics & YA" items={modernEpics} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=intitle:"Harry Potter"+OR+intitle:"The Hunger Games"+OR+intitle:"Percy Jackson"+OR+intitle:"The Maze Runner"+OR+intitle:"Twilight"&printType=books&maxResults=40`} />
          <MediaRow title="Sci-Fi & Fantasy Legends" items={sciFiLegends} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=intitle:"Dune"+OR+intitle:"The Lord of the Rings"+OR+intitle:"A Game of Thrones"+OR+intitle:"The Martian"+OR+intitle:"Project Hail Mary"&printType=books&maxResults=40`} />
        </div>
      )}
    </div>
  );
}