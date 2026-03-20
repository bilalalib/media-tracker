import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Discover from './components/Discover'
import MyList from './components/MyList'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/mylist" element={<MyList />} />
      </Routes>
      
    </div>
  )
}

export default App