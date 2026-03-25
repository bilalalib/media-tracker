import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900 p-3 sm:p-4 shadow-sm print:hidden">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <Link to="/">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 tracking-wider text-center">
            MY MEDIA TRACKER
          </h1>
        </Link>
        <nav>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-zinc-400">
            <li>
              <Link to="/" className="hover:text-white transition">Dashboard</Link>
            </li>
            <li>
              <Link to="/manga" className="hover:text-white transition">Discover</Link>
            </li>
            <li>
              <Link to="/mylist" className="hover:text-white transition">My List</Link>
            </li>
            <li className="hover:text-white cursor-pointer transition">
              <Link to="/account" className="text-zinc-400 hover:text-white transition">Account</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}