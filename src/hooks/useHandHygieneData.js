import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_HEADERS, SURVEY_OPTIONS } from "../data/constants.js";
import {
  clearCsiImports,
  clearFormObservations,
  createObservation,
  deleteCsiMonth,
  deleteObservation,
  fetchCsiImports,
  fetchObservations,
  importCsiFile,
} from "../services/api.js";

const isCsiRecord = (item) => item.source === "CSI" || item.source === "CSI Excel";

export function useHandHygieneData() {
  const [records, setRecords] = useState([]);
  const [csiImports, setCsiImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [allRecords, imports] = await Promise.all([
        fetchObservations(),
        fetchCsiImports(),
      ]);
      setRecords(allRecords);
      setCsiImports(imports);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  const formRecords = useMemo(() => records.filter((item) => !isCsiRecord(item)), [records]);
  const csiRecords = useMemo(() => records.filter(isCsiRecord), [records]);
  const dashboardOptions = useMemo(() => ({
    department: [...new Set(records.map((item) => item.department))].filter(Boolean).sort(),
    profession: [...new Set(formRecords.map((item) => item.profession))].filter(Boolean).sort(),
  }), [records, formRecords]);

  async function addRecord(form) {
    await createObservation(form);
    await refresh();
  }

  async function clearSavedRecords() {
    await clearFormObservations();
    await refresh();
  }

  async function removeFormRecord(recordId) {
    await deleteObservation(recordId);
    await refresh();
  }

  async function importCsi(file, importMonth) {
    const { count } = await importCsiFile(file, importMonth);
    await refresh();
    return count;
  }

  async function clearCsiRecords() {
    await clearCsiImports();
    await refresh();
  }

  async function removeCsiImport(importMonth) {
    await deleteCsiMonth(importMonth);
    await refresh();
  }

  return {
    records,
    formRecords,
    loading,
    error,
    headers: DEFAULT_HEADERS,
    surveyOptions: { department: [], ...SURVEY_OPTIONS },
    dashboardOptions,
    savedCount: formRecords.length,
    csiCount: csiRecords.length,
    csiImports,
    addRecord,
    clearSavedRecords,
    removeFormRecord,
    importCsi,
    clearCsiRecords,
    removeCsiImport,
  };
}
