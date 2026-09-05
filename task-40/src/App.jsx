import { useMemo, useRef, useState, useCallback } from "react";
import { generateRows } from "./generateRows.js";

const ROW_HEIGHT = 44;
const VIEWPORT_HEIGHT = 560;
const OVERSCAN = 6;
const TOTAL_ROWS = 10000;

const ALL_ROWS = generateRows(TOTAL_ROWS);

function useVirtualizedList(itemCount, itemHeight, viewportHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef(null);

  const visibleCount = Math.ceil(viewportHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const endIndex = Math.min(itemCount, startIndex + visibleCount + OVERSCAN * 2);

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    viewportRef,
    onScroll,
    startIndex,
    endIndex,
    totalHeight: itemCount * itemHeight,
    offsetY: startIndex * itemHeight,
  };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const filteredSorted = useMemo(() => {
    let rows = ALL_ROWS;
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    const sorted = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [query, sortKey, sortDir]);

  const { viewportRef, onScroll, startIndex, endIndex, totalHeight, offsetY } = useVirtualizedList(
    filteredSorted.length,
    ROW_HEIGHT,
    VIEWPORT_HEIGHT
  );

  const visibleRows = filteredSorted.slice(startIndex, endIndex);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortArrow(key) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? "▲" : "▼";
  }

  return (
    <div className="wrap">
      <h1>📋 Virtualized 10,000-Row Table</h1>
      <p className="desc">
        Only the ~{Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2} rows near the viewport are ever mounted
        in the DOM at once (see <code>useVirtualizedList</code> in <code>src/App.jsx</code>) — scroll through all
        {" "}{TOTAL_ROWS.toLocaleString()} rows and it stays smooth because absolute positioning + a spacer div
        simulate full scroll height without rendering every row.
      </p>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="stats-bar">
        <span><b>{filteredSorted.length.toLocaleString()}</b> rows matched</span>
        <span>Rendering rows <b>{startIndex}</b>–<b>{endIndex}</b> ({visibleRows.length} DOM nodes)</span>
      </div>

      <div className="table-shell">
        <div className="table-header">
          <div className="col" onClick={() => toggleSort("id")}>ID <span className="sort-arrow">{sortArrow("id")}</span></div>
          <div className="col" onClick={() => toggleSort("name")}>Name <span className="sort-arrow">{sortArrow("name")}</span></div>
          <div className="col" onClick={() => toggleSort("email")}>Email <span className="sort-arrow">{sortArrow("email")}</span></div>
          <div className="col" onClick={() => toggleSort("status")}>Status <span className="sort-arrow">{sortArrow("status")}</span></div>
          <div className="col" onClick={() => toggleSort("score")}>Score <span className="sort-arrow">{sortArrow("score")}</span></div>
        </div>

        <div className="scroll-viewport" ref={viewportRef} onScroll={onScroll}>
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleRows.map((row, i) => (
              <div
                key={row.id}
                className="virtual-row"
                style={{ height: ROW_HEIGHT, transform: `translateY(${offsetY + i * ROW_HEIGHT}px)` }}
              >
                <div className="cell">{row.id}</div>
                <div className="cell">{row.name}</div>
                <div className="cell">{row.email}</div>
                <div className="cell">
                  <span className={`status-chip ${row.status}`}>{row.status}</span>
                </div>
                <div className="cell">{row.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
