import { useState, useEffect } from 'react'
import MediaCard from './MediaCard'
import { supabase } from '../supabase'

export default function MyList() {
  const [savedMedia, setSavedMedia] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMyList = async () => {
      const { data, error } = await supabase.from('tracked_manga').select('*')
      
      if (error) {
        console.error("Error fetching from Supabase:", error)
      } else {
        setSavedMedia(data || [])
      }
      setIsLoading(false)
    }
    
    fetchMyList()
  }, [])

  const handleRemoveFromList = async (idToRemove) => {
    setSavedMedia((prev) => prev.filter((manga) => String(manga.id) !== String(idToRemove)))
    
    const { error } = await supabase.from('tracked_manga').delete().eq('id', idToRemove)
    if (error) console.error("Error deleting:", error)
  }

  const handleUpdate = async (idToUpdate, field, newValue) => {
    setSavedMedia((prev) => prev.map((manga) => {
      if (String(manga.id) === String(idToUpdate)) {
        return { ...manga, [field]: newValue } 
      }
      return manga
    }))
    
    const { error } = await supabase.from('tracked_manga').update({ [field]: newValue }).eq('id', idToUpdate)
    if (error) console.error("Error updating:", error)
  }

  let processedMedia = savedMedia.filter((manga) => {
    if (activeFilter === 'All') return true
    return manga.trackingStatus === activeFilter
  })

  if (sortBy === 'Highest Rated') {
    processedMedia.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sortBy === 'Lowest Rated') {
    processedMedia.sort((a, b) => (a.rating || 0) - (b.rating || 0))
  }

  const filterOptions = ['All', 'Reading', 'Completed', 'Plan to Read', 'On Hold']

  return (
    <main className="max-w-6xl mx-auto p-6 mt-4 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-xl font-semibold border-l-4 border-red-600 pl-3">My Tracked Series</h2>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition duration-200 border ${
                  activeFilter === option 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-red-600"
            >
              <option value="Default">Sort: Default</option>
              <option value="Highest Rated">Sort: Highest Rated</option>
              <option value="Lowest Rated">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
         <div className="text-center text-zinc-500 mt-20 animate-pulse text-xl">Connecting to Database...</div>
      ) : processedMedia.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">Your list is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {processedMedia.map((manga) => (
            <MediaCard 
              key={manga.id}
              id={manga.id}
              title={manga.title}
              type={manga.type}
              status={manga.status}
              imageUrl={manga.imageUrl}
              trackingStatus={manga.trackingStatus}
              rating={manga.rating}
              notes={manga.notes}
              isSavedPage={true}
              onRemove={handleRemoveFromList}
              onUpdate={handleUpdate} 
            />
          ))}
        </div>
      )}
    </main>
  )
}