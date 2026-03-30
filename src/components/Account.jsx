import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Account() {
  // Auth state
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form + auth feedback
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: "", text: "" });

  // Export-related state
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");

  // Print data: populated when generating visual PDF, cleared after print
  const [printData, setPrintData] = useState(null);

  // Export filter toggles
  const [exportCategories, setExportCategories] = useState({
    manga: true,
    movies: true,
    shows: true,
    books: true,
  });

  // Export column toggles for what fields to include
  const [exportColumns, setExportColumns] = useState({
    title: true,
    type: true,
    status: true,
    rating: true,
    notes: true,
  });

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );

    // Cleanup: clear print data when print dialog closes
    // This ensures print layout doesn't persist in the DOM
    const handleAfterPrint = () => setPrintData(null);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handleAuth = async (e, type) => {
    e.preventDefault();
    // Reset state for fresh attempt
    setLoading(true);
    setAuthMessage({ type: "", text: "" });

    try {
      // Sign up or sign in based on type param
      let error;
      if (type === "signup") {
        const res = await supabase.auth.signUp({ email, password });
        error = res.error;
        // Sign up success shows email verification message
        if (!error)
          setAuthMessage({
            type: "success",
            text: "Check your email for the confirmation link!",
          });
      } else {
        // Direct sign in for existing users
        const res = await supabase.auth.signInWithPassword({ email, password });
        error = res.error;
      }
      if (error) throw error;
    } catch (err) {
      setAuthMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Quick sign out
  const handleSignOut = async () => await supabase.auth.signOut();

  // Toggle helpers for export filters
  const toggleCategory = (cat) =>
    setExportCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  const toggleColumn = (col) =>
    setExportColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  const handleExport = async (format) => {
    // Guard: require at least one column selected
    setExportLoading(true);
    setExportError("");

    const hasColumns = Object.values(exportColumns).some(Boolean);
    if (!hasColumns) {
      setExportError(
        "Please select at least one detail to include in your export.",
      );
      setExportLoading(false);
      return;
    }
    // Collect data from all selected categories

    let allData = [];

    const fetchAndFormat = async (tableName, categoryName) => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", session.user.id);
      // Fetch only this user's data
      if (error) return [];

      return data.map((item) => {
        let formattedItem = {};
        // Keep original image URL for visual PDF rendering
        formattedItem._rawImage = item.imageUrl || item.image_url;

        if (exportColumns.title) formattedItem.Title = item.title;
        if (exportColumns.type)
          formattedItem.Type =
            item.type ||
            (categoryName === "movie"
              ? "Movie"
              : categoryName === "show"
                ? "TV Show"
                : categoryName === "book"
                  ? "Book"
                  : "Manga");
        if (exportColumns.status)
          formattedItem.Status =
            item.trackingStatus || item.tracking_status || "Unknown";
        if (exportColumns.rating)
          formattedItem.Rating = item.rating ? `${item.rating}/10` : "Unrated";
        if (exportColumns.notes) formattedItem.Notes = item.notes || "";
        return formattedItem;
      });
    };

    // Fetch from selected categories in parallel
    if (exportCategories.manga)
      allData = [
        ...allData,
        ...(await fetchAndFormat("tracked_manga", "manga")),
      ];
    if (exportCategories.movies)
      allData = [
        ...allData,
        ...(await fetchAndFormat("tracked_movies", "movie")),
      ];
    if (exportCategories.shows)
      allData = [
        ...allData,
        ...(await fetchAndFormat("tracked_shows", "show")),
      ];
    if (exportCategories.books)
      allData = [
        ...allData,
        ...(await fetchAndFormat("tracked_books", "book")),
      ];

    if (allData.length === 0) {
      // Guard: prevent export with no data
      setExportError("No data found for the selected categories.");
      setExportLoading(false);
      return;
    }

    // Route 1: Visual PDF uses native browser print engine
    if (format === "visual") {
      setPrintData(allData);
      // Wait for images to load in DOM before opening print dialog
      setTimeout(() => {
        window.print();
        setExportLoading(false);
      }, 800);
      return;
    }

    // Routes 2-4: Remove internal print data, export as JSON/CSV/PDF
    const cleanData = allData.map(({ _rawImage, ...rest }) => rest);

    if (format === "json") {
      // JSON format: structured full data
      const blob = new Blob([JSON.stringify(cleanData, null, 2)], {
        type: "application/json",
      });
      triggerDownload(blob, "my_media_tracker.json");
    } else if (format === "csv") {
      // CSV format: spreadsheet-ready
      // Build CSV with quoted fields for safe parsing
      const headers = Object.keys(cleanData[0]);
      const csvRows = [
        headers.join(","),
        ...cleanData.map((row) =>
          headers
            .map((fieldName) => {
              let fieldData =
                row[fieldName] === null || row[fieldName] === undefined
                  ? ""
                  : String(row[fieldName]);
              return `"${fieldData.replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      triggerDownload(blob, "my_media_tracker.csv");
    } else if (format === "pdf") {
      // jsPDF table layout for structured PDF export
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("My Media Tracker Collection", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableColumns = Object.keys(cleanData[0]);
      const tableRows = cleanData.map((item) => Object.values(item));

      doc.autoTable({
        startY: 36,
        head: [tableColumns],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      doc.save("my_media_tracker_data.pdf");
    }

    setExportLoading(false);
  };

  // Trigger browser download for blob data
  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Logged-out UI: sign in/up form
  // Show logged-out auth form
  if (!session) {
    return (
      <main className="max-w-md mx-auto px-6 mt-10 sm:mt-20">
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
            Welcome Back
          </h2>
          {authMessage.text && (
            <div
              // Show success or error feedback inline
              className={`p-3 mb-4 rounded text-sm ${authMessage.type === "error" ? "bg-red-900/50 text-red-200 border border-red-800" : "bg-emerald-900/50 text-emerald-200 border border-emerald-800"}`}
            >
              {authMessage.text}
            </div>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => handleAuth(e, "login")}
          >
            <div>
              <label className="text-zinc-400 text-xs sm:text-sm font-semibold mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs sm:text-sm font-semibold mb-1 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-lg transition mt-2"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            <button
              type="button"
              onClick={(e) => handleAuth(e, "signup")}
              disabled={loading}
              className="w-full bg-transparent border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-lg transition"
            >
              Create Account
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Logged-in UI: dashboard + export controls
       Hidden during print (`print:hidden`) */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 mb-20 print:hidden">
        {/* User info card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Welcome Back!
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Logged in as:{" "}
            <span className="text-white font-medium">{session.user.email}</span>
          </p>
          <button
            onClick={handleSignOut}
            // Sign out + clear session
            className="w-full sm:w-auto px-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        {/* Export controls + format selection */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 border-b border-zinc-800 pb-4">
            📥 Export Your Data
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Download a copy of your tracked collection for your own records.
          </p>

          {exportError && (
            <div className="p-3 mb-6 rounded text-sm bg-red-900/50 text-red-200 border border-red-800">
              {exportError}
            </div>
          )}

          {/* Category + column toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-zinc-200 font-semibold mb-3 text-sm tracking-wide uppercase">
                Include Categories
              </h3>
              <div className="flex flex-col gap-2">
                {Object.keys(exportCategories).map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={exportCategories[cat]}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                    <span className="text-zinc-400 group-hover:text-white transition capitalize text-sm">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-zinc-200 font-semibold mb-3 text-sm tracking-wide uppercase">
                Include Details
              </h3>
              <div className="flex flex-col gap-2">
                {Object.keys(exportColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={exportColumns[col]}
                      onChange={() => toggleColumn(col)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                    <span className="text-zinc-400 group-hover:text-white transition capitalize text-sm">
                      {col}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Export format buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-zinc-800">
            <button
              onClick={() => handleExport("visual")}
              disabled={exportLoading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3.5 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
            >
              📄 Download PDF Report
            </button>

            <button
              onClick={() => handleExport("csv")}
              disabled={exportLoading}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3.5 rounded-lg transition border border-zinc-700 flex items-center justify-center gap-2"
            >
              📊 Export Raw Data (CSV)
            </button>
          </div>
        </div>
      </main>

      {/* Print layout: only shows when printing
       Normal display is `hidden`, but `print:block` clause makes it visible
       in browser print preview / PDF save
      */}
      {printData && (
        <div className="hidden print:block w-full bg-white text-black p-4 sm:p-8 font-sans">
          {/* Professional print header with metadata */}
          <div className="flex justify-between items-end border-b-2 border-red-600 pb-4 mb-8">
            <div>
              {/* User name header (falls back if metadata unavailable) */}
              <h1 className="text-3xl font-black text-red-600 tracking-tight uppercase">
                {session?.user?.user_metadata?.full_name || "Bilal Ahmad"}'s
                Collection
              </h1>
              <h2 className="text-xl font-bold text-gray-800 mt-1">
                Personal Media Tracker
              </h2>
            </div>
            <div className="text-right text-gray-500 text-sm font-medium">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Total Items: {printData.length}</p>
            </div>
          </div>

          {/* 2-column grid for print layout */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {printData.map((item, idx) => (
              <div
                key={idx}
                // Avoid page breaks within items for cleaner print
                className="break-inside-avoid flex items-center gap-4 border-b border-gray-200 pb-4"
              >
                {/* Thumbnail from original source */}
                {item._rawImage ? (
                  <img
                    src={item._rawImage}
                    referrerPolicy="no-referrer"
                    className="w-16 h-24 object-cover rounded shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-100 border border-gray-300 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-[10px]">No Image</span>
                  </div>
                )}

                {/* Media details based on selected export columns */}
                <div className="flex flex-col flex-grow">
                  {exportColumns.title && (
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
                      {item.Title}
                    </h3>
                  )}

                  <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                    {exportColumns.type && (
                      <p>
                        <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider">
                          Type:{" "}
                        </span>{" "}
                        {item.Type}
                      </p>
                    )}
                    {exportColumns.status && (
                      <p>
                        <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider">
                          Status:{" "}
                        </span>{" "}
                        {item.Status}
                      </p>
                    )}
                    {exportColumns.rating && (
                      <p>
                        <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wider">
                          Rating:{" "}
                        </span>{" "}
                        {item.Rating}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtle print footer */}
          <div className="mt-16 pt-4 border-t border-gray-200 flex flex-col items-center text-[10px] text-gray-400 font-medium">
            <p>
              Generated via{" "}
              <span className="font-semibold text-gray-500">
                My Media Tracker
              </span>
            </p>
            <a
              href="https://media-tracker-rust.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 text-[9px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              https://media-tracker-rust.vercel.app
            </a>
            <a
              href="https://github.com/bilalalib"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 text-[9px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Github @bilalalib
            </a>
          </div>
        </div>
      )}
    </>
  );
}
