import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900 p-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand link */}
        <Link to="/">
          <h1 className="text-2xl font-bold text-red-600 tracking-wider">
            MY MEDIA TRACKER
          </h1>
        </Link>
        {/* Primary navigation */}
        <nav>
          <ul className="flex space-x-6 text-sm font-medium text-zinc-400">
            <li>
              <Link to="/" className="hover:text-white transition">
                Discover
              </Link>
            </li>
            <li>
              <Link to="/mylist" className="hover:text-white transition">
                My List
              </Link>
            </li>
            <li className="hover:text-white cursor-pointer transition">
              <Link
                to="/account"
                className="text-zinc-400 hover:text-white transition"
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
