import { useState, useEffect } from 'react';
import MediaRow from './MediaRow';
import DiscoverCard from './DiscoverCard';

export default function DiscoverBooks() {
  // NYT State (Bestsellers)
  const [nytHits, setNytHits] = useState([]);
  
  // Google State (Dynamic Genres)
  const [classics, setClassics] = useState([]);
  const [fantasy, setFantasy] = useState([]);
  const [sciFi, setSciFi] = useState([]);
  const [thriller, setThriller] = useState([]);

  // Search + loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const NYT_KEY = import.meta.env.VITE_NYT_API_KEY;

  const formatNYTData = (books) => {
    if (!books) return [];
    return books.map(book => ({
      id: book.primary_isbn13 || book.primary_isbn10, 
      title: book.title,
      imageUrl: book.book_image || null, 
    }));
  };

  // The Dynamic Genre Formatter (Strict Author Filter for Dashboard Diversity)
  const formatGoogleDashboard = (items) => {
    if (!items) return [];
    const uniqueBooks = [];
    const seenTitles = new Set();
    const seenAuthors = new Set(); 

    items.forEach(book => {
      let title = book.volumeInfo?.title || 'Unknown Title';
      let normalizedTitle = title.toLowerCase().trim();
      let authors = book.volumeInfo?.authors || [];
      let primaryAuthor = authors.length > 0 ? authors[0].toLowerCase().trim() : 'unknown';
      let cover = book.volumeInfo?.imageLinks?.thumbnail || null;

      // Kills study guides, summaries, and weird reference manuals
      const isJunk = normalizedTitle.includes("summary") || 
                     normalizedTitle.includes("study guide") || 
                     normalizedTitle.includes("analysis") ||
                     normalizedTitle.includes("cliffsnotes") ||
                     normalizedTitle.includes("reference") ||
                     normalizedTitle.includes("review");

      if (cover && !seenTitles.has(normalizedTitle) && !seenAuthors.has(primaryAuthor) && !isJunk) {
        cover = cover.replace('http:', 'https:').replace('&edge=curl', ''); 
        uniqueBooks.push({ id: book.id, title: title, imageUrl: cover });
        seenTitles.add(normalizedTitle); 
        seenAuthors.add(primaryAuthor);
      }
    });
    return uniqueBooks;
  };

  // Search Formatter (Allows multiple books by the same author!)
  const formatSearchData = (items) => {
    if (!items) return [];
    const uniqueBooks = [];
    const seenTitles = new Set();

    items.forEach(book => {
      let title = book.volumeInfo?.title || 'Unknown Title';
      let normalizedTitle = title.toLowerCase().trim();
      let cover = book.volumeInfo?.imageLinks?.thumbnail || null;

      const isJunk = normalizedTitle.includes("summary") || 
                     normalizedTitle.includes("study guide") || 
                     normalizedTitle.includes("analysis") ||
                     normalizedTitle.includes("cliffsnotes");

      if (cover && !seenTitles.has(normalizedTitle) && !isJunk) {
        cover = cover.replace('http:', 'https:').replace('&edge=curl', ''); 
        uniqueBooks.push({ id: book.id, title: title, imageUrl: cover });
        seenTitles.add(normalizedTitle); 
      }
    });
    return uniqueBooks;
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        // 1. Fetch NYT Current Hits (Optional, won't break if key is missing)
        let nytData = [];
        if (NYT_KEY) {
          const res = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_KEY}`);
          if (res.ok) nytData = formatNYTData((await res.json()).results?.books);
        }

        // 2. Dynamic Subject Queries (Just like TMDB Genres! Allows infinite pagination)
        const baseGoogleUrl = 'https://www.googleapis.com/books/v1/volumes?printType=books&langRestrict=en&orderBy=relevance&maxResults=40&q=';
        
        const [classicsRes, fantasyRes, sciFiRes, thrillerRes] = await Promise.all([
          fetch(`${baseGoogleUrl}subject:"classic literature"`),
          fetch(`${baseGoogleUrl}subject:"fantasy"`),
          fetch(`${baseGoogleUrl}subject:"science fiction"`),
          fetch(`${baseGoogleUrl}subject:"thriller"`)
        ]);

        setNytHits(nytData);
        setClassics(formatGoogleDashboard((await classicsRes.json()).items));
        setFantasy(formatGoogleDashboard((await fantasyRes.json()).items));
        setSciFi(formatGoogleDashboard((await sciFiRes.json()).items));
        setThriller(formatGoogleDashboard((await thrillerRes.json()).items));

      } catch (error) {
        console.error("Error fetching book dashboards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, [NYT_KEY]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setIsSearching(false); return; }

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&printType=books&maxResults=40`);
      setSearchResults(formatSearchData((await response.json()).items));
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
          placeholder="Search for any book, series, or author..."
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
          {nytHits.length > 0 && (
            <MediaRow title="Current NYT Bestsellers" items={nytHits} category="book" />
          )}
          
          {/* THESE NOW SUPPORT INFINITE PAGINATION IN VIEW ALL! */}
          <MediaRow title="Timeless Classics" items={classics} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=subject:"classic literature"&printType=books&langRestrict=en&orderBy=relevance&maxResults=40`} />
          <MediaRow title="Epic Fantasy" items={fantasy} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=subject:"fantasy"&printType=books&langRestrict=en&orderBy=relevance&maxResults=40`} />
          <MediaRow title="Sci-Fi Masterpieces" items={sciFi} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=subject:"science fiction"&printType=books&langRestrict=en&orderBy=relevance&maxResults=40`} />
          <MediaRow title="Gripping Thrillers" items={thriller} category="book" endpoint={`https://www.googleapis.com/books/v1/volumes?q=subject:"thriller"&printType=books&langRestrict=en&orderBy=relevance&maxResults=40`} />
        </div>
      )}
    </div>
  );
}