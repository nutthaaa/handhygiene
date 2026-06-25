import ExcelJS from "exceljs";
import { MONTH_NAMES } from "../data/constants.js";

const NO_HAND_HYGIENE = "ไม่ทำความสะอาดมือ";
const NO_MOMENT_DATA = "ไม่มีข้อมูล Moment";
const NO_COMPLETE_DATA = "ไม่มีข้อมูลครบ 6 ขั้นตอน";
const UNKNOWN = "ไม่ระบุ";

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const unique = (items) => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));

export function calculateRate(records) {
  const denominator = records.length;
  const compliant = records.filter((item) =>
    item.method.startsWith("H1") || item.method.startsWith("H2"),
  ).length;
  const complete = records.filter((item) => item.result.startsWith("ครบ")).length;
  const completeDenominator = records.filter((item) => item.result !== NO_COMPLETE_DATA).length;
  return {
    denominator,
    compliant,
    complete,
    completeDenominator,
    nonCompliant: denominator - compliant,
    incomplete: Math.max(compliant - complete, 0),
    complianceRate: denominator ? compliant * 100 / denominator : 0,
    completeRate: completeDenominator ? complete * 100 / completeDenominator : 0,
  };
}

export function calculateExcelSummaries(records) {
  const monthGroups = records.reduce((groups, record) => {
    const key = monthKey(record.date);
    (groups[key] ||= []).push(record);
    return groups;
  }, {});

  const monthly = Object.entries(monthGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rows]) => ({ key, label: monthLabel(key), ...calculateRate(rows) }));

  const ytd = monthly.reduce((total, month) => ({
    denominator: total.denominator + month.denominator,
    compliant: total.compliant + month.compliant,
    complete: total.complete + month.complete,
    completeDenominator: total.completeDenominator + month.completeDenominator,
    incomplete: total.incomplete + month.incomplete,
    nonCompliant: total.nonCompliant + month.nonCompliant,
  }), { denominator: 0, compliant: 0, complete: 0, completeDenominator: 0, incomplete: 0, nonCompliant: 0 });

  ytd.complianceRate = ytd.denominator ? ytd.compliant * 100 / ytd.denominator : 0;
  ytd.completeRate = ytd.completeDenominator ? ytd.complete * 100 / ytd.completeDenominator : 0;
  return { monthly, ytd };
}

function excelCellValue(cell) {
  const value = cell?.value;
  if (value == null) return "";
  if (typeof value !== "object") return value;
  if ("result" in value) return value.result ?? "";
  if ("text" in value) return value.text ?? "";
  return "";
}

