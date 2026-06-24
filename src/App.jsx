import { Layout } from "./components/Layout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Reports from "./components/Reports.jsx";
import SurveyForm from "./components/SurveyForm.jsx";
import Login from "./components/Login.jsx";
import { useHandHygieneData } from "./hooks/useHandHygieneData.js";
import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        กำลังโหลด...
      </div>
    );
  }

  if (!auth.user) {
    return <Login onLogin={auth.login} />;
  }

  return <AuthedApp user={auth.user} onLogout={auth.logout} />;
}

function AuthedApp({ user, onLogout }) {
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
    <Layout activePage={path === "/reports" ? "reports" : "dashboard"} savedCount={data.savedCount} csiCount={data.csiCount} user={user} onLogout={onLogout}>
      {data.error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          เชื่อมต่อ API ไม่สำเร็จ: {data.error}
        </div>
      )}
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
