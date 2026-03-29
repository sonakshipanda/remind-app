import { useState, useEffect } from "react";
import { formatDate, formatTime } from "../utils/formatDate";
import api from "../utils/api";

function groupByDate(entries) {
  return entries.reduce((acc, e) => {
    const d = formatDate(e.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});
}

export default function AllEntries({ onLog }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarEntry, setSimilarEntry] = useState(null);

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
          ts: e.createdAt,
          similarEntries: e.similarEntries || [],
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
      if (similarEntry?.id === id) setSimilarEntry(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  if (loading) return <div className="text-sm text-[#4A4A4A] py-6">Loading...</div>;

  const grouped = groupByDate(entries);
  const dates = Object.keys(grouped);

  return (
    <div>
      {dates.length === 0 ? (
        <div className="bg-white rounded-xl p-5 max-w-lg shadow-sm">
          <p className="text-sm text-[#4A4A4A]">No entries found.</p>
          <span className="text-sm text-[#BBD4CE] underline cursor-pointer" onClick={onLog}>Log an entry to get started!</span>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#4A4A4A] mb-2">{date}</p>
            <div className="flex flex-col gap-2">
              {grouped[date].map((e) => (
                <div key={e.id} className="bg-[#F2EFE9] rounded-xl px-4 py-3 flex justify-between items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-[#1D1D1D] font-medium">{e.habit}</p>
                    {e.note && <p className="text-xs text-[#4A4A4A] mt-0.5">{e.note}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      {e.emotionTag && <span className="bg-[#2E2E2E] text-white px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">{e.emotionTag}</span>}
                      {e.trigger && <span className="bg-[#E8E4DC] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">{e.trigger}</span>}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-1.5">
<button onClick={() => handleDelete(e.id)} className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded text-[#4A4A4A] bg-none cursor-pointer hover:bg-[#FAD7D3] text-sm">🗑</button>
                        <button onClick={() => setSimilarEntry(e)} className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded text-[#4A4A4A] bg-none cursor-pointer hover:bg-[#F2EFE9] text-sm">⋮</button>
                      </div>
                      <span className="text-xs text-[#4A4A4A]">{formatTime(e.ts)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}