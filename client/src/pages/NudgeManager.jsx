import { useState, useEffect } from "react";
import api from "../utils/api";

export default function NudgeManager({ onLog }) {
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchNudges() {
      try {
        const res = await api.get("/nudges");
        setNudges(res.data.filter((n) => n.status === "active"));
      } catch (err) {
        console.error("NudgeManager fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNudges();
  }, []);

  async function dismiss(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "dismissed" });
      setNudges((prev) => prev.filter((n) => n._id !== id));
      setToast(true);
      setDismissed(false);
      setTimeout(() => setToast(false), 4000);
    } catch (err) {
      console.error("Dismiss error:", err);
    }
  }

  async function snooze(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "snoozed" });
      setNudges((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Snooze error:", err);
    }
  }

  if (loading) return <div className="text-sm text-[#4A4A4A] py-6">Loading...</div>;

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A] mb-4">Active Nudges</p>
        {nudges.length === 0 ? (
          <div className="bg-[#FAD7D3] rounded-xl px-4 py-3 text-sm text-[#E08478]">No current active nudges</div>
        ) : (
          <div className="flex flex-col gap-3">
            {nudges.map((n) => (
              <div key={n._id} className="bg-[#F2EFE9] rounded-xl px-4 py-3 flex justify-between items-center gap-3 shadow-sm">
                <div className="flex-1">
                  <p className="text-sm text-[#1D1D1D] mb-0.5">{n.message}</p>
                  {n.patternId && <p className="text-xs text-[#e08080]">Pattern detected</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => snooze(n._id)} className="bg-[#FAD7D3] text-[#7a2a2a] px-3 py-1.5 rounded text-xs font-sans border-none cursor-pointer hover:opacity-80 transition-all">snooze</button>
                  <button onClick={() => dismiss(n._id)} className="bg-[#F9B4AB] text-[#7a2a2a] px-3 py-1.5 rounded text-xs font-sans border-none cursor-pointer hover:opacity-80 transition-all">dismiss ✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && !dismissed && (
        <div className="fixed bottom-20 right-7 w-80 bg-[#FAF6EE] rounded-2xl p-5 shadow-xl z-[500]">
          <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[#4A4A4A] hover:bg-black/8 border-none bg-transparent cursor-pointer text-base">✕</button>
          <p className="text-sm leading-relaxed text-[#1D1D1D] mb-3 pr-4">Nudge dismissed. Keep it up!</p>
        </div>
      )}
    </div>
  );
}
