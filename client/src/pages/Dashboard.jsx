import { formatDate, formatTime } from "../utils/formatDate";
import { useState } from "react";

export default function Dashboard({ entries, streak, onLog, setPage, user }) {

  const activeNudges = [];
  const recentEntries = entries.slice(0, 5);

  const [showToast, setShowToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function handleDismissToast() {
    setDismissed(true);
    setTimeout(() => {
      setShowToast(false);
      setDismissed(false);
    }, 3000);
  }

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div>

      {/* ── Dashboard Layout: entries left, streak + nudges right ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>

        {/* ── LEFT: Recent Entries ── */}
        <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
          <p className="font-mono text-[0.7rem] tracking-widest uppercase text-[#4A4A4A] mb-3">
            Recent Entries:
          </p>
          {recentEntries.length === 0 ? (
            <div className="flex flex-col gap-1 py-4 text-sm text-[#4A4A4A]">
              <span>No entries found.</span>
              <span
                className="text-[#BBD4CE] underline cursor-pointer"
                onClick={onLog}
              >
                Log an entry to get started!
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              {recentEntries.map((e) => (
                <div
                  key={e.id}
                  className="py-3 border-b border-black/5 last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.75rem] font-semibold text-[#1D1D1D]">
                      {formatDate(e.ts)}
                    </span>
                    <span className="text-[0.72rem] text-[#4A4A4A]">
                      {formatTime(e.ts)}
                    </span>
                  </div>
                  <p className="text-sm text-[#1D1D1D]">{e.habit}</p>
                  {e.note && (
                    <p className="text-[0.78rem] text-[#4A4A4A] mt-0.5">{e.note}</p>
                  )}
                </div>
              ))}
              {entries.length > 5 && (
                <span
                  className="mt-3 text-[0.78rem] text-[#BBD4CE] underline cursor-pointer self-start"
                  onClick={() => setPage("allentries")}
                >
                  View All
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Streak + Active Nudges stacked ── */}
        <div className="flex flex-col gap-5">

          {/* Streak */}
          <div className="bg-[#F2EFE9] rounded-[20px] px-9 py-7 text-center shadow-sm flex flex-col items-center gap-1 w-full">
            <span className="text-[0.9rem] tracking-widest text-[#4A4A4A]">Streak:</span>
            {entries.length === 0 ? (
              <>
                <span className="font-display text-[2.5rem] leading-none text-[#1D1D1D]">X</span>
                <span className="text-[0.85rem] text-[#4A4A4A]">days</span>
                <span className="text-[0.85rem] text-[#4A4A4A] font-normal mt-1">keep it up!</span>
              </>
            ) : streak > 0 ? (
              <>
                <span className="font-display text-[3.5rem] leading-none text-[#1D1D1D]">{streak}</span>
                <span className="text-[0.85rem] text-[#4A4A4A]">days</span>
                <span className="text-[0.85rem] font-bold text-[#1D1D1D] mt-1">keep it up!</span>
              </>
            ) : (
              <>
                <span className="font-display text-[2.5rem] leading-none text-[#1D1D1D]">0</span>
                <span className="text-[0.85rem] text-[#4A4A4A]">days</span>
                <span className="text-[0.85rem] text-[#4A4A4A] font-normal mt-1">
                  log an entry to start your streak!
                </span>
              </>
            )}
          </div>

          {/* Active Nudges */}
          <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
            <p className="text-2xl text-[#1D1D1D] mb-2.5">
              Active Nudges:
            </p>
            {activeNudges.length === 0 ? (
              <div className="text-sm text-[#4A4A4A] py-1">No current active nudges</div>
            ) : (
              <>
                {activeNudges.slice(0, 3).map((n) => (
                  <div key={n.id} className="bg-[#FAD7D3] rounded-lg px-3 py-2.5 text-sm text-[#1D1D1D] mb-2 last:mb-0">
                    {n.text}
                  </div>
                ))}
                {activeNudges.length > 3 && (
                  <span
                    className="mt-2 text-[0.78rem] text-[#BBD4CE] underline cursor-pointer block"
                    onClick={() => setPage("nudgemanager")}
                  >
                    View All
                  </span>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Nudge Toast bottom right ── */}
      {showToast && !dismissed && (
        <div className="fixed bottom-7 right-7 z-50 bg-[#FFFCF7] rounded-xl p-5 shadow-md w-72">
          <button
            className="absolute top-3 right-3 text-[#4A4A4A] text-sm bg-transparent border-none cursor-pointer"
            onClick={handleDismissToast}
          >
            ✕
          </button>
          <p className="text-sm text-[#1D1D1D] leading-relaxed mb-3">
            You tend to send reactive messages when you're tired + frustrated.
            Want to pause before sending next time?
          </p>
          <div className="mb-3">
            <span className="bg-[#C8D8E4] text-[#2E2E2E] px-2.5 py-0.5 rounded-full text-[0.72rem]">
              communication • tired
            </span>
          </div>
          <button className="w-full bg-[#2E2E2E] text-white text-[0.82rem] font-bold tracking-wide py-2 rounded-full cursor-pointer border-none hover:bg-[#444] transition-colors">
            Set a Reminder
          </button>
        </div>
      )}

      {dismissed && (
        <div className="fixed bottom-7 right-7 z-50 bg-[#F2EFE9] text-[#4A4A4A] text-[0.78rem] px-4 py-2 rounded-full shadow-sm">
          Nudge dismissed ●
        </div>
      )}

    </div>
  );
}
