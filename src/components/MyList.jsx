import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";

export default function MyList() {
  const [savedMedia, setSavedMedia] = useState([]);

  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const storedData = localStorage.getItem("nexus_tracker_list");
    if (storedData) {
      setSavedMedia(JSON.parse(storedData));
    }
  }, []);

  const handleRemoveFromList = (idToRemove) => {
    const updatedList = savedMedia.filter((manga) => manga.id !== idToRemove);
    setSavedMedia(updatedList);
    localStorage.setItem("nexus_tracker_list", JSON.stringify(updatedList));
  };

  const handleStatusChange = (idToUpdate, newStatus) => {
    const updatedList = savedMedia.map((manga) => {
      if (String(manga.id) === String(idToUpdate)) {
        return { ...manga, trackingStatus: newStatus };
      }
      return manga;
    });
    setSavedMedia(updatedList);
    localStorage.setItem("nexus_tracker_list", JSON.stringify(updatedList));
  };

  const filteredMedia = savedMedia.filter((manga) => {
    if (activeFilter === "All") {
      return true;
    }
    return manga.trackingStatus === activeFilter;
  });

  const filterOptions = [
    "All",
    "Reading",
    "Completed",
    "Plan to Read",
    "On Hold",
  ];

  return (
    <main className="max-w-6xl mx-auto p-6 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-xl font-semibold border-l-4 border-red-600 pl-3">My Tracked Series</h2>
        
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
      </div>
      
      {filteredMedia.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <p className="text-xl">No series found.</p>
          {activeFilter !== 'All' && <p className="mt-2">You don't have any manga marked as "{activeFilter}".</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          {filteredMedia.map((manga) => (
            <MediaCard 
              key={manga.id}
              id={manga.id}
              title={manga.title}
              type={manga.type}
              status={manga.status}
              imageUrl={manga.imageUrl}
              trackingStatus={manga.trackingStatus} 
              isSavedPage={true} 
              onRemove={handleRemoveFromList} 
              onStatusChange={handleStatusChange} 
            />
          ))}
        </div>
      )}
    </main>
  )
}
