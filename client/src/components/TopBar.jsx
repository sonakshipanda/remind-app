export default function TopBar({ onLog, user, onLogout }) {
  return (
    <header className="h-12 bg-[#456E91] flex items-center px-6 gap-3">
      <div className="flex-1" />
      <div className="flex items-center gap-2.5">
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