import { useState } from "react";
import { formatDate, formatTime } from "../utils/formatDate";

const FILTER_OPTIONS = [
  "All Tags",
  "communication",
  "work & productivity",
  "relationships",
  "conflicts & arguments",
  "social media",
  "health & self-care",
  "academic",
  "decisions & choices",
  "reactions & responses",
  "finance",
];

const ALL_TAGS = [
  "communication",
  "work & productivity",
  "relationships",
  "conflicts & arguments",
  "social media",
  "health & self-care",
  "finance",
  "academic",
  "decisions & choices",
  "reactions & responses",
];

const TAG_SHORT = {
  "communication": "comm.",
  "work & productivity": "work & prod.",
  "relationships": "relation.",
  "conflicts & arguments": "conflicts & arg.",
  "social media": "social media",
  "health & self-care": "health & self-care",
  "finance": "finance",
  "academic": "academic",
  "decisions & choices": "decisions & choices",
  "reactions & responses": "reactions & resp.",
};

export default function Insights({ entries, onLog }) {
  const [filter, setFilter] = useState("All Tags");
  const [filterOpen, setFilterOpen] = useState(false);

  // Top triggers
  const triggerCounts = entries
    .map((e) => e.trigger)
    .filter(Boolean)
    .reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  // Tag counts for bar chart
  const tagCounts = ALL_TAGS.map((tag) => ({
    tag,
    short: TAG_SHORT[tag],
    count: entries.filter((e) => e.emotionTag === tag).length,
  }));
  const maxCount = Math.max(...tagCounts.map((t) => t.count), 1);

  // Filtered entries
  const filteredEntries = filter === "All Tags"
    ? entries
    : entries.filter((e) => e.emotionTag === filter);

  // Group by date
  const grouped = filteredEntries.reduce((acc, e) => {
    const d = formatDate(e.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  if (entries.length === 0) {
    return (
      <div>
        <div className="bg-[#F2EFE9] rounded-2xl p-8 font-semibold text-[#BBD4CE] text-lg leading-relaxed">
          <p>No data to be shown.</p>
          <p>Log an entry to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top row: Entry History + Top Triggers */}
      <div className="grid grid-cols-[1fr_220px] gap-5 items-start mb-6">

        {/* Entry History */}
        <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-sans text-xl">Entry History</h2>

            {/* Filter dropdown */}
            <div className="relative w-44">
              <div
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex justify-between items-center px-3.5 py-2.5 border rounded-xl bg-[#F2EFE9] text-sm cursor-pointer select-none transition-all
                  ${filterOpen ? "border-[#BBD4CE] rounded-b-none" : "border-[#E0E0E0] hover:border-[#aaa]"}`}
              >
                {filter === "All Tags" ? (
                  <span className="text-[#4A4A4A]">Filter</span>
                ) : (
                  <span className="bg-[#F2EFE9] border border-[#E0E0E0] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs">{filter}</span>
                )}
                <span className="text-xs text-[#4A4A4A]">{filterOpen ? "▲" : "▼"}</span>
              </div>
              {filterOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#F2EFE9] border border-[#BBD4CE] border-t-0 rounded-b-xl max-h-52 overflow-y-auto z-50 shadow-md">
                  {FILTER_OPTIONS.map((o) => (
                    <div
                      key={o}
                      onClick={() => { setFilter(o); setFilterOpen(false); }}
                      className={`px-3.5 py-2.5 text-sm cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-[#E8E4DC] transition-colors
                        ${filter === o ? "font-bold" : ""}`}
                    >
                      {o}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-[#4A4A4A]">No entries match this filter.</p>
          ) : (
            Object.entries(grouped).map(([date, dayEntries]) => (
              <div key={date}>
                <p className="text-xs tracking-widest uppercase text-[#4A4A4A] mt-3 mb-1">{date}</p>
                {dayEntries.map((e) => (
                  <div key={e.id} className="flex justify-between items-start py-3 border-b border-black/6 last:border-b-0 gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-[#1D1D1D]">{e.habit}</p>
                      {e.note && <p className="text-xs text-[#4A4A4A] mt-0.5">{e.note}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {e.emotionTag && (
                        <span className="bg-[#F2EFE9] border border-[#E0E0E0] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                          {e.emotionTag}
                        </span>
                      )}
                      <span className="text-xs text-[#4A4A4A]">{formatTime(e.ts)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Top Triggers */}
        <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
          <p className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A] mb-3">Your Top Triggers:</p>
          {topTriggers.length === 0 ? (
            <p className="text-xs text-[#4A4A4A]">Log entries to see your top triggers</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topTriggers.map((t, i) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="text-xs text-[#4A4A4A] w-4">{i + 1}.</span>
                  <span className="bg-[#4A4A4A] border border-[#E0E0E0] text-[#F2EFE9] px-2.5 py-0.5 rounded-full text-xs">{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
        <h2 className="font-sans text-xl mb-5">Entries By Tag</h2>
        <div className="flex items-end gap-2 h-36 pb-1">
          {tagCounts.map(({ tag, short, count }) => (
            <div key={tag} className="flex flex-col items-center flex-1 gap-1.5 h-full">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full bg-[#F9B4AB] rounded-t hover:bg-[#E08478] cursor-pointer transition-colors"
                  style={{ height: `${(count / maxCount) * 100}%`, minHeight: "2px" }}
                  title={`${tag}: ${count}`}
                />
              </div>
              <span className="text-[0.58rem] text-[#4A4A4A] text-center leading-tight break-words">{short}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#4A4A4A] mt-2 tracking-wide">Emotional tags</p>
      </div>
    </div>
  );
}
