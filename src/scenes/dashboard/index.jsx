import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

const safeStr = (v) => (v ?? "").toString().trim();

function excelSerialToDate(n) {
  // Excel 1900 date system
  const ms = Math.round((n - 25569) * 86400 * 1000);
  return new Date(ms);
}

function toISODate(v) {
  if (v === null || v === undefined || v === "") return null;

  // SheetJS sometimes gives Date objects, strings, or serial numbers
  let d;
  if (v instanceof Date) d = v;
  else if (typeof v === "number") d = excelSerialToDate(v);
  else d = new Date(v);

  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function parseWorkbook(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const wb = XLSX.read(data, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  // defval keeps empty cells from disappearing
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  return rows;
}

function groupCount(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([k, v]) => ({ key: k, value: v }));
}

function groupSum(rows, keyFn, valFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    const v = Number(valFn(r) ?? 0);
    map.set(k, (map.get(k) ?? 0) + (Number.isNaN(v) ? 0 : v));
  }
  return [...map.entries()].map(([k, v]) => ({ key: k, value: v }));
}

const Card = ({ title, value, sub }) => (
  <div style={styles.card}>
    <div style={styles.cardTitle}>{title}</div>
    <div style={styles.cardValue}>{value}</div>
    {sub ? <div style={styles.cardSub}>{sub}</div> : null}
  </div>
);

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    event: "All",
    producer: "All",
  });

  const loadFile = async (file) => {
    const buf = await file.arrayBuffer();
    const parsed = parseWorkbook(buf);
    setRows(parsed);
  };

  const events = useMemo(() => {
    const s = new Set(rows.map((r) => safeStr(r["Event"]) || "Unknown"));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const producers = useMemo(() => {
    const s = new Set(rows.map((r) => safeStr(r["Producer"]) || "Unassigned"));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const ev = safeStr(r["Event"]) || "Unknown";
      const pr = safeStr(r["Producer"]) || "Unassigned";
      if (filters.event !== "All" && ev !== filters.event) return false;
      if (filters.producer !== "All" && pr !== filters.producer) return false;
      return true;
    });
  }, [rows, filters]);

  // KPIs
  const kpis = useMemo(() => {
    const totalLines = filteredRows.length;

    const totalQty = filteredRows.reduce((acc, r) => {
      const q = Number(r["Qty"] ?? 0);
      return acc + (Number.isNaN(q) ? 0 : q);
    }, 0);

    const uniqueMenuItems = new Set(
      filteredRows.map((r) => safeStr(r["Menu Item"]) || safeStr(r["Item"]) || "—")
    ).size;

    const scheduled = filteredRows.filter((r) => toISODate(r["Day"])).length;
    const unscheduled = totalLines - scheduled;

    const unassignedProducer = filteredRows.filter((r) => !safeStr(r["Producer"])).length;

    return { totalLines, totalQty, uniqueMenuItems, scheduled, unscheduled, unassignedProducer };
  }, [filteredRows]);

  // Chart data
  const itemsByDay = useMemo(() => {
    const map = new Map();
    for (const r of filteredRows) {
      const d = toISODate(r["Day"]);
      if (!d) continue;
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day, count }));
  }, [filteredRows]);

  const qtyByProducer = useMemo(() => {
    const data = groupSum(
      filteredRows,
      (r) => safeStr(r["Producer"]) || "Unassigned",
      (r) => r["Qty"]
    );
    // recharts wants named keys
    return data
      .map((d) => ({ producer: d.key, qty: d.value }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 12);
  }, [filteredRows]);

  const kosherBreakdown = useMemo(() => {
    const data = groupCount(filteredRows, (r) => safeStr(r["Kosher Type"]) || "Unknown");
    return data.map((d) => ({ name: d.key, value: d.value })).sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const itemsByEvent = useMemo(() => {
    const data = groupCount(filteredRows, (r) => safeStr(r["Event"]) || "Unknown");
    return data
      .map((d) => ({ event: d.key, count: d.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [filteredRows]);

  const pieColors = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#a3a3a3"];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.h1}>Culinary Production Dashboard</div>
          <div style={styles.h2}>Upload the schedule Excel → get KPIs, charts, and a table.</div>
        </div>

        <label style={styles.uploadBtn}>
          Upload .xlsx
          <input
            type="file"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </label>
      </header>

      {/* Filters */}
      <section style={styles.filters}>
        <div style={styles.filter}>
          <div style={styles.filterLabel}>Event</div>
          <select
            style={styles.select}
            value={filters.event}
            onChange={(e) => setFilters((f) => ({ ...f, event: e.target.value }))}
          >
            {events.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filter}>
          <div style={styles.filterLabel}>Producer</div>
          <select
            style={styles.select}
            value={filters.producer}
            onChange={(e) => setFilters((f) => ({ ...f, producer: e.target.value }))}
          >
            {producers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterNote}>
          Showing <b>{filteredRows.length}</b> rows
        </div>
      </section>

      {/* KPI row */}
      <section style={styles.kpis}>
        <Card title="Line Items" value={kpis.totalLines} />
        <Card title="Total Qty" value={kpis.totalQty.toLocaleString()} />
        <Card title="Unique Menu Items" value={kpis.uniqueMenuItems} />
        <Card title="Scheduled" value={kpis.scheduled} sub={`Unscheduled: ${kpis.unscheduled}`} />
        <Card title="Unassigned Producer" value={kpis.unassignedProducer} />
      </section>

      {/* Charts */}
      <section style={styles.grid2}>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Items by Day</div>
          {itemsByDay.length ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={itemsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={styles.empty}>No day values found (or filtered out).</div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Qty by Producer (Top 12)</div>
          {qtyByProducer.length ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={qtyByProducer}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="producer" interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="qty" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={styles.empty}>No producer/qty values found.</div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Kosher Type Breakdown</div>
          {kosherBreakdown.length ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={kosherBreakdown} dataKey="value" nameKey="name" outerRadius={110} label>
                    {kosherBreakdown.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={styles.empty}>No kosher type values found.</div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Items by Event (Top 12)</div>
          {itemsByEvent.length ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={itemsByEvent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="event" interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={styles.empty}>No event values found.</div>
          )}
        </div>
      </section>

      {/* Table preview */}
      <section style={styles.panel}>
        <div style={styles.panelTitle}>Data Preview</div>
        {!filteredRows.length ? (
          <div style={styles.empty}>Upload an Excel file to see rows.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {Object.keys(filteredRows[0]).map((k) => (
                    <th key={k} style={styles.th}>
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, 25).map((r, i) => (
                  <tr key={i}>
                    {Object.keys(filteredRows[0]).map((k) => (
                      <td key={k} style={styles.td}>
                        {String(r[k] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.tableFoot}>Showing first 25 rows</div>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background: "#0b0b10",
    color: "#eaeaf2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  h1: { fontSize: 22, fontWeight: 700, letterSpacing: 0.2 },
  h2: { fontSize: 13, opacity: 0.75, marginTop: 4 },
  uploadBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#111827",
    border: "1px solid #2b2b35",
    cursor: "pointer",
    fontSize: 13,
    userSelect: "none",
  },
  filters: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  filter: { display: "flex", flexDirection: "column", gap: 6 },
  filterLabel: { fontSize: 12, opacity: 0.75 },
  select: {
    background: "#0f172a",
    color: "#eaeaf2",
    border: "1px solid #2b2b35",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 13,
    minWidth: 220,
  },
  filterNote: { marginLeft: "auto", fontSize: 13, opacity: 0.85 },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #2b2b35",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardTitle: { fontSize: 12, opacity: 0.75 },
  cardValue: { fontSize: 20, fontWeight: 800, marginTop: 8 },
  cardSub: { fontSize: 12, opacity: 0.7, marginTop: 6 },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  panel: {
    background: "#0f172a",
    border: "1px solid #2b2b35",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  panelTitle: { fontSize: 13, fontWeight: 700, marginBottom: 10 },
  empty: { fontSize: 13, opacity: 0.75, padding: 10 },
  tableWrap: { overflow: "auto", borderRadius: 12, border: "1px solid #2b2b35" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    position: "sticky",
    top: 0,
    background: "#0b1220",
    textAlign: "left",
    padding: "10px 10px",
    borderBottom: "1px solid #2b2b35",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "9px 10px",
    borderBottom: "1px solid rgba(43,43,53,0.6)",
    whiteSpace: "nowrap",
    maxWidth: 420,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tableFoot: { fontSize: 12, opacity: 0.7, padding: "10px 2px 0" },
};
