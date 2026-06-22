import { useMemo, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";
import { MOMENTS } from "../data/constants.js";
import { calculateRate, exportResults, monthKey, monthLabel } from "../services/excelService.js";

/* ===== สีกรอบและไอคอนของ KPI (ใช้คลาส Tailwind) ===== */
const KPI_COLOR_CLASSES = {
  green: "border-green-500 text-green-500",
  blue: "border-blue-500 text-blue-500",
  teal: "border-teal-500 text-teal-500",
  orange: "border-orange-500 text-orange-500",
  gold: "border-yellow-500 text-yellow-500",
};

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;
const momentCode = (value) => (
  String(value).match(/M\s*([1-5])/i)?.[1]
    ? `M${String(value).match(/M\s*([1-5])/i)[1]}`
    : "M?"
);
const groupBy = (rows, getter) => rows.reduce((result, row) => {
  const key = getter(row) || "ไม่ระบุ";
  (result[key] ||= []).push(row);
  return result;
}, {});

function Panel({ id, title, subtitle, className = "", action, children }) {
  return (
    <article
      id={id}
      className={`scroll-mt-5 min-w-0 rounded-[13px] border border-slate-200 bg-white p-3.5 shadow-[0_8px_25px_rgba(26,68,98,.08)] ${className}`}
    >
      <div className="mb-2 flex min-h-8 items-start justify-between">
        <div>
          <h2 className="m-0 text-[11px] font-bold text-slate-800">{title}</h2>
          <p className="mt-px text-[8px] text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}

function KpiCard({ label, value, note, tone, icon }) {
  return (
    <article className={`relative flex min-h-[87px] items-center gap-2.5 overflow-hidden rounded-[13px] border bg-white p-[13px] shadow-[0_8px_25px_rgba(26,68,98,.08)] ${KPI_COLOR_CLASSES[tone]}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-current font-extrabold">
        <span className="text-white">{icon}</span>
      </span>
      <div>
        <small className="block text-xs text-slate-500">{label}</small>
        <strong className="my-1 block text-2xl leading-[1.1] text-slate-800">{value}</strong>
        <em className="block text-[8px] not-italic text-slate-500">{note}</em>
      </div>
    </article>
  );
}

function TrendChart({ data }) {
  if (!data.length) {
    return <div className="grid min-h-48 place-items-center text-[11px] text-slate-500">ยังไม่มีข้อมูล</div>;
  }
  const width = 680;
  const height = 190;
  const left = 38;
  const right = 18;
  const top = 14;
  const bottom = 28;
  const x = (index) => data.length === 1
    ? width / 2
    : left + index * (width - left - right) / (data.length - 1);
  const y = (value) => top + (100 - value) * (height - top - bottom) / 100;
  const points = data.map((item, index) => `${x(index)},${y(item.value)}`).join(" ");
  const area = `${left},${height - bottom} ${points} ${x(data.length - 1)},${height - bottom}`;

  return (
    <svg className="block h-[190px] w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#36aea9" stopOpacity=".24" />
          <stop offset="1" stopColor="#36aea9" stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line x1={left} y1={y(value)} x2={width - right} y2={y(value)} stroke="#e6eef3" />
          <text className="fill-slate-400 text-[9px]" x="2" y={y(value) + 3}>{value}%</text>
        </g>
      ))}
      <line x1={left} y1={y(90)} x2={width - right} y2={y(90)} stroke="#e99c65" strokeWidth="1.5" strokeDasharray="5 4" />
      <polygon points={area} fill="url(#trendArea)" />
      <polyline points={points} fill="none" stroke="#269fa1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((item, index) => (
        <g key={item.key}>
          <circle cx={x(index)} cy={y(item.value)} r="4" fill="#fff" stroke="#269fa1" strokeWidth="3" />
          <text className="fill-slate-400 text-[9px]" textAnchor="middle" x={x(index)} y={height - 7}>{item.label.split(" ")[0]}</text>
          <text className="fill-cyan-800 text-[8px] font-bold" textAnchor="middle" x={x(index)} y={y(item.value) - 9}>{pct(item.value)}</text>
        </g>
      ))}
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

  return (
    <div className="grid min-h-[190px] grid-cols-[125px_1fr] items-center gap-3">
      <div
        className="relative size-[124px] rounded-full after:absolute after:inset-[31px] after:rounded-full after:bg-white after:content-['']"
        style={{ background: total ? `conic-gradient(${gradient})` : "#edf3f6" }}
      >
        <div className="absolute inset-0 z-[1] grid content-center justify-items-center text-slate-500">
          <strong className="text-[17px] text-slate-800">{total.toLocaleString("th-TH")}</strong>
          <span className="text-[8px]">ครั้ง</span>
        </div>
      </div>
      <div className="grid gap-[7px]">
        {data.map((item) => (
          <div className="grid grid-cols-[8px_1fr_auto] items-center gap-1.5" key={item.code}>
            <i className="size-2 rounded-sm" style={{ background: item.color }} />
            <span className="text-[8px]"><b>{item.code}</b> {item.label}</span>
            <strong className="text-[9px]">{pct(item.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({ data, ranked = false }) {
  if (!data.length) {
    return <div className="grid min-h-48 place-items-center text-[11px] text-slate-500">ยังไม่มีข้อมูล</div>;
  }
  return (
    <div className="grid min-h-[190px] content-start gap-[9px]">
      {data.map((item, index) => {
        const color = item.value >= 90 ? "#4bb78c" : item.value >= 80 ? "#43a9b5" : "#e4ad44";
        return (
          <div className="grid grid-cols-[92px_1fr_37px] items-center gap-2" key={item.label}>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[8px]">
              {ranked && <b className="mr-1 text-sky-600">{index + 1}</b>} {item.label}
            </span>
            <div className="h-2.5 overflow-hidden rounded-md bg-slate-100">
              <div className="h-full min-w-0.5 rounded-md" style={{ width: `${item.value}%`, background: color }} />
            </div>
            <span className="text-right text-[9px] font-bold">{pct(item.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function heatColor(value) {
  if (value >= 90) return "#d8f0df";
  if (value >= 80) return "#eef1b7";
  if (value >= 70) return "#ffe0a4";
  return "#ffcfc3";
}

export default function Dashboard({ records, options, savedCount, csiCount, onImportCsi }) {
  const csiFileInput = useRef(null);
  const [csiMonth] = useState(new Date().toISOString().slice(0, 7));
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
  const trend = useMemo(() => Object.entries(groupBy(filtered, (item) => monthKey(item.date)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => ({ key, label: monthLabel(key), value: calculateRate(rows).complianceRate })), [filtered]);
  const momentData = useMemo(() => MOMENTS.map((item) => {
    const rows = filtered.filter((row) => momentCode(row.moment) === item.code);
    return { ...item, count: rows.length, value: calculateRate(rows).complianceRate };
  }), [filtered]);
  const momentObservationCount = useMemo(
    () => filtered.filter((row) => /^M[1-5]$/.test(momentCode(row.moment))).length,
    [filtered],
  );
  const departmentRates = useMemo(() => Object.entries(groupBy(filtered, (item) => item.department))
    .map(([label, rows]) => ({ label, count: rows.length, value: calculateRate(rows).complianceRate }))
    .sort((a, b) => b.value - a.value).slice(0, 8), [filtered]);
  const professionRates = useMemo(() => Object.entries(groupBy(filtered, (item) => item.profession))
    .map(([label, rows]) => ({ label, count: rows.length, value: calculateRate(rows).complianceRate }))
    .sort((a, b) => b.count - a.count).slice(0, 7), [filtered]);
  const heatmap = useMemo(() => Object.entries(groupBy(filtered, (item) => item.department))
    .sort((a, b) => b[1].length - a[1].length).slice(0, 8)
    .map(([department, rows]) => ({
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

  const fieldClass = "flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-2.5 py-[7px] text-[11px] text-slate-500";
  const selectClass = "max-w-[210px] border-0 bg-transparent text-xs font-semibold text-slate-800 outline-none";

  return (
    <div id="overview" className="scroll-mt-5">
      {/* ===== ส่วนหัว ===== */}
      <header className="mb-4 flex items-center justify-between gap-5 max-[720px]:flex-wrap max-[720px]:items-start">
        <div>
          <p className="m-0 text-xs font-extrabold tracking-[1.3px] text-sky-600">HAND HYGIENE MONITORING</p>
          <h1 className="mt-0.5 text-[23px] font-bold tracking-[-.45px] text-slate-800 max-[720px]:text-lg">ภาพรวมการล้างมือของโรงพยาบาล</h1>
          <p className="mt-px text-xs text-slate-500">ข้อมูลจากแบบประเมินในระบบ</p>
        </div>
        <div className="flex gap-2 max-[720px]:w-full max-[720px]:flex-wrap">
          <button className="inline-flex items-center whitespace-nowrap rounded-[9px] bg-sky-900 px-[13px] py-2 text-xs font-bold text-white hover:bg-sky-950 disabled:opacity-60" type="button" onClick={() => csiFileInput.current?.click()} disabled={csiImporting}>
            {csiImporting ? "กำลังนำเข้า..." : "นำเข้า Excel"}
          </button>
          <label className="flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-[11px] py-2 text-slate-500 max-[720px]:max-w-[170px]">
            <Icon name="calendar" size={17} />
            <select className={selectClass} value={filters.period} onChange={updateFilter("period")}>
              <option value="all">ทุกเดือน</option>
              {periods.map((item) => <option value={item} key={item}>{monthLabel(item)}</option>)}
            </select>
          </label>
          <input ref={csiFileInput} type="file" accept=".xlsx,.xls" hidden onChange={handleCsiFile} />
          <button className="whitespace-nowrap rounded-[9px] border border-slate-200 bg-white px-[11px] py-2 text-xs font-bold text-sky-900 hover:border-sky-300 hover:bg-sky-50" onClick={() => exportResults(records)}>ส่งออก Excel</button>
        </div>
      </header>

      {csiMessage && (
        <div className={`mb-2.5 rounded-lg px-[11px] py-2 text-[9px] ${csiMessage.includes("ไม่สำเร็จ") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {csiMessage}
        </div>
      )}

      {/* ===== ตัวกรอง ===== */}
      <div className="mb-3 flex items-center gap-[9px] max-[720px]:flex-wrap">
        <label className={fieldClass}>
          หน่วยงาน
          <select className={selectClass} value={filters.department} onChange={updateFilter("department")}>
            <option value="all">ทุกหน่วยงาน</option>
            {options.department.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className={fieldClass}>
          กลุ่มบุคลากร
          <select className={selectClass} value={filters.profession} onChange={updateFilter("profession")}>
            <option value="all">ทุกกลุ่มบุคลากร</option>
            {options.profession.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div className="ml-auto text-xs text-slate-500 max-[720px]:ml-0 max-[720px]:w-full">
          <strong className="text-xs text-sky-900">{filtered.length.toLocaleString("th-TH")}</strong> observations
        </div>
      </div>

      {/* ===== KPI ===== */}
      <section className="mb-[11px] grid grid-cols-5 gap-2.5 max-[1100px]:grid-cols-3 max-[720px]:grid-cols-2">
        <KpiCard label="Overall Compliance Rate" value={pct(stats.complianceRate)} note="เป้าหมาย ≥ 85%" tone="green" icon="✓" />
        <KpiCard label="Total Observations" value={stats.denominator.toLocaleString("th-TH")} note={`แบบประเมิน ${savedCount} + CSI ${csiCount}`} tone="blue" icon="▤" />
        <KpiCard label="Complete 6 Steps" value={pct(stats.completeRate)} note={`${stats.complete.toLocaleString("th-TH")}/${stats.completeDenominator.toLocaleString("th-TH")} รายการที่มีข้อมูล`} tone="teal" icon="✦" />
        <KpiCard label="Non-compliant Actions" value={stats.nonCompliant.toLocaleString("th-TH")} note="ไม่ทำความสะอาดมือ" tone="orange" icon="!" />
        <KpiCard label="Observation Coverage" value={new Set(filtered.map((item) => item.department)).size.toLocaleString("th-TH")} note="หน่วยงานที่มีข้อมูล" tone="gold" icon="◎" />
      </section>

      {/* ===== กราฟและตาราง ===== */}
      <section className="grid grid-cols-[1.2fr_1.05fr_.9fr] gap-[11px] max-[1100px]:grid-cols-2 max-[720px]:block [&>article]:max-[720px]:mb-2.5">
        <Panel id="time-location" title="แนวโน้มตามเวลาและพื้นที่" subtitle={`Monthly Trend · ${new Set(filtered.map((item) => item.department)).size} locations`} className="col-span-2" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600">Target 90%</span>}><TrendChart data={trend} /></Panel>
        <Panel id="moments" title="อัตราการล้างมือตาม 5 Moments" subtitle="เฉพาะแบบประเมินที่มีข้อมูล Moment"><MomentsChart data={momentData} total={momentObservationCount} /></Panel>
        <Panel id="departments" title="อัตราการล้างมือตามแผนก" subtitle="Department ranking"><BarList data={departmentRates} ranked /></Panel>
        <Panel id="staff" title="อัตราการล้างมือตามกลุ่มบุคลากร" subtitle="Professional groups"><BarList data={professionRates} /></Panel>
        <Panel title="อัตราการล้างมือจำแนกหน่วยงาน" subtitle="Department × Moment" className="col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-[3px] text-[8px]">
              <thead><tr><th className="p-[3px] text-left font-semibold text-slate-500">หน่วยงาน</th>{MOMENTS.map((item) => <th className="p-[3px] font-semibold text-slate-500" key={item.code}>{item.code}</th>)}<th className="p-[3px] font-semibold text-slate-500">รวม</th></tr></thead>
              <tbody>{heatmap.map((row) => <tr key={row.department}><td className="min-w-[75px] rounded p-1.5 text-left font-semibold text-slate-800">{row.department}</td>{row.values.map((value, index) => <td className="min-w-12 rounded p-1.5 text-center font-bold" key={MOMENTS[index].code} style={{ background: heatColor(value) }}>{pct(value)}</td>)}<td className="min-w-12 rounded p-1.5 text-center font-bold" style={{ background: heatColor(row.total) }}>{pct(row.total)}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
        <Panel id="non-compliance" title="จุดที่ควรติดตาม" subtitle="Top improvement opportunities">
          <div className="grid gap-2">
            {attention.map((item, index) => <div className="grid grid-cols-[25px_1fr_auto] items-center gap-2 rounded-lg bg-slate-50 p-2" key={item.label}><span className="grid size-[25px] place-items-center rounded-full bg-orange-100 text-[9px] font-extrabold text-orange-500">{index + 1}</span><div><b className="block text-[9px]">{item.label}</b><small className="block text-[8px] text-slate-500">{item.count} observations</small></div><strong className="text-[10px] text-orange-500">{pct(item.value)}</strong></div>)}
          </div>
        </Panel>
      </section>
    </div>
  );
}
