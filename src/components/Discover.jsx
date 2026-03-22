import { useState } from "react";
import MediaGrid from "./MediaGrid";
import MediaRow from "./MediaRow";
import Top100List from "./Top100List";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="max-w-7xl mx-auto px-6 mt-8">
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search for manga, manhwa..."
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-red-600 transition shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery.trim() !== "" ? (
        <>
          <MediaGrid searchQuery={searchQuery} />
        </>
      ) : (
        <div className="flex flex-col gap-2 mt-4">
          <MediaRow 
            title="Trending Now" 
            endpoint="https://api.jikan.moe/v4/manga?status=publishing&order_by=members&sort=desc&start_date=2021-01-01" 
          />

          <MediaRow
            title="All Time Popular"
            endpoint="https://api.jikan.moe/v4/top/manga?filter=bypopularity"
          />

          <MediaRow
            title="Popular Manhwa"
            endpoint="https://api.jikan.moe/v4/manga?type=manhwa&order_by=members&sort=desc"
          />

          <Top100List />
        </div>
      )}
    </main>
  );
}
