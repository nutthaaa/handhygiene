import { useEffect, useMemo, useState } from "react";
import { CSI_STORAGE_KEY, DEFAULT_HEADERS, STORAGE_KEY, SURVEY_OPTIONS } from "../data/constants.js";
import { readCsiExcel } from "../services/excelService.js";

function loadSavedRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadCsiRecords() {
  try {
    return JSON.parse(localStorage.getItem(CSI_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useHandHygieneData() {
  const [formRecords, setFormRecords] = useState(loadSavedRecords);
  const [csiRecords, setCsiRecords] = useState(loadCsiRecords);

  useEffect(() => {
    const refreshRecords = () => {
      setFormRecords(loadSavedRecords());
      setCsiRecords(loadCsiRecords());
    };
    window.addEventListener("storage", refreshRecords);
    window.addEventListener("focus", refreshRecords);
    return () => {
      window.removeEventListener("storage", refreshRecords);
      window.removeEventListener("focus", refreshRecords);
    };
  }, []);

  const records = useMemo(() => [...formRecords, ...csiRecords], [formRecords, csiRecords]);
  const dashboardOptions = useMemo(() => ({
    department: [...new Set(records.map((item) => item.department))].filter(Boolean).sort(),
    profession: [...new Set(formRecords.map((item) => item.profession))].filter(Boolean).sort(),
  }), [records, formRecords]);

  function addRecord(form) {
    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    const record = {
      ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, normalize(value)])),
      id: `local:${crypto.randomUUID()}`,
      source: "แบบประเมินออนไลน์",
      createdAt: new Date().toISOString(),
    };
    const next = [...formRecords, record];
    setFormRecords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function clearSavedRecords() {
    setFormRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function removeFormRecord(recordId) {
    const next = formRecords.filter((item) => item.id !== recordId);
    setFormRecords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function importCsi(file, importMonth) {
    const imported = await readCsiExcel(file, importMonth);
    const next = [...csiRecords.filter((item) => item.csiMonth !== importMonth), ...imported];
    setCsiRecords(next);
    localStorage.setItem(CSI_STORAGE_KEY, JSON.stringify(next));
    return imported.length;
  }

  function clearCsiRecords() {
    setCsiRecords([]);
    localStorage.removeItem(CSI_STORAGE_KEY);
  }

  function removeCsiImport(importMonth) {
    const next = csiRecords.filter((item) => item.csiMonth !== importMonth);
    setCsiRecords(next);
    localStorage.setItem(CSI_STORAGE_KEY, JSON.stringify(next));
  }

  const csiImports = useMemo(() => {
    const grouped = csiRecords.reduce((result, record) => {
      const key = record.csiMonth;
      if (!result[key]) {
        result[key] = {
          month: key,
          fileName: record.csiFile || "CSI.xlsx",
          importedAt: record.importedAt || null,
          count: 0,
          departments: new Set(),
        };
      }
      result[key].count += 1;
      result[key].departments.add(record.department);
      return result;
    }, {});
    return Object.values(grouped)
      .map((item) => ({ ...item, departments: item.departments.size }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [csiRecords]);

  return {
    records,
    formRecords,
    headers: DEFAULT_HEADERS,
    surveyOptions: { department: [], ...SURVEY_OPTIONS },
    dashboardOptions,
    savedCount: formRecords.length,
    csiCount: csiRecords.length,
    csiMonths: [...new Set(csiRecords.map((item) => item.csiMonth))].sort(),
    csiImports,
    addRecord,
    clearSavedRecords,
    removeFormRecord,
    importCsi,
    clearCsiRecords,
    removeCsiImport,
  };
}
