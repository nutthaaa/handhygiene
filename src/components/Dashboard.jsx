import { useMemo, useRef, useState } from "react";
import { ClipboardList, HandHeart, UsersRound } from "lucide-react";
import { Icon } from "./Icons.jsx";
import { MOMENTS } from "../data/constants.js";
import { calculateRate, exportResults, monthKey, monthLabel } from "../services/excelService.js";

/* ===== สี KPI: กรอบ กล่องไอคอน และตัวไอคอนกำหนดแยกกัน ===== */
const KPI_COLORS = {
  green: {
    card: "border-green-700/20",
    iconBox: "bg-green-500/20",
    iconBorder: "border-green-500/30",
    icon: "text-green-700",
  },
  blue: {
    card: "border-blue-700/20",
    iconBox: "bg-blue-500/20",
    iconBorder: "border-blue-500/30",
    icon: "text-blue-700",
  },
  teal: {
    card: "border-teal-700/20",
    iconBox: "bg-teal-500/20",
    iconBorder: "border-teal-500/30",
    icon: "text-teal-700",
  },
  orange: {
    card: "border-orange-700/20",
    iconBox: "bg-orange-500/20",
    iconBorder: "border-orange-500/30",
    icon: "text-orange-700",
  },
  gold: {
    card: "border-yellow-700/20",
    iconBox: "bg-yellow-500/20",
    iconBorder: "border-yellow-500/30",
    icon: "text-yellow-700",
  },
};

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;
const shortMonthLabel = (key, fallback) => {
  const [year, month] = String(key).split("-").map(Number);
  if (!year || !month) return fallback;
  const buddhistYear = String(year + 543).slice(-2);
  return `${monthLabel(key).split(" ")[0]} ${buddhistYear}`;
};
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

/* SVG Repo: hand-raised-slash-svgrepo-com.svg */
function HandRaisedSlashIcon({ className, size = 26 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M30.3085 2.207c-2.2734 0-3.8672 1.5235-4.1953 3.8204-.6094-.586-1.4297-.8907-2.2969-.8907-2.4375 0-4.0547 1.6875-4.0547 4.2891v2.6016c-.6328-.6563-1.5703-1.0079-2.5781-1.0079-1.1484 0-2.1094.4688-2.6484 1.3125l2.5312 2.5313v-.1875c.0704-.3516.3047-.5859.7031-.5859.961 0 1.6641.7031 1.6641 1.6875v1.4765l2.9766 3V9.8477c0-1.0078.6328-1.6876 1.6171-1.6876.961 0 1.6641.6798 1.6641 1.6876v13.6406l2.9766 2.9765V6.9414c0-.9844.6797-1.7109 1.6406-1.7109.9375 0 1.6406.7265 1.6406 1.7109v19.6172c0 .8203.6563 1.4531 1.4532 1.4531.8203 0 1.5234-.6328 1.5234-1.4531V9.8477c0-1.0078.6563-1.6876 1.6406-1.6876.961 0 1.6172.6798 1.6172 1.6876v23.0624c0 1.0782.7032 1.8516 1.6641 1.8516.8437 0 1.5469-.375 2.0859-1.5469l3.1875-7.1249c.4453-1.0078 1.2657-1.5235 2.1562-1.1954.9375.375 1.2423 1.2656.7968 2.4844l-4.1483 11.5781c-.2578.7031-.5156 1.3594-.7969 1.9688l2.2969 2.2969c.4922-1.0079.961-2.1094 1.3594-3.2579l4.1483-11.6015c1.0315-2.9297.0941-5.3438-2.3438-6.2344-2.2029-.7969-4.3592.1406-5.367 2.5547l-1.5469 3.75c-.0469.0938-.0937.1641-.1875.1641-.1172 0-.1875-.0938-.1875-.211V9.5899c0-2.7422-1.7109-4.4532-4.3359-4.4532-.9376 0-1.8281.3281-2.461.9375-.3281-2.3906-1.8515-3.8672-4.1953-3.8672Zm16.0547 50.8829c.6797.7031 1.875.7031 2.5547 0 .7032-.6797.7032-1.8282 0-2.5547L7.2929 8.9336c-.7031-.7031-1.875-.7031-2.5781 0-.6797.7031-.6797 1.875 0 2.5547Zm-6.75-2.8829-2.3203-2.2968c-2.2266 1.4062-4.8516 2.0625-7.7813 2.0625-8.2968 0-13.3359-5.3204-13.3359-14.7657v-8.3906l-3.0937-3.0938v11.8595c0 10.9687 6.6328 17.6484 16.5468 17.6484 3.8906 0 7.2422-1.0078 9.9844-3.0235Z" />
    </svg>
  );
}

