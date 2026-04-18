import { formatDate, formatTime } from "../utils/formatDate";
import { useState, useEffect } from "react";
import api from "../utils/api";

const EMOTION_COLORS = {
  tired:       "#4C756B",
  frustrated:  "#4A6478",
  anxious:     "#264E70",
  angry:       "#C56C6E",
  sad:         "#6B5555",
  overwhelmed: "#4A5C5C",
  embarrassed: "#6B5D6B",
  lonely:      "#5D6B5D",
  insecure:    "#6B6B5D",
  excited:     "#556B68",
};

export default function Dashboard({ streak, onLog, setPage, user, pendingNudge, onNudgeDismissed, refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [activeNudges, setActiveNudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nudgeBannerDismissed, setNudgeBannerDismissed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

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
      setActiveNudges((prev) => [
        { _id: "pending", message: pendingNudge.message, status: "active" },
        ...prev,
      ]);
      setToastVisible(true);
      setToastDismissed(false);
    }
  }, [pendingNudge]);

  async function dismissBannerNudge(nudgeId) {
    try {
      if (nudgeId !== "pending") {
        await api.put(`/nudges/${nudgeId}`, { status: "dismissed" });
      }
      setActiveNudges((prev) => prev.filter((n) => n._id !== nudgeId));
      setNudgeBannerDismissed(true);
      if (onNudgeDismissed) onNudgeDismissed();
    } catch (err) {
      console.error("Dismiss nudge error:", err);
    }
  }

  function dismissToast() {
    setToastDismissed(true);
    setTimeout(() => setToastVisible(false), 300);
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekEntries = entries.filter((e) => new Date(e.ts) >= startOfWeek);
  const entriesThisWeek = thisWeekEntries.length;

  const emotionCounts = {};
  entries.forEach((e) => {
    if (e.emotionTag) emotionCounts[e.emotionTag] = (emotionCounts[e.emotionTag] || 0) + 1;
  });
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const triggerCounts = {};
  entries.forEach((e) => {
    if (e.trigger) triggerCounts[e.trigger] = (triggerCounts[e.trigger] || 0) + 1;
  });
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const recentEntries = entries.slice(0, 5);
  const bannerNudge = !nudgeBannerDismissed && activeNudges.length > 0 ? activeNudges[0] : null;
  const toastNudge = toastVisible && !toastDismissed && activeNudges.length > 0 ? activeNudges[0] : null;

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (loading) return <div className="text-sm py-6" style={{ color: "#4A4A4A" }}>Loading...</div>;

  return (
    <div className="min-h-screen px-8 py-8" style={{ backgroundColor: "#FFFCF7" }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#1D1D1D" }}>
          Hello, {firstName}!
        </h1>
        <button
          onClick={onLog}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tracking-wide border-none cursor-pointer transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#4A4A4A" }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #EBB4AC 0%, #D5C4BD 50%, #C9AEB3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            + Log Entry
          </span>
        </button>
      </div>

      {/* Week at a glance */}
      <div className="mb-5">
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#2E2E2E" }}>
          Your Week at a Glance
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Streak", value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "0 days" },
            { label: "Entries this Week", value: entriesThisWeek.toString() },
            { label: "Top Emotion", value: topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1) },
            { label: "Top Trigger", value: topTrigger },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "#F2EFE9" }}
            >
              <p className="text-[0.68rem] font-sans tracking-wide mb-1" style={{ color: "#656463" }}>
                {label}
              </p>
              <p className="text-base font-semibold" style={{ color: "#1D1D1D" }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active nudge banner */}
      {bannerNudge && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 mb-5 text-sm"
          style={{ backgroundColor: "#FAD7D3", border: "1px solid #F9B4AB" }}
        >
          <span className="flex-1" style={{ color: "#1D1D1D" }}>
            <span className="font-semibold">Active nudge:</span> {bannerNudge.message}
          </span>
          <button
            onClick={() => setPage("nudgemanager")}
            className="px-3 py-1 rounded-md text-xs font-semibold border-none cursor-pointer transition-opacity hover:opacity-85 shrink-0"
            style={{ backgroundColor: "#4A4A4A", color: "#FFFCF7" }}
          >
            view details
          </button>
          <button
            onClick={() => dismissBannerNudge(bannerNudge._id)}
            className="px-3 py-1 rounded-md text-xs border-none cursor-pointer transition-opacity hover:opacity-75 shrink-0"
            style={{ backgroundColor: "#FAD7D3", color: "#4A4A4A", border: "1px solid #F9B4AB" }}
          >
            snooze
          </button>
        </div>
      )}

      {/* Recent entries */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[0.68rem] tracking-widest uppercase" style={{ color: "#2E2E2E" }}>
          Recent Entries
        </p>
        {entries.length > 5 && (
          <button
            onClick={() => setPage("allentries")}
            className="text-[0.75rem] underline bg-transparent border-none cursor-pointer"
            style={{ color: "#4A4A4A" }}
          >
            View All
          </button>
        )}
      </div>

      {recentEntries.length === 0 ? (
        <div
          className="rounded-xl px-5 py-8 text-center"
          style={{ backgroundColor: "#F2EFE9" }}
        >
          <p className="text-sm mb-1" style={{ color: "#4A4A4A" }}>No data to be shown.</p>
          <button
            onClick={onLog}
            className="text-sm underline bg-transparent border-none cursor-pointer"
            style={{ color: "#4A4A4A" }}
          >
            Log an entry to get started!
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentEntries.map((e) => {
            const emotionColor = EMOTION_COLORS[e.emotionTag?.toLowerCase()] || "#4A5C5C";
            return (
              <div
                key={e.id}
                className="rounded-xl px-5 py-4"
                style={{ backgroundColor: "#F2EFE9" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>
                        {formatDate(e.ts)} • {formatTime(e.ts)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "#1D1D1D" }}>
                      {e.habit}
                    </p>
                    {e.note && (
                      <>
                        <div className="my-2" style={{ borderTop: "1px solid #7B7A79" }} />
                        <p className="text-[0.78rem] italic leading-snug" style={{ color: "#4A4A4A" }}>
                          {e.note}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {e.emotionTag && (
                      <span
                        className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono tracking-wide"
                        style={{ backgroundColor: emotionColor, color: "#F2EFE9" }}
                      >
                        {e.emotionTag}
                      </span>
                    )}
                    {e.trigger && (
                      <span
                        className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono tracking-wide"
                        style={{ backgroundColor: "#E1DED9", color: "#4A4A4A" }}
                      >
                        {e.trigger}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast nudge overlay */}
      {toastNudge && (
        <div
          className="fixed bottom-7 right-7 z-50 rounded-2xl p-5 shadow-xl w-72 transition-opacity"
          style={{ backgroundColor: "#FFFCF7", opacity: toastDismissed ? 0 : 1 }}
        >
          <button
            onClick={dismissToast}
            className="absolute top-3 right-3 text-sm bg-transparent border-none cursor-pointer"
            style={{ color: "#4A4A4A" }}
          >
            ✕
          </button>
          <p className="text-sm leading-relaxed mb-2 pr-4" style={{ color: "#1D1D1D" }}>
            {toastNudge.message}
          </p>
          {toastNudge.patternId && (
            <div className="mb-3">
              <span
                className="text-[0.68rem] px-2 py-0.5 rounded-full font-mono"
                style={{ backgroundColor: "#FAD7D3", color: "#4A4A4A" }}
              >
                pattern detected
              </span>
            </div>
          )}
          <button
            onClick={() => { dismissToast(); setPage("nudgemanager"); }}
            className="w-full py-2 rounded-full text-[0.82rem] font-bold tracking-wide border-none cursor-pointer transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#2E2E2E", color: "#FFFCF7" }}
          >
            Set a Reminder
          </button>
        </div>
      )}
    </div>
  );
}
