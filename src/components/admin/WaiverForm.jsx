'use client';

import { useState, useRef } from 'react';
import styles from './WaiverForm.module.css';

const rooms = ['Butcher', 'Sherlock', 'Lost City', 'VR Rooms', 'Mindshield', 'Outdoor Escape'];

export default function WaiverForm({ onSubmit }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    room: '',
    language: 'en',
    experience: '',
    scary: '',
    videoConsent: '',
    socialConsent: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  // Signature canvas
  const startDraw = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    // e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#d4a84b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // const handleSubmit = () => {
  //   if (!hasSigned) return alert('Please sign the waiver');
  //   const signature = canvasRef.current.toDataURL();
  //   onSubmit({ ...form, signature });
  // };

  const handleSubmit = () => {
  console.log("CLICKED SUBMIT"); // 👈 add this

  if (!hasSigned) return alert('Please sign the waiver');

  const signature = canvasRef.current.toDataURL();

  const formattedData = {
    ...form,
    videoConsent: form.videoConsent === 'Yes',
    socialConsent: form.socialConsent === 'Yes',
  };

  console.log("SENDING DATA:", formattedData); // 👈 add this

  onSubmit({ ...formattedData, signature });
};

  return (
    <div className={styles.form}>
      {/* Step indicators */}
      <div className={styles.steps}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`${styles.step} ${step === s ? styles.activeStep : ''} ${step > s ? styles.doneStep : ''}`}
          >
            {step > s ? <i className="bi bi-check-lg"></i> : s}
          </div>
        ))}
        <div className={styles.stepLine}></div>
      </div>

      {/* Step 1 — Personal Info */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h4 className={styles.stepTitle}>Personal Information</h4>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Full Name *</label>
              <input type="text" placeholder="Enter full name" value={form.name}
                onChange={(e) => update('name', e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>Phone *</label>
              <input type="tel" placeholder="+966..." value={form.phone}
                onChange={(e) => update('phone', e.target.value)} className={styles.input} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" placeholder="email@example.com" value={form.email}
                onChange={(e) => update('email', e.target.value)} className={styles.input} />
            </div>
            <div className={styles.inputGroup}>
              <label>Birthday</label>
              <input type="date" value={form.birthday}
                onChange={(e) => update('birthday', e.target.value)} className={styles.input} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Room *</label>
              <select value={form.room} onChange={(e) => update('room', e.target.value)} className={styles.input}>
                <option value="">Select room</option>
                {rooms.map((r) => <option key={r} value={r} style={{background:'black'}}>{r}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Language</label>
              <select value={form.language} onChange={(e) => update('language', e.target.value)} className={styles.input}>
                <option style={{background:'black'}} value="en">English</option>
                <option style={{background:'black'}} value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <button
            className={styles.nextBtn}
            onClick={() => setStep(2)}
            disabled={!form.name || !form.phone || !form.room}
          >
            Next <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Step 2 — Preferences */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h4 className={styles.stepTitle}>Experience & Preferences</h4>

          <div className={styles.questionGroup}>
            <label>Have you played an escape room before?</label>
            <div className={styles.btnGroup}>
              {['Yes', 'No'].map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optBtn} ${form.experience === opt ? styles.optActive : ''}`}
                  onClick={() => update('experience', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.questionGroup}>
            <label>Scary or Not Scary experience?</label>
            <div className={styles.btnGroup}>
              {['Scary', 'Not Scary'].map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optBtn} ${form.scary === opt ? styles.optActive : ''}`}
                  onClick={() => update('scary', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.questionGroup}>
            <label>Do you consent to video recording?</label>
            <div className={styles.btnGroup}>
              {['Yes', 'No'].map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optBtn} ${form.videoConsent === opt ? styles.optActive : ''}`}
                  onClick={() => update('videoConsent', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.questionGroup}>
            <label>Do you consent to social media posting?</label>
            <div className={styles.btnGroup}>
              {['Yes', 'No'].map((opt) => (
                <button
                  key={opt}
                  className={`${styles.optBtn} ${form.socialConsent === opt ? styles.optActive : ''}`}
                  onClick={() => update('socialConsent', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navBtns}>
            <button className={styles.backBtn} onClick={() => setStep(1)}>
              <i className="bi bi-arrow-left"></i> Back
            </button>
            <button
              className={styles.nextBtn}
              onClick={() => setStep(3)}
              disabled={!form.experience || !form.scary || !form.videoConsent || !form.socialConsent}
            >
              Next <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Signature */}
      {step === 3 && (
        <div className={styles.stepContent}>
          <h4 className={styles.stepTitle}>Digital Signature</h4>
          <p className={styles.signatureNote}>
            By signing below, I agree to the terms and conditions of Enigma Escape Room.
          </p>

          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className={styles.canvas}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <button className={styles.clearBtn} onClick={clearSignature}>
              <i className="bi bi-arrow-counterclockwise"></i> Clear
            </button>
          </div>

          <div className={styles.navBtns}>
            <button className={styles.backBtn} onClick={() => setStep(2)}>
              <i className="bi bi-arrow-left"></i> Back
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!hasSigned}
            >
              <i className="bi bi-check-lg"></i> Submit Waiver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}