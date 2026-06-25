import { useMemo, useState } from "react";
import { Icon } from "./Icons.jsx";

const createInitialForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  department: "",
  profession: "",
  moment: "",
  method: "",
  result: "",
});

function ChoiceGroup({ field, value, otherValue, onChange, onOtherChange }) {
  const isOther = value.includes("อื่น");
  const columns = field.name === "profession"
    ? "grid-cols-3 max-[900px]:grid-cols-2 max-[720px]:grid-cols-1"
    : "grid-cols-2 max-[720px]:grid-cols-1";

  return (
    <div className="grid gap-2.5">
      <div className={`ml-[43px] grid gap-[9px] max-[720px]:ml-0 ${columns}`}>
        {field.options.map((option) => {
          const selected = value === option;
          return (
            <label
              className={`relative flex min-h-12 cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[14px] leading-[1.45] transition max-[720px]:min-h-[54px] max-[720px]:items-start max-[720px]:p-[11px] max-[720px]:text-[13px] ${
                selected
                  ? "border-green-500/25 bg-green-50/70 text-green-800 shadow-[0_0_0_2px_rgba(34,197,94,.06)]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-500/20 hover:bg-green-50/50"
              }`}
              key={option}
            >
              <input className="pointer-events-none absolute opacity-0" type="radio" name={field.name} value={option} checked={selected} onChange={onChange} required />
              <span className={`mt-px size-[18px] shrink-0 rounded-full bg-white ${selected ? "border-[5px] border-green-500/70" : "border-[1.5px] border-slate-400"}`} />
              <span className="[overflow-wrap:anywhere]">{option}</span>
            </label>
          );
        })}
      </div>
      {isOther && (
        <div className="ml-[43px] grid gap-1.5 rounded-[10px] border border-green-500/20 bg-green-50/60 p-3 max-[720px]:ml-0">
          <label className="text-[14px] font-bold text-green-800" htmlFor={`${field.name}-other`}>โปรดระบุรายละเอียด</label>
          <input
            className="min-h-[46px] w-full rounded-lg border border-green-500/20 bg-white px-3 py-2.5 text-[16px] text-slate-800 outline-none focus:border-green-500/35 focus:ring-3 focus:ring-green-500/10"
            id={`${field.name}-other`}
            type="text"
            value={otherValue}
            onChange={(event) => onOtherChange(field.name, event.target.value)}
            placeholder="กรอกรายละเอียดเพิ่มเติม"
            autoFocus
            required
          />
        </div>
      )}
    </div>
  );
}

