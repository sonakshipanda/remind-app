import { useState } from "react";
import { formatDate, formatTime } from "../utils/formatDate";

function groupByDate(entries) {
  return entries.reduce((acc, e) => {
    const d = formatDate(e.ts);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});
}

export default function AllEntries({ entries, onLog }) {
  const [similarEntry, setSimilarEntry] = useState(null);
  const grouped = groupByDate(entries);
  const dates = Object.keys(grouped);

  return (
    <div>
      {dates.length === 0 ? (
        <div className="bg-white rounded-xl p-5 max-w-lg shadow-sm">
          <p className="text-sm text-[#4A4A4A]">No entries found.</p>
          <span
            className="text-sm text-[#BBD4CE] underline cursor-pointer"
            onClick={onLog}
          >Log an entry to get started!</span>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date} className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#4A4A4A] mb-2">{date}</p>
            <div className="flex flex-col gap-2">
              {grouped[date].map((e) => (
                <div
                  key={e.id}
                  className="bg-[#F2EFE9] rounded-xl px-4 py-3 flex justify-between items-center gap-3"
                >
                  {/* Left */}
                  <div className="flex-1">
                    <p className="text-sm text-[#1D1D1D] font-medium">{e.habit}</p>
                    {e.note && <p className="text-xs text-[#4A4A4A] mt-0.5">{e.note}</p>}
                  </div>

                  {/* Right — pills + icons + time */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      {e.emotionTag && (
                        <span className="bg-[#2E2E2E] text-white px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                          {e.emotionTag}
                        </span>
                      )}
                      {e.trigger && (
                        <span className="bg-[#E8E4DC] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                          {e.trigger}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex gap-1.5">
                        <button className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded text-[#4A4A4A] bg-none cursor-pointer hover:bg-[#F2EFE9] text-sm">
                          🗑
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded text-[#4A4A4A] bg-none cursor-pointer hover:bg-[#F2EFE9] text-sm"
                          onClick={() => setSimilarEntry(e)}
                        >
                          ⋮
                        </button>
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

      {/* Similar Entries overlay */}
      {similarEntry && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] w-[420px] max-w-[95vw]">
          <div className="bg-[#FAD7D3] rounded-2xl px-6 py-5 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans text-lg text-[#1D1D1D]">Similar Entries:</h3>
              <button
                onClick={() => setSimilarEntry(null)}
                className="border-none bg-transparent cursor-pointer text-[#4A4A4A] text-base hover:text-[#1D1D1D]"
              >✕</button>
            </div>
            {entries
              .filter((e) => e.id !== similarEntry.id && e.emotionTag === similarEntry.emotionTag)
              .slice(0, 4)
              .map((e) => (
                <div key={e.id} className="flex justify-between items-start py-2.5 border-b border-black/8 last:border-b-0 gap-3">
                  <p className="text-sm text-[#1D1D1D] flex-1">{e.habit}</p>
                  <span className="text-xs text-[#4A4A4A] flex-shrink-0">{formatTime(e.ts)}</span>
                </div>
              ))}
            {entries.filter((e) => e.id !== similarEntry.id && e.emotionTag === similarEntry.emotionTag).length === 0 && (
              <p className="text-sm text-[#4A4A4A]">No similar entries found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
