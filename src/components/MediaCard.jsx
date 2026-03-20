export default function MediaCard({title, type, status, imageUrl}){
    return (
      <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-400 transition duration-300">
        
        <div className="h-64 bg-zinc-800 relative">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-bold text-xl group-hover:scale-110 transition duration-300">
                    No Cover
                </div>
            )}
        </div>

        <div className="p-4">
            <h3 className="font-bold text-lg truncate">
                {title}
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
                {type} - {status}
            </p>
        </div>
      </div>
    );
}