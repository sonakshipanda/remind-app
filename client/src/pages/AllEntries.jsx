import { useState, useEffect, useRef } from "react";
import { formatDate, formatTime } from "../utils/formatDate";
import api from "../utils/api";
import EMOTION_COLORS from "../utils/emotionColors";

const CATEGORIES = [
  "All Entries",
  "Communication",
  "Work & Productivity",
  "Relationships",
  "Conflicts & Arguments",
  "Social Media",
  "Health & Self-Care",
  "Finance",
  "Academic",
  "Decisions & Choices",
  "Reactions & Responses",
];

const SORT_OPTIONS = ["newest first", "oldest first", "emotion"];

function groupByDate(entries) {
  return entries.reduce((acc, e) => {
    const d = formatDate(e.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});
}

function groupByEmotion(entries) {
  return entries.reduce((acc, e) => {
    const key = e.emotionTag || "no emotion";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
}

function CustomDropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ minWidth: "160px" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border-none cursor-pointer"
        style={{ backgroundColor: "#F2EFE9", color: "#4A4A4A" }}
      >
        <span>{value || placeholder}</span>
        <span className="ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-lg z-50 w-full overflow-hidden shadow-md"
          style={{ backgroundColor: "#F2EFE9" }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs border-none cursor-pointer transition-opacity hover:opacity-75"
                style={{
                  backgroundColor: "#F2EFE9",
                  color: "#4A4A4A",
                  borderLeft: isSelected ? "3px solid #F9B4AB" : "3px solid transparent",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const COLLAPSED_LIMIT = 3;

function DateGroup({ date, entries, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = entries.length - COLLAPSED_LIMIT;
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="mb-6 flex gap-4">
      <div className="flex flex-col items-center" style={{ width: "12px", marginTop: "4px" }}>
        <div className="rounded-full shrink-0" style={{ width: "10px", height: "10px", backgroundColor: "#264E70" }} />
        <div className="flex-1 w-px mt-1" style={{ backgroundColor: "#264E70", opacity: 0.3 }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[0.68rem] font-semibold tracking-widest uppercase mb-2" style={{ color: "#2E2E2E" }}>
          {date}
        </p>
        <div className="flex flex-col">
          {visible.map((e, i) => {
            const emotionColor = EMOTION_COLORS[e.emotionTag?.toLowerCase()] || "#4A5C5C";
            const isFirst = i === 0;
            const isLast = i === visible.length - 1;
            const hasExpander = entries.length > COLLAPSED_LIMIT;
            return (
              <div
                key={e.id}
                className="px-4 py-3"
                style={{
                  backgroundColor: "#F2EFE9",
                  borderBottom: i < visible.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  borderRadius: isFirst && isLast ? "12px"
                    : isFirst ? "12px 12px 0 0"
                    : isLast && !hasExpander ? "0 0 12px 12px"
                    : "0",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug" style={{ color: "#1D1D1D" }}>
                      {e.habit}
                    </p>
                    {e.note && (
                      <>
                        <div className="my-1.5" style={{ borderTop: "1px solid #7B7A79", opacity: 0.3 }} />
                        <p className="text-[0.78rem] italic leading-snug" style={{ color: "#4A4A4A" }}>
                          {e.note}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-start gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      {e.emotionTag && (
                        <span
                          className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono"
                          style={{ backgroundColor: emotionColor, color: "#F2EFE9" }}
                        >
                          {e.emotionTag}
                        </span>
                      )}
                      {e.trigger && (
                        <span
                          className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono"
                          style={{ backgroundColor: "#E1DED9", color: "#4A4A4A" }}
                        >
                          {e.trigger}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>
                        {formatTime(e.ts)}
                      </span>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="text-sm bg-transparent border-none cursor-pointer transition-opacity hover:opacity-60 p-0"
                        style={{ color: "#4A4A4A" }}
                        title="Delete entry"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {entries.length > COLLAPSED_LIMIT && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full text-center py-2.5 text-[0.75rem] border-none cursor-pointer transition-opacity hover:opacity-75"
              style={{
                backgroundColor: "#F2EFE9",
                color: "#4A4A4A",
                borderRadius: "0 0 12px 12px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {expanded ? "collapse —" : `${hidden} more entries — click to expand`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AllEntries({ onLog }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("All Entries");
  const [sort, setSort] = useState("newest first");

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await api.get("/entries");
        const mapped = res.data.map((e) => ({
          id: e._id,
          habit: e.description,
          note: e.desiredAction || "",
          emotionTag: e.emotionalState || "",
          trigger: e.trigger || "",
          category: e.category || "",
          ts: e.createdAt,
        }));
        setEntries(mapped);
      } catch (err) {
        console.error("AllEntries fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  async function handleDelete(id) {
    try {
      await api.delete(`/entries/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  if (loading) return <div className="text-sm py-6 px-8" style={{ color: "#4A4A4A" }}>Loading...</div>;

  let filtered = entries;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) => e.habit.toLowerCase().includes(q) || e.note.toLowerCase().includes(q)
    );
  }
  if (filter && filter.toLowerCase() !== "all entries") {
    filtered = filtered.filter(
      (e) => e.category?.toLowerCase() === filter.toLowerCase()
    );
  }

  let sorted = [...filtered];
  if (sort === "newest first") {
    sorted.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  } else if (sort === "oldest first") {
    sorted.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  } else if (sort === "emotion") {
    sorted.sort((a, b) => (a.emotionTag || "").localeCompare(b.emotionTag || ""));
  }

  const isEmotionSort = sort === "emotion";

  return (
    <div className="min-h-screen px-8 py-8" style={{ backgroundColor: "#FFFCF7" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#1D1D1D" }}>All Entries</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="search entries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setSearch(searchInput); }}
            className="px-3 py-2 rounded-lg text-xs outline-none border-none"
            style={{ backgroundColor: "#FFFCF7", color: "#4A4A4A", width: "160px" }}
          />
          <CustomDropdown
            value={filter}
            options={CATEGORIES.map((c) => c.toLowerCase())}
            onChange={(val) => setFilter(val)}
            placeholder="filter"
          />
          <CustomDropdown
            value={`sort: ${sort}`}
            options={SORT_OPTIONS.map((o) => `sort: ${o}`)}
            onChange={(val) => setSort(val.replace("sort: ", ""))}
            placeholder="sort: newest first"
          />
        </div>
      </div>

      {/* Entries */}
      {sorted.length === 0 ? (
        <div className="rounded-xl px-5 py-8 text-center" style={{ backgroundColor: "#F2EFE9" }}>
          <p className="text-sm mb-1" style={{ color: "#4A4A4A" }}>No entries found.</p>
          <button
            onClick={onLog}
            className="text-sm underline bg-transparent border-none cursor-pointer"
            style={{ color: "#4A4A4A" }}
          >
            Log an entry to get started!
          </button>
        </div>
      ) : isEmotionSort ? (
        Object.entries(groupByEmotion(sorted)).map(([emotion, group]) => (
          <div key={emotion} className="mb-6 flex gap-4">
            <div className="flex flex-col items-center" style={{ width: "12px", marginTop: "4px" }}>
              <div className="rounded-full shrink-0" style={{ width: "10px", height: "10px", backgroundColor: "#264E70" }} />
              <div className="flex-1 w-px mt-1" style={{ backgroundColor: "#264E70", opacity: 0.3 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.68rem] font-semibold tracking-widest uppercase mb-2" style={{ color: "#2E2E2E" }}>
                {emotion} ({group.length})
              </p>
              <div className="flex flex-col">
                {group.map((e, i) => {
                  const emotionColor = EMOTION_COLORS[e.emotionTag?.toLowerCase()] || "#4A5C5C";
                  return (
                    <div
                      key={e.id}
                      className="px-4 py-3"
                      style={{
                        backgroundColor: "#F2EFE9",
                        borderBottom: i < group.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                        borderRadius: i === 0 && group.length === 1 ? "12px"
                          : i === 0 ? "12px 12px 0 0"
                          : i === group.length - 1 ? "0 0 12px 12px"
                          : "0",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.68rem] mb-1" style={{ color: "#4A4A4A" }}>
                            {formatDate(e.ts)} • {formatTime(e.ts)}
                          </p>
                          <p className="text-sm font-medium leading-snug" style={{ color: "#1D1D1D" }}>
                            {e.habit}
                          </p>
                          {e.note && (
                            <>
                              <div className="my-1.5" style={{ borderTop: "1px solid #7B7A79", opacity: 0.3 }} />
                              <p className="text-[0.78rem] italic leading-snug" style={{ color: "#4A4A4A" }}>
                                {e.note}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-start gap-3 shrink-0">
                          <div className="flex flex-col items-end gap-1">
                            {e.emotionTag && (
                              <span
                                className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono"
                                style={{ backgroundColor: emotionColor, color: "#F2EFE9" }}
                              >
                                {e.emotionTag}
                              </span>
                            )}
                            {e.trigger && (
                              <span
                                className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono"
                                style={{ backgroundColor: "#E1DED9", color: "#4A4A4A" }}
                              >
                                {e.trigger}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>
                              {formatTime(e.ts)}
                            </span>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="text-sm bg-transparent border-none cursor-pointer transition-opacity hover:opacity-60 p-0"
                              style={{ color: "#4A4A4A" }}
                              title="Delete entry"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      ) : (
        Object.entries(groupByDate(sorted)).map(([date, group]) => (
          <DateGroup key={date} date={date} entries={group} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
