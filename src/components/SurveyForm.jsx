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
  return (
    <div className="choice-section">
      <div className={`choice-grid choice-${field.name}`}>
        {field.options.map((option) => (
          <label className={`choice-card ${value === option ? "selected" : ""}`} key={option}>
            <input
              type="radio"
              name={field.name}
              value={option}
              checked={value === option}
              onChange={onChange}
              required
            />
            <span className="choice-check" />
            <span className="choice-text">{option}</span>
          </label>
        ))}
      </div>
      {isOther && (
        <div className="other-detail">
          <label htmlFor={`${field.name}-other`}>โปรดระบุรายละเอียด</label>
          <input
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

  return (
    <div className="survey-system">
      <header className="survey-topbar">
        <a className="survey-brand" href="/survey">
          <Icon name="hand" size={31} />
          <span><strong>CleanHands+</strong><small>Observation Form</small></span>
        </a>
        <a className="dashboard-link" href="/">ดู Dashboard</a>
      </header>

      <main className="survey-main">
        <section className="survey-hero">
          <div>
            <p className="eyebrow">HAND HYGIENE OBSERVATION</p>
            <h1>แบบประเมินการทำความสะอาดมือ</h1>
            <p>เลือกคำตอบด้วยการติ๊กแต่ละข้อ แล้วกดส่งข้อมูล ผลจะถูกนำไปคำนวณในระบบ Dashboard อัตโนมัติ</p>
          </div>
          <div className="survey-progress"><strong>6</strong><span>หัวข้อประเมิน</span></div>
        </section>

        {submitted && (
          <section className="submit-success">
            <span>✓</span>
            <div><b>ส่งข้อมูลเข้า Dashboard แล้ว</b><p>สามารถทำแบบประเมินรายการถัดไป หรือเปิด Dashboard เพื่อตรวจสอบผล</p></div>
            <a href="/">เปิด Dashboard</a>
          </section>
        )}
        <form className="survey-form" onSubmit={handleSubmit}>
          <section className="question-card">
            <div className="question-head"><span>1</span><div><h2>{fields[0].label}</h2><p>เลือกวันที่ทำการสังเกต</p></div></div>
            <input className="date-choice" type="date" name="date" value={form.date} onChange={handleChange} required />
          </section>

          {fields.slice(1).map((field, index) => (
            <section className="question-card" key={field.name}>
              <div className="question-head">
                <span>{index + 2}</span>
                <div>
                  <h2>{field.label}</h2>
                  <p>{field.name === "department" ? "กรอกชื่อแผนก หรือเลือกจากรายการที่เคยกรอก" : "เลือกได้ 1 คำตอบ"}</p>
                </div>
              </div>
              {field.name === "department" ? (
                <div className="department-input-wrap">
                  <input
                    className="department-input"
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="เช่น ทันตกรรม"
                    autoComplete="off"
                    required
                  />
                  <span>ระบบจะรวมข้อมูลที่ใช้ชื่อแผนกเดียวกันไว้ในรายการเดียว</span>
                </div>
              ) : (
                <ChoiceGroup
                  field={field}
                  value={form[field.name]}
                  otherValue={otherDetails[field.name] || ""}
                  onChange={handleChange}
                  onOtherChange={handleOtherChange}
                />
              )}
            </section>
          ))}

          <div className="survey-submit-bar">
            <div><b>ตรวจสอบคำตอบก่อนส่ง</b><span>ข้อมูลจะถูกส่งเข้าสู่ Dashboard ทันที</span></div>
            <button className="submit-btn survey-submit" type="submit">ส่งแบบประเมิน</button>
          </div>
        </form>
      </main>
    </div>
  );
}
