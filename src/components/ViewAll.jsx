import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DiscoverCard from "./DiscoverCard";

export default function ViewAll() {
  const location = useLocation();
  const navigate = useNavigate();

  const title = location.state?.title;
  const endpoint = location.state?.endpoint;
  const category = location.state?.category || "manga";

  // --- NEW PAGINATION STATE ---
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Dynamic theme colors for the Load More button
  const themeColor =
    category === "manga"
      ? "red"
      : category === "movie"
        ? "cyan"
        : category === "show"
          ? "purple"
          : "emerald";

  useEffect(() => {
    if (!endpoint) return;

    const fetchFullList = async () => {
      try {
        if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        // 1. URL Engine: Safely injects pagination parameters based on the API type
        const url = new URL(endpoint);

        if (
          category === "manga" ||
          category === "movie" ||
          category === "show"
        ) {
          url.searchParams.set("page", page);
        } else if (category === "book") {
          if (endpoint.includes("nytimes")) {
            // NYT lists are strictly 15 items long. No pages exist!
            setHasMore(false);
          } else if (endpoint.includes("googleapis")) {
            // Google Books uses "startIndex", moving forward 40 books at a time
            url.searchParams.set("startIndex", (page - 1) * 40);
            url.searchParams.set("maxResults", 40);
          }
        }

        // 2. Setup Headers
        const fetchOptions = { method: "GET" };
        if (category === "movie" || category === "show") {
          fetchOptions.headers = {
            accept: "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_TOKEN}`,
          };
        }

        // 3. Fetch Data
        let response = await fetch(url.toString(), fetchOptions);

        if (response.status === 429 && category === "manga") {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          response = await fetch(url.toString(), fetchOptions);
        }

        const data = await response.json();

        // 4. Format Data & Calculate if there is a "Next Page"
        let formattedData = [];
        let moreAvailable = false;

        if (category === "manga") {
          formattedData = (data.data || []).map((item) => ({
            id: item.mal_id,
            title: item.title,
            imageUrl:
              item.images?.webp?.image_url ||
              item.images?.jpg?.image_url ||
              null,
          }));
          moreAvailable = data.pagination?.has_next_page || false;
        } else if (category === "book") {
          if (endpoint.includes("nytimes")) {
            formattedData = (data.results?.books || []).map((book) => ({
              id: book.primary_isbn13 || book.primary_isbn10,
              title: book.title,
              imageUrl: book.book_image || null,
            }));
            moreAvailable = false;
          } else {
            // Google Books data (View All version)
            const seenTitles = new Set();
            const seenAuthors = new Set();
            formattedData = [];

            (data.items || []).forEach((book) => {
              let title = book.volumeInfo?.title || "Unknown Title";
              let normalizedTitle = title.toLowerCase().trim();

              let authors = book.volumeInfo?.authors || [];
              let primaryAuthor =
                authors.length > 0
                  ? authors[0].toLowerCase().trim()
                  : "unknown";

              let cover = book.volumeInfo?.imageLinks?.thumbnail || null;

              const isJunk =
                normalizedTitle.includes("summary") ||
                normalizedTitle.includes("study guide") ||
                normalizedTitle.includes("analysis") ||
                normalizedTitle.includes("cliffsnotes") ||
                normalizedTitle.includes("reference");

              if (
                cover &&
                !seenTitles.has(normalizedTitle) &&
                !seenAuthors.has(primaryAuthor) &&
                !isJunk
              ) {
                cover = cover
                  .replace("http:", "https:")
                  .replace("&edge=curl", "");

                formattedData.push({
                  id: book.id,
                  title: title,
                  imageUrl: cover,
                });
                seenTitles.add(normalizedTitle);
                seenAuthors.add(primaryAuthor);
              }
            });

            moreAvailable = data.items && data.items.length > 0;
          }
        } else {
          formattedData = (data.results || []).map((item) => ({
            id: item.id,
            title: item.title || item.name,
            imageUrl: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : null,
          }));
          // TMDB tells us exactly how many pages exist!
          moreAvailable = data.page < data.total_pages;
        }

        // 5. Append new items to the grid (and block duplicates!)
        if (page === 1) {
          setItems(formattedData);
        } else {
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const existingTitles = new Set(prev.map(item => item.title.toLowerCase().trim()));
            const newItems = formattedData.filter(item => 
              !existingIds.has(item.id) && !existingTitles.has(item.title.toLowerCase().trim())
            );
            return [...prev, ...newItems];
          });
        }

        setHasMore(moreAvailable);
      } catch (error) {
        console.error("Error fetching view all:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchFullList();
  }, [endpoint, category, page]); // React automatically runs this effect again whenever "page" changes!

  if (!endpoint) {
    return (
      <div className="text-center mt-32 text-zinc-500">
        <p className="text-xl mb-4">Oops! We lost the data.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-red-600 hover:text-red-500 font-bold px-6 py-2 border border-red-600 rounded transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 w-full mt-8 pb-20">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-zinc-500 hover:text-zinc-300 transition text-sm font-semibold uppercase tracking-wider"
        >
          ← Back
        </button>
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-red-600 pl-3 uppercase tracking-wider text-white">
          {title || "Collection"}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 justify-center justify-items-center">
            {items.map((item) => (
              <DiscoverCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                category={category}
              />
            ))}
          </div>

          {/* --- THE NEW LOAD MORE BUTTON --- */}
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLoadingMore}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                  isLoadingMore
                    ? "bg-zinc-800 text-zinc-500 cursor-wait border border-zinc-700"
                    : `bg-${themeColor}-600 hover:bg-${themeColor}-500 hover:scale-105`
                }`}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
