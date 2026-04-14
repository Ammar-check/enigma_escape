"use client"
import WaiverForm from "@/components/admin/WaiverForm"
import styles from "./Waiver.module.css"

const Waiver = () => {
  return (
    <section className={styles.waiverSection}>
        <WaiverForm/>
    </section>
  )
}

export default Waiver