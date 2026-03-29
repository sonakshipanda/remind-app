export default function TopBar({ user, onLogout, onLog }) {
  return (
    <header className="h-12 bg-[#456E91] flex items-center px-6 gap-3">
      <div className="flex-1" />
      <div className="flex items-center gap-2.5">
        <button
          onClick={onLog}
          className="bg-[#2E2E2E] text-white text-[0.82rem] font-bold tracking-wide px-4 py-1.5 rounded-full border-none cursor-pointer hover:bg-[#444] transition-colors"
        >
          + Log Entry
        </button>
        <button className="border-none text-white bg-transparent text-base cursor-pointer">⚙️</button>
        <div
          onClick={onLogout}
          title={user?.email}
          className="w-8 h-8 rounded-full bg-[#BBD4CE] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
        >
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "R"}
        </div>
      </div>
    </header>
  );
}