import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  PieChart, Pie, Cell, Tooltip,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

const EMOTION_COLORS = {
  tired:       "#4C756B",
  frustrated:  "#4A6478",
  anxious:     "#264E70",
  angry:       "#C56C6E",
  sad:         "#6B5555",
  overwhelmed: "#4A5C5C",
  embarrassed: "#6B5D6B",
  lonely:      "#5D6B5D",
  insecure:    "#6B6B5D",
  excited:     "#556B68",
};

const RANGE_OPTIONS = ["week", "month", "all time"];

export default function Insights({ onLog }) {
  const [entries, setEntries] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all time");
  const [activeEmotion, setActiveEmotion] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesRes] = await Promise.all([
          api.get("/entries"),
          // patterns endpoint ready: api.get("/patterns")
        ]);
        const mapped = entriesRes.data.map((e) => ({
          id: e._id,
          habit: e.description,
          emotionTag: e.emotionalState || "",
          trigger: e.trigger || "",
          ts: e.createdAt,
        }));
        setEntries(mapped);
        // setPatterns(patternsRes.data);

        // Placeholder patterns — remove when backend is ready
        setPatterns([
          {
            id: "1",
            title: "Procrastination loop",
            description: "Social media scrolling then deadline panic has appeared 3 times this week. Each time it led to feeling overwhelmed.",
            linkedEntries: [],
            type: "pink",
          },
          {
            id: "2",
            title: "Late-night reactivity",
            description: "Angry messages sent after 10 PM, regretted the next morning. 4 occurrences in the past 2 weeks.",
            linkedEntries: [],
            type: "teal",
          },
        ]);
      } catch (err) {
        console.error("Insights fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Range filter
  const now = new Date();
  const rangeFiltered = entries.filter((e) => {
    if (range === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return new Date(e.ts) >= start;
    }
    if (range === "month") {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      return new Date(e.ts) >= start;
    }
    return true;
  });

  // Emotion breakdown — top 4
  const emotionCounts = {};
  rangeFiltered.forEach((e) => {
    if (e.emotionTag) emotionCounts[e.emotionTag] = (emotionCounts[e.emotionTag] || 0) + 1;
  });
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const totalEmotions = topEmotions.reduce((sum, [, c]) => sum + c, 0);

  // Top triggers — top 4
  const triggerCounts = {};
  rangeFiltered.forEach((e) => {
    if (e.trigger) triggerCounts[e.trigger] = (triggerCounts[e.trigger] || 0) + 1;
  });
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxTrigger = topTriggers[0]?.[1] || 1;

  // Scatter plot data
  const scatterByEmotion = {};
  rangeFiltered.forEach((e) => {
    const emotion = e.emotionTag?.toLowerCase() || "unknown";
    if (!scatterByEmotion[emotion]) scatterByEmotion[emotion] = [];
    const date = new Date(e.ts);
    scatterByEmotion[emotion].push({
      x: date.getTime(),
      y: Math.floor(Math.random() * 9) + 1, // placeholder intensity — replace with backend field
      label: e.habit,
    });
  });

  // Filter by emotion
  const emotions = [...new Set(rangeFiltered.map((e) => e.emotionTag).filter(Boolean))];
  const filteredForTable = activeEmotion
    ? rangeFiltered.filter((e) => e.emotionTag === activeEmotion)
    : rangeFiltered;

  const formatXAxis = (tick) => {
    const d = new Date(tick);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  };

  if (loading) return <div className="text-sm py-6 px-8" style={{ color: "#4A4A4A" }}>Loading...</div>;

  if (entries.length === 0) {
    return (
      <div className="min-h-screen px-8 py-8" style={{ backgroundColor: "#FFFCF7" }}>
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#1D1D1D" }}>Insights</h1>
        <div className="rounded-xl px-5 py-8 text-center" style={{ backgroundColor: "#F2EFE9" }}>
          <p className="text-sm mb-1" style={{ color: "#4A4A4A" }}>No data to be shown.</p>
          <button onClick={onLog} className="text-sm underline bg-transparent border-none cursor-pointer" style={{ color: "#4A4A4A" }}>
            Log an entry to get started!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-8" style={{ backgroundColor: "#FFFCF7" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#1D1D1D" }}>Insights</h1>
        <div className="flex items-center gap-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1 rounded-full text-xs border-none cursor-pointer transition-all"
              style={{
                backgroundColor: range === r ? "#4A5C5C" : "#FFFCF7",
                color: range === r ? "#F2EFE9" : "#4A4A4A",
                border: range === r ? "none" : "1px solid #F2EFE9",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top row: Emotion Breakdown + Top Triggers */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Emotion Breakdown */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#F3EFE9" }}>
          <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#2E2E2E" }}>
            Emotion Breakdown
          </p>
          <div className="flex items-center gap-6">
            <PieChart width={100} height={100}>
              <Pie
                data={topEmotions.map(([emotion, count]) => ({ name: emotion, value: count }))}
                cx={45}
                cy={45}
                innerRadius={28}
                outerRadius={45}
                dataKey="value"
                strokeWidth={0}
              >
                {topEmotions.map(([emotion]) => (
                  <Cell key={emotion} fill={EMOTION_COLORS[emotion.toLowerCase()] || "#4A5C5C"} />
                ))}
              </Pie>
              <text x={50} y={45} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold" fill="#1D1D1D">
                {totalEmotions}
              </text>
              <text x={50} y={58} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#4A4A4A">
                entries
              </text>
            </PieChart>
            <div className="flex flex-col gap-1.5">
              {topEmotions.map(([emotion, count]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <div className="rounded-full shrink-0" style={{ width: "8px", height: "8px", backgroundColor: EMOTION_COLORS[emotion.toLowerCase()] || "#4A5C5C" }} />
                  <span className="text-xs capitalize" style={{ color: "#4A4A4A" }}>
                    {emotion} ({count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Triggers */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#F3EFE9" }}>
          <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#2E2E2E" }}>
            Top Triggers
          </p>
          {topTriggers.length === 0 ? (
            <p className="text-sm" style={{ color: "#4A4A4A" }}>Not enough data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topTriggers.map(([trigger, count]) => {
                const emotion = rangeFiltered.find((e) => e.trigger === trigger)?.emotionTag?.toLowerCase();
                const barColor = EMOTION_COLORS[emotion] || "#264E70";
                const pct = (count / maxTrigger) * 100;
                return (
                  <div key={trigger}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: "#4A4A4A" }}>{trigger}</span>
                      <span className="text-xs font-semibold" style={{ color: "#4A4A4A" }}>{count}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: "6px", backgroundColor: "#E1DED9" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Patterns Detected */}
      <div className="mb-4">
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#2E2E2E" }}>
          Patterns Detected
        </p>
        <div className="grid grid-cols-2 gap-4">
          {patterns.length === 0 ? (
            <div className="col-span-2 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: "#F3EFE9", color: "#4A4A4A" }}>
              No patterns detected yet.
            </div>
          ) : (
            patterns.map((p) => (
              <div
                key={p.id}
                className="rounded-xl px-5 py-4"
                style={{
                  backgroundColor: p.type === "pink" ? "#FAD7D3" : "#BBD4CE",
                  borderLeft: `4px solid ${p.type === "pink" ? "#E69697" : "#679186"}`,
                }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "#1D1D1D" }}>{p.title}</p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>{p.description}</p>
                <button
                  className="text-xs underline bg-transparent border-none cursor-pointer p-0"
                  style={{ color: p.type === "pink" ? "#666160" : "#5C605F" }}
                >
                  View Linked Entries
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Emotion Timeline */}
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: "#F3EFE9" }}>
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#2E2E2E" }}>
          Emotion Timeline
        </p>
        <p className="text-[0.68rem] mb-3" style={{ color: "#4A4A4A" }}>Entries Over Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="x"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 9, fill: "#4A4A4A" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 10]}
              label={{ value: "Intensity", angle: -90, position: "insideLeft", fontSize: 9, fill: "#4A4A4A" }}
              tick={{ fontSize: 9, fill: "#4A4A4A" }}
              tickLine={false}
              axisLine={false}
            />
            {Object.entries(scatterByEmotion).map(([emotion, data]) => (
              <Scatter
                key={emotion}
                name={emotion}
                data={data}
                fill={EMOTION_COLORS[emotion] || "#4A5C5C"}
              />
            ))}
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "9px", paddingTop: "12px" }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Filter by Emotion */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#F3EFE9" }}>
        <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#2E2E2E" }}>
          Filter by Emotion
        </p>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {emotions.map((emotion) => {
            const isActive = activeEmotion === emotion;
            const color = EMOTION_COLORS[emotion.toLowerCase()] || "#4A5C5C";
            return (
              <button
                key={emotion}
                onClick={() => setActiveEmotion(isActive ? null : emotion)}
                className="px-3 py-1 rounded-full text-xs border-none cursor-pointer transition-all capitalize"
                style={{
                  backgroundColor: isActive ? color : "#FFFCF7",
                  color: isActive ? "#F2EFE9" : "#4A4A4A",
                  border: isActive ? "none" : "1px solid #F2EFE9",
                }}
              >
                {emotion}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col">
          {filteredForTable.slice(0, 10).map((e, i) => (
            <div
              key={e.id}
              className="flex items-center justify-between py-2.5 px-1"
              style={{ borderBottom: i < filteredForTable.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[0.68rem]" style={{ color: "#4A4A4A" }}>
                  {new Date(e.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-sm" style={{ color: "#1D1D1D" }}>{e.habit}</span>
              </div>
              {e.emotionTag && (
                <span
                  className="text-[0.68rem] px-2.5 py-0.5 rounded-full font-mono capitalize"
                  style={{
                    backgroundColor: EMOTION_COLORS[e.emotionTag.toLowerCase()] || "#4A5C5C",
                    color: "#F2EFE9",
                  }}
                >
                  {e.emotionTag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
