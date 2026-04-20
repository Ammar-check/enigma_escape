// 'use client';

// import { useState, useRef } from 'react';
// import styles from './WaiverForm.module.css';

// const rooms = ['Butcher', 'Sherlock', 'Lost City', 'VR Rooms', 'Mindshield', 'Outdoor Escape'];

// export default function WaiverForm({ onSubmit }) {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [hasSigned, setHasSigned] = useState(false);
//   const [step, setStep] = useState(1);

//   const [form, setForm] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     birthday: '',
//     room: '',
//     language: 'en',
//     experience: '',
//     scary: '',
//     videoConsent: '',
//     socialConsent: '',
//     date: new Date().toISOString().split('T')[0],
//     time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
//   });

//   const update = (field, value) => setForm({ ...form, [field]: value });

//   // Signature canvas
//   const startDraw = (e) => {
//     setIsDrawing(true);
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const rect = canvas.getBoundingClientRect();
//     const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
//     const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
//     // e.preventDefault();
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const rect = canvas.getBoundingClientRect();
//     const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
//     const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
//     ctx.lineTo(x, y);
//     ctx.strokeStyle = '#d4a84b';
//     ctx.lineWidth = 2;
//     ctx.lineCap = 'round';
//     ctx.stroke();
//     setHasSigned(true);
//   };

//   const stopDraw = () => setIsDrawing(false);

//   const clearSignature = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     setHasSigned(false);
//   };

//   // const handleSubmit = () => {
//   //   if (!hasSigned) return alert('Please sign the waiver');
//   //   const signature = canvasRef.current.toDataURL();
//   //   onSubmit({ ...form, signature });
//   // };

//   const handleSubmit = () => {
//   console.log("CLICKED SUBMIT"); // 👈 add this

//   if (!hasSigned) return alert('Please sign the waiver');

//   const signature = canvasRef.current.toDataURL();

//   const formattedData = {
//     ...form,
//     videoConsent: form.videoConsent === 'Yes',
//     socialConsent: form.socialConsent === 'Yes',
//   };

//   console.log("SENDING DATA:", formattedData); // 👈 add this

//   onSubmit({ ...formattedData, signature });
// };

//   return (
//     <div className={styles.form}>
//       {/* Step indicators */}
//       <div className={styles.steps}>
//         {[1, 2, 3].map((s) => (
//           <div
//             key={s}
//             className={`${styles.step} ${step === s ? styles.activeStep : ''} ${step > s ? styles.doneStep : ''}`}
//           >
//             {step > s ? <i className="bi bi-check-lg"></i> : s}
//           </div>
//         ))}
//         <div className={styles.stepLine}></div>
//       </div>

//       {/* Step 1 — Personal Info */}
//       {step === 1 && (
//         <div className={styles.stepContent}>
//           <h4 className={styles.stepTitle}>Personal Information</h4>

//           <div className={styles.row}>
//             <div className={styles.inputGroup}>
//               <label>Full Name *</label>
//               <input type="text" placeholder="Enter full name" value={form.name}
//                 onChange={(e) => update('name', e.target.value)} className={styles.input} />
//             </div>
//             <div className={styles.inputGroup}>
//               <label>Phone *</label>
//               <input type="tel" placeholder="+966..." value={form.phone}
//                 onChange={(e) => update('phone', e.target.value)} className={styles.input} />
//             </div>
//           </div>

//           <div className={styles.row}>
//             <div className={styles.inputGroup}>
//               <label>Email</label>
//               <input type="email" placeholder="email@example.com" value={form.email}
//                 onChange={(e) => update('email', e.target.value)} className={styles.input} />
//             </div>
//             <div className={styles.inputGroup}>
//               <label>Birthday</label>
//               <input type="date" value={form.birthday}
//                 onChange={(e) => update('birthday', e.target.value)} className={styles.input} />
//             </div>
//           </div>

//           <div className={styles.row}>
//             <div className={styles.inputGroup}>
//               <label>Room *</label>
//               <select value={form.room} onChange={(e) => update('room', e.target.value)} className={styles.input}>
//                 <option value="">Select room</option>
//                 {rooms.map((r) => <option key={r} value={r} style={{background:'black'}}>{r}</option>)}
//               </select>
//             </div>
//             <div className={styles.inputGroup}>
//               <label>Language</label>
//               <select value={form.language} onChange={(e) => update('language', e.target.value)} className={styles.input}>
//                 <option style={{background:'black'}} value="en">English</option>
//                 <option style={{background:'black'}} value="ar">Arabic</option>
//               </select>
//             </div>
//           </div>

