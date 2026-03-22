import { useState } from "react";

const SAMPLE_NUDGES = [
  { id: 1, text: "nudge card insert nudge here...", pattern: "pattern that triggered this" },
  { id: 2, text: "nudge card insert nudge here...", pattern: "pattern that triggered this" },
];

export default function NudgeManager({ onLog }) {
  const [nudges, setNudges] = useState(SAMPLE_NUDGES);
  const [toast, setToast] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function dismiss(id) {
    setNudges((prev) => prev.filter((n) => n.id !== id));
    setToast(true);
    setTimeout(() => { setToast(false); setDismissed(false); }, 4000);
  }

  function snooze(id) {
    alert(`Nudge ${id} snoozed!`);
  }

  return (
    <div>
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-widest uppercase text-[#4A4A4A] mb-4">Active Nudges</p>

        {nudges.length === 0 ? (
          <div className="bg-[#FAD7D3] rounded-xl px-4 py-3 text-sm text-[#E08478]">
            No current active nudges
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {nudges.map((n) => (
              <div key={n.id} className="bg-[#F2EFE9] rounded-xl px-4 py-3 flex justify-between items-center gap-3 shadow-sm">
                <div className="flex-1">
                  <p className="text-sm text-[#1D1D1D] mb-0.5">{n.text}</p>
                  <p className="text-xs text-[#e08080]">{n.pattern}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => snooze(n.id)}
                    className="bg-[#FAD7D3] text-[#7a2a2a] px-3 py-1.5 rounded text-xs font-sans border-none cursor-pointer hover:opacity-80 transition-all"
                  >snooze</button>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="bg-[#F9B4AB] text-[#7a2a2a] px-3 py-1.5 rounded text-xs font-sans border-none cursor-pointer hover:opacity-80 transition-all"
                  >dismiss ✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && !dismissed && (
        <div className="fixed bottom-20 right-7 w-80 bg-[#FAF6EE] rounded-2xl p-5 shadow-xl z-[500]">
          <button
            onClick={() => { setDismissed(true); }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[#4A4A4A] hover:bg-black/8 border-none bg-transparent cursor-pointer text-base"
          >✕</button>
          <p className="text-sm leading-relaxed text-[#1D1D1D] mb-3 pr-4">
            You tend to send reactive messages when you're tired + frustrated. Want to pause before sending next time?
          </p>
          <div className="mb-3">
            <span className="bg-[#C8D8E4] text-[#2E2E2E] px-2.5 py-0.5 rounded-full text-xs">
              communication • tired
            </span>
          </div>
          <button className="bg-[#2E2E2E] text-white border-none rounded-xl py-3.5 w-full font-sans text-sm tracking-wide cursor-pointer hover:bg-[#444] transition-all">
            Set a Reminder
          </button>
        </div>
      )}

      {dismissed && (
        <div className="fixed bottom-7 right-7 z-[500] bg-[#2E2E2E] text-white px-5 py-2.5 rounded-full text-xs tracking-wide flex items-center gap-2">
          Nudge dismissed ●
        </div>
      )}
    </div>
  );
}
