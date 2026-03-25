import { NavLink } from "react-router-dom";

export default function MediaTabs() {
  // Central tab config keeps labels and routes in one place
  const tabs = [
    { name: "Manga & Manhwa", path: "/manga" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/shows" },
  ];

  return (
    <div className="flex justify-center space-x-2 sm:space-x-4 py-4 bg-gray-950 border-b border-gray-800 px-4">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          // Active route gets highlighted pill styling
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
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
