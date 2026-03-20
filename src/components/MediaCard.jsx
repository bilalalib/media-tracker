export default function MediaCard({ id, title, type, status, imageUrl, isSavedPage, onRemove }) {
  
  const handleSave = () => {
    try {
      const storedString = localStorage.getItem('nexus_tracker_list');
      let existingList = [];
      
      if (storedString) {
        existingList = JSON.parse(storedString);
      }

      const isAlreadySaved = existingList.find((item) => item.id === id);
      if (isAlreadySaved) {
        alert(`${title} is already in your list!`);
        return;
      }

      const newMangaToSave = { id, title, type, status, imageUrl };
      const updatedList = [...existingList, newMangaToSave];
      localStorage.setItem('nexus_tracker_list', JSON.stringify(updatedList));
      
      alert(`Added ${title} to your list!`);
    } catch (error) {
      console.error("CRASH DURING SAVE:", error);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition group flex flex-col shadow-md">
      
      <div className="h-64 bg-zinc-800 relative cursor-pointer">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold text-xl">
            No Cover
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg truncate" title={title}>{title}</h3>
          <p className="text-sm text-zinc-400 mt-1">{type} • {status}</p>
        </div>
        
        {isSavedPage ? (
          <button 
            onClick={() => onRemove(id)}
            className="mt-4 w-full bg-zinc-800 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
          >
            Remove
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
          >
            Track Series
          </button>
        )}
      </div>

    </div>
  )
}