//           <button
//             className={styles.nextBtn}
//             onClick={() => setStep(2)}
//             disabled={!form.name || !form.phone || !form.room}
//           >
//             Next <i className="bi bi-arrow-right"></i>
//           </button>
//         </div>
//       )}

//       {/* Step 2 — Preferences */}
//       {step === 2 && (
//         <div className={styles.stepContent}>
//           <h4 className={styles.stepTitle}>Experience & Preferences</h4>

//           <div className={styles.questionGroup}>
//             <label>Have you played an escape room before?</label>
//             <div className={styles.btnGroup}>
//               {['Yes', 'No'].map((opt) => (
//                 <button
//                   key={opt}
//                   className={`${styles.optBtn} ${form.experience === opt ? styles.optActive : ''}`}
//                   onClick={() => update('experience', opt)}
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className={styles.questionGroup}>
//             <label>Scary or Not Scary experience?</label>
//             <div className={styles.btnGroup}>
//               {['Scary', 'Not Scary'].map((opt) => (
//                 <button
//                   key={opt}
//                   className={`${styles.optBtn} ${form.scary === opt ? styles.optActive : ''}`}
//                   onClick={() => update('scary', opt)}
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className={styles.questionGroup}>
//             <label>Do you consent to video recording?</label>
//             <div className={styles.btnGroup}>
//               {['Yes', 'No'].map((opt) => (
//                 <button
//                   key={opt}
//                   className={`${styles.optBtn} ${form.videoConsent === opt ? styles.optActive : ''}`}
//                   onClick={() => update('videoConsent', opt)}
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className={styles.questionGroup}>
//             <label>Do you consent to social media posting?</label>
//             <div className={styles.btnGroup}>
//               {['Yes', 'No'].map((opt) => (
//                 <button
//                   key={opt}
//                   className={`${styles.optBtn} ${form.socialConsent === opt ? styles.optActive : ''}`}
//                   onClick={() => update('socialConsent', opt)}
//                 >
//                   {opt}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className={styles.navBtns}>
//             <button className={styles.backBtn} onClick={() => setStep(1)}>
//               <i className="bi bi-arrow-left"></i> Back
//             </button>
//             <button
//               className={styles.nextBtn}
//               onClick={() => setStep(3)}
//               disabled={!form.experience || !form.scary || !form.videoConsent || !form.socialConsent}
//             >
//               Next <i className="bi bi-arrow-right"></i>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Step 3 — Signature */}
//       {step === 3 && (
//         <div className={styles.stepContent}>
//           <h4 className={styles.stepTitle}>Digital Signature</h4>
//           <p className={styles.signatureNote}>
//             By signing below, I agree to the terms and conditions of Enigma Escape Room.
//           </p>

//           <div className={styles.canvasWrapper}>
//             <canvas
//               ref={canvasRef}
//               width={500}
//               height={150}
//               className={styles.canvas}
//               onMouseDown={startDraw}
//               onMouseMove={draw}
//               onMouseUp={stopDraw}
//               onMouseLeave={stopDraw}
//               onTouchStart={startDraw}
//               onTouchMove={draw}
//               onTouchEnd={stopDraw}
//             />
//             <button className={styles.clearBtn} onClick={clearSignature}>
//               <i className="bi bi-arrow-counterclockwise"></i> Clear
//             </button>
//           </div>

