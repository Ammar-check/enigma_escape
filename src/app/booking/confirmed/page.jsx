import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div style={{ padding: "120px 20px", color: "#fff" }}>Loading booking...</div>}>
      <ConfirmedClient />
    </Suspense>
  );
}
