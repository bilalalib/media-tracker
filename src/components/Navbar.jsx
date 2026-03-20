export default function Navbar() {
    return (
        <header className="border-b border-zinc-800 bg-zinc-900 p-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-red-600 tracking-wider">MY MANGA TRACKER</h1>
                <nav>
                    <ul className="flex space-x-6 text-sm font-medium text-zinc-400">
                        <li className="hover:text-white cursor-pointer transition">My List</li>
                        <li className="hover:text-white cursor-pointer transition">Account</li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}