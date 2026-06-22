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
              className={`relative flex min-h-12 cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[10px] leading-[1.45] transition max-[720px]:min-h-[54px] max-[720px]:items-start max-[720px]:p-[11px] max-[720px]:text-[11px] ${
                selected
                  ? "border-teal-500 bg-teal-50 text-teal-800 shadow-[0_0_0_2px_rgba(42,167,164,.08)]"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-300 hover:bg-teal-50/40"
              }`}
              key={option}
            >
              <input className="pointer-events-none absolute opacity-0" type="radio" name={field.name} value={option} checked={selected} onChange={onChange} required />
              <span className={`mt-px size-[18px] shrink-0 rounded-full bg-white ${selected ? "border-[5px] border-teal-500" : "border-[1.5px] border-slate-400"}`} />
              <span className="[overflow-wrap:anywhere]">{option}</span>
            </label>
          );
        })}
      </div>
      {isOther && (
        <div className="ml-[43px] grid gap-1.5 rounded-[10px] border border-teal-200 bg-teal-50 p-3 max-[720px]:ml-0">
          <label className="text-[10px] font-bold text-teal-800" htmlFor={`${field.name}-other`}>โปรดระบุรายละเอียด</label>
          <input
            className="min-h-[46px] w-full rounded-lg border border-teal-200 bg-white px-3 py-2.5 text-slate-800 outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/10"
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
    <div className="mb-[15px] grid grid-cols-[32px_1fr] items-start gap-[11px] max-[720px]:grid-cols-[30px_minmax(0,1fr)] max-[720px]:gap-[9px]">
      <span className="grid size-[30px] place-items-center rounded-full bg-sky-900 text-[11px] font-extrabold text-white max-[430px]:size-7">{number}</span>
      <div>
        <h2 className="text-[13px] font-bold leading-[1.45] max-[720px]:text-xs">{title}</h2>
        <p className="mt-0.5 text-[9px] text-slate-500">{description}</p>
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

  const questionClass = "rounded-[15px] border border-slate-200 bg-white p-[21px] shadow-[0_7px_22px_rgba(30,76,105,.06)] max-[720px]:rounded-xl max-[720px]:px-[13px] max-[720px]:py-4 max-[430px]:px-[11px] max-[430px]:py-3.5";
  const inputClass = "min-h-12 rounded-[10px] border border-slate-200 bg-slate-50 px-[13px] py-[11px] text-slate-800 outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/10";

  return (
    <div className="min-h-screen min-w-0 bg-[linear-gradient(180deg,#edf7f8_0,#f5f8fa_260px)] font-['Noto_Sans_Thai','Leelawadee_UI',Tahoma,sans-serif] text-slate-800 max-[720px]:pb-[env(safe-area-inset-bottom)] [&_*]:min-w-0">
      <header className="sticky top-0 z-10 m-0 flex min-h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-[max(20px,calc((100vw-1040px)/2))] backdrop-blur-xl max-[720px]:min-h-[60px] max-[720px]:px-3.5 max-[430px]:px-2.5">
        <a className="flex items-center gap-2.5 text-sky-900 no-underline" href="/survey">
          <span className="text-teal-500"><Icon name="hand" size={31} /></span>
          <span>
            <strong className="block text-[17px] leading-[1.1] max-[430px]:text-[15px]">CleanHands+</strong>
            <small className="mt-0.5 block text-[9px] text-slate-500 max-[430px]:hidden">Observation Form</small>
          </span>
        </a>
        <a className="rounded-[9px] border border-slate-300 bg-white px-[13px] py-2 text-[10px] font-bold text-sky-900 no-underline max-[430px]:px-[9px] max-[430px]:py-[7px] max-[430px]:text-[9px]" href="/">ดู Dashboard</a>
      </header>

      <main className="mx-auto w-[min(calc(100%-32px),1040px)] py-[38px] max-[900px]:w-[min(calc(100%-28px),760px)] max-[720px]:w-[min(calc(100%-20px),1040px)] max-[720px]:py-6">
        <section className="mb-6 flex items-center justify-between gap-[25px] max-[720px]:items-start max-[430px]:block max-[430px]:mb-[18px]">
          <div className="max-w-[680px] max-[900px]:max-w-[620px]">
            <p className="text-[9px] font-extrabold tracking-[1.3px] text-sky-600">HAND HYGIENE OBSERVATION</p>
            <h1 className="my-2 text-[clamp(24px,4vw,34px)] font-bold max-[430px]:text-[23px]">แบบประเมินการทำความสะอาดมือ</h1>
            <p className="text-xs leading-[1.8] text-slate-500 max-[430px]:text-[11px] max-[430px]:leading-[1.65]">เลือกคำตอบด้วยการติ๊กแต่ละข้อ แล้วกดส่งข้อมูล ผลจะถูกนำไปคำนวณในระบบ Dashboard อัตโนมัติ</p>
          </div>
          <div className="grid size-[105px] shrink-0 place-content-center rounded-full border-[9px] border-teal-100 border-t-teal-500 bg-white text-center shadow-[0_8px_25px_rgba(26,68,98,.08)] max-[720px]:size-[76px] max-[720px]:border-[7px] max-[430px]:hidden">
            <strong className="block text-[27px] leading-none text-teal-500 max-[720px]:text-[21px]">6</strong>
            <span className="mt-1 block text-[8px] text-slate-500">หัวข้อประเมิน</span>
          </div>
        </section>

        {submitted && (
          <section className="mb-[18px] grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800 max-[720px]:grid-cols-[34px_1fr] max-[430px]:p-3">
            <span className="grid size-9 place-items-center rounded-full bg-emerald-500 font-extrabold text-white">✓</span>
            <div><b className="block text-xs">ส่งข้อมูลเข้า Dashboard แล้ว</b><p className="mt-0.5 text-[9px] text-emerald-700">สามารถทำแบบประเมินรายการถัดไป หรือเปิด Dashboard เพื่อตรวจสอบผล</p></div>
            <a className="text-[10px] font-bold text-emerald-700 max-[720px]:col-start-2" href="/">เปิด Dashboard</a>
          </section>
        )}

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
                  <span className="text-[9px] text-slate-500">ระบบจะรวมข้อมูลที่ใช้ชื่อแผนกเดียวกันไว้ในรายการเดียว</span>
                </div>
              ) : (
                <ChoiceGroup field={field} value={form[field.name]} otherValue={otherDetails[field.name] || ""} onChange={handleChange} onOtherChange={handleOtherChange} />
              )}
            </section>
          ))}

          <div className="sticky bottom-3 mt-1 flex items-center justify-between gap-5 rounded-[13px] border border-slate-200 bg-white/95 px-4 py-3.5 shadow-[0_12px_34px_rgba(25,68,98,.14)] backdrop-blur-xl max-[720px]:bottom-[calc(7px+env(safe-area-inset-bottom))] max-[720px]:rounded-[11px] max-[720px]:p-2.5">
            <div className="max-[720px]:hidden"><b className="block text-[11px]">ตรวจสอบคำตอบก่อนส่ง</b><span className="mt-0.5 block text-[9px] text-slate-500">ข้อมูลจะถูกส่งเข้าสู่ Dashboard ทันที</span></div>
            <button className="min-w-[180px] rounded-[10px] bg-gradient-to-r from-sky-900 to-sky-600 px-6 py-3 font-bold text-white max-[720px]:min-h-12 max-[720px]:w-full max-[720px]:min-w-0" type="submit">ส่งแบบประเมิน</button>
          </div>
        </form>
      </main>
    </div>
  );
}
