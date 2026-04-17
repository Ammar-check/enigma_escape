"use client"
import WaiverForm from "@/components/admin/WaiverForm"
import styles from "./Waiver.module.css"
import BookingForm from "@/components/BookingForm"

const Waiver = () => {
  return (
    <section className={styles.waiverSection}>
        {/* <WaiverForm/> */}
        <BookingForm/>
    </section>
  )
}

export default Waiver