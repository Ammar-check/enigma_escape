import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function BookingCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: "120px 20px", color: "#fff" }}>Loading checkout...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
