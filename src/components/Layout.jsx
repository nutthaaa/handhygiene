import { Icon } from "./Icons.jsx";

export function Layout({ activePage, savedCount, csiCount, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-icon"><Icon name="hand" size={34} /></span>
          <span><strong>CleanHands+</strong><small>Hand Hygiene Monitoring</small></span>
        </a>

        <nav>
          <a className={`nav-item ${activePage === "dashboard" ? "active" : ""}`} href="/">
            <Icon name="home" /> <span><b>ภาพรวม Dashboard</b><small>Overview</small></span>
          </a>
          <a className={`nav-item ${activePage === "reports" ? "active" : ""}`} href="/reports">
            <Icon name="report" /> <span><b>รายงาน</b><small>Reports</small></span>
          </a>
        </nav>

        <div className="source-status">
          <span className="status-dot" />
          <Icon name="database" size={18} />
          <div><b>Data Connected</b><small>แบบประเมิน {savedCount} รายการ<br />CSI {csiCount} observations</small></div>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
