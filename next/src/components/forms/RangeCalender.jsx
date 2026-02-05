import React, { useMemo, useState } from "react";

/**
 * RangeCalendar
 * - 1st click: set start
 * - 2nd click: set end
 * - 3rd click: reset start to clicked date (end cleared)
 */
export default function RangeCalendar({
  initialMonth = new Date(), // 表示開始月
  value, // { start: Date|null, end: Date|null } を外から渡したい場合
  onChange, // (range) => void
  weekStartsOn = 0, // 0: Sunday, 1: Monday
}) {
    const isControlled = value != null;
    const [internalRange, setInternalRange] = useState({ start: null, end: null });
    const range = isControlled ? value : internalRange;

    const [viewDate, setViewDate] = useState(startOfMonth(initialMonth));
    const [hoverDate, setHoverDate] = useState(null);

    const setRange = (next) => {
        if (!isControlled) setInternalRange(next);
        onChange?.(next);
    };

    const weeks = useMemo(() => {
        return buildMonthGrid(viewDate, weekStartsOn);
    }, [viewDate, weekStartsOn]);

    const selecting = range.start && !range.end;
    const previewEnd = selecting ? hoverDate : null;

    const handleDayClick = (day) => {
        if (isSameDay(day, null)) return;

        // 1) start未選択 → startセット
        if (!range.start) {
        setRange({ start: day, end: null });
        return;
        }

        // 2) startはあるがend未確定 → end確定
        if (range.start && !range.end) {
        // 同日でもOK（1日レンジ）
        let start = range.start;
        let end = day;

        // 逆順クリックなら入れ替え
        if (end < start) {
            const tmp = start;
            start = end;
            end = tmp;
        }
        setRange({ start: stripTime(start), end: stripTime(end) });
        return;
        }

        // 3) すでにstart&end確定済み → クリック日を新しいstartにしてリセット
        setRange({ start: day, end: null });
    };

    const title = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;

    return (
        <div className="c-rangeCalendar">
            <div className="c-rangeCalendar__header">
                <button type="button" onClick={() => setViewDate(addMonths(viewDate, -1))} className="c-rangeCalendar__navBtn">
                ←
                </button>
                <div className="c-rangeCalendar__title">{title}</div>
                <button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="c-rangeCalendar__navBtn">
                →
                </button>
            </div>

            <div className="c-rangeCalendar__weekdays">
                {getWeekdayLabels(weekStartsOn).map((w) => (
                <div key={w} className="c-rangeCalendar__weekdayCell">{w}</div>
                ))}
            </div>

            <div className="c-rangeCalendar__grid">
                {weeks.flat().map((cell) => {
                const { date, inMonth } = cell;

                const isStart = range.start && isSameDay(date, range.start);
                const isEnd = range.end && isSameDay(date, range.end);

                const inSelected =
                    range.start &&
                    range.end &&
                    isBetweenInclusive(date, range.start, range.end);

                const inPreview =
                    selecting &&
                    range.start &&
                    previewEnd &&
                    isBetweenInclusive(
                    date,
                    minDate(range.start, previewEnd),
                    maxDate(range.start, previewEnd)
                    );

                return (
                    <button
                    key={dateKey(date)}
                    type="button"
                    className={`
                        c-rangeCalendar__dayCell
                        ${!inMonth ? "c-rangeCalendar__dayCell--out" : ""}
                        ${inSelected ? "c-rangeCalendar__dayCell--inSelected" : ""}
                        ${inPreview ? "c-rangeCalendar__dayCell--inPreview" : ""}
                        ${(isStart || isEnd) ? "c-rangeCalendar__dayCell--endpoint" : ""}
                    `}
                    onClick={() => handleDayClick(stripTime(date))}
                    onMouseEnter={() => setHoverDate(stripTime(date))}
                    onMouseLeave={() => setHoverDate(null)}
                    >
                    <span className="c-rangeCalendar__dayNum">{date.getDate()}</span>
                    {(isStart || isEnd) && <span className="c-rangeCalendar__dot"/>}
                    </button>
                );
                })}
            </div>
        </div>
    );
}

/* =========================
   Helpers
========================= */

function stripTime(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addMonths(d, delta) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return startOfMonth(x);
}
function daysInMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return x.getDate();
}
function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function minDate(a, b) {
  return a < b ? a : b;
}
function maxDate(a, b) {
  return a > b ? a : b;
}
function isBetweenInclusive(d, a, b) {
  const dd = stripTime(d).getTime();
  const aa = stripTime(a).getTime();
  const bb = stripTime(b).getTime();
  return dd >= aa && dd <= bb;
}
function formatYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build 6x7 grid for a month view (common calendar layout)
 * weekStartsOn: 0(Sun) or 1(Mon) ... etc
 */
function buildMonthGrid(viewDate, weekStartsOn) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  first.setHours(0, 0, 0, 0);

  const firstDayOfWeek = first.getDay(); // 0..6 (Sun..Sat)
  const offset = (firstDayOfWeek - weekStartsOn + 7) % 7;

  const start = new Date(year, month, 1 - offset);
  start.setHours(0, 0, 0, 0);

  const grid = [];
  let cursor = new Date(start);

  // 6 weeks x 7 days
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      row.push({
        date: new Date(cursor),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    grid.push(row);
  }

  return grid;
}

function getWeekdayLabels(weekStartsOn) {
  // ひらがなに寄せたければここを変更してOK
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels.slice(weekStartsOn).concat(labels.slice(0, weekStartsOn));
}