/* SVG Repo: target-04-svgrepo-com.svg */
function TargetArrowIcon({ className, size = 26 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8V5L19 2L20 4L22 5L19 8H16ZM16 8L12 11.9999M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7" />
    </svg>
  );
}

function Panel({ id, title, subtitle, className = "", titleClassName = "", action, children }) {
  return (
    <article
      id={id}
      className={`flex min-h-0 min-w-0 scroll-mt-5 flex-col rounded-[13px] border border-slate-200 bg-white p-2.5 shadow-[0_8px_25px_rgba(26,68,98,.08)] ${className}`}
    >
      <div className="mb-2 flex min-h-8 items-start justify-between">
        <div>
          <h2 className={`m-0 text-[11px] font-bold text-slate-800 ${titleClassName}`}>{title}</h2>
          <p className="mt-px text-[8px] text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </article>
  );
}

function KpiCard({ label, value, note, tone, icon }) {
  const colors = KPI_COLORS[tone];
  const KpiIcon = icon;
  return (
    <article className={`relative flex min-h-[87px] items-center gap-2.5 overflow-hidden rounded-[13px] border bg-white p-[13px] shadow-[0_8px_25px_rgba(26,68,98,.08)] ${colors.card}`}>
      <span className={`grid size-12 shrink-0 place-items-center rounded-full border font-extrabold ${colors.iconBox} ${colors.iconBorder}`}>
        <KpiIcon className={colors.icon} size={26} strokeWidth={2.2} aria-hidden="true" />
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
  const height = 230;
  const left = 48;
  const right = 12;
  const top = 20;
  const bottom = 24;
  const plotLeft = left;
  const plotRight = width - right;
  const plotBottom = height - bottom;
  const x = (index) => data.length === 1
    ? (plotLeft + plotRight) / 2
    : plotLeft + index * (plotRight - plotLeft) / (data.length - 1);
  const y = (value) => top + (100 - value) * (height - top - bottom) / 100;
  const points = data.map((item, index) => `${x(index)},${y(item.value)}`).join(" ");
  const area = `${plotLeft},${plotBottom} ${points} ${x(data.length - 1)},${plotBottom}`;

  return (
    <svg
      className="block h-full min-h-[220px] w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* กล่องพื้นที่กราฟ: ข้อมูลทั้งหมดอยู่ภายในกรอบนี้ */}
      <rect
        x={left}
        y={top}
        width={plotRight - left}
        height={plotBottom - top}
        rx="4"
        fill="#ffffff"
      />

      {/* สีพื้นที่อยู่ชั้นล่างสุด จึงไม่ทับเส้นแกนและเส้นกริด */}
      <polygon points={area} fill="#dff2f5" />

      {/* แกน Y และเส้นกริดแนวนอน */}
      {[0, 20, 40, 60, 80, 100].map((value) => (
        <g key={value}>
          <line x1={left} y1={y(value)} x2={plotRight} y2={y(value)} stroke="#dfe8ee" />
          <text
            className="fill-slate-500 text-[13px] font-semibold"
            x={left - 14}
            y={y(value) + 5}
            textAnchor="end"
          >
            {value}
          </text>
        </g>
      ))}
      <text
        className="fill-slate-500 text-sm font-bold"
        x={left - 14}
        y={top - 9}
        textAnchor="end"
      >
        (%)
      </text>

      {/* กรอบกราฟอยู่เหนือสีพื้นที่ */}
      <rect
        x={left}
        y={top}
        width={plotRight - left}
        height={plotBottom - top}
        rx="4"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />

      {/* เส้นเกณฑ์ */}
      <line x1={left} y1={y(85)} x2={plotRight} y2={y(85)} stroke="#c76c55" strokeWidth="2.5" strokeDasharray="9 6" />

      {/* เส้นข้อมูลและจุด */}
      <polyline points={points} fill="none" stroke="#3f9fa7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((item, index) => (
        <g key={item.key}>
          <circle cx={x(index)} cy={y(item.value)} r="7" fill="#3f9fa7" />
          {/* ค่าเปอร์เซ็นต์อยู่เหนือจุด ส่วนชื่อเดือนอยู่นอกกรอบด้านล่าง */}
          <text
            x={index === data.length - 1 ? x(index) - 4 : x(index) + 4}
            y={y(item.value) - 12}
            textAnchor={index === data.length - 1 ? "end" : "start"}
            fill="#334155"
            fontSize="13"
            fontWeight="800"
          >
            {pct(item.value)}
          </text>
          <text x={x(index)} y={plotBottom + 20} textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="600">
            {shortMonthLabel(item.key, item.label)}
          </text>
        </g>
      ))}

      {/* คำอธิบายเส้นกราฟ */}
      <g transform={`translate(${left + 20} ${plotBottom - 14})`}>
        <line x1="0" y1="0" x2="34" y2="0" stroke="#3f9fa7" strokeWidth="4" strokeLinecap="round" />
        <text x="44" y="4" fill="#475569" fontSize="12" fontWeight="600">Compliance Rate (%)</text>
        <line x1="190" y1="0" x2="224" y2="0" stroke="#c76c55" strokeWidth="2.5" strokeDasharray="9 6" />
        <text x="234" y="4" fill="#475569" fontSize="12" fontWeight="600">Target 85%</text>
      </g>
    </svg>
  );
}

