import { useState } from "react";
import { Icon } from "./Icons.jsx";

const heroBackground =
  "linear-gradient(rgba(4, 24, 70, .88), rgba(4, 24, 70, .88)), url('/login-bg.jpg')";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const inputClass =
    "min-h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10";

  return (
    <main className="min-h-screen bg-white font-['Noto_Sans_Thai','Leelawadee_UI',Tahoma,sans-serif] text-slate-900">
      <div className="grid min-h-screen overflow-hidden bg-white lg:grid-cols-[1fr_460px]">
        <section
          className="relative flex min-h-[420px] flex-col justify-between bg-cover bg-[center_top] px-8 py-8 text-white sm:px-12 lg:min-h-full lg:px-16 lg:py-14"
          style={{ backgroundImage: heroBackground }}
        >
          <div className="max-w-[620px]">
            <img className="mb-16 h-14 w-auto object-contain lg:mb-20" src="/bdms-logo.png" alt="BDMS" />
            <h1 className="text-[34px] font-extrabold leading-tight sm:text-[42px]">Welcome Back</h1>
            <h2 className="mt-4 text-xl font-bold sm:text-2xl">Hand Hygiene Monitoring</h2>
            <p className="mt-4 max-w-[520px] text-[15px] leading-7 text-blue-50/95">
              ระบบติดตามและประเมินการล้างมือสำหรับบุคลากรภายในโรงพยาบาลกรุงเทพ เชียงใหม่
            </p>
          </div>

        </section>

        <section className="flex min-h-[620px] items-center justify-center bg-white px-6 py-10 sm:px-10">
          <div className="w-full max-w-[360px]">
            <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[14px] font-semibold text-blue-600">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-white">
                <Icon name="hand" size={14} />
              </span>
              เข้าสู่ระบบที่ปลอดภัย
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-normal text-slate-900">เข้าสู่ระบบ</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                เข้าสู่ระบบเพื่อดูภาพรวมและติดตามผลการประเมินการล้างมือภายในโรงพยาบาล
              </p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">อีเมลผู้ใช้</span>
                <input
                  className={inputClass}
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="กรุณากรอกอีเมลของท่าน"
                  required
                  autoFocus
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">รหัสผ่าน</span>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-12`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="กรุณากรอกรหัสผ่านของท่าน"
                    required
                  />
                  <button
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-500">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  จดจำฉัน
                </label>
                <button className="font-semibold text-blue-700 hover:text-blue-800" type="button">
                  ลืมรหัสผ่าน ?
                </button>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                className="mt-2 min-h-12 rounded-[10px] bg-blue-800 px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(30,64,175,.25)] transition hover:bg-blue-900 disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบอัตโนมัติ"}
              </button>
            </form>

            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-5 text-[11px] text-slate-400">
              <span>Version 1.0</span>
              <span>© Bangkok Hospital</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="rounded-[10px] border border-white/18 bg-white/12 px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,.16)] backdrop-blur-md">
      <strong className="block text-3xl font-extrabold">{value}</strong>
      <span className="mt-1 block text-xs text-blue-50">{label}</span>
    </div>
  );
}
