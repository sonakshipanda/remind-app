import { useState } from "react";

const TRIGGERS = [
  "select a trigger",
  "tired / exhausted",
  "frustrated",
  "anxious / stressed",
  "angry",
  "sad / low mood",
  "embarrassed",
  "excited / impulsive",
  "lonely",
  "overwhelmed",
  "insecure",
  "under pressure / deadline",
  "after an argument",
  "late at night",
  "under the influence",
  "in public / social setting",
  "reacting to someone else",
  "on my phone / online",
  "first thing in the morning",
  "after receiving bad news",
  "bored",
  "sleep deprived",
];

const EMOTION_TAGS = [
  "select a tag",
  "communication",
  "work & productivity",
  "relationships",
  "conflicts & arguments",
  "social media",
  "academic",
  "decisions & choices",
  "reactions & responses",
  "health & self-care",
  "finance",
];

function Dropdown({ options, value, onChange, isOpen, onToggle }) {
  const isPlaceholder = value === options[0];

  return (
    <div className="relative">
      <div
        onClick={onToggle}
        className={`flex justify-between items-center px-3.5 py-3 border rounded-xl bg-[#F2EFE9] font-sans text-sm cursor-pointer select-none transition-all
          ${isOpen ? "border-[#BBD4CE] rounded-b-none" : "border-[#E0E0E0] hover:border-[#aaaaaa]"}`}
      >
        {!isPlaceholder ? (
          <span className="bg-[#2E2E2E] text-white px-2.5 py-0.5 rounded-full text-xs tracking-wide">
            {value}
          </span>
        ) : (
          <span className="text-[#4A4A4A]">{value}</span>
        )}
        <span className="text-xs text-[#4A4A4A]">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#F2EFE9] border border-[#BBD4CE] border-t-0 rounded-b-xl max-h-52 overflow-y-auto z-50 shadow-md">
          {options.map((o) => (
            <div
              key={o}
              onClick={() => { onChange(o); onToggle(); }}
              className={`px-3.5 py-2.5 text-sm font-sans cursor-pointer border-b border-black/5 last:border-b-0 transition-colors
                ${value === o ? "font-bold text-[#1D1D1D]" : "text-[#1D1D1D] hover:bg-[#E8E4DC]"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LogEntryModal({ onClose, onSubmit }) {
  const [description, setDescription] = useState("");
  const [wishDidDifferently, setWishDidDifferently] = useState("");
  const [trigger, setTrigger] = useState("select a trigger");
  const [emotionTag, setEmotionTag] = useState("select a tag");
  const [category, setCategory] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  const canSubmit = description.trim() && trigger !== "select a trigger" && emotionTag !== "select a tag";

  function handleSubmit() {
    if (!canSubmit) {
      setErrors({ description: !description.trim() ? "Please describe what happened" : undefined });
      return;
    }
    onSubmit({ habit: description, note: wishDidDifferently, trigger, emotionTag, category });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[300]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-16 w-full max-w-6xl shadow-xl relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[#4A4A4A] hover:bg-black/8 border-none bg-transparent cursor-pointer text-base transition-all"
        >✕</button>

        <h2 className="font-sans text-2xl mb-6">Log a regret</h2>

        {/* Two column grid */}
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT column */}
          <div className="flex flex-col gap-4">
            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Description Field:</label>
              <textarea
                rows={8}
                placeholder="describe what happened..."
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors({}); }}
                className={`w-full px-3.5 py-3 border rounded-xl font-sans text-sm bg-[#F2EFE9] resize-none focus:outline-none focus:border-[#BBD4CE] transition-colors
                  ${errors.description ? "border-[#E08478]" : "border-[#E0E0E0]"}`}
              />
              {errors.description && <span className="text-xs text-[#E08478]">{errors.description}</span>}
            </div>

            {/* What I Wish I Did */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">What I Wish I Did:</label>
              <textarea
                rows={8}
                placeholder="describe what you wish you did differently..."
                value={wishDidDifferently}
                onChange={(e) => setWishDidDifferently(e.target.value)}
                className="w-full px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] resize-none focus:outline-none focus:border-[#BBD4CE] transition-colors"
              />
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-4">
            {/* Trigger */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Trigger:</label>
              <Dropdown
                options={TRIGGERS}
                value={trigger}
                onChange={setTrigger}
                isOpen={openDropdown === "trigger"}
                onToggle={() => setOpenDropdown(openDropdown === "trigger" ? null : "trigger")}
              />
            </div>

            {/* Emotional State */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Emotional State:</label>
              <Dropdown
                options={EMOTION_TAGS}
                value={emotionTag}
                onChange={setEmotionTag}
                isOpen={openDropdown === "emotion"}
                onToggle={() => setOpenDropdown(openDropdown === "emotion" ? null : "emotion")}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A]">Category:</label>
              <input
                type="text"
                placeholder="e.g. health, finance..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-3 border border-[#E0E0E0] rounded-xl font-sans text-sm bg-[#F2EFE9] focus:outline-none focus:border-[#BBD4CE] transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-auto">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-5 py-2.5 rounded-full font-sans text-sm font-bold tracking-wide border-none transition-all
                  ${canSubmit ? "bg-[#2E2E2E] text-white cursor-pointer hover:bg-[#444]" : "bg-[#2E2E2E] text-white opacity-35 cursor-not-allowed"}`}
              >
                Submit Entry
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
