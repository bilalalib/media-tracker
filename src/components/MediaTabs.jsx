import { NavLink, useLocation } from "react-router-dom";

export default function MediaTabs() {
  const location = useLocation();

  // 1. Define allowed paths
  const allowedPaths = ["/manga", "/movies", "/shows", "/books"];

  // 2. Check if the CURRENT URL exactly matches one of the allowed paths
  const isAllowed = allowedPaths.includes(location.pathname);

  // 3. The Nuclear Kill Switch
  if (!isAllowed) {
    // This stops React from rendering anything at all
    return null;
  }

  const tabs = [
    { name: "Manga & Manhwa", path: "/manga" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/shows" },
    { name: "Books", path: "/books" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-3 sm:py-4 bg-gray-950 border-b border-gray-800 px-2 sm:px-4">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          className={({ isActive }) =>
            `flex items-center justify-center text-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "bg-white text-black shadow-lg scale-105"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </div>
  );
}