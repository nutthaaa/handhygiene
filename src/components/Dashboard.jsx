import { useMemo, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";
import { MOMENTS } from "../data/constants.js";
import { calculateRate, exportResults, monthKey, monthLabel } from "../services/excelService.js";

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;
const momentCode = (value) => (String(value).match(/M\s*([1-5])/i)?.[1] ? `M${String(value).match(/M\s*([1-5])/i)[1]}` : "M?");
const groupBy = (rows, getter) => rows.reduce((result, row) => {
  const key = getter(row) || "ไม่ระบุ";
  (result[key] ||= []).push(row);
  return result;
}, {});

function Panel({ id, title, subtitle, className = "", action, children }) {
  return <article id={id} className={`panel dashboard-anchor ${className}`}><div className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</article>;
}

function KpiCard({ label, value, note, tone, icon }) {
  return <article className={`kpi ${tone}`}><span className="kpi-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>;
}

function TrendChart({ data }) {
  if (!data.length) return <div className="empty-state">ยังไม่มีข้อมูล</div>;
  const width = 680, height = 190, left = 38, right = 18, top = 14, bottom = 28;
  const x = (index) => data.length === 1 ? width / 2 : left + index * (width - left - right) / (data.length - 1);
  const y = (value) => top + (100 - value) * (height - top - bottom) / 100;
  const points = data.map((item, index) => `${x(index)},${y(item.value)}`).join(" ");
  const area = `${left},${height - bottom} ${points} ${x(data.length - 1)},${height - bottom}`;
  return (
    <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs><linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#36aea9" stopOpacity=".24" /><stop offset="1" stopColor="#36aea9" stopOpacity=".02" /></linearGradient></defs>
      {[0, 25, 50, 75, 100].map((value) => <g key={value}><line className="grid-line" x1={left} y1={y(value)} x2={width - right} y2={y(value)} /><text className="axis-label" x="2" y={y(value) + 3}>{value}%</text></g>)}
      <line className="target-line" x1={left} y1={y(90)} x2={width - right} y2={y(90)} />
      <polygon className="trend-area" points={area} /><polyline className="trend-line" points={points} />
      {data.map((item, index) => <g key={item.key}><circle className="trend-point" cx={x(index)} cy={y(item.value)} r="4" /><text className="axis-label" textAnchor="middle" x={x(index)} y={height - 7}>{item.label.split(" ")[0]}</text><text className="point-label" textAnchor="middle" x={x(index)} y={y(item.value) - 9}>{pct(item.value)}</text></g>)}
    </svg>
  );
}

function MomentsChart({ data, total }) {
  let cursor = 0;
  const gradient = data.map((item) => {
    const start = cursor;
    cursor += total ? item.count * 100 / total : 0;
    return `${item.color} ${start}% ${cursor}%`;
  }).join(", ");
  return <div className="moments-layout"><div className="donut" style={{ background: total ? `conic-gradient(${gradient})` : "#edf3f6" }}><div className="donut-center"><strong>{total.toLocaleString("th-TH")}</strong><span>ครั้ง</span></div></div><div className="legend">{data.map((item) => <div className="legend-row" key={item.code}><i style={{ background: item.color }} /><span><b>{item.code}</b> {item.label}</span><strong>{pct(item.value)}</strong></div>)}</div></div>;
}

function BarList({ data, ranked = false }) {
  if (!data.length) return <div className="empty-state">ยังไม่มีข้อมูล</div>;
  return <div className="bar-list">{data.map((item, index) => {
    const color = item.value >= 90 ? "#4bb78c" : item.value >= 80 ? "#43a9b5" : "#e4ad44";
    return <div className="bar-row" key={item.label}><span className="bar-label">{ranked && <b>{index + 1}</b>} {item.label}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${item.value}%`, background: color }} /></div><span className="bar-value">{pct(item.value)}</span></div>;
  })}</div>;
}

function heatColor(value) {
  if (value >= 90) return "#d8f0df";
  if (value >= 80) return "#eef1b7";
  if (value >= 70) return "#ffe0a4";
  return "#ffcfc3";
}

export default function Dashboard({ records, options, savedCount, csiCount, csiMonths, onImportCsi }) {
  const csiFileInput = useRef(null);
  const [csiMonth, setCsiMonth] = useState(new Date().toISOString().slice(0, 7));
  const [csiMessage, setCsiMessage] = useState("");
  const [csiImporting, setCsiImporting] = useState(false);
  const periods = useMemo(() => [...new Set(records.map((item) => monthKey(item.date)))].filter(Boolean).sort(), [records]);
  const [filters, setFilters] = useState({ department: "all", profession: "all", period: "all" });
  const filtered = useMemo(() => records.filter((item) =>
    (filters.department === "all" || item.department === filters.department)
    && (filters.profession === "all" || item.profession === filters.profession)
    && (filters.period === "all" || monthKey(item.date) === filters.period)
  ), [records, filters]);
  const stats = useMemo(() => calculateRate(filtered), [filtered]);
  const trend = useMemo(() => Object.entries(groupBy(filtered, (item) => monthKey(item.date))).sort(([a], [b]) => a.localeCompare(b)).map(([key, rows]) => ({ key, label: monthLabel(key), value: calculateRate(rows).complianceRate })), [filtered]);
  const momentData = useMemo(() => MOMENTS.map((item) => {
    const rows = filtered.filter((row) => momentCode(row.moment) === item.code);
    return { ...item, count: rows.length, value: calculateRate(rows).complianceRate };
  }), [filtered]);
  const momentObservationCount = useMemo(
    () => filtered.filter((row) => /^M[1-5]$/.test(momentCode(row.moment))).length,
    [filtered],
  );
  const departmentRates = useMemo(() => Object.entries(groupBy(filtered, (item) => item.department)).map(([label, rows]) => ({ label, count: rows.length, value: calculateRate(rows).complianceRate })).sort((a, b) => b.value - a.value).slice(0, 8), [filtered]);
  const professionRates = useMemo(() => Object.entries(groupBy(filtered, (item) => item.profession)).map(([label, rows]) => ({ label, count: rows.length, value: calculateRate(rows).complianceRate })).sort((a, b) => b.count - a.count).slice(0, 7), [filtered]);
  const heatmap = useMemo(() => Object.entries(groupBy(filtered, (item) => item.department)).sort((a, b) => b[1].length - a[1].length).slice(0, 8).map(([department, rows]) => ({
    department,
    values: MOMENTS.map((moment) => calculateRate(rows.filter((row) => momentCode(row.moment) === moment.code)).complianceRate),
    total: calculateRate(rows).complianceRate,
  })), [filtered]);
  const attention = [...departmentRates].sort((a, b) => a.value - b.value).slice(0, 4);

  const updateFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  async function handleCsiFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setCsiImporting(true);
    try {
      const count = await onImportCsi(file, csiMonth);
      setCsiMessage(`นำเข้า CSI เดือน ${monthLabel(csiMonth)} สำเร็จ ${count.toLocaleString("th-TH")} observations`);
    } catch (error) {
      setCsiMessage(`นำเข้า CSI ไม่สำเร็จ: ${error.message}`);
    } finally {
      setCsiImporting(false);
    }
  }

  return (
    <div id="overview" className="dashboard-anchor">
      <header>
        <div><p className="eyebrow">HAND HYGIENE MONITORING</p><h1>ภาพรวมการล้างมือของโรงพยาบาล</h1><p className="header-subtitle">ข้อมูลจากแบบประเมินในระบบ</p></div>
        <div className="header-actions">
          <button className="primary-link" type="button" onClick={() => csiFileInput.current?.click()} disabled={csiImporting}>
            {csiImporting ? "กำลังนำเข้า..." : "นำเข้า Excel"}
          </button>
          <label className="period"><Icon name="calendar" size={17} /><select value={filters.period} onChange={updateFilter("period")}><option value="all">ทุกเดือน</option>{periods.map((item) => <option value={item} key={item}>{monthLabel(item)}</option>)}</select></label>
          <input ref={csiFileInput} type="file" accept=".xlsx,.xls" hidden onChange={handleCsiFile} />
          <button className="outline-btn" onClick={() => exportResults(records)}>ส่งออก Excel</button>
        </div>
      </header>
      {csiMessage && <div className={`import-message ${csiMessage.includes("ไม่สำเร็จ") ? "error" : ""}`}>{csiMessage}</div>}
      <div className="filter-row">
        <label>หน่วยงาน<select value={filters.department} onChange={updateFilter("department")}><option value="all">ทุกหน่วยงาน</option>{options.department.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>กลุ่มบุคลากร<select value={filters.profession} onChange={updateFilter("profession")}><option value="all">ทุกกลุ่มบุคลากร</option>{options.profession.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="filter-summary"><strong>{filtered.length.toLocaleString("th-TH")}</strong> observations</div>
      </div>
      <section className="kpi-grid">
        <KpiCard label="Overall Compliance Rate" value={pct(stats.complianceRate)} note="เป้าหมาย ≥ 90%" tone="green" icon="✓" />
        <KpiCard label="Total Observations" value={stats.denominator.toLocaleString("th-TH")} note={`แบบประเมิน ${savedCount} + CSI ${csiCount}`} tone="blue" icon="▤" />
        <KpiCard label="Complete 6 Steps" value={pct(stats.completeRate)} note={`${stats.complete.toLocaleString("th-TH")}/${stats.completeDenominator.toLocaleString("th-TH")} รายการที่มีข้อมูล`} tone="teal" icon="✦" />
        <KpiCard label="Non-compliant Actions" value={stats.nonCompliant.toLocaleString("th-TH")} note="ไม่ทำความสะอาดมือ" tone="orange" icon="!" />
        <KpiCard label="Observation Coverage" value={new Set(filtered.map((item) => item.department)).size.toLocaleString("th-TH")} note="หน่วยงานที่มีข้อมูล" tone="gold" icon="◎" />
      </section>
      <section className="dashboard-grid">
        <Panel id="time-location" title="แนวโน้มตามเวลาและพื้นที่" subtitle={`Monthly Trend · ${new Set(filtered.map((item) => item.department)).size} locations`} className="trend-panel" action={<span className="target-chip">Target 90%</span>}><TrendChart data={trend} /></Panel>
        <Panel id="moments" title="อัตราการล้างมือตาม 5 Moments" subtitle="เฉพาะแบบประเมินที่มีข้อมูล Moment"><MomentsChart data={momentData} total={momentObservationCount} /></Panel>
        <Panel id="departments" title="อัตราการล้างมือตามแผนก" subtitle="Department ranking"><BarList data={departmentRates} ranked /></Panel>
        <Panel id="staff" title="อัตราการล้างมือตามกลุ่มบุคลากร" subtitle="Professional groups"><BarList data={professionRates} /></Panel>
        <Panel title="อัตราการล้างมือจำแนกหน่วยงาน" subtitle="Department × Moment" className="heatmap-panel"><div className="heatmap-wrap"><table className="heatmap-table"><thead><tr><th>หน่วยงาน</th>{MOMENTS.map((item) => <th key={item.code}>{item.code}</th>)}<th>รวม</th></tr></thead><tbody>{heatmap.map((row) => <tr key={row.department}><td>{row.department}</td>{row.values.map((value, index) => <td key={MOMENTS[index].code} style={{ background: heatColor(value) }}>{pct(value)}</td>)}<td style={{ background: heatColor(row.total) }}>{pct(row.total)}</td></tr>)}</tbody></table></div></Panel>
        <Panel id="non-compliance" title="จุดที่ควรติดตาม" subtitle="Top improvement opportunities"><div className="attention-list">{attention.map((item, index) => <div className="attention-item" key={item.label}><span>{index + 1}</span><div><b>{item.label}</b><small>{item.count} observations</small></div><strong>{pct(item.value)}</strong></div>)}</div></Panel>
      </section>
    </div>
  );
}
