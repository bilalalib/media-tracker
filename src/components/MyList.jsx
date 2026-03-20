import { useState, useEffect } from 'react'
import MediaCard from './MediaCard'

export default function MyList() {
  const [savedMedia, setSavedMedia] = useState([])

  useEffect(() => {
    const storedData = localStorage.getItem('nexus_tracker_list')
    if (storedData) {
      setSavedMedia(JSON.parse(storedData))
    }
  }, [])

  const handleRemoveFromList = (idToRemove) => {
    const updatedList = savedMedia.filter((manga) => manga.id !== idToRemove)
    
    setSavedMedia(updatedList)
    
    localStorage.setItem('nexus_tracker_list', JSON.stringify(updatedList))
  }

  return (
    <main className="max-w-6xl mx-auto p-6 mt-4">
      <h2 className="text-xl font-semibold mb-6 border-l-4 border-red-600 pl-3">My Tracked Series</h2>
      
      {savedMedia.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">Your list is currently empty.</p>
          <p className="mt-2">Go to the Discover tab to add some manga!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {savedMedia.map((manga) => (
            <MediaCard 
              key={manga.id}
              id={manga.id}
              title={manga.title}
              type={manga.type}
              status={manga.status}
              imageUrl={manga.imageUrl}
              isSavedPage={true}
              onRemove={handleRemoveFromList}
            />
          ))}
        </div>
      )}
    </main>
  )
}