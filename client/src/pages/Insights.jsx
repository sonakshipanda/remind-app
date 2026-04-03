import { useState, useEffect } from "react";
import { formatDate, formatTime } from "../utils/formatDate";
import api from "../utils/api";

const FILTER_OPTIONS = [
  "All Tags",
  "Tired / Exhausted",
  "Frustrated",
  "Anxious / Stressed",
  "Angry",
  "Sad / Low Mood",
  "Embarrassed",
  "Excited / Impulsive",
  "Lonely",
  "Overwhelmed",
  "Insecure",
  "Under pressure / deadline",
  "After an argument",
  "Late at night",
  "Under the influence",
  "In public / social setting",
  "Alone",
  "Reacting to someone else",
  "On my phone / online",
  "First thing in the morning",
  "After receiving bad news",
];

const ALL_TAGS = [
  "Tired / Exhausted",
  "Frustrated",
  "Anxious / Stressed",
  "Angry",
  "Sad / Low Mood",
  "Embarrassed",
  "Excited / Impulsive",
  "Lonely",
  "Overwhelmed",
  "Insecure",
  "Under pressure / deadline",
  "After an argument",
  "Late at night",
  "Under the influence",
  "In public / social setting",
  "Alone",
  "Reacting to someone else",
  "On my phone / online",
  "First thing in the morning",
  "After receiving bad news",
];

const TAG_SHORT = {
  "Tired / Exhausted": "tired",
  "Frustrated": "frustrated",
  "Anxious / Stressed": "anxious",
  "Angry": "angry",
  "Sad / Low Mood": "sad",
  "Embarrassed": "embarrassed",
  "Excited / Impulsive": "excited",
  "Lonely": "lonely",
  "Overwhelmed": "overwhelmed",
  "Insecure": "insecure",
  "Under pressure / deadline": "pressure",
  "After an argument": "argument",
  "Late at night": "late night",
  "Under the influence": "influenced",
  "In public / social setting": "public",
  "Alone": "alone",
  "Reacting to someone else": "reacting",
  "On my phone / online": "online",
  "First thing in the morning": "morning",
  "After receiving bad news": "bad news",
};

export default function Insights({ onLog }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("All Tags");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/entries")
      .then((res) => {
        const mapped = res.data.map((e) => ({
          id: e._id,
          habit: e.description,
          note: e.desiredAction || "",
          emotionTag: e.emotionalState || "",
          trigger: e.trigger || "",
          ts: e.createdAt,
        }));
        setEntries(mapped);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const norm = (s) => (s || "").trim().toLowerCase();

  const triggerCounts = entries
    .map((e) => e.trigger)
    .filter(Boolean)
    .reduce((acc, t) => {
      const key = ALL_TAGS.find((tag) => norm(tag) === norm(t)) || t;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  const tagCounts = ALL_TAGS.map((tag) => ({
    tag,
    short: TAG_SHORT[tag],
    count: entries.filter((e) => norm(e.trigger) === norm(tag)).length,
  }));
  const maxCount = Math.max(...tagCounts.map((t) => t.count), 1);

  const filteredEntries = filter === "All Tags"
    ? entries
    : entries.filter((e) => norm(e.trigger) === norm(filter) || norm(e.emotionTag) === norm(filter));

  const grouped = filteredEntries.reduce((acc, e) => {
    const d = formatDate(e.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  if (loading) return <div className="text-sm text-[#4A4A4A] py-6">Loading...</div>;

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
      <div className="grid grid-cols-[1fr_220px] gap-5 items-start mb-6">
        <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-sans text-xl">Entry History</h2>
            <div className="relative w-44">
              <div
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex justify-between items-center px-3.5 py-2.5 border rounded-xl bg-[#F2EFE9] text-sm cursor-pointer select-none transition-all
                  ${filterOpen ? "border-[#BBD4CE] rounded-b-none" : "border-[#E0E0E0] hover:border-[#aaa]"}`}
              >
                {filter === "All Tags" ? (
                  <span className="text-[#4A4A4A]">Filter</span>
                ) : (
                  <span className="bg-[#4A4A4A] text-white px-2.5 py-0.5 rounded-full text-xs">{filter}</span>
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
                        ${filter === o ? "bg-[#E8E4DC] font-medium" : ""}`}
                    >
                      {o === "All Tags" ? "All Tags" : (
                        <span className="bg-[#4A4A4A] text-white px-2.5 py-0.5 rounded-full text-xs">{o}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-sm text-[#4A4A4A] py-4">No entries match this filter.</p>
          ) : (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-5">
                <p className="text-xs tracking-widest uppercase text-[#4A4A4A] mb-2">{date}</p>
                <div className="flex flex-col gap-2">
                  {items.map((e) => (
                    <div key={e.id} className="bg-white rounded-xl px-4 py-3 flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-[#1D1D1D] font-medium">{e.habit}</p>
                        {e.note && <p className="text-xs text-[#4A4A4A] mt-0.5">{e.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {e.emotionTag && (
                          <span className="bg-[#2E2E2E] text-white px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">{e.emotionTag}</span>
                        )}
                        {e.trigger && (
                          <span className="bg-[#E8E4DC] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">{e.trigger}</span>
                        )}
                        <span className="text-xs text-[#4A4A4A]">{formatTime(e.ts)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
            <p className="font-mono text-[0.7rem] tracking-widest uppercase text-[#4A4A4A] mb-3">Top Triggers</p>
            {topTriggers.length === 0 ? (
              <p className="text-sm text-[#4A4A4A]">Not enough data yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {topTriggers.map((t, i) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4A4A4A] w-4">{i + 1}.</span>
                    <span className="bg-[#4A4A4A] text-white px-2.5 py-0.5 rounded-full text-xs">{t}</span>
                    <span className="text-xs text-[#4A4A4A]">({triggerCounts[t]})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
        <p className="font-mono text-[0.7rem] tracking-widest uppercase text-[#4A4A4A] mb-4">Entries By Tag</p>
        <div className="flex items-end gap-1.5" style={{ height: "144px" }}>
          {tagCounts.map(({ tag, short, count }) => (
            <div key={tag} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
              <span className="text-[0.6rem] text-[#4A4A4A]">{count}</span>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: count > 0 ? `${Math.max((count / maxCount) * 100, 8)}%` : "4%",
                    backgroundColor: count > 0 ? "#F9B4AB" : "#E0E0E0",
                  }}
                />
              </div>
              <span className="text-[0.55rem] text-[#4A4A4A] text-center leading-tight" title={tag}>{short}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
