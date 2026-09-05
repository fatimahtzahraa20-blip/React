import { useMemo, useState } from "react";

const today = new Date(); today.setHours(0, 0, 0, 0);
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const monthStart = d => new Date(d.getFullYear(), d.getMonth(), 1);
const same = (a, b) => !!a && !!b && a.getTime() === b.getTime();
const fmt = d => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date";
const dayCount = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000) + 1;
const monthGrid = m => { const first = monthStart(m), start = addDays(first, -first.getDay()); return Array.from({ length: 42 }, (_, i) => addDays(start, i)); };
const PRESETS = [
  ["Today", () => [today, today]],
  ["Yesterday", () => [addDays(today, -1), addDays(today, -1)]],
  ["Last 7 days", () => [addDays(today, -6), today]],
  ["Last 30 days", () => [addDays(today, -29), today]],
  ["This month", () => [monthStart(today), today]],
];

function Chevron({ left }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={left ? "m12.5 4-6 6 6 6" : "m7.5 4 6 6-6 6"} /></svg>;
}

function Month({ month, start, end, hover, selecting, onPick, onHover, previous, next, mobileNext }) {
  const dates = useMemo(() => monthGrid(month), [month]);
  const previewEnd = selecting && hover && hover >= start ? hover : end;
  return <section className="month" aria-label={month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}>
    <header>
      {previous ? <button className="nav" onClick={previous} aria-label="Previous month"><Chevron left /></button> : <i />}
      <h2>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
      {mobileNext ? <button className="nav mobile-next" onClick={mobileNext} aria-label="Next month"><Chevron /></button> : next ? <button className="nav" onClick={next} aria-label="Next month"><Chevron /></button> : <i />}
    </header>
    <div className="calendar" role="grid">
      {DOW.map(day => <b key={day}>{day}</b>)}
      {dates.map(date => {
        const outside = date.getMonth() !== month.getMonth(), disabled = date > today;
        const isStart = same(date, start), isEnd = same(date, previewEnd);
        const inside = start && previewEnd && date >= start && date <= previewEnd;
        const classes = ["day", outside && "outside", disabled && "disabled", inside && "inside", isStart && "start", isEnd && "end", isStart && isEnd && "single"].filter(Boolean).join(" ");
        return <button key={date.toISOString()} className={classes} disabled={outside || disabled}
          onClick={() => onPick(date)} onMouseEnter={() => onHover(date)}
          aria-label={fmt(date)} aria-selected={isStart || isEnd}><span>{date.getDate()}</span></button>;
      })}
    </div>
  </section>;
}

export default function App() {
  const initial = { start: addDays(today, -6), end: today };
  const [range, setRange] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [selecting, setSelecting] = useState(false);
  const [hover, setHover] = useState(null);
  const [open, setOpen] = useState(true);
  const [left, setLeft] = useState(addMonths(today, -1));
  const lastLeft = addMonths(today, -1);

  const openPicker = () => { setDraft(range); setSelecting(false); setOpen(true); };
  const pick = date => {
    if (!selecting) {
      setDraft({ start: date, end: null }); setSelecting(true); setHover(date);
    } else {
      setDraft(date < draft.start ? { start: date, end: draft.start } : { start: draft.start, end: date });
      setSelecting(false); setHover(null);
    }
  };
  const preset = item => {
    const [start, end] = item[1]();
    setDraft({ start, end }); setSelecting(false); setHover(null);
    setLeft(addMonths(end, -1));
  };
  const cancel = () => { setDraft(range); setSelecting(false); setOpen(false); };
  const apply = () => { if (draft.end) { setRange(draft); setOpen(false); } };

  return <main>
    <div className="eyebrow">REPORTING PERIOD</div>
    <h1>Select date range</h1>
    <p>Choose the dates you’d like to include in your report.</p>
    <div className="fields" aria-label="Selected date range">
      <button onClick={openPicker}><small>Start date</small><strong>{fmt(range.start)}</strong><span>▣</span></button>
      <em>→</em>
      <button onClick={openPicker}><small>End date</small><strong>{fmt(range.end)}</strong><span>▣</span></button>
    </div>
    {open && <div className="picker">
      <div className="presets">{PRESETS.map(item => <button key={item[0]} onClick={() => preset(item)}>{item[0]}</button>)}</div>
      <div className="months">
        <Month month={left} start={draft.start} end={draft.end} hover={hover} selecting={selecting} onPick={pick} onHover={setHover} previous={() => setLeft(addMonths(left, -1))} mobileNext={left < lastLeft ? () => setLeft(addMonths(left, 1)) : null} />
        <div className="rule" />
        <Month month={addMonths(left, 1)} start={draft.start} end={draft.end} hover={hover} selecting={selecting} onPick={pick} onHover={setHover} next={left < lastLeft ? () => setLeft(addMonths(left, 1)) : null} />
      </div>
      <footer>
        <div><small>Selected range</small><strong>{draft.end ? fmt(draft.start) + " – " + fmt(draft.end) : fmt(draft.start) + " – Select end date"}</strong>{draft.end && <span>{dayCount(draft.start, draft.end)} days</span>}</div>
        <nav><button onClick={cancel}>Cancel</button><button className="apply" disabled={!draft.end} onClick={apply}>Apply range</button></nav>
      </footer>
    </div>}
  </main>;
}
