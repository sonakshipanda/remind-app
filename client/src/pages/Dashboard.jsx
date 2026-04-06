import { formatDate, formatTime } from "../utils/formatDate";
import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Dashboard({ streak, bestStreak, onLog, setPage, user, pendingNudge, onNudgeDismissed, refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [activeNudges, setActiveNudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes, nudgesRes] = await Promise.all([
          api.get("/entries"),
          api.get("/nudges"),
        ]);
        const mapped = entriesRes.data.map((e) => ({
          id: e._id,
          habit: e.description,
          note: e.desiredAction || "",
          emotionTag: e.emotionalState || "",
          trigger: e.trigger || "",
          ts: e.createdAt,
        }));
        setEntries(mapped);
        setActiveNudges(nudgesRes.data.filter((n) => n.status === "active"));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    if (pendingNudge) {
      setActiveNudges((prev) => [{ _id: "pending", message: pendingNudge.message, status: "active" }, ...prev]);
    }
  }, [pendingNudge]);

  async function dismissNudge(nudgeId) {
    try {
      if (nudgeId !== "pending") {
        await api.put(`/nudges/${nudgeId}`, { status: "dismissed" });
      }
      setActiveNudges((prev) => prev.filter((n) => n._id !== nudgeId));
      setDismissed(true);
      setTimeout(() => setDismissed(false), 3000);
      if (onNudgeDismissed) onNudgeDismissed();
    } catch (err) {
      console.error("Dismiss nudge error:", err);
    }
  }

  const recentEntries = entries.slice(0, 5);
  const toastNudge = activeNudges[0] || null;

  if (loading) return <div className="text-sm text-[#4A4A4A] py-6">Loading...</div>;

  return (
    <div>
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
        <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
          <p className="font-mono text-[0.7rem] tracking-widest uppercase text-[#4A4A4A] mb-3">Recent Entries:</p>
          {recentEntries.length === 0 ? (
            <div className="flex flex-col gap-1 py-4 text-sm text-[#4A4A4A]">
              <span>No entries found.</span>
              <span className="text-[#BBD4CE] underline cursor-pointer" onClick={onLog}>Log an entry to get started!</span>
            </div>
          ) : (
            <div className="flex flex-col">
              {recentEntries.map((e) => (
                <div key={e.id} className="py-3 border-b border-black/5 last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.75rem] font-semibold text-[#1D1D1D]">{formatDate(e.ts)}</span>
                    <span className="text-[0.72rem] text-[#4A4A4A]">{formatTime(e.ts)}</span>
                  </div>
                  <p className="text-sm text-[#1D1D1D]">{e.habit}</p>
                  {e.note && <p className="text-[0.78rem] text-[#4A4A4A] mt-0.5">{e.note}</p>}
                </div>
              ))}
              {entries.length > 5 && (
                <span className="mt-3 text-[0.78rem] text-[#BBD4CE] underline cursor-pointer self-start" onClick={() => setPage("allentries")}>View All</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <div className="bg-[#F2EFE9] rounded-[20px] px-9 py-7 text-center shadow-sm flex flex-col items-center gap-1 w-full">
            <span className="text-[0.9rem] tracking-widest text-[#4A4A4A]">Streak:</span>
            {entries.length === 0 ? (
              <><span className="font-display text-[2.5rem] leading-none text-[#1D1D1D]">X</span><span className="text-[0.85rem] text-[#4A4A4A]">days</span></>
            ) : streak > 0 ? (
              <><span className="font-display text-[3.5rem] leading-none text-[#1D1D1D]">{streak}</span><span className="text-[0.85rem] text-[#4A4A4A]">days</span><span className="text-[0.85rem] font-bold text-[#1D1D1D] mt-1">keep it up!</span></>
            ) : (
              <><span className="font-display text-[2.5rem] leading-none text-[#1D1D1D]">0</span><span className="text-[0.85rem] text-[#4A4A4A]">days</span><span className="text-[0.85rem] text-[#4A4A4A] font-normal mt-1">log an entry to start your streak!</span></>
            )}
            <div className="w-full border-t border-black/10 mt-3 pt-3 flex flex-col gap-1.5">
              <div className="flex justify-between text-[0.78rem]">
                <span className="text-[#4A4A4A] font-semibold">Next Milestone:</span>
                <span className="text-[#1D1D1D]">
                  {streak < 7 ? "7 days" : streak < 30 ? "30 days" : streak < 100 ? "100 days" : "🏆"}
                </span>
              </div>
              <div className="flex justify-between text-[0.78rem]">
                <span className="text-[#4A4A4A] font-semibold">Best:</span>
                <span className="text-[#1D1D1D]">{bestStreak > 0 ? `${bestStreak} days` : "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F2EFE9] rounded-xl p-5 shadow-sm">
            <p className="text-2xl text-[#1D1D1D] mb-2.5">Active Nudges:</p>
            {activeNudges.length === 0 ? (
              <div className="text-sm text-[#4A4A4A] py-1">No current active nudges</div>
            ) : (
              <>
                {activeNudges.slice(0, 3).map((n) => (
                  <div key={n._id} className="bg-[#FAD7D3] rounded-lg px-3 py-2.5 text-sm text-[#1D1D1D] mb-2 last:mb-0">{n.message}</div>
                ))}
                {activeNudges.length > 3 && (
                  <span className="mt-2 text-[0.78rem] text-[#BBD4CE] underline cursor-pointer block" onClick={() => setPage("nudgemanager")}>View All</span>
                )}
              </>
            )}
          </div>
           
          {toastNudge && !dismissed && (
            <div className="bg-[#FCEEDA] rounded-xl p-5 shadow-md border border-[#F0EDE8]">
              <button className="float-right text-[#4A4A4A] text-sm bg-transparent border-none cursor-pointer" onClick={() => dismissNudge(toastNudge._id)}>✕</button>
              <p className="text-sm text-[#1D1D1D] leading-relaxed mb-3">{toastNudge.message}</p>
              {(toastNudge.category || toastNudge.emotionTag) && (
                <div className="flex gap-1.5 mb-3">
                  {toastNudge.category && (
                    <span className="bg-[#E8E4DC] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs">{toastNudge.category}</span>
                  )}
                  {toastNudge.emotionTag && (
                    <span className="bg-[#E8E4DC] text-[#4A4A4A] px-2.5 py-0.5 rounded-full text-xs">{toastNudge.emotionTag}</span>
                  )}
                </div>
              )}
              <button className="w-full bg-[#2E2E2E] text-white text-[0.82rem] font-bold tracking-wide py-2 rounded-full cursor-pointer border-none hover:bg-[#444] transition-colors" onClick={() => setPage("nudgemanager")}>
                View All Nudges
              </button>
            </div>
          )}
        </div>
      </div>
      {dismissed && (
        <div className="fixed bottom-7 right-7 z-50 bg-[#F2EFE9] text-[#4A4A4A] text-sm px-6 py-3 rounded-xl shadow-md font-medium">
          Nudge dismissed ✓
        </div>
      )}
    </div>
  );
}