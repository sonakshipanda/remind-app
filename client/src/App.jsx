import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import LogEntryModal from "./components/LogEntryModal";
import Dashboard from "./pages/Dashboard";
import AllEntries from "./pages/AllEntries";
import Insights from "./pages/Insights";
import NudgeManager from "./pages/NudgeManager";
import "./index.css";
import "./styles.css";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [logOpen, setLogOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(() =>
    parseInt(localStorage.getItem("remind_streak") || "0")
  );
  const [lastLogDate, setLastLogDate] = useState(() =>
    localStorage.getItem("remind_lastLogDate") || null
  );

  function handleLog(entry) {
    const newEntry = { ...entry, id: Date.now(), ts: new Date() };
    setEntries((prev) => [newEntry, ...prev]);
    const today = todayStr();
    if (lastLogDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastLogDate(today);
      localStorage.setItem("remind_streak", newStreak);
      localStorage.setItem("remind_lastLogDate", today);
    }
    setLogOpen(false);
  }

  function handleLogout() {
    setUser(null);
    setEntries([]);
    setStreak(0);
    setLastLogDate(null);
    localStorage.removeItem("remind_streak");
    localStorage.removeItem("remind_lastLogDate");
  }

  if (!user) return <AuthPage onAuth={setUser} />;

  const pages = {
    dashboard: Dashboard,
    allentries: AllEntries,
    insights: Insights,
    nudgemanager: NudgeManager,
  };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onLogout={handleLogout} />
        <div className="flex justify-between items-center px-7 pt-6">
          <h1 className="font-display text-3xl">
            {page === "dashboard" ? `Hello, ${user?.name || "there"}!` :
            page === "allentries" ? "Your Entries" :
            page === "insights" ? "Insights" :
            page === "nudgemanager" ? "Manage Your Nudges" : ""}
          </h1>
          <button
            className="bg-[#2E2E2E] text-white text-[0.82rem] font-bold tracking-wide px-5 py-2.5 rounded-full flex items-center gap-2 border-none cursor-pointer hover:bg-[#444] hover:-translate-y-px active:translate-y-0 active:bg-[#1D1D1D] transition-all"
            onClick={() => setLogOpen(true)}
          >
            + Log Entry
          </button>
        </div>
        <div className="px-7 pt-3 pb-24 flex-1 overflow-y-auto">
          <PageComponent
            entries={entries}
            streak={streak}
            onLog={() => setLogOpen(true)}
            setPage={setPage}
            user={user}
          />
        </div>
      </div>
      {logOpen && <LogEntryModal onClose={() => setLogOpen(false)} onSubmit={handleLog} />}
    </div>
  );
}
