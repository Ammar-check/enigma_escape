"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

export default function ConfirmedClient() {
  const searchParams = useSearchParams();
  const booking = useMemo(
    () => ({
      bookingNumber: searchParams.get("bookingNumber") || "",
      room: searchParams.get("room") || "",
      date: searchParams.get("date") || "",
      time: searchParams.get("time") || "",
      adults: searchParams.get("adults") || "",
      totalPrice: Number(searchParams.get("totalPrice") || 0),
      amountDue: Number(searchParams.get("amountDue") || 0),
      email: searchParams.get("email") || "",
    }),
    [searchParams]
  );

  const downloadReceipt = () => {
    const receipt = `Booking Receipt

Booking Number: ${booking.bookingNumber}
Room: ${booking.room}
Date: ${booking.date}
Time: ${booking.time}
Adults: ${booking.adults}
Total: ${booking.totalPrice} SAR
Amount Due: ${booking.amountDue} SAR
Email: ${booking.email}
`;
    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${booking.bookingNumber || "booking"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Booking Confirmed</h1>
        <p className={styles.subtitle}>Your booking is completed successfully.</p>

        <div className={styles.summary}>
          <p><strong>Booking Number:</strong> {booking.bookingNumber || "--"}</p>
          <p><strong>Room:</strong> {booking.room || "--"}</p>
          <p><strong>Date & Time:</strong> {booking.date || "--"} {booking.time || ""}</p>
          <p><strong>Adults:</strong> {booking.adults || "--"}</p>
          <p><strong>Total Price:</strong> {booking.totalPrice.toLocaleString()} SAR</p>
          <p><strong>Amount Due:</strong> {booking.amountDue.toLocaleString()} SAR</p>
          <p><strong>Email:</strong> {booking.email || "--"}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.printBtn} type="button" onClick={() => window.print()}>
            Print
          </button>
          <button className={styles.downloadBtn} type="button" onClick={downloadReceipt}>
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
