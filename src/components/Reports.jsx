import { useState } from "react";
import { monthLabel } from "../services/excelService.js";

function repairMojibake(value) {
  const text = String(value ?? "");
  if (!/[àÃÂ]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from([...text].map((char) => char.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded.includes("\uFFFD") ? text : decoded;
  } catch {
    return text;
  }
}

function formatDate(value, withTime = false) {
  if (!value) return "ไม่ระบุ";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function DetailModal({ detail, onClose }) {
  if (!detail) return null;
  const isCsi = detail.type === "csi";
  const fileName = repairMojibake(detail.item.fileName);
  const rows = isCsi ? [
    ["ชื่อไฟล์", fileName],
    ["เดือนข้อมูล", monthLabel(detail.item.month)],
    ["วันที่นำเข้า", formatDate(detail.item.importedAt, true)],
    ["จำนวนแผนก", `${detail.item.departments} แผนก`],
    ["จำนวนข้อมูล", `${detail.item.count.toLocaleString("th-TH")} observations`],
  ] : [
    ["วันที่สังเกต", formatDate(detail.item.date)],
    ["แผนก", detail.item.department],
    ["ตำแหน่งบุคลากร", detail.item.profession],
    ["Moment", detail.item.moment],
    ["วิธีทำความสะอาดมือ", detail.item.method],
    ["ผล 6 ขั้นตอน", detail.item.result],
    ["วันที่บันทึก", formatDate(detail.item.createdAt, true)],
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5 backdrop-blur-[3px]" role="presentation" onClick={onClose}>
      <section className="max-h-[calc(100vh-40px)] w-full max-w-[560px] overflow-y-auto rounded-[14px] bg-white p-[18px] shadow-2xl" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-between gap-[15px] border-b border-slate-200 pb-3">
          <div className="min-w-0">
            <small className="mb-1 text-[13px] font-extrabold tracking-[1px] text-slate-700">{isCsi ? "CSI IMPORT" : "OBSERVATION FORM"}</small>
            <h2 className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">{isCsi ? fileName : detail.item.department}</h2>
          </div>
          <button className="grid size-[30px] cursor-pointer place-items-center rounded-full bg-slate-50 text-xl text-slate-600" onClick={onClose} aria-label="ปิด">×</button>
        </div>
        <dl className="grid">
          {rows.map(([label, value]) => (
            <div className="grid grid-cols-[145px_1fr] gap-2 border-b border-slate-100 px-[3px] py-[9px] max-[720px]:grid-cols-1 max-[720px]:gap-[3px]" key={label}>
              <dt className="p-1 text-[13px] font-semibold text-slate-700">{label}</dt>
              <dd className="m-0 p-1 text-[13px] leading-6 text-slate-700">{value || "ไม่ระบุ"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

const actionButton = "cursor-pointer whitespace-nowrap rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-sky-900";
const deleteButton = "cursor-pointer whitespace-nowrap rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700";

function ReportRecord({ badge, badgeClass, title, subtitle, stat, statLabel, hideBadge = false, onDetail, onDelete }) {
  return (
    <article className={`grid items-center gap-3 rounded-[9px] border border-slate-200 bg-slate-50/60 p-3 max-[1100px]:grid-cols-[minmax(0,1fr)_auto] ${hideBadge ? "grid-cols-[minmax(0,1fr)_120px_auto]" : "grid-cols-[40px_minmax(0,1fr)_120px_auto]"}`}>
      {!hideBadge && <span className={`grid size-[38px] place-items-center rounded-lg text-[12px] font-medium text-white ${badgeClass}`}>{badge}</span>}
      <div className="min-w-0">
        <b className="block overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium">{title}</b>
        <small className="mt-0.5 block text-[13px] font-medium text-slate-500">{subtitle}</small>
      </div>
      <div className="min-w-0 text-center max-[1100px]:hidden">
        <b className="block text-[15px] font-medium text-sky-900">{stat}</b>
        <small className="block text-[10px] font-medium text-slate-500">{statLabel}</small>
      </div>
      <div className="flex gap-2 max-[1100px]:col-start-2 max-[1100px]:col-end-[-1] max-[1100px]:justify-end">
        <button className={actionButton} onClick={onDetail}>ดูรายละเอียด</button>
        <button className={deleteButton} onClick={onDelete}>ลบ</button>
      </div>
    </article>
  );
}

export default function Reports({
  csiImports,
  csiCount,
  savedCount,
  formRecords,
  onClearCsi,
  onRemoveCsiImport,
  onClearSaved,
  onRemoveFormRecord,
}) {
  const [detail, setDetail] = useState(null);

  function removeImport(item) {
    const fileName = repairMojibake(item.fileName);
    if (window.confirm(`ลบไฟล์ ${fileName} เดือน ${monthLabel(item.month)} ใช่หรือไม่?`)) {
      onRemoveCsiImport(item.month);
      setDetail(null);
    }
  }

  function removeForm(item) {
    if (window.confirm(`ลบแบบประเมินของแผนก ${item.department} วันที่ ${formatDate(item.date)} ใช่หรือไม่?`)) {
      onRemoveFormRecord(item.id);
      setDetail(null);
    }
  }

  const blockClass = "mb-[13px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_25px_rgba(26,68,98,.08)]";
  const emptyClass = "rounded-lg bg-slate-50 p-3 text-center text-[12px] text-slate-500";
  const clearClass = "cursor-pointer border-0 bg-transparent text-[12px] font-medium text-red-600 underline";

  return (
    <section className="mx-auto max-[720px]:min-h-0">
      <header className="mb-4 flex items-center justify-between gap-5 max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h1 className="mt-0.5 text-[23px] font-bold tracking-[-.45px] text-slate-800 max-[720px]:text-lg">รายงานและจัดการข้อมูล</h1>
          <p className="m-0 text-[14px] font-extrabold tracking-[1.3px] text-slate-500">DATA MANAGEMENT</p>
        </div>
        <img className="h-[37px] w-auto shrink-0 object-contain" src="/bangkok-hospital-logo-navy-trim.png" alt="Bangkok Hospital" />
      </header>

      <section className={blockClass}>
        <div className="mb-[11px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[38px] place-items-center rounded-lg bg-emerald-600 text-[13px] font-semibold text-white">CSI</span>
            <div>
              <h2 className="text-[16px] font-medium">ไฟล์ Excel จาก CSI</h2>
              <p className="text-[13px] font-medium text-slate-500">{csiCount.toLocaleString("th-TH")} observations · {csiImports.length} ไฟล์</p>
            </div>
          </div>
          {csiImports.length > 0 && <button className={clearClass} onClick={() => window.confirm("ลบข้อมูล CSI ทั้งหมดใช่หรือไม่?") && onClearCsi()}>ล้างทั้งหมด</button>}
        </div>
        {csiImports.length === 0 ? <div className={emptyClass}>ยังไม่มีไฟล์ Excel จาก CSI</div> : (
          <div className="grid gap-[7px]">
            {csiImports.map((item) => {
              const fileName = repairMojibake(item.fileName);
              return (
                <ReportRecord
                  key={item.month}
                  hideBadge
                  title={fileName}
                  subtitle={`เดือนข้อมูล ${monthLabel(item.month)} · นำเข้า ${formatDate(item.importedAt, true)}`}
                  stat={item.count.toLocaleString("th-TH")}
                  statLabel="observations"
                  onDetail={() => setDetail({ type: "csi", item: { ...item, fileName } })}
                  onDelete={() => removeImport({ ...item, fileName })}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className={blockClass}>
        <div className="mb-[11px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-[38px] place-items-center rounded-lg bg-sky-600 text-[11px] font-semibold text-white">FORM</span>
            <div>
              <h2 className="text-[16px] font-medium">ข้อมูลจากแบบประเมิน</h2>
              <p className="text-[13px] text-slate-500">{savedCount.toLocaleString("th-TH")} รายการ</p>
            </div>
          </div>
          {savedCount > 0 && <button className={clearClass} onClick={() => window.confirm("ลบแบบประเมินทั้งหมดใช่หรือไม่?") && onClearSaved()}>ล้างทั้งหมด</button>}
        </div>
        {formRecords.length === 0 ? <div className={emptyClass}>ยังไม่มีข้อมูลจากแบบประเมิน</div> : (
          <div className="grid gap-[7px]">
            {[...formRecords].reverse().map((item) => (
              <ReportRecord
                key={item.id}
                hideBadge
                title={item.department}
                subtitle={`${formatDate(item.date)} · ${item.profession}`}
                stat={item.moment?.match(/M[1-5]/)?.[0] || "-"}
                statLabel="Moment"
                onDetail={() => setDetail({ type: "form", item })}
                onDelete={() => removeForm(item)}
              />
            ))}
          </div>
        )}
      </section>
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </section>
  );
}
