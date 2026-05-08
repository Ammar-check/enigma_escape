"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const termsEn = [
  "Arrival: I understand that I must arrive at least 15 minutes before my scheduled booking time.",
  "Booking Details: I understand that I am responsible for double checking my booking date, time, and room and that Enigma Escape Games will not be responsible for any incorrect bookings or guarantee the availability of the room.",
  "Confirmation Presentation: I agree to present my booking confirmation upon arrival.",
  "Payment: I understand that payment must be made in full upon arrival through cash, debit, or credit card before the challenge begins.",
  "Booking Cancellation: I understand that Enigma Escape Games reserves the right to cancel my booking if I do not answer confirmation calls, arrive ten (10) minutes late, or am a no-show for my first booking without notice.",
  "Booking Change: I understand that I may change my booking up to 24 hours prior to my scheduled time.",
  "Property Care: I agree to treat all props, furniture, and electrical objects with care and that I will be liable for damages if I cause any damage willfully or due to misconduct.",
  "Electronic Devices: I understand that cell phones, cameras, and recording devices are strictly prohibited inside the game room and that lockers will be provided to store my personal belongings.",
  "Room Cancellation Policy: I understand that if I cancel one or more rooms upon arrival, I will be charged fully for the cancelled room(s).",
  "Children's Participation: I understand that children below 10 are required to have at least one adult per room (and not allowed in The Butcher room).",
  "Food and Drinks: I understand that food and drinks are prohibited inside the game room(s).",
  "Release of Liability: I acknowledge that I am participating in this escape room experience voluntarily and assume all risks associated with the experience. I release and hold harmless Enigma Escape Games, its owners, employees, and agents from any and all liability for any injury, loss, or damage that may occur as a result of my participation in the experience.",
];

const termsAr = [
  "الحضور: الوصول قبل ١٥ دقيقة على الأقل من موعد الحجز.",
  "تفاصيل الحجز: التحقق من تاريخ ووقت حجز الغرفة. غرف إنجما للهروب غير مسؤولين عن أي حجز غير صحيح ولن نضمن توفير غرفتك في هذه الحالة.",
  "تأكيد الحضور: إظهار رسالة تأكيد الحجز عند الوصول.",
  "الدفع: يتم الدفع بالكامل نقدا أو عبر البطاقة الائتمانية عند الوصول وقبل البدء باللعب.",
  "إلغاء الحجوزات: إنجما لغرف الهروب لها الحق بإلغاء حجزك إذا لم يتم الرد على مكالمات التأكيد أو الوصول ١٠ دقائق متأخر أو عدم الحضور لحجزك الأول بدون إشعار.",
  "تغيير الحجز: يمكنك تغيير الحجز قبل ٢٤ ساعة من حجز الغرفة.",
  "التعامل مع الممتلكات: يرجى التعامل مع الأثاث وجميع الأغراض داخل الغرفة بعناية. اللاعبون الذين يلحقون الضرر سيكونون مسؤولين عن الأضرار.",
  "الأجهزة الإلكترونية: ممنوع منعًا باتا استخدام الهواتف المحمولة والكاميرات وأي جهاز إلكتروني داخل غرف الهروب. سيتم توفير خزانات لتخزين متعلقاتكم الشخصية.",
  "إلغاء الغرف: إذا كنت قد حجزت غرفة أو عدة غرف وقررت إلغاء غرفة واحدة أو أكثر عند الوصول، فسيتم محاسبتك بالكامل على الغرفة (الغرف) الملغاة.",
  "الأطفال: الأطفال الأقل من ١٠ سنوات يجب أن يتواجد معهم شخص بالغ واحد على الأقل (غير مسموح لهم بالمشاركة بغرفة الجزار).",
  "الأكل والشرب: يمنع تناول الطعام والشراب داخل الغرف.",
  "إخلاء المسؤولية: أقر بأنني أشارك في تجربة غرفة الهروب هذه تطوعية وأتحمل جميع المخاطر المرتبطة بالتجربة. أعفي إنجما لغرف الهروب ومالكيها وموظفيها ووكلائها من أي مسؤولية عن أي إصابة أو خسارة أو ضرر قد يحدث نتيجة لمشاركتي في التجربة.",
];

export default function BookingCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const details = useMemo(
    () => ({
      room: searchParams.get("room") || "",
      roomSlug: searchParams.get("roomSlug") || "",
      date: searchParams.get("date") || "",
      time: searchParams.get("time") || "",
      adults: Number(searchParams.get("adults") || 2),
      price: Number(searchParams.get("price") || 0),
    }),
    [searchParams]
  );

  const canSubmit = Boolean(agreedTerms && formData.firstName && formData.email && details.room && details.date && details.time);

  const onConfirm = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setMessage("");
    try {
      const bookingNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const startAt = `${details.date}T${details.time}:00`;
      const payload = {
        booking_number: bookingNumber,
        start_at: startAt,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_address: formData.email,
        phone: formData.phone,
        participants: details.adults,
        adults: details.adults,
        tour: details.room,
        status: "booked",
        total_gross: details.price,
        total_paid: 0,
        total_due: details.price,
        alert: "Terms accepted by customer",
      };
      const { error } = await supabase.from("bookings").insert(payload);
      if (error) throw error;

      const query = new URLSearchParams({
        bookingNumber,
        room: details.room,
        date: details.date,
        time: details.time,
        adults: String(details.adults),
        totalPrice: String(details.price),
        amountDue: String(details.price),
        email: formData.email,
      });
      router.push(`/booking/confirmed?${query.toString()}`);
    } catch (err) {
      setMessage(err?.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Booking Checkout</h1>
        <p className={styles.subtitle}>Confirm your booking details and complete the form.</p>

        <div className={styles.summary}>
          <h3>Booking Details</h3>
          <p><strong>Room:</strong> {details.room || "--"}</p>
          <p><strong>Date:</strong> {details.date || "--"}</p>
          <p><strong>Time:</strong> {details.time || "--"}</p>
          <p><strong>Adults:</strong> {details.adults}</p>
          <p><strong>Total Price:</strong> {details.price.toLocaleString()} SAR</p>
        </div>

        <div className={styles.formGrid}>
          <input
            className={styles.input}
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <div className={styles.termsBox}>
          <p className={styles.termsTitle}>Please read and agree to the following terms and conditions before making your payment:</p>
          <ul>{termsEn.map((line, idx) => <li key={`en-${idx}`}>{line}</li>)}</ul>
          <p className={styles.termsTitle}>إخلاء مسؤولية لتجربة إنجما لغرف الهروب:</p>
          <ul dir="rtl">{termsAr.map((line, idx) => <li key={`ar-${idx}`}>{line}</li>)}</ul>
        </div>

        <label className={styles.agreeRow}>
          <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
          I agree to terms and privacy content.
        </label>

        {message ? <p className={styles.error}>{message}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.backBtn} onClick={() => router.back()} disabled={loading}>
            Back
          </button>
          <button type="button" className={styles.confirmBtn} onClick={onConfirm} disabled={!canSubmit || loading}>
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
