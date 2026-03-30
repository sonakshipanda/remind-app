const links = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "insights",     label: "Insights" },
  { id: "allentries",   label: "All Entries" },
  { id: "nudgemanager", label: "Nudge Manager" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="w-44 min-h-screen bg-[#264E70] text-white flex flex-col py-6 sticky top-0 h-screen">
      <div className="text-2xl font-bold tracking-widest px-5 pb-6 border-b border-white/10 mb-4">
        REMIND
      </div>
      <nav className="flex flex-col gap-0.5">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => setPage(l.id)}
            className={`text-left px-5 py-2.5 text-xs tracking-wide font-sans border-none cursor-pointer transition-all
              ${page === l.id
                ? "text-white bg-white/10 border-l-4 border-white"
                : "text-white/50 bg-transparent hover:text-white hover:bg-white/5"
              }`}
          >
            {l.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}