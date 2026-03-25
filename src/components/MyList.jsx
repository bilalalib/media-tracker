import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MediaCard from './MediaCard'
import { supabase } from '../supabase'

export default function MyList() {
  const [savedMedia, setSavedMedia] = useState([])
  const [activeTab, setActiveTab] = useState('manga') // 'manga', 'movie', or 'show'
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchMyList('manga') // Default to manga on load
      } else {
        setIsLoading(false)
      }
    })
  }, [])

  const fetchMyList = async (category) => {
    setIsLoading(true)
    setSavedMedia([])
    
    // Determine the exact table to pull from
    let tableName = 'tracked_manga'
    if (category === 'movie') tableName = 'tracked_movies'
    if (category === 'show') tableName = 'tracked_shows'

    const { data, error } = await supabase.from(tableName).select('*')
    
    if (error) {
      console.error("Error fetching:", error)
    } else {
      // Normalizing the database fields so MediaCard understands them!
      const normalizedData = data.map(item => ({
        id: category === 'manga' ? item.id : item.tmdb_id, // Map the correct ID column
        title: item.title,
        imageUrl: item.imageUrl || item.image_url,
        trackingStatus: item.trackingStatus || item.tracking_status || (category === 'manga' ? 'Reading' : 'Watching'),
        rating: item.rating || 0,
        notes: item.notes || '',
        type: item.type || (category === 'movie' ? 'Movie' : category === 'show' ? 'TV Show' : 'Manga')
      }))
      setSavedMedia(normalizedData || [])
    }
    setIsLoading(false)
  }

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setActiveFilter('All')
    fetchMyList(tab)
  }

  const handleRemoveFromList = async (idToRemove) => {
    setSavedMedia((prev) => prev.filter((item) => String(item.id) !== String(idToRemove)))
    
    let tableName = 'tracked_manga'
    let idColumn = 'id'
    if (activeTab === 'movie') { tableName = 'tracked_movies'; idColumn = 'tmdb_id'; }
    if (activeTab === 'show') { tableName = 'tracked_shows'; idColumn = 'tmdb_id'; }

    const { error } = await supabase.from(tableName).delete().eq(idColumn, idToRemove)
    if (error) console.error("Error deleting:", error)
  }

  const handleUpdate = async (idToUpdate, field, newValue) => {
    // 1. Update the UI instantly
    setSavedMedia((prev) => prev.map((item) => {
      if (String(item.id) === String(idToUpdate)) {
        return { ...item, [field]: newValue } 
      }
      return item
    }))
    
    // 2. Determine where to update in the database
    let tableName = 'tracked_manga'
    let idColumn = 'id'
    let dbField = field

    if (activeTab === 'movie') { tableName = 'tracked_movies'; idColumn = 'tmdb_id'; }
    if (activeTab === 'show') { tableName = 'tracked_shows'; idColumn = 'tmdb_id'; }
    
    // Catching the camelCase vs snake_case difference
    if (field === 'trackingStatus' && activeTab !== 'manga') dbField = 'tracking_status'

    const { error } = await supabase.from(tableName).update({ [dbField]: newValue }).eq(idColumn, idToUpdate)
    if (error) console.error("Error updating:", error)
  }

  // Filter and Sort Logic
  let processedMedia = savedMedia.filter((item) => {
    if (activeFilter === 'All') return true
    return item.trackingStatus === activeFilter
  })

  if (sortBy === 'Highest Rated') {
    processedMedia.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sortBy === 'Lowest Rated') {
    processedMedia.sort((a, b) => (a.rating || 0) - (b.rating || 0))
  }

  // Dynamic filter verbs
  const filterOptions = ['All', activeTab === 'manga' ? 'Reading' : 'Watching', 'Completed', activeTab === 'manga' ? 'Plan to Read' : 'Plan to Watch', 'Dropped']

  if (!isLoading && !session) {
    return (
      <main className="max-w-xl mx-auto px-6 mt-32 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">You are not logged in</h2>
        <p className="text-zinc-400 mb-8">Please sign in or create an account to view your collection.</p>
        <Link to="/account" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200">
          Go to Account Page
        </Link>
      </main>
    )
  }
  
  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 mt-8 mb-12">
      
      {/* Category Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => handleTabSwitch('manga')} className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'manga' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>Manga</button>
        <button onClick={() => handleTabSwitch('movie')} className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'movie' ? 'bg-cyan-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>Movies</button>
        <button onClick={() => handleTabSwitch('show')} className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'show' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>TV Shows</button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className={`text-xl font-semibold border-l-4 pl-3 ${activeTab === 'manga' ? 'border-red-600' : activeTab === 'movie' ? 'border-cyan-600' : 'border-purple-600'}`}>
          My Tracked {activeTab === 'manga' ? 'Manga' : activeTab === 'movie' ? 'Movies' : 'Shows'}
        </h2>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition duration-200 border ${
                  activeFilter === option 
                    ? (activeTab === 'manga' ? 'bg-red-600 border-red-600 text-white' : activeTab === 'movie' ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-purple-600 border-purple-600 text-white')
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
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-zinc-500"
            >
              <option value="Default">Sort: Default</option>
              <option value="Highest Rated">Sort: Highest Rated</option>
              <option value="Lowest Rated">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
         <div className="text-center text-zinc-500 mt-20 animate-pulse text-xl">Loading your collection...</div>
      ) : processedMedia.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">Your list is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {processedMedia.map((item) => (
            <MediaCard 
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              imageUrl={item.imageUrl}
              trackingStatus={item.trackingStatus}
              rating={item.rating}
              notes={item.notes}
              category={activeTab} // Crucial: Tells the card what colors and logic to use
              onRemove={handleRemoveFromList}
              onUpdate={handleUpdate} 
            />
          ))}
        </div>
      )}
    </main>
  )
}