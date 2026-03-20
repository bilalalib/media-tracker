import { useState } from 'react'
import MediaGrid from './MediaGrid'

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <input 
          type="text" 
          placeholder="Search for manga..." 
          className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-red-600 transition shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <MediaGrid searchQuery={searchQuery} />
    </>
  )
}