function daysInImportMonth(importMonth) {
  const [year, month] = String(importMonth).split("-").map(Number);
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function normalizeImportedDate(value, importMonth) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  const text = clean(value);
  const day = Number(text);
  if (Number.isInteger(day) && day >= 1 && day <= daysInImportMonth(importMonth)) {
    return `${importMonth}-${String(day).padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return `${importMonth}-01`;
}

function isObservationHeader(row) {
  const headers = Array.from({ length: 6 }, (_, index) => clean(excelCellValue(row.getCell(index + 1))));
  return (headers[0].includes("วันที่สังเกต") || headers[0].includes("วัน/เดือน/ปี") || /date/i.test(headers[0]))
    && (headers[1].includes("แผนก") || headers[1].includes("สังเกตการทำความสะอาดมือ") || /department|unit|ward/i.test(headers[1]))
    && headers[3].includes("Moment")
    && (headers[4].includes("วิธีการทำความสะอาดมือ") || /hand hygiene action|method/i.test(headers[4]));
}

function readRawObservationSheets(workbook, file, importMonth, importedAt) {
  const candidates = [];
  workbook.eachSheet((sheet) => {
    if (!isObservationHeader(sheet.getRow(1))) return;

    const rows = [];
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const department = clean(excelCellValue(row.getCell(2)));
      const profession = clean(excelCellValue(row.getCell(3)));
      const moment = clean(excelCellValue(row.getCell(4)));
      const method = clean(excelCellValue(row.getCell(5)));
      const result = clean(excelCellValue(row.getCell(6)));

      const validMoment = /^M\s*[1-5]\b/i.test(moment);
      const validMethod = /^H\s*[12]\b/i.test(method) || method.includes(NO_HAND_HYGIENE);
      if (!department || !validMoment || !validMethod) continue;

      rows.push({
        id: `csi:${importMonth}:${sheet.name}:${rowNumber}`,
        date: normalizeImportedDate(excelCellValue(row.getCell(1)), importMonth),
        department,
        profession: profession || UNKNOWN,
        moment,
        method,
        result: result || (method.includes(NO_HAND_HYGIENE) ? NO_HAND_HYGIENE : UNKNOWN),
        source: "CSI Excel",
        csiMonth: importMonth,
        csiFile: file.name,
        csiSheet: sheet.name,
        importedAt,
      });
    }
    if (rows.length) candidates.push({ sheetName: sheet.name, records: rows });
  });

  candidates.sort((a, b) => b.records.length - a.records.length);
  return candidates[0]?.records || [];
}

function cleanCsiDepartment(value) {
  const text = clean(value);
  return text.includes(" - ") ? text.split(" - ").slice(1).join(" - ").trim() : text;
}

export async function readCsiExcel(file, importMonth) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const importedAt = new Date().toISOString();

  const detailedRecords = readRawObservationSheets(workbook, file, importMonth, importedAt);
  if (detailedRecords.length) return detailedRecords;

  const sheet = workbook.getWorksheet("CSI");
  if (!sheet) throw new Error("ไม่พบชีตชื่อ CSI");

  let allSectionRow = 0;
  sheet.eachRow((row, rowNumber) => {
    if (clean(excelCellValue(row.getCell(2))).includes("All : IPD+OPD")) allSectionRow = rowNumber;
  });
  if (!allSectionRow) throw new Error("ไม่พบตาราง All : IPD+OPD ในชีต CSI");

  const records = [];
  for (let rowNumber = allSectionRow + 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const department = cleanCsiDepartment(excelCellValue(row.getCell(2)));
    const numerator = Number(excelCellValue(row.getCell(3)) || 0);
    const denominator = Number(excelCellValue(row.getCell(4)) || 0);
    if (!department || !Number.isFinite(denominator) || denominator <= 0) continue;
    const safeNumerator = Math.min(Math.max(Number.isFinite(numerator) ? numerator : 0, 0), denominator);

    for (let index = 0; index < denominator; index += 1) {
      const compliant = index < safeNumerator;
      records.push({
        id: `csi:${importMonth}:${rowNumber}:${index}`,
        date: `${importMonth}-01`,
        department,
        profession: "CSI Aggregate",
        moment: NO_MOMENT_DATA,
        method: compliant ? "H1/H2 จากข้อมูล CSI" : NO_HAND_HYGIENE,
        result: NO_COMPLETE_DATA,
        source: "CSI",
        csiMonth: importMonth,
        csiFile: file.name,
        importedAt,
      });
    }
  }
  if (!records.length) throw new Error("ไม่พบข้อมูลตัวตั้ง/ตัวหารที่นำเข้าได้");
  return records;
}

export function monthKey(date) {
  return clean(date).slice(0, 7);
}

export function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1] ?? month} ${year + 543}`;
}

export async function exportResults(records) {
  const workbook = new ExcelJS.Workbook();
  const observations = workbook.addWorksheet("Observations");
  observations.columns = [
    { header: "วันที่สังเกต", key: "date", width: 16 },
    { header: "แผนก", key: "department", width: 24 },
    { header: "ตำแหน่ง", key: "profession", width: 28 },
    { header: "Moment", key: "moment", width: 42 },
    { header: "วิธีทำความสะอาดมือ", key: "method", width: 42 },
    { header: "ผลการทำครบขั้นตอน", key: "result", width: 28 },
  ];
  observations.addRows(records);
  observations.getRow(1).font = { bold: true };

  const summary = workbook.addWorksheet("Department Summary");
  summary.addRow(["แผนก", "ตัวตั้ง Compliance", "ตัวหาร Compliance", "ร้อยละ Compliance", "ตัวตั้งครบ 6 ขั้นตอน", "ตัวหารครบ 6 ขั้นตอน", "ร้อยละครบ 6 ขั้นตอน"]);
  summary.getRow(1).font = { bold: true };
  unique(records.map((item) => item.department)).forEach((department, index) => {
    const stats = calculateRate(records.filter((item) => item.department === department));
    const excelRow = index + 2;
    summary.addRow([
      department,
      stats.compliant,
      stats.denominator,
      { formula: `IFERROR(B${excelRow}*100/C${excelRow},0)`, result: stats.complianceRate },
      stats.complete,
      stats.completeDenominator,
      { formula: `IFERROR(E${excelRow}*100/F${excelRow},0)`, result: stats.completeRate },
    ]);
  });
  summary.columns = [{ width: 24 }, { width: 20 }, { width: 18 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 24 }];
  summary.getColumn(4).numFmt = "0.0";
  summary.getColumn(7).numFmt = "0.0";

  const { monthly } = calculateExcelSummaries(records);
  const ytdSheet = workbook.addWorksheet("Monthly & YTD");
  ytdSheet.addRow(["เดือน", "ตัวตั้ง Compliance", "ตัวหาร Compliance", "ร้อยละ Compliance", "ตัวตั้งครบ 6 ขั้นตอน", "ตัวหารครบ 6 ขั้นตอน", "ร้อยละครบ 6 ขั้นตอน"]);
  ytdSheet.getRow(1).font = { bold: true };
  monthly.forEach((month, index) => {
    const excelRow = index + 2;
    ytdSheet.addRow([
      month.label,
      month.compliant,
      month.denominator,
      { formula: `IFERROR(B${excelRow}*100/C${excelRow},0)`, result: month.complianceRate },
      month.complete,
      month.completeDenominator,
      { formula: `IFERROR(E${excelRow}*100/F${excelRow},0)`, result: month.completeRate },
    ]);
  });
  const ytdRow = monthly.length + 2;
  if (monthly.length) {
    const firstDataRow = 2;
    const lastDataRow = monthly.length + 1;
    ytdSheet.addRow([
      "YTD",
      { formula: `SUM(B${firstDataRow}:B${lastDataRow})` },
      { formula: `SUM(C${firstDataRow}:C${lastDataRow})` },
      { formula: `IFERROR(B${ytdRow}*100/C${ytdRow},0)` },
      { formula: `SUM(E${firstDataRow}:E${lastDataRow})` },
      { formula: `SUM(F${firstDataRow}:F${lastDataRow})` },
      { formula: `IFERROR(E${ytdRow}*100/F${ytdRow},0)` },
    ]);
  } else {
    ytdSheet.addRow(["YTD", 0, 0, 0, 0, 0, 0]);
  }
  ytdSheet.getRow(ytdRow).font = { bold: true };
  ytdSheet.columns = [{ width: 20 }, { width: 20 }, { width: 18 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 24 }];
  ytdSheet.getColumn(4).numFmt = "0.0";
  ytdSheet.getColumn(7).numFmt = "0.0";

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `HandHygiene-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}
