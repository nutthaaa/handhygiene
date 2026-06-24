import { useState } from "react";
import { Icon } from "./Icons.jsx";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "min-h-12 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-[13px] py-[11px] text-slate-800 outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/10";

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#edf7f8_0,#f5f8fa_260px)] px-4 font-['Noto_Sans_Thai','Leelawadee_UI',Tahoma,sans-serif] text-slate-800">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="text-teal-500"><Icon name="hand" size={44} /></span>
          <div>
            <strong className="block text-2xl text-sky-900">CleanHands+</strong>
            <small className="text-[11px] text-slate-500">Hand Hygiene Monitoring</small>
          </div>
        </div>

        <form className="grid gap-3.5 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(25,68,98,.1)]" onSubmit={handleSubmit}>
          <div>
            <h1 className="text-lg font-bold">เข้าสู่ระบบ</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">กรอกบัญชีผู้ใช้เพื่อเข้าใช้งานระบบ</p>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">ชื่อผู้ใช้ (Username)</span>
            <input className={inputClass} type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="admin" required autoFocus />
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">รหัสผ่าน (Password)</span>
            <input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" required />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11px] text-red-700">
              {error}
            </div>
          )}

          <button className="mt-1 min-h-12 rounded-[10px] bg-gradient-to-r from-sky-900 to-sky-600 px-6 font-bold text-white disabled:opacity-60" type="submit" disabled={submitting}>
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
