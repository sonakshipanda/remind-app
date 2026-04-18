import { useState, useEffect } from "react";
import api from "../utils/api";
import { formatDate } from "../utils/formatDate";

export default function NudgeManager({ onLog }) {
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNudges() {
      try {
        const res = await api.get("/nudges");
        setNudges(res.data);
      } catch (err) {
        console.error("NudgeManager fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNudges();
  }, []);

  const activeNudges = nudges.filter((n) => n.status === "active");
  const pastNudges = nudges.filter((n) => n.status === "dismissed" || n.status === "resolved" || n.status === "snoozed");

  async function markHelpful(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "resolved" });
      setNudges((prev) => prev.map((n) => n._id === id ? { ...n, status: "resolved" } : n));
    } catch (err) {
      console.error("Mark helpful error:", err);
    }
  }

  async function snooze(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "snoozed" });
      setNudges((prev) => prev.map((n) => n._id === id ? { ...n, status: "snoozed" } : n));
    } catch (err) {
      console.error("Snooze error:", err);
    }
  }

  async function dismiss(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "dismissed" });
      setNudges((prev) => prev.map((n) => n._id === id ? { ...n, status: "dismissed" } : n));
    } catch (err) {
      console.error("Dismiss error:", err);
    }
  }

  async function reactivate(id) {
    try {
      await api.put(`/nudges/${id}`, { status: "active" });
      setNudges((prev) => prev.map((n) => n._id === id ? { ...n, status: "active" } : n));
    } catch (err) {
      console.error("Reactivate error:", err);
    }
  }

  if (loading) return <div className="text-sm py-6 px-8" style={{ color: "#4A4A4A" }}>Loading...</div>;

  return (
    <div className="min-h-screen px-8 py-8" style={{ backgroundColor: "#FFFCF7" }}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "#1D1D1D" }}>Nudge Manager</h1>
        <p className="text-sm" style={{ color: "#4A4A4A" }}>AI-generated reminders based on your recurring patterns.</p>
      </div>

      {/* Active Nudges */}
      <div className="mb-8">
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#2E2E2E" }}>
          Active Nudges
        </p>

        {activeNudges.length === 0 ? (
          <div
            className="rounded-xl px-5 py-4 text-sm"
            style={{ backgroundColor: "#F2EFE9", color: "#4A4A4A" }}
          >
            No active nudges
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeNudges.map((n) => (
              <div
                key={n._id}
                className="rounded-xl px-6 py-5"
                style={{
                  backgroundColor: "#F2EFE9",
                  borderTop: "2px solid #E69697",
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[0.7rem] px-2.5 py-0.5 rounded-full font-sans"
                    style={{ backgroundColor: "#FAD7D3", color: "#83504A" }}
                  >
                    active
                  </span>
                  <span className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>
                    Detected {n.createdAt ? formatDate(n.createdAt) : "—"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-2" style={{ color: "#1D1D1D" }}>
                  {n.title || "Pattern detected"}
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#1D1D1D" }}>
                  {n.message}
                </p>

                {/* Linked entries */}
                {(n.linkedEntries?.length > 0 || n.patternId) && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>Linked entries:</span>
                    {n.linkedEntries?.map((entry, i) => (
                      <span
                        key={i}
                        className="text-[0.7rem] px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "#FFFCF7", color: "#4A4A4A" }}
                      >
                        {entry}
                      </span>
                    ))}
                    {n.patternId && (
                      <span
                        className="text-[0.7rem] px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "#FFFCF7", color: "#4A4A4A" }}
                      >
                        date • trigger
                      </span>
                    )}
                  </div>
                )}

                {/* Suggested action box */}
                {n.suggestedAction && (
                  <div
                    className="rounded-lg px-4 py-3 mb-4"
                    style={{ backgroundColor: "#FFFCF7" }}
                  >
                    <p className="text-[0.68rem] font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#4A4A4A" }}>
                      Suggested Action
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "#1D1D1D" }}>
                      {n.suggestedAction}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => markHelpful(n._id)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#456E91", color: "#FFFCF7" }}
                  >
                    mark as helpful
                  </button>
                  <button
                    onClick={() => snooze(n._id)}
                    className="px-4 py-1.5 rounded-full text-xs border-none cursor-pointer transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#FAD7D3", color: "#4A4A4A" }}
                  >
                    snooze 24h
                  </button>
                  <button
                    onClick={() => dismiss(n._id)}
                    className="px-4 py-1.5 rounded-full text-xs cursor-pointer transition-opacity hover:opacity-85"
                    style={{
                      backgroundColor: "transparent",
                      color: "#4A4A4A",
                      border: "1px solid #D0CECA",
                    }}
                  >
                    dismiss ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Nudges */}
      <div>
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#2E2E2E" }}>
          Past Nudges
        </p>

        {pastNudges.length === 0 ? (
          <div
            className="rounded-xl px-5 py-4 text-sm"
            style={{ backgroundColor: "#F2EFE9", color: "#4A4A4A" }}
          >
            Nothing to see here...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pastNudges.map((n) => {
              const isResolved = n.status === "resolved";
              const isDismissed = n.status === "dismissed" || n.status === "snoozed";
              return (
                <div
                  key={n._id}
                  className="rounded-xl px-5 py-3 flex items-center gap-4"
                  style={{ backgroundColor: "#F2EFE9" }}
                >
                  {/* Status badge */}
                  <span
                    className="text-[0.68rem] px-2.5 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isResolved ? "#BBD4CE" : "#FFFCF7",
                      color: "#4A4A4A",
                    }}
                  >
                    {n.status}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#1D1D1D" }}>
                      {n.title || "Pattern detected"}
                    </p>
                    <p className="text-[0.72rem]" style={{ color: "#4A4A4A" }}>
                      {n.createdAt ? `Detected ${formatDate(n.createdAt)}` : ""}
                    </p>
                  </div>

                  {/* Action link */}
                  {isDismissed && (
                    <button
                      onClick={() => reactivate(n._id)}
                      className="text-[0.78rem] underline bg-transparent border-none cursor-pointer shrink-0 hover:opacity-75 transition-opacity"
                      style={{ color: "#656463" }}
                    >
                      Reactivate
                    </button>
                  )}
                  {isResolved && (
                    <button
                      className="text-[0.78rem] underline bg-transparent border-none cursor-pointer shrink-0 hover:opacity-75 transition-opacity"
                      style={{ color: "#656463" }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
