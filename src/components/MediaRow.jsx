import DiscoverCard from "./DiscoverCard";
import { Link } from "react-router-dom";

export default function MediaRow({
  title,
  endpoint,
  items = [],
  category = "manga",
}) {
  // Skip rendering empty rows
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide uppercase">
          {title}
        </h2>
        {endpoint && (
          <Link
            // Build a readable slug for the view-all route
            to={`/view/${title.toLowerCase().replace(/\s+/g, "-")}`}
            state={{ title: title, endpoint: endpoint }}
            className="text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition"
          >
            View All
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((item) => (
          <DiscoverCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}
