import { useState } from "react";
import api from "../utils/api";

const CATEGORIES = [
  "Communication",
  "Work & Productivity",
  "Relationships",
  "Conflict & Arguments",
  "Social Media",
  "Health & Self-Care",
  "Finance",
  "Academic",
  "Decisions & Choices",
  "Reactions & Responses",
];

const TRIGGERS = [
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

export default function LogEntryModal({ onClose, onEntryLogged }) {
  const [form, setForm] = useState({
    description: "",
    category: "",
    trigger: "",
    emotionalState: "",
    desiredAction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setError("");
  }

  const canSubmit = form.description.trim() && form.category && form.trigger && form.emotionalState && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const entryRes = await api.post("/entries", {
        description: form.description,
        category: form.category,
        trigger: form.trigger,
        emotionalState: form.emotionalState,
        desiredAction: form.desiredAction,
      });
      const newEntry = entryRes.data;
      let nudge = null;
      try {
        const analyzeRes = await api.post("/analyze", { entryId: newEntry._id });
        nudge = analyzeRes.data.nudge?.nudge_triggered ? {
          ...analyzeRes.data.nudge,
          category: form.category,
          emotionTag: form.emotionalState,
        } : null;
      } catch (analyzeErr) {
        console.warn("Analysis failed:", analyzeErr);
      }
      onEntryLogged(newEntry, nudge);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save entry. Try again.");
    } finally {
      setLoading(false);
    }
  }

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl relative">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[#4A4A4A] bg-transparent border-none cursor-pointer text-lg hover:text-[#1D1D1D]">✕</button>
        <h2 className="font-sans text-2xl text-[#1D1D1D] mb-6">Log a regret</h2>
        {error && (
          <div className="mb-4 px-3 py-2 bg-[#FAD7D3] text-[#7a2a2a] text-sm rounded-xl">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Description Field:</label>
              <textarea placeholder="describe what happened..." value={form.description}
                onChange={(e) => set("description", e.target.value)} rows={5}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE] resize-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">What I Wish I Did:</label>
              <textarea placeholder="describe what you wish you did differently..." value={form.desiredAction}
                onChange={(e) => set("desiredAction", e.target.value)} rows={5}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE] resize-none" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Trigger:</label>
              <select value={form.trigger} onChange={(e) => set("trigger", e.target.value)}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]">
                <option value="">select a trigger</option>
                {TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Emotional State:</label>
              <select value={form.emotionalState} onChange={(e) => set("emotionalState", e.target.value)}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]">
                <option value="">select a tag</option>
                <option value="tired">Tired</option>
                <option value="frustrated">Frustrated</option>
                <option value="anxious">Anxious</option>
                <option value="angry">Angry</option>
                <option value="sad">Sad</option>
                <option value="overwhelmed">Overwhelmed</option>
                <option value="embarrassed">Embarrassed</option>
                <option value="lonely">Lonely</option>
                <option value="insecure">Insecure</option>
                <option value="excited">Excited</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Category:</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE]">
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className={`py-3.5 px-6 rounded-xl w-full text-sm tracking-widest uppercase font-sans transition-all mt-auto ${canSubmit ? "bg-[#2E2E2E] text-white hover:opacity-85 hover:-translate-y-0.5 cursor-pointer" : "bg-[#2E2E2E] text-white opacity-35 cursor-not-allowed"}`}>
              {loading ? "Saving..." : "Submit Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}