import { useState, useEffect } from 'react';
import MediaRow from './MediaRow';
import DiscoverCard from './DiscoverCard';

export default function DiscoverBooks() {
  // Dashboard rows for book discovery
  const [fiction, setFiction] = useState([]);
  const [fantasy, setFantasy] = useState([]);
  const [sciFi, setSciFi] = useState([]);
  const [selfHelp, setSelfHelp] = useState([]);
  const [tech, setTech] = useState([]);

  // Search + loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Normalize Google Books payload for shared card UI
  const formatData = (items) => {
    if (!items) return [];
    return items.map(book => {
      let cover = book.volumeInfo?.imageLinks?.thumbnail || null;
      if (cover) cover = cover.replace('http:', 'https:'); // Avoid mixed-content image blocking

      return {
        id: book.id,
        title: book.volumeInfo?.title || 'Unknown Title',
        imageUrl: cover,
      };
    });
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        // Load all dashboard sections in parallel
        const [fictionRes, fantasyRes, sciFiRes, selfHelpRes, techRes] = await Promise.all([
          fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=15'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fantasy&orderBy=relevance&maxResults=15'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=subject:"science fiction"&orderBy=relevance&maxResults=15'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=subject:"self-help"&orderBy=relevance&maxResults=15'),
          fetch('https://www.googleapis.com/books/v1/volumes?q=subject:technology&orderBy=relevance&maxResults=15')
        ]);

        setFiction(formatData((await fictionRes.json()).items));
        setFantasy(formatData((await fantasyRes.json()).items));
        setSciFi(formatData((await sciFiRes.json()).items));
        setSelfHelp(formatData((await selfHelpRes.json()).items));
        setTech(formatData((await techRes.json()).items));
      } catch (error) {
        console.error("Error fetching book dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    // Empty query exits search mode and shows dashboard rows
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=40`);
      const data = await response.json();
      setSearchResults(formatData(data.items));
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
          placeholder="Search for a book or author..."
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
          <MediaRow title="Bestselling Fiction" items={fiction} category="book" />
          <MediaRow title="Epic Fantasy" items={fantasy} category="book" />
          <MediaRow title="Sci-Fi Masterpieces" items={sciFi} category="book" />
          <MediaRow title="Self-Help & Productivity" items={selfHelp} category="book" />
          <MediaRow title="Tech & Business" items={tech} category="book" />
        </div>
      )}
    </div>
  );
}