//           <div className={styles.navBtns}>
//             <button className={styles.backBtn} onClick={() => setStep(2)}>
//               <i className="bi bi-arrow-left"></i> Back
//             </button>
//             <button
//               className={styles.submitBtn}
//               onClick={handleSubmit}
//               disabled={!hasSigned}
//             >
//               <i className="bi bi-check-lg"></i> Submit Waiver
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import styles from "./WaiverForm.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function WaiverForm() {
  const [count, setCount] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // Allow any language, at least 3 characters
  const nameRegex = /^.{3,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Reuse contact-style phone pattern: supports +966... etc
  const phoneRegex =
    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

  const { t, isArabic } = useLanguage();
  const participants = Array.from({ length: count }, (_, i) => i + 1);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const headerEl = document.querySelector("header");
    const previousBodyOverflow = document.body.style.overflow;
    const previousHeaderOpacity = headerEl?.style.opacity || "";
    const previousHeaderVisibility = headerEl?.style.visibility || "";
    const previousHeaderPointerEvents = headerEl?.style.pointerEvents || "";

    if (!hasAcceptedTerms) {
      document.body.style.overflow = "hidden";
      if (headerEl) {
        headerEl.style.opacity = "0";
        headerEl.style.visibility = "hidden";
        headerEl.style.pointerEvents = "none";
      }
    } else {
      document.body.style.overflow = previousBodyOverflow;
      if (headerEl) {
        headerEl.style.opacity = previousHeaderOpacity;
        headerEl.style.visibility = previousHeaderVisibility;
        headerEl.style.pointerEvents = previousHeaderPointerEvents;
      }
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      if (headerEl) {
        headerEl.style.opacity = previousHeaderOpacity;
        headerEl.style.visibility = previousHeaderVisibility;
        headerEl.style.pointerEvents = previousHeaderPointerEvents;
      }
    };
  }, [hasAcceptedTerms]);

  const validate = () => {
    let newErrors = {};

    participants.forEach((_, index) => {
      const name = document.getElementsByName(`name-${index}`)[0]?.value;
      const email = document.getElementsByName(`email-${index}`)[0]?.value;
      const phone = document.getElementsByName(`phone-${index}`)[0]?.value;

      if (!nameRegex.test((name || "").trim())) {
        newErrors[`name-${index}`] = isArabic
          ? "الاسم غير صالح"
          : "Invalid name";
      }

      if ((email || "").trim() && !emailRegex.test((email || "").trim())) {
        newErrors[`email-${index}`] = isArabic
          ? "بريد إلكتروني غير صالح"
          : "Invalid email";
      }

      if (!phoneRegex.test((phone || "").trim())) {
        newErrors[`phone-${index}`] = isArabic
          ? "رقم هاتف غير صالح"
          : "Invalid phone";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;

    if (!hasAcceptedTerms) return;
    if (!validate()) return;

    try {
      setSubmitting(true);

      const roomSelect = document.querySelector("select[name='room']");
      const languageSelect = document.querySelector("select[name='language']");
      const firstEscapeSelect = document.querySelector(
        "select[name='firstEscape']"
      );
      const scarySelect = document.querySelector("select[name='scary']");
      const videoConsentSelect = document.querySelector(
        "select[name='videoConsent']")
      ;

      const room = roomSelect?.value || "";
      const language = languageSelect?.value || (isArabic ? "ar" : "en");
      const firstEscape = firstEscapeSelect?.value || "";
      const scary = scarySelect?.value || "";
      const videoConsent = videoConsentSelect?.value || "";

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const participantData = participants.map((_, index) => {
        const name =
          document.getElementsByName(`name-${index}`)[0]?.value || "";
        const email =
          document.getElementsByName(`email-${index}`)[0]?.value || "";
        const phone =
          document.getElementsByName(`phone-${index}`)[0]?.value || "";
        const birthday =
          document.getElementsByName(`birthday-${index}`)?.[0]?.value || "";

        return {
          name,
          email,
          phone,
          birthday,
        };
      });

      // Load Supabase client dynamically so it only runs in the browser
      const { supabase } = await import("@/lib/supabase");

      const { error } = await supabase.from("waiver_forms").insert([
        {
          participants_count: count,
          participants: participantData,
          room,
          language,
          first_escape_room: firstEscape,
          scary_preference: scary,
          video_consent: videoConsent,
        },
      ]);
      if (error) {
        console.error("Supabase insert error", error);
        alert("Something went wrong submitting the waiver. Please try again.");
        return;
      }

      // Clear form and state after successful submit
      formEl.reset();
      setCount(1);
      setErrors({});

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <form onSubmit={handleSubmit}>
        <div
          className={`${styles.formCard} ${
            !hasAcceptedTerms ? styles.formCardHiddenBehindPopup : ""
          }`}
        >
          {/* Header */}
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {isArabic
                ? "الإقرار والتسجيل"
                : "Waiver and Registration"}
            </h2>
            {/* <p className={styles.formSub}>
              {isArabic
                ? "يرجى تعبئة جميع التفاصيل قبل تجربتك"
                : "Please fill in all details before your experience"}
            </p> */}
          </div>

          <div className={styles.formBody}>
            <h1 className={styles.personalDetail}>
              {isArabic ? "التفاصيل الشخصية" : "PERSONAL DETAILS"}
            </h1>

            {/* Participants Count */}
            <div className={styles.participantsSelector}>
              <span className={styles.participantsLabel}>
                {isArabic ? "كم عدد المشاركين؟" : "How many participants?"}
              </span>

              <div className={styles.countRow}>
                <select
                  className={styles.countSelect}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Participants */}
            <div className={styles.participantsArea}>
              {participants.map((num) => (
                <div key={num} className={styles.participantBlock}>
                  <div className={styles.participantHeader}>
                    <div className={styles.participantNum}>{num}</div>
                    <div className={styles.participantTitle}>
                      {isArabic ? "مشارك" : "Participant"} {num}
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>{isArabic ? "الاسم الكامل" : "Full Name"}</label>
                      <input
                        name={`name-${num - 1}`}
                        type="text"
                        placeholder={
                          isArabic ? "أدخل الاسم الكامل" : "Enter full name"
                        }
                      />
                      {errors[`name-${num - 1}`] && (
                        <span className={styles.error}>
                          {errors[`name-${num - 1}`]}
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>{isArabic ? "البريد الإلكتروني" : "Email"}</label>
                      <input
                        name={`email-${num - 1}`}
                        type="email"
                        placeholder="email@example.com"
                      />
                      {errors[`email-${num - 1}`] && (
                        <span className={styles.error}>
                          {errors[`email-${num - 1}`]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>{isArabic ? "رقم الهاتف" : "Phone Number"}</label>
                      <input
                        name={`phone-${num - 1}`}
                        type="tel"
                        placeholder="+966..."
                      />
                      {errors[`phone-${num - 1}`] && (
                        <span className={styles.error}>
                          {errors[`phone-${num - 1}`]}
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>
                        {isArabic ? "تاريخ الميلاد" : "Date of Birth"}
                      </label>
                      <input
                        className={styles.dateInput}
                        type="date"
                        name={`birthday-${num - 1}`}
                        max={today}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className={styles.divider} />

            {/* Game Section */}
            <div className={styles.gameSection}>
              <div className={styles.sectionTitle}>
                {isArabic ? "تفاصيل اللعبة" : "Game Details"}
              </div>

              <div className={styles.row3}>
                <div className={styles.field}>
                  <label>{isArabic ? "غرفة" : "Room"}</label>
                  <div className={styles.selectCont}>
                  <select name="room">
                    <option>{isArabic ? "نوع الغرفة" : "Room Type"}</option>
                    <option>{isArabic ? "!الجزار" : "The Butcher"}</option>
                    <option>
                      {isArabic ? "شيرلوك وجهاز يوم القيامة" : "Sherlock"}
                    </option>
                    <option>
                      {isArabic ? "المدينة المفقودة" : "The Lost City"}
                    </option>
                    <option>
                      {isArabic ? "غرف الواقع الافتراضي" : "VR Rooms"}
                    </option>
                    {/* <option>Mindshield</option> */}
                    <option>
                      {isArabic ? "مغامرات هروب خارجية" : "Outdoor Escape"}
                    </option>
                  </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>{isArabic ? "اللغة" : "Language"}</label>
                  <div className={styles.selectCont}>
                  <select name="language">
                    <option>{isArabic ? "الإنجليزية" : "English"}</option>
                    <option>{isArabic ? "العربية" : "Arabic"}</option>
                  </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>
                    {isArabic
                      ? "هل هذه أول تجربة لك في غرفة الهروب؟"
                      : "First Escape Room?"}
                  </label>
                  <div className={styles.selectCont}>

                  <select name="firstEscape">
                    <option>{isArabic ? "نعم" : "Yes"}</option>
                    <option>{isArabic ? "لا" : "No"}</option>
                  </select>
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>
                    {isArabic ? "مخيفة / غير مخيفة" : "Scary / Not Scary"}
                  </label>
                  <div className={styles.selectCont}>

                  <select name="scary">
                    <option>{isArabic ? "مخيفة" : "Scary"}</option>
                    <option>{isArabic ? "غير مخيفة" : "Not Scary"}</option>
                  </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>
                    {isArabic
                      ? "الموافقة على تسجيل الفيديو"
                      : "Video Recording Consent"}
                  </label>
                  <div className={styles.selectCont}>

                  <select name="videoConsent">
                    <option>
                      {isArabic ? "نعم — أوافق" : "Yes — I consent"}
                    </option>
                    <option>{isArabic ? "لا — أرفض" : "No — I decline"}</option>
                  </select>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting
                ? isArabic
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : isArabic
                ? "إرسال "
                : "Submit"}
            </button>
          </div>
        </div>
      </form>

      {!hasAcceptedTerms && (
        <div className={styles.termsOverlay}>
          <div className={styles.termsModal}>
            <h3 className={styles.termsTitle}>
              {isArabic ? "الشروط والأحكام" : "Terms and Conditions"}
            </h3>

            <p className={styles.termsIntro}>
              {isArabic
                ? "يرجى قراءة الشروط والأحكام التالية والموافقة عليها قبل المتابعة:"
                : "Please read and agree to the following terms and conditions before making your payment:"}
            </p>

            <ul className={styles.termsList}>
              <li>
                <strong>{isArabic ? "العناية بالممتلكات:" : "Property Care:"}</strong>{" "}
                {isArabic
                  ? "أوافق على التعامل مع جميع الأدوات والأثاث والأجهزة الكهربائية بعناية، وأتحمل مسؤولية أي أضرار متعمدة أو ناتجة عن سوء الاستخدام."
                  : "I agree to treat all props, furniture, and electrical objects with care and that I will be liable for damages if I cause any damage willfully or due to misconduct."}
              </li>
              <li>
                <strong>{isArabic ? "الأجهزة الإلكترونية:" : "Electronic Devices:"}</strong>{" "}
                {isArabic
                  ? "أفهم أن الهواتف المحمولة والكاميرات وأجهزة التسجيل ممنوعة منعًا باتًا داخل غرفة اللعب، وسيتم توفير خزائن لحفظ المتعلقات الشخصية."
                  : "I understand that cell phones, cameras, and recording devices are strictly prohibited inside the game room and that lockers will be provided to store my personal belongings."}
              </li>
              <li>
                <strong>{isArabic ? "مشاركة الأطفال:" : "Children's Participation:"}</strong>{" "}
                {isArabic
                  ? "أفهم أن الأطفال دون سن 10 سنوات يجب أن يكون معهم شخص بالغ واحد على الأقل في كل غرفة (ولا يُسمح لهم بدخول غرفة The Butcher)."
                  : "I understand that children below 10 are required to have at least one adult per room (and not allowed in The Butcher room)."}
              </li>
              <li>
                <strong>{isArabic ? "الطعام والمشروبات:" : "Food and Drinks:"}</strong>{" "}
                {isArabic
                  ? "أفهم أن الطعام والمشروبات ممنوعة داخل غرفة/غرف اللعب."
                  : "I understand that food and drinks are prohibited inside the game room(s)."}
              </li>
              <li>
                <strong>{isArabic ? "إخلاء المسؤولية:" : "Release of Liability:"}</strong>{" "}
                {isArabic
                  ? "أقر بأن مشاركتي في تجربة غرفة الهروب طوعية، وأتحمل جميع المخاطر المرتبطة بها. أُخلي مسؤولية Enigma Escape Games وملاكها وموظفيها ووكلائها من أي إصابة أو خسارة أو ضرر قد يحدث نتيجة مشاركتي. جميع المدفوعات غير قابلة للاسترداد. كما أوافق على الإفصاح عن أي حالة قلبية أو حمل لموظفي Enigma Escape Games."
                  : "I acknowledge that I am participating in this escape room experience voluntarily and assume all risks associated with the experience. I release and hold harmless Enigma Escape Games, its owners, employees, and agents from any and all liability for any injury, loss, or damage that may occur as a result of my participation in the experience. Any payments made are NOT refundable. I also agree to declare any heart condition or pregnancy to the Enigma Escape Games Staff."}
              </li>
            </ul>

            <label className={styles.termsCheckRow}>
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
              <span>
                {isArabic
                  ? "لقد قرأت ووافقت على الشروط والأحكام."
                  : "I have read and agree to the terms and conditions."}
              </span>
            </label>

            <button
              type="button"
              className={styles.termsAgreeBtn}
              disabled={!termsChecked}
              onClick={() => setHasAcceptedTerms(true)}
            >
              {isArabic ? "موافقة ومتابعة" : "Agree and Continue"}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className={styles.successToast}>
          {isArabic
            ? "تم إرسال الإقرار بنجاح!"
            : "Waiver submitted successfully!"}
        </div>
      )}
    </div>
  );
}
