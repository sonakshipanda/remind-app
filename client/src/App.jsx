import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AllEntries from "./pages/AllEntries";
import Insights from "./pages/Insights";
import NudgeManager from "./pages/NudgeManager";
import LogEntryModal from "./components/LogEntryModal";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [pendingNudge, setPendingNudge] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);
  const [streak, setStreak] = useState(() =>
    parseInt(localStorage.getItem("remind_streak") || "0")
  );
  const [lastLogDate, setLastLogDate] = useState(() =>
    localStorage.getItem("remind_lastLogDate") || null
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    if (token && savedName) {
      setUser({ name: savedName, email: savedEmail });
    }
    setAuthLoading(false);
  }, []);

  function handleAuth(userData) {
    setUser(userData);
    localStorage.setItem("userName", userData.name);
    localStorage.setItem("userEmail", userData.email);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("remind_streak");
    localStorage.removeItem("remind_lastLogDate");
    setUser(null);
    setPage("dashboard");
  }

  function handleEntryLogged(newEntry, nudge) {
    const today = new Date().toISOString().slice(0, 10);
    if (lastLogDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastLogDate(today);
      localStorage.setItem("remind_streak", newStreak);
      localStorage.setItem("remind_lastLogDate", today);
    }
    if (nudge) setPendingNudge(nudge);
    setRefreshKey((k) => k + 1);
    setPage("dashboard");
  }

  if (authLoading) return null;
  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-[#FFFCF7] flex">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        {page === "dashboard" && (
          <Dashboard
            streak={streak}
            refreshKey={refreshKey}
            onLog={() => setShowModal(true)}
            setPage={setPage}
            user={user}
            pendingNudge={pendingNudge}
            onNudgeDismissed={() => setPendingNudge(null)}
          />
        )}
        {page === "allentries" && <AllEntries onLog={() => setShowModal(true)} />}
        {page === "insights" && <Insights onLog={() => setShowModal(true)} />}
        {page === "nudgemanager" && <NudgeManager onLog={() => setShowModal(true)} />}
      </main>
      {showModal && (
        <LogEntryModal
          onClose={() => setShowModal(false)}
          onEntryLogged={handleEntryLogged}
        />
      )}
    </div>
  );
}
