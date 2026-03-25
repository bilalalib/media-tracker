import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import MediaTabs from "./components/MediaTabs";
import DiscoverManga from "./components/DiscoverManga";
import DiscoverMovies from "./components/DiscoverMovies";
import DiscoverShows from "./components/DiscoverShows";
import MyList from "./components/MyList";
import ViewAll from "./components/ViewAll";
import Account from "./components/Account";
import DiscoverBooks from './components/DiscoverBooks'
import Home from "./components/Home";

function App() {
  const location = useLocation();
  const discoverPaths = ['/manga', '/movies', '/shows', '/books'];
  const showTabs = discoverPaths.includes(location.pathname);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Navbar />
      {showTabs && <MediaTabs />}
      {/* App routes */}
      <Routes>
        {/* Default landing route */}
        <Route path="/" element={<Home />} />
        <Route path="/manga" element={<DiscoverManga />} />
        <Route path="/movies" element={<DiscoverMovies />} />
        <Route path="/shows" element={<DiscoverShows />} />
        <Route path="/books" element={<DiscoverBooks />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/mylist/:tab" element={<MyList />} />
        <Route path="/view/:category" element={<ViewAll />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}

export default App;
