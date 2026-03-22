import { useState, useEffect } from 'react'

export default function Top100List() {
  const [media, setMedia] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false) 

  useEffect(() => {
    const fetchTopManga = async () => {
      if (page === 1) setIsLoading(true)
      else setIsLoadingMore(true)

      try {
        let response = await fetch(`https://api.jikan.moe/v4/top/manga?page=${page}`)

        if (response.status === 429) {
          await new Promise(res => setTimeout(res, 1500)) 
          response = await fetch(`https://api.jikan.moe/v4/top/manga?page=${page}`)
        }

        const data = await response.json()

        if (data.data) {
          setMedia(prevMedia => [...prevMedia, ...data.data])
        }
      } catch (error) {
        console.error("Error fetching top manga:", error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
    
    fetchTopManga()
  }, [page]) 

  if (isLoading && page === 1) return <div className="animate-pulse bg-zinc-900/30 h-96 rounded-xl mt-8 mb-10"></div>

  return (
    <div className="mt-8 mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-sm font-bold text-zinc-300 tracking-wider uppercase">Top Manga</h2>
        <button className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition">View All</button>
      </div>

      <div className="flex flex-col gap-3">
        {media.map((manga, index) => (
          <div key={`${manga.mal_id}-${index}`} className="flex items-center bg-zinc-900/40 hover:bg-zinc-800/80 transition rounded-lg p-3 gap-4 border border-zinc-800/50">
            
            <div className="text-xl font-bold text-zinc-500 w-8 text-center">#{index + 1}</div>

            <div className="h-16 w-12 flex-shrink-0 rounded overflow-hidden shadow-sm">
              <img src={manga.images?.webp?.image_url} alt={manga.title} className="h-full w-full object-cover" />
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <h3 className="font-semibold text-zinc-200 text-sm md:text-base line-clamp-1">{manga.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {manga.genres.slice(0, 3).map(genre => (
                  <span key={genre.mal_id} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium tracking-wide">
                    {genre.name.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end justify-center w-28">
              <div className="text-green-500 text-sm font-bold flex items-center gap-1.5">
                {manga.score ? Math.round(manga.score * 10) : 0}% 
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">{manga.scored_by?.toLocaleString()} reviews</div>
            </div>

            <div className="hidden sm:flex flex-col items-end justify-center w-32 text-xs text-zinc-400">
              <div className="font-medium text-zinc-300">{manga.type}</div>
              <div className="truncate mt-0.5">{manga.status}</div>
            </div>

          </div>
        ))}
      </div>

      {media.length < 100 && (
        <button 
          onClick={() => setPage(prev => prev + 1)}
          disabled={isLoadingMore}
          className="w-full mt-6 py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm font-semibold text-zinc-300 transition duration-200 disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "Show More (Next 25)"}
        </button>
      )}
    </div>
  )
}