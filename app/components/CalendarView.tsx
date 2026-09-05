"use client";

import { useMemo, useState } from "react";
import type { Quest } from "@/lib/types";
import { Card } from "./ui";
import "../calendar-polish.css";

const shortDate = (date: Date) => new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short" }).format(date);
const clock = (value: string) => new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));

export function CalendarView({ quests, onSelect }: { quests: Quest[]; onSelect: (quest: Quest) => void }) {
  const [mode, setMode] = useState<"day" | "week">("week");
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: mode === "week" ? 7 : 1 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [mode]);
  const sessions = quests.flatMap((quest) => quest.events.map((event) => ({ quest, event })));
  const dateKey = (value: Date | string) => new Date(value).toDateString();
  const today = new Date();
  const hours = Array.from({ length: 15 }, (_, index) => index + 8);

  return (
    <section className="today-page calendar-page">
      <p className="eyebrow">行事曆</p>
      <h1>行事曆</h1>
      <p className="page-subtitle">看看你的行程，以及 Agent 安排的工作階段。</p>
      <div className="calendar-toolbar"><button className="text">‹</button><b>{mode === "week" ? "本週安排" : "今天的安排"}</b><button className="text">›</button><span /><div className="view-switch"><button className={mode === "day" ? "selected" : ""} onClick={() => setMode("day")}>日</button><button className={mode === "week" ? "selected" : ""} onClick={() => setMode("week")}>週</button></div></div>

      {sessions.length ? (
        <Card className="week-calendar">
          <div className="week-calendar-body">
          <div className="week-head"><span>時間</span>{days.map((day) => <b className={dateKey(day) === dateKey(today) ? "today-column" : ""} key={day.toISOString()}>{shortDate(day)}</b>)}</div>
          {hours.map((hour) => <div className="week-row" key={hour}><time>{String(hour).padStart(2, "0")}:00</time>{days.map((day) => {
            const daySessions = sessions.filter(({ event }) => dateKey(event.start) === dateKey(day) && new Date(event.start).getHours() === hour);
            const isToday = dateKey(day) === dateKey(today);
            const isCurrentHour = isToday && today.getHours() === hour;
            return <div className={`week-cell ${isToday ? "today-column" : ""}`} key={day.toISOString()}>{isCurrentHour && <span className="now-line" style={{ top: `${(today.getMinutes() / 60) * 100}%` }}>現在</span>}{daySessions.map(({ quest, event }) => <button className={`calendar-session ${event.provider === "demo" ? "agent-session" : "normal-session"}`} key={event.id} onClick={() => onSelect(quest)}><b>{event.title}</b><span>{clock(event.start)}–{clock(event.end)}</span><small>{event.provider === "demo" ? quest.title : "一般行程"}</small></button>)}</div>;
          })}</div>)}
          </div>
          <div className="calendar-legend"><span><i className="agent-dot" />Agent 工作階段</span><span><i className="normal-dot" />一般行程</span></div>
        </Card>
      ) : (
        <Card className="calendar-empty"><h2>目前還沒有安排。</h2><p>告訴 Agent 你想完成什麼，它會幫你找到適合的時間。</p></Card>
      )}
    </section>
  );
}
