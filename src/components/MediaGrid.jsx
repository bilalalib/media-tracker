import MediaCard from "./MediaCard";

export default function MediaGrid(){
    return(
        <main className="max-w-6xl mx-auto p-6">
            <h2 className="text-xl font-semibold mb-6 border-l-4 border-red-600 pl-2">Currently Reading</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <MediaCard title="Vagabond" type="Seinen" status="Reading" />
                <MediaCard title="Chainsaw Man" type="Shonen" status="Reading" />
                <MediaCard title="Berserk" type="Seinen" status="Reading" />
                <MediaCard title="Attack on Titan" type="Shonen" status="Completed" />
                <MediaCard title="Death Note" type="Shonen" status="Completed" />
                <MediaCard title="Tokyo Ghoul" type="Seinen" status="Completed" />
                <MediaCard title="Jujutsu Kaisen" type="Shonen" status="Completed" />
            </div>
        </main>
    )
}