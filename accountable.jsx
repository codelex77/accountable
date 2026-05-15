import { useState, useEffect, useRef } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
});

const HABIT_COLORS = ["#C8B560", "#7EC8A4", "#E07B6A", "#7AA3D4", "#C47EC8", "#E0A96A"];
const CATEGORY_ICONS = { Health: "🏃", Mind: "📚", Work: "💼", Social: "🤝", Finance: "💰", Creative: "🎨" };

const defaultHabits = [
  { id: 1, name: "Morning Run", category: "Health", color: "#C8B560", days: [1,2,3,4,5], streak: 4, log: {} },
  { id: 2, name: "Read 30 mins", category: "Mind", color: "#7EC8A4", days: [0,1,2,3,4,5,6], streak: 7, log: {} },
  { id: 3, name: "Deep Work", category: "Work", color: "#7AA3D4", days: [1,2,3,4,5], streak: 2, log: {} },
];

const defaultRoutine = [
  { id: 1, time: "6:00 AM", label: "Wake up & hydrate", duration: 15, color: "#C8B560" },
  { id: 2, time: "6:15 AM", label: "Morning Run", duration: 30, color: "#7EC8A4" },
  { id: 3, time: "7:00 AM", label: "Shower & grooming", duration: 30, color: "#7AA3D4" },
  { id: 4, time: "8:00 AM", label: "Deep Work Block", duration: 120, color: "#C47EC8" },
  { id: 5, time: "10:00 AM", label: "Read 30 mins", duration: 30, color: "#7EC8A4" },
  { id: 6, time: "12:00 PM", label: "Lunch break", duration: 60, color: "#E0A96A" },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getTodayDow() {
  return new Date().getDay();
}

export default function Accountable() {
  const [tab, setTab] = useState("today");
  const [habits, setHabits] = useState(defaultHabits);
  const [routine, setRoutine] = useState(defaultRoutine);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", category: "Health", color: "#C8B560", days: [1,2,3,4,5] });
  const [newBlock, setNewBlock] = useState({ time: "9:00 AM", label: "", duration: 30, color: "#C8B560" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const today = getToday();
  const todayDow = getTodayDow();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  function toggleHabitDay(id) {
    setHabits(h => h.map(habit => {
      if (habit.id !== id) return habit;
      const log = { ...habit.log };
      const done = log[today];
      log[today] = !done;
      const streak = Object.keys(log).filter(k => log[k]).length;
      return { ...habit, log, streak };
    }));
  }

  function addHabit() {
    if (!newHabit.name.trim()) return;
    setHabits(h => [...h, { ...newHabit, id: Date.now(), streak: 0, log: {} }]);
    setNewHabit({ name: "", category: "Health", color: "#C8B560", days: [1,2,3,4,5] });
    setShowAddHabit(false);
  }

  function deleteHabit(id) {
    setHabits(h => h.filter(x => x.id !== id));
  }

  function addBlock() {
    if (!newBlock.label.trim()) return;
    setRoutine(r => [...r, { ...newBlock, id: Date.now() }]);
    setNewBlock({ time: "9:00 AM", label: "", duration: 30, color: "#C8B560" });
    setShowAddBlock(false);
  }

  function deleteBlock(id) {
    setRoutine(r => r.filter(x => x.id !== id));
  }

  const todayHabits = habits.filter(h => h.days.includes(todayDow));
  const completedToday = todayHabits.filter(h => h.log[today]).length;
  const progress = todayHabits.length ? Math.round((completedToday / todayHabits.length) * 100) : 0;

  const timeString = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateString = currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E0E0F",
      color: "#F0EDE6",
      fontFamily: "'DM Serif Display', Georgia, serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 10px 18px; border-radius: 2px;
          transition: all 0.2s ease; color: #666;
        }
        .tab-btn.active { color: #F0EDE6; background: #1A1A1B; }
        .tab-btn:hover { color: #C8B560; }

        .habit-row {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-bottom: 1px solid #1C1C1D;
          transition: background 0.15s;
          cursor: pointer;
        }
        .habit-row:hover { background: #141414; }

        .check-circle {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid #333; background: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
          font-size: 14px;
        }
        .check-circle.done { border-color: transparent; }

        .add-btn {
          background: #C8B560; color: #0E0E0F; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 10px 22px; border-radius: 2px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .add-btn:hover { opacity: 0.85; }

        .ghost-btn {
          background: none; border: 1px solid #2A2A2B; color: #888;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 8px 16px; border-radius: 2px; cursor: pointer;
          transition: all 0.2s;
        }
        .ghost-btn:hover { border-color: #C8B560; color: #C8B560; }

        .day-pill {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #2A2A2B; background: none; color: #555;
          font-family: 'DM Mono', monospace; font-size: 10px;
          cursor: pointer; transition: all 0.15s; display: flex;
          align-items: center; justify-content: center;
        }
        .day-pill.active { border-color: #C8B560; color: #C8B560; background: rgba(200,181,96,0.1); }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
        }
        .modal {
          background: #141414; border: 1px solid #222; border-radius: 4px;
          padding: 28px; width: 100%; max-width: 420px;
        }
        .modal-input {
          width: 100%; background: #0E0E0F; border: 1px solid #252525;
          color: #F0EDE6; padding: 10px 14px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: #C8B560; }
        .modal-select {
          width: 100%; background: #0E0E0F; border: 1px solid #252525;
          color: #F0EDE6; padding: 10px 14px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; appearance: none;
        }

        .routine-block {
          border-left: 3px solid; padding: 12px 16px; margin-bottom: 8px;
          background: #141414; border-radius: 0 2px 2px 0;
          display: flex; align-items: center; gap: 14px;
        }

        .progress-ring {
          transform: rotate(-90deg);
          transform-origin: center;
        }

        .streak-badge {
          font-family: 'DM Mono', monospace; font-size: 11px;
          background: rgba(200,181,96,0.12); color: #C8B560;
          padding: 2px 8px; border-radius: 20px; white-space: nowrap;
        }

        .del-btn {
          background: none; border: none; color: #333; cursor: pointer;
          font-size: 16px; line-height: 1; transition: color 0.15s;
          padding: 4px;
        }
        .del-btn:hover { color: #E07B6A; }

        .section-label {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.15em; text-transform: uppercase; color: #444;
          padding: 14px 20px 8px; border-bottom: 1px solid #1A1A1B;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }

        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Background grain */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        backgroundSize: "128px",
      }} />

      {/* Header */}
      <div style={{ padding: "24px 24px 0", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8B560", animation: "shimmer 2s infinite" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase" }}>Accountable</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{dateString}</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: "#C8B560", letterSpacing: "0.04em" }}>{timeString}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#444", marginTop: 2 }}>
              {completedToday}/{todayHabits.length} habits done
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20, height: 2, background: "#1A1A1B", borderRadius: 1, position: "relative" }}>
          <div style={{
            height: "100%", borderRadius: 1, background: "#C8B560",
            width: `${progress}%`, transition: "width 0.5s ease",
          }} />
          <span style={{
            position: "absolute", right: 0, top: -18,
            fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#C8B560",
          }}>{progress}%</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20, borderBottom: "1px solid #1A1A1B", paddingBottom: 0 }}>
          {[
            { key: "today", label: "Today" },
            { key: "habits", label: "Habits" },
            { key: "routine", label: "Routine" },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 0 100px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>

        {/* TODAY TAB */}
        {tab === "today" && (
          <div className="fade-in">
            {todayHabits.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#444" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌙</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>No habits scheduled today.</p>
              </div>
            ) : (
              <>
                <div className="section-label">Habits for {FULL_DAYS[todayDow]}</div>
                {todayHabits.map(habit => {
                  const done = !!habit.log[today];
                  return (
                    <div key={habit.id} className="habit-row" onClick={() => toggleHabitDay(habit.id)}>
                      <div className="check-circle done" style={{ background: done ? habit.color : "none", borderColor: done ? "transparent" : "#2A2A2B" }}>
                        {done && <span style={{ color: "#0E0E0F", fontSize: 13 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 400, color: done ? "#555" : "#F0EDE6", textDecoration: done ? "line-through" : "none" }}>
                          {habit.name}
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginTop: 2 }}>
                          {CATEGORY_ICONS[habit.category]} {habit.category}
                        </div>
                      </div>
                      <div className="streak-badge">🔥 {habit.streak}d</div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Today's routine preview */}
            {routine.length > 0 && (
              <>
                <div className="section-label" style={{ marginTop: 8 }}>Today's Schedule</div>
                <div style={{ padding: "12px 20px" }}>
                  {routine.slice(0, 4).map(block => (
                    <div key={block.id} className="routine-block" style={{ borderLeftColor: block.color }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", width: 60, flexShrink: 0 }}>{block.time}</div>
                      <div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{block.label}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginTop: 2 }}>{block.duration} min</div>
                      </div>
                    </div>
                  ))}
                  {routine.length > 4 && (
                    <button className="ghost-btn" style={{ marginTop: 8 }} onClick={() => setTab("routine")}>
                      +{routine.length - 4} more blocks →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* HABITS TAB */}
        {tab === "habits" && (
          <div className="fade-in">
            <div className="section-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 20 }}>
              <span>All Habits ({habits.length})</span>
              <button className="add-btn" onClick={() => setShowAddHabit(true)}>+ Add</button>
            </div>

            {habits.map(habit => (
              <div key={habit.id} style={{ borderBottom: "1px solid #1A1A1B", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: habit.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>{habit.name}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginLeft: 8 }}>
                      {CATEGORY_ICONS[habit.category]} {habit.category}
                    </span>
                  </div>
                  <div className="streak-badge">🔥 {habit.streak}d</div>
                  <button className="del-btn" onClick={() => deleteHabit(habit.id)}>×</button>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {DAYS.map((d, i) => (
                    <div key={i} className="day-pill" style={{
                      borderColor: habit.days.includes(i) ? habit.color : "#1E1E1F",
                      color: habit.days.includes(i) ? habit.color : "#333",
                      background: habit.days.includes(i) ? `${habit.color}15` : "none",
                    }}>{d[0]}</div>
                  ))}
                </div>
              </div>
            ))}

            {habits.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#444" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif" }}>No habits yet. Add your first one.</p>
              </div>
            )}
          </div>
        )}

        {/* ROUTINE TAB */}
        {tab === "routine" && (
          <div className="fade-in">
            <div className="section-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 20 }}>
              <span>Daily Timetable</span>
              <button className="add-btn" onClick={() => setShowAddBlock(true)}>+ Block</button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {routine.map((block, idx) => (
                <div key={block.id} style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                  {/* Timeline */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: block.color, flexShrink: 0, marginTop: 14 }} />
                    {idx < routine.length - 1 && <div style={{ width: 1, flex: 1, background: "#1E1E1F", marginTop: 4 }} />}
                  </div>
                  <div className="routine-block" style={{ flex: 1, borderLeftColor: block.color }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", width: 70, flexShrink: 0 }}>{block.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400 }}>{block.label}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", marginTop: 2 }}>{block.duration} min</div>
                    </div>
                    <button className="del-btn" onClick={() => deleteBlock(block.id)}>×</button>
                  </div>
                </div>
              ))}
              {routine.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif" }}>Your timetable is empty. Add your first block.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD HABIT MODAL */}
      {showAddHabit && (
        <div className="modal-overlay" onClick={() => setShowAddHabit(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 20 }}>New Habit</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input className="modal-input" placeholder="Habit name..." value={newHabit.name}
                onChange={e => setNewHabit(h => ({ ...h, name: e.target.value }))} />
              <select className="modal-select" value={newHabit.category}
                onChange={e => setNewHabit(h => ({ ...h, category: e.target.value }))}>
                {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginBottom: 8, letterSpacing: "0.1em" }}>COLOR</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {HABIT_COLORS.map(c => (
                    <div key={c} onClick={() => setNewHabit(h => ({ ...h, color: c }))}
                      style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                        border: newHabit.color === c ? "2px solid #F0EDE6" : "2px solid transparent", transition: "border 0.15s" }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginBottom: 8, letterSpacing: "0.1em" }}>REPEAT ON</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {DAYS.map((d, i) => (
                    <button key={i} className="day-pill"
                      style={{ borderColor: newHabit.days.includes(i) ? newHabit.color : "#2A2A2B", color: newHabit.days.includes(i) ? newHabit.color : "#555", background: newHabit.days.includes(i) ? `${newHabit.color}15` : "none" }}
                      onClick={() => setNewHabit(h => ({ ...h, days: h.days.includes(i) ? h.days.filter(x => x !== i) : [...h.days, i] }))}>
                      {d[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className="ghost-btn" onClick={() => setShowAddHabit(false)}>Cancel</button>
                <button className="add-btn" style={{ flex: 1 }} onClick={addHabit}>Add Habit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD BLOCK MODAL */}
      {showAddBlock && (
        <div className="modal-overlay" onClick={() => setShowAddBlock(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 20 }}>Add Time Block</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input className="modal-input" placeholder="Block label..." value={newBlock.label}
                onChange={e => setNewBlock(b => ({ ...b, label: e.target.value }))} />
              <select className="modal-select" value={newBlock.time}
                onChange={e => setNewBlock(b => ({ ...b, time: e.target.value }))}>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input className="modal-input" type="number" placeholder="Duration (min)" value={newBlock.duration} min={5} max={480}
                  onChange={e => setNewBlock(b => ({ ...b, duration: Number(e.target.value) }))}
                  style={{ flex: 1 }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#444" }}>min</span>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginBottom: 8, letterSpacing: "0.1em" }}>COLOR</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {HABIT_COLORS.map(c => (
                    <div key={c} onClick={() => setNewBlock(b => ({ ...b, color: c }))}
                      style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                        border: newBlock.color === c ? "2px solid #F0EDE6" : "2px solid transparent", transition: "border 0.15s" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button className="ghost-btn" onClick={() => setShowAddBlock(false)}>Cancel</button>
                <button className="add-btn" style={{ flex: 1 }} onClick={addBlock}>Add Block</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
