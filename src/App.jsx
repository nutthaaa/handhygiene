import { Layout } from "./components/Layout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Reports from "./components/Reports.jsx";
import SurveyForm from "./components/SurveyForm.jsx";
import { useHandHygieneData } from "./hooks/useHandHygieneData.js";

export default function App() {
  const data = useHandHygieneData();
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isSurvey = path === "/survey";

  if (isSurvey) {
    return (
      <SurveyForm
        headers={data.headers}
        options={data.surveyOptions}
        onSave={data.addRecord}
      />
    );
  }

  return (
    <Layout activePage={path === "/reports" ? "reports" : "dashboard"} savedCount={data.savedCount} csiCount={data.csiCount}>
      {path === "/reports" ? (
        <Reports
          csiImports={data.csiImports}
          csiCount={data.csiCount}
          savedCount={data.savedCount}
          formRecords={data.formRecords}
          onClearCsi={data.clearCsiRecords}
          onRemoveCsiImport={data.removeCsiImport}
          onClearSaved={data.clearSavedRecords}
          onRemoveFormRecord={data.removeFormRecord}
        />
      ) : (
        <Dashboard
          records={data.records}
          options={data.dashboardOptions}
          savedCount={data.savedCount}
          csiCount={data.csiCount}
          onImportCsi={data.importCsi}
        />
      )}
    </Layout>
  );
}
