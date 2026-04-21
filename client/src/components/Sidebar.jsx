const links = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "insights",     label: "Insights" },
  { id: "allentries",   label: "All Entries" },
  { id: "nudgemanager", label: "Nudge Manager" },
];

export default function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="w-44 min-h-screen bg-[#264E70] text-white flex flex-col py-6 sticky top-0 h-screen">
      <div
        className="px-5 pb-6 border-b mb-4"
        style={{ borderColor: "rgba(187,212,206,0.15)" }}
      >
        <span
          className="text-2xl font-bold tracking-widest"
          style={{ color: "#BBD4CE" }}
        >
          REMIND
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {links.map((l) => {
          const isActive = page === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              className="text-left px-5 py-2.5 text-xs tracking-wide font-sans border-none cursor-pointer transition-all bg-transparent"
              style={{
                color: "#BBD4CE",
                opacity: isActive ? 1 : 0.55,
                borderLeft: isActive
                  ? "3px solid #BBD4CE"
                  : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.opacity = "0.55";
              }}
            >
              {l.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-5 pb-2">
        <button
          onClick={onLogout}
          className="text-xs tracking-wide font-sans border-none cursor-pointer bg-transparent transition-all"
          style={{ color: "#BBD4CE" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#D5EAE5"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#BBD4CE"}
          onMouseDown={(e) => e.currentTarget.style.color = "#D5EAE5"}
          onMouseUp={(e) => e.currentTarget.style.color = "#BBD4CE"}
        >
          logout [→
        </button>
      </div>
    </aside>
  );
}
