import { useState } from "react";
import { monthLabel } from "../services/excelService.js";

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
  const rows = isCsi ? [
    ["ชื่อไฟล์", detail.item.fileName],
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
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="detail-modal-head">
          <div><small>{isCsi ? "CSI IMPORT" : "OBSERVATION FORM"}</small><h2>{isCsi ? detail.item.fileName : detail.item.department}</h2></div>
          <button onClick={onClose} aria-label="ปิด">×</button>
        </div>
        <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "ไม่ระบุ"}</dd></div>)}</dl>
      </section>
    </div>
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
    if (window.confirm(`ลบไฟล์ ${item.fileName} เดือน ${monthLabel(item.month)} ใช่หรือไม่?`)) {
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

  return (
    <section className="reports-page">
      <header>
        <div><p className="eyebrow">DATA MANAGEMENT</p><h1>รายงานและจัดการข้อมูล</h1><p className="header-subtitle">ตรวจสอบรายละเอียดและลบข้อมูลที่บันทึกผิดได้ทีละรายการ</p></div>
      </header>

      <section className="report-block">
        <div className="report-block-head">
          <div><span className="file-badge">CSI</span><div><h2>ไฟล์ Excel จาก CSI</h2><p>{csiCount.toLocaleString("th-TH")} observations · {csiImports.length} ไฟล์</p></div></div>
          {csiImports.length > 0 && <button className="danger-link" onClick={() => window.confirm("ลบข้อมูล CSI ทั้งหมดใช่หรือไม่?") && onClearCsi()}>ล้างทั้งหมด</button>}
        </div>
        {csiImports.length === 0 ? <div className="imported-empty">ยังไม่มีไฟล์ Excel จาก CSI</div> : (
          <div className="report-record-list">
            {csiImports.map((item) => (
              <article className="report-record" key={item.month}>
                <span className="record-icon excel">XLS</span>
                <div className="record-main"><b>{item.fileName}</b><small>เดือนข้อมูล {monthLabel(item.month)} · นำเข้า {formatDate(item.importedAt, true)}</small></div>
                <div className="record-stat"><b>{item.count.toLocaleString("th-TH")}</b><small>observations</small></div>
                <div className="record-actions"><button onClick={() => setDetail({ type: "csi", item })}>ดูรายละเอียด</button><button className="delete" onClick={() => removeImport(item)}>ลบ</button></div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="report-block">
        <div className="report-block-head">
          <div><span className="form-badge">FORM</span><div><h2>ข้อมูลจากแบบประเมิน</h2><p>{savedCount.toLocaleString("th-TH")} รายการ</p></div></div>
          {savedCount > 0 && <button className="danger-link" onClick={() => window.confirm("ลบแบบประเมินทั้งหมดใช่หรือไม่?") && onClearSaved()}>ล้างทั้งหมด</button>}
        </div>
        {formRecords.length === 0 ? <div className="imported-empty">ยังไม่มีข้อมูลจากแบบประเมิน</div> : (
          <div className="report-record-list">
            {[...formRecords].reverse().map((item) => (
              <article className="report-record" key={item.id}>
                <span className="record-icon form">FORM</span>
                <div className="record-main"><b>{item.department}</b><small>{formatDate(item.date)} · {item.profession}</small></div>
                <div className="record-stat"><b>{item.moment?.match(/M[1-5]/)?.[0] || "—"}</b><small>Moment</small></div>
                <div className="record-actions"><button onClick={() => setDetail({ type: "form", item })}>ดูรายละเอียด</button><button className="delete" onClick={() => removeForm(item)}>ลบ</button></div>
              </article>
            ))}
          </div>
        )}
      </section>
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </section>
  );
}
