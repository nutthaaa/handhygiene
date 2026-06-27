import { Icon } from "./Icons.jsx";

const navClass = (active) => [
  "flex items-center gap-2.5 rounded-[9px] border-0 px-2.5 py-2 text-left text-white/70 no-underline transition hover:bg-white/15 hover:text-white",
  "max-[1100px]:justify-center max-[720px]:min-w-[70px] max-[720px]:shrink-0 max-[720px]:snap-start max-[720px]:justify-center max-[720px]:p-1",
  active ? "bg-white/15 text-white" : "",
].join(" ");

export function Layout({ activePage, savedCount, csiCount, user, onLogout, children }) {
  return (
    <div className="grid min-h-screen grid-cols-[218px_minmax(0,1fr)] bg-slate-50 font-['Noto_Sans_Thai','Leelawadee_UI',Tahoma,sans-serif] text-slate-800 max-[1100px]:grid-cols-[82px_minmax(0,1fr)] max-[720px]:block">
      <aside className="sticky top-0 flex h-screen flex-col bg-[linear-gradient(180deg,#0e4d86,#082f58_68%,#062846)] px-[15px] py-[22px] text-white max-[720px]:fixed max-[720px]:inset-x-0 max-[720px]:bottom-0 max-[720px]:top-auto max-[720px]:z-50 max-[720px]:h-16 max-[720px]:flex-row max-[720px]:px-[15px] max-[720px]:py-[7px]">
        <a className="flex items-center gap-2.5 px-[7px] pb-[25px] text-left text-white no-underline max-[1100px]:justify-center max-[720px]:hidden" href="/">
          <span className="grid place-items-center text-teal-300"><Icon name="hand" size={34} /></span>
          <span className="max-[1100px]:hidden">
            <strong className="block mt-1 text-lg leading-[1.1]">CleanHands+</strong>
            <small className="mt-1 block text-[10px] opacity-65">Hand Hygiene Monitoring</small>
          </span>
        </a>

        <nav className="grid gap-[3px] overflow-y-auto [scrollbar-width:none] max-[720px]:flex max-[720px]:min-w-0 max-[720px]:flex-1 max-[720px]:snap-x max-[720px]:gap-[5px] max-[720px]:overflow-x-auto max-[720px]:overflow-y-hidden [&::-webkit-scrollbar]:hidden">
          <a className={navClass(activePage === "dashboard")} href="/">
            <Icon name="home" />
            <span className="max-[1100px]:hidden">
              <b className="block text-[14px] font-semibold text-white">ภาพรวม</b>
              <small className="mt-px block text-[11px] font-medium text-white opacity-75">Overview</small>
            </span>
          </a>
          <a className={navClass(activePage === "reports")} href="/reports">
            <Icon name="report" />
            <span className="max-[1100px]:hidden">
              <b className="block text-[14px] font-semibold text-white">รายงาน</b>
              <small className="mt-px block text-[11px] font-medium text-white opacity-75">Reports</small>
            </span>
          </a>
        </nav>

        <div className="mt-auto grid grid-cols-[8px_20px_1fr] items-start gap-[7px] border-t border-white/15 px-[5px] pb-[3px] pt-[18px] text-white/80 max-[1100px]:grid-cols-[8px_20px] max-[720px]:hidden">
          <span className="mt-1 size-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(88,212,157,.13)]" />
          <Icon name="database" size={18} />
          <div className="max-[1100px]:hidden">
            <b className="block text-[14px] ml-1">Data Connected</b>
            <small className="mt-[3px] block text-[11px] opacity-75 ml-1">แบบประเมิน {savedCount} รายการ<br /></small>
          </div>
        </div>

        {user && (
          <div className="mt-3 border-t border-white/15 pt-3 max-[720px]:mt-0 max-[720px]:ml-1.5 max-[720px]:flex max-[720px]:shrink-0 max-[720px]:items-center max-[720px]:border-0 max-[720px]:pt-0">
            <div className="mb-2 px-[5px] max-[1100px]:hidden max-[720px]:hidden">
              <b className="block text-[13px] text-white">{user.fullName || user.username}</b>
              <small className="text-[10px] uppercase tracking-wide text-white/60">{user.role}</small>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-[9px] border border-white/20 px-2.5 py-2 text-[13px] font-semibold text-white/85 transition hover:bg-white/15 max-[720px]:w-auto cursor-pointer"
            >
              <Icon name="logout" size={16} />
              <span className="max-[1100px]:hidden">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </aside>
      <main className="min-w-0 px-[25px] pb-[34px] pt-5 max-[720px]:px-3 max-[720px]:pb-[82px] max-[720px]:pt-[15px]">{children}</main>
    </div>
  );
}