function MomentsChart({ data, total }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  const segments = data.map((item) => {
    const share = total ? item.count / total : 1 / data.length;
    const start = cursor;
    const length = share * circumference;
    const middleAngle = -90 + (start + length / 2) / circumference * 360;
    const angle = middleAngle * Math.PI / 180;
    cursor += length;
    return {
      ...item,
      dashArray: `${Math.max(length - 2, 0)} ${circumference}`,
      dashOffset: -start,
      labelX: 90 + Math.cos(angle) * radius,
      labelY: 90 + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="grid h-full min-h-[220px] grid-cols-[minmax(180px,1.05fr)_minmax(0,1fr)] items-center gap-2 max-[1100px]:grid-cols-[170px_1fr]">
      <svg className="mx-auto block size-full max-h-[250px] max-w-[250px]" viewBox="0 0 180 180" aria-label="Compliance by 5 Moments">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#eef2f7" strokeWidth="40" />
        {segments.map((item) => (
          <circle
            key={item.code}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth="40"
            strokeDasharray={item.dashArray}
            strokeDashoffset={item.dashOffset}
            transform="rotate(-90 90 90)"
          />
        ))}
        <circle cx="90" cy="90" r="40" fill="#fff" />
        <text x="90" y="82" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600">Compliance</text>
        <text x="90" y="97" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600">by 5 Moments</text>
        {segments.map((item) => (
          <text
            key={`label-${item.code}`}
            x={item.labelX}
            y={item.labelY + 4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="9"
            fontWeight="800"
            paintOrder="stroke"
            stroke="rgba(0,0,0,.16)"
            strokeWidth=".8"
          >
            {pct(item.value)}
          </text>
        ))}
      </svg>

      <div className="grid content-center gap-3">
        {segments.map((item, index) => (
          <div className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-2" key={item.code}>
            <span
              className="grid size-[30px] place-items-center rounded-full border-2 text-xs font-extrabold"
              style={{ color: item.color, borderColor: item.color, backgroundColor: `${item.color}18` }}
            >
              {index + 1}
            </span>
            <span className="text-[10px] font-medium leading-[1.3] text-slate-600">{item.label}</span>
            <strong className="text-xs font-extrabold text-slate-700">{pct(item.value)}</strong>
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
    <div className="grid h-full auto-rows-fr content-stretch gap-[9px]">
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
  const periodRates = trend.map((item) => ({
    label: item.label,
    value: item.value,
  }));
  const attention = [...departmentRates]
    .filter((item) => item.value < 85)
    .sort((a, b) => a.value - b.value)
    .slice(0, 7);
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

  const fieldClass = "flex items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-2.5 py-[7px] text-[12px] font-base text-slate-400";
  const selectClass = "max-w-[210px] border-0 bg-transparent text-[12px] font-semibold text-slate-800 outline-none";

  return (
    <div id="overview" className="flex min-h-[calc(100vh-54px)] scroll-mt-5 flex-col max-[720px]:min-h-0">
      {/* ===== ส่วนหัว ===== */}
      <header className="mb-4 flex items-center justify-between gap-5 max-[720px]:flex-wrap max-[720px]:items-start">
        <div>
          <h1 className="mt-0.5 text-[23px] font-bold tracking-[-.45px] text-slate-800 max-[720px]:text-lg">ภาพรวมการล้างมือของโรงพยาบาล</h1>
          <p className="m-0 text-[14px] font-extrabold tracking-[1.3px] text-slate-500">HAND HYGIENE MONITORING</p>
        </div>
        <div className="flex gap-2 max-[720px]:w-full max-[720px]:flex-wrap">
          <button className="inline-flex items-center whitespace-nowrap border border-slate-200 rounded-[9px] bg-white px-[13px] py-2 text-xs font-semibold text-slate-700 hover:bg-sky-800 hover:text-white disabled:opacity-60" type="button" onClick={() => csiFileInput.current?.click()} disabled={csiImporting}>
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
          <button className="whitespace-nowrap rounded-[9px] border border-slate-200 bg-white px-[11px] py-2 text-xs font-semibold text-slate-700 hover:bg-sky-800 hover:text-white" onClick={() => exportResults(records)}>ส่งออก Excel</button>
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
        <KpiCard label="Overall Compliance Rate" value={pct(stats.complianceRate)} note="เป้าหมาย ≥ 85%" tone="green" icon={HandHeart} />
        <KpiCard label="Total Observations" value={stats.denominator.toLocaleString("th-TH")} note={`แบบประเมิน ${savedCount} + CSI ${csiCount}`} tone="blue" icon={ClipboardList} />
        <KpiCard label="Complete 6 Steps" value={pct(stats.completeRate)} note={`${stats.complete.toLocaleString("th-TH")}/${stats.completeDenominator.toLocaleString("th-TH")} รายการที่มีข้อมูล`} tone="teal" icon={UsersRound} />
        <KpiCard label="Non-compliant Actions" value={stats.nonCompliant.toLocaleString("th-TH")} note="ไม่ทำความสะอาดมือ" tone="orange" icon={HandRaisedSlashIcon} />
        <KpiCard label="Observation Coverage" value={new Set(filtered.map((item) => item.department)).size.toLocaleString("th-TH")} note="หน่วยงานที่มีข้อมูล" tone="gold" icon={TargetArrowIcon} />
      </section>

      {/* ===== กราฟและตาราง ===== */}
      <section className="grid w-full flex-1 grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-2 items-stretch gap-[11px] max-[720px]:block [&>article]:h-full [&>article]:max-[720px]:mb-2.5 [&>article]:max-[720px]:h-auto">
        <Panel id="time-location" title="แนวโน้มอัตราการล้างมือ (Compliance Trend)" titleClassName="!text-[15px] mb-1" className="!p-4 [&>div:first-child]:!mb-0.5 [&>div:first-child]:px-1.5 [&>div:last-child]:mt-1 [&>div:last-child]:min-h-0" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>}><TrendChart data={trend} /></Panel>
        <Panel id="moments" title="อัตราการล้างมือ จำแนกตาม 5 Moments" titleClassName="!text-[15px] mb-1" className="!p-4 [&>div:first-child]:!mb-0.5 [&>div:first-child]:px-1.5 [&>div:last-child]:mt-1 [&>div:last-child]:min-h-0" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>}><MomentsChart data={momentData} total={momentObservationCount} /></Panel>
        <Panel id="staff" title="อัตราการล้างมือ จำแนกตามประเภทบุคลากร" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>}><BarList data={professionRates} /></Panel>
        <Panel id="departments" title="อัตราการล้างมือ จำแนกตามแผนก" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>}><BarList data={departmentRates} ranked /></Panel>
        <Panel id="periods" title="อัตราการล้างมือ จำแนกตามช่วงเวลา" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>}><BarList data={periodRates} /></Panel>
        <Panel id="non-compliance" title="แผนกที่ต้องได้รับการติดตาม (ต่ำกว่าเป้าหมาย 85)" action={<span className="rounded-xl bg-teal-50 px-[7px] py-1 text-[8px] text-teal-600"></span>} subtitle="ต่ำกว่าเกณฑ์ 85%">
          {attention.length === 0 ? (
            <div className="grid h-full min-h-[170px] place-items-center rounded-lg bg-emerald-50 p-5 text-[10px] font-semibold text-emerald-700">
              ทุกแผนกผ่านเกณฑ์ 85%
            </div>
          ) : (
          <div className="grid h-full auto-rows-fr gap-2">
              {attention.map((item, index) => <div className="grid grid-cols-[25px_1fr_auto] items-center gap-2 rounded-lg bg-slate-50 p-2" key={item.label}><span className="grid size-[25px] place-items-center rounded-full bg-orange-100 text-[9px] font-extrabold text-orange-500">{index + 1}</span><div><b className="block text-[9px]">{item.label}</b><small className="block text-[8px] text-slate-500">{item.count} observations</small></div><strong className="text-[10px] text-orange-500">{pct(item.value)}</strong></div>)}
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}