function QuestionHeader({ number, title, description }) {
  return (
    <div className="mb-2.5 grid grid-cols-[32px_1fr] items-start gap-[11px] max-[720px]:grid-cols-[30px_minmax(0,1fr)] max-[720px]:gap-[9px]">
      <span className="grid size-[30px] place-items-center rounded-full bg-sky-900 text-[11px] font-extrabold text-white max-[430px]:size-7">{number}</span>
      <div>
        <h2 className="text-[17px] font-bold leading-[1.35] max-[720px]:text-[15px]">{title}</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function SurveyForm({ headers, options, onSave }) {
  const [form, setForm] = useState(createInitialForm);
  const [otherDetails, setOtherDetails] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fields = useMemo(() => [
    { name: "date", label: headers[0], type: "date" },
    { name: "department", label: headers[1], options: options.department },
    { name: "profession", label: headers[2], options: options.profession },
    { name: "moment", label: headers[3], options: options.moment },
    { name: "method", label: headers[4], options: options.method },
    { name: "result", label: headers[5], options: options.result },
  ], [headers, options]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const submittedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        value.includes("อื่น") && otherDetails[key]?.trim()
          ? `อื่นๆ: ${otherDetails[key].trim()}`
          : value,
      ]),
    );
    onSave(submittedForm);
    setSubmitted(true);
    setForm(createInitialForm());
    setOtherDetails({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOtherChange(fieldName, value) {
    setOtherDetails((current) => ({ ...current, [fieldName]: value }));
  }

  const questionClass = "rounded-[15px] border border-slate-200 bg-white px-[21px] py-4 shadow-[0_7px_22px_rgba(30,76,105,.06)] max-[720px]:rounded-xl max-[720px]:px-[13px] max-[720px]:py-3.5 max-[430px]:px-[11px] max-[430px]:py-3";
  const inputClass = "min-h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-[13px] py-[11px] text-[16px] text-slate-800 outline-none focus:border-green-500/35 focus:ring-3 focus:ring-green-500/10";

  return (
    <div className="min-h-screen min-w-0 bg-slate-50 font-['Noto_Sans_Thai','Leelawadee_UI',Tahoma,sans-serif] text-slate-800 max-[720px]:pb-[env(safe-area-inset-bottom)] [&_*]:min-w-0">
      <header className="sticky top-0 z-10 m-0 min-h-[68px] border-b border-slate-200 bg-white/95 backdrop-blur-xl max-[720px]:min-h-[60px]">
        <div className="mx-auto flex min-h-[68px] w-[min(calc(100%-32px),1040px)] items-center justify-between gap-4 max-[900px]:w-[min(calc(100%-28px),760px)] max-[720px]:min-h-[60px] max-[720px]:w-[min(calc(100%-20px),1040px)] max-[430px]:gap-2">
          <a className="flex min-w-0 items-center gap-2.5 text-sky-900 no-underline" href="/survey">
            <span className="shrink-0 text-teal-500"><Icon name="hand" size={33} /></span>
            <span className="min-w-0">
              <strong className="block truncate text-[20px] leading-[1.1] max-[430px]:text-[15px]">CleanHands+</strong>
              <small className="mt-0.5 block truncate text-[12px] text-slate-500 max-[430px]:hidden">Observation Form</small>
            </span>
          </a>
          <img className="h-[37px] w-auto shrink-0 object-contain max-[430px]:h-8" src="/bangkok-hospital-logo-navy-trim.png" alt="Bangkok Hospital" />
        </div>
      </header>

      <main className="mx-auto w-[min(calc(100%-32px),1040px)] py-[18px] max-[900px]:w-[min(calc(100%-28px),760px)] max-[720px]:w-[min(calc(100%-20px),1040px)] max-[720px]:py-6">
        <section className="mb-6 max-[430px]:mb-[18px]">
          <h1 className="my-2 text-[clamp(24px,4vw,34px)] font-bold max-[430px]:text-[23px]">แบบประเมินการทำความสะอาดมือ</h1>
          <p className="-mt-2 text-[14px] font-extrabold tracking-[1.3px] text-slate-600">HAND HYGIENE OBSERVATION</p>
          <div className="mt-1 flex items-center justify-between gap-5 max-[720px]:items-start max-[520px]:flex-col max-[520px]:gap-3">
            <p className="m-0 text-sm leading-[1.8] text-slate-500 max-[430px]:text-[11px] max-[430px]:leading-[1.65]">เลือกคำตอบแล้วกดส่งข้อมูล ผลจะถูกนำไปคำนวณในระบบ Dashboard อัตโนมัติ</p>
            <a className="shrink-0 rounded-[9px] border border-slate-300 bg-white px-[13px] py-2 text-[12px] font-semibold text-sky-900 no-underline hover:bg-sky-800 hover:text-white max-[430px]:px-[9px] max-[430px]:py-[7px] max-[430px]:text-[11px]" href="/">ดู Dashboard</a>
          </div>
        </section>

        <form className="grid gap-3.5" onSubmit={handleSubmit}>
          <section className={questionClass}>
            <QuestionHeader number="1" title={fields[0].label} description="เลือกวันที่ทำการสังเกต" />
            <input className={`ml-[43px] w-[min(100%,320px)] max-[720px]:ml-0 max-[720px]:w-full ${inputClass}`} type="date" name="date" value={form.date} onChange={handleChange} required />
          </section>

          {fields.slice(1).map((field, index) => (
            <section className={questionClass} key={field.name}>
              <QuestionHeader
                number={index + 2}
                title={field.label}
                description={field.name === "department" ? "กรอกชื่อแผนก หรือเลือกจากรายการที่เคยกรอก" : "เลือกได้ 1 คำตอบ"}
              />
              {field.name === "department" ? (
                <div className="ml-[43px] grid gap-1.5 max-[720px]:ml-0">
                  <input className={`w-[min(100%,520px)] max-[720px]:w-full ${inputClass}`} type="text" name="department" value={form.department} onChange={handleChange} placeholder="เช่น ทันตกรรม" autoComplete="off" required />
                  <span className="text-[13px] text-slate-500">ระบบจะรวมข้อมูลที่ใช้ชื่อแผนกเดียวกันไว้ในรายการเดียว</span>
                </div>
              ) : (
                <ChoiceGroup field={field} value={form[field.name]} otherValue={otherDetails[field.name] || ""} onChange={handleChange} onOtherChange={handleOtherChange} />
              )}
            </section>
          ))}

          <div className="sticky bottom-3 mt-1 flex items-center justify-between gap-5 rounded-[13px] border border-slate-200 bg-white/95 px-4 py-3.5 shadow-[0_12px_34px_rgba(25,68,98,.14)] backdrop-blur-xl max-[720px]:bottom-[calc(7px+env(safe-area-inset-bottom))] max-[720px]:rounded-[11px] max-[720px]:p-2.5">
            <div className="max-[720px]:hidden">
              <b className="block text-[14px] font-semibold">ตรวจสอบคำตอบก่อนส่ง</b>
              <span className="mt-0.5 block text-[12px] text-slate-500">ข้อมูลจะถูกส่งเข้าสู่ Dashboard ทันที</span>
            </div>
            <button className="min-w-[180px] cursor-pointer rounded-[10px] border border-slate-100 bg-white px-6 py-3 text-[15px] font-semibold text-slate-700 hover:bg-sky-800 hover:text-white max-[720px]:min-h-12 max-[720px]:w-full max-[720px]:min-w-0" type="submit">ส่งแบบประเมิน</button>
          </div>
        </form>
      </main>

      {submitted && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5 backdrop-blur-[2px]" role="presentation">
          <section className="flex w-full max-w-[460px] flex-col items-center rounded-2xl bg-white px-7 py-8 text-center text-slate-900 shadow-2xl max-[430px]:px-5">
            <div className="grid size-14 place-items-center rounded-full bg-green-500/70">
              <img className="h-12 w-12 object-contain" src="/check-svgrepo-com.svg" alt="" aria-hidden="true" />
            </div>
            <b className="mt-5 block text-lg">ส่งข้อมูลเข้า Dashboard แล้ว</b>
            <p className="mt-2 max-w-[340px] text-sm leading-6 text-slate-700">สามารถทำแบบประเมินรายการถัดไป หรือเปิด Dashboard เพื่อตรวจสอบผล</p>
            <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
              <button
                className="min-w-[145px] cursor-pointer rounded-[10px] border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                type="button"
                onClick={() => setSubmitted(false)}
              >
                ทำแบบประเมินต่อ
              </button>
              <a className="min-w-[145px] cursor-pointer rounded-[10px] border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline transition hover:border-sky-800 hover:bg-sky-50 hover:text-sky-800" href="/">เปิด Dashboard</a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
