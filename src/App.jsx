import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import MediaTabs from './components/MediaTabs'
import DiscoverManga from './components/DiscoverManga'
import DiscoverMovies from './components/DiscoverMovies'
import DiscoverShows from './components/DiscoverShows'
import MyList from './components/MyList'
import ViewAll from './components/ViewAll'
import Account from './components/Account'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Navbar />
      <MediaTabs />
      <Routes>
        <Route path="/" element={<Navigate to="/manga" replace />} />
        <Route path="/manga" element={<DiscoverManga />} />
        <Route path="/movies" element={<DiscoverMovies />} />
        <Route path="/shows" element={<DiscoverShows />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/view/:category" element={<ViewAll />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      
    </div>
  )
}

export default App