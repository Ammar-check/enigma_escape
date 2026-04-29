import { useState } from "react";
import styles from "./BookingForm.module.css";
import { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import siteData from '@/data/siteData.json';
import Link from "next/link";

const BookingForm = () => {
  const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const dateRef = useRef(null);
  const [selectedInfo, setSelectedInfo] = useState(null);


  const [selectedDate, setSelectedDate] = useState(() => normalizeDate(new Date()));

  const isToday = () => {
    const today = normalizeDate(new Date());
    return selectedDate.getTime() === today.getTime();
  };

  const goNext = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goPrev = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formattedDate = formatDateLocal(selectedDate);
const displayDate = selectedDate.toLocaleDateString("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});


const filteredCard = selectedRoom === "" ? siteData.bookingCard : siteData.bookingCard.filter(
  (card)=> card.title === selectedRoom
)


  return (
    <div className={styles.bookContainer}>
      <div className={styles.topRow}>
        {/* Filter Button */}
        <button
          className={styles.filterBtn}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <i className="bi bi-funnel"></i>
          Filter
        </button>

        {/* Expandable Panel */}
        <div
          className={`${styles.filterPanel} ${filterOpen ? styles.open : ""}`}
        >
          <label>Tour:</label>
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              console.log("Filter:", e.target.value);
            }}
          >
            <option value="">All Rooms</option>
            <option value="The Butcher">The Butcher</option>
            <option value="Sherlock">Sherlock</option>
            <option value="The Lost City">The Lost City</option>
            <option value="VR Room">VR Room</option>
            <option value="Mind Shield">Mind Shield</option>
          </select>
        </div>
      </div>

      <div className={styles.bottomRow}>
        {/* Pick Date */}
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(normalizeDate(date));
          }}
          minDate={new Date()}
          popperPlacement="bottom-start" // 👈 button ke neeche open hoga
          customInput={
            <button className={styles.dateBtn}>
              <span className={styles.calIcon}>&#128197;</span>
              Pick date
            </button>
          }
        />

        {/* Previous — hidden when today */}
        {!isToday() && (
          <button className={styles.dateBtn} onClick={goPrev}>
            &#8249; Previous days
          </button>
        )}

        {/* Following */}
        <button className={styles.dateBtn} onClick={goNext}>
          Following days &#8250;
        </button>
      </div>

      <div className={styles.cardBody}>
        {filteredCard.map((card) => (
  <div key={card.id} className={styles.card}>
    
    <div className={styles.imgSec}>
      <Image
        className={styles.bookCardImg}
        src={card.image}
        width={100}
        height={100}
        alt={card.title}
      />

      <div className={styles.cardDetail}>
        <h1 className={styles.heading}>{card.title}</h1>

        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>1 hour</span>

          <button
            className={styles.infoBtn}
            onClick={() => setSelectedInfo(card)}
          >
            <i className="bi bi-info-circle"></i>
          </button>
        </p>
      </div>
    </div>
    
    <div className={styles.dateBar}>
  {/* Prev Button */}
  <button
    className={styles.navBtn}
    onClick={goPrev}
    style={{ visibility: isToday() ? "hidden" : "visible" }} // 👈 no shift
  >
    &#8249;
  </button>

  {/* Center Date */}
  <div className={styles.dateText}>
    {displayDate}
  </div>

  {/* Next Button */}
  <button className={styles.navBtn} onClick={goNext}>
    &#8250;
  </button>
</div>


    <div className={styles.dateSec}>
      {(() => {
        const slots = card.availability?.[formattedDate] ?? card.slotTimes ?? [];
        const availableCount = card.availableCount ?? 10;
        if (slots.length === 0) {
          return (
            <span
              className={styles.slots}
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10px' }}
            >
              No slots available
            </span>
          );
        }
        return slots.map((slot, i) => {
          const slotData = typeof slot === "string" ? { time: slot, status: "available", available: availableCount } : slot;
          const isFull = slotData.status === "full";
          return (
            <button
              key={`${card.id}-${formattedDate}-${i}`}
              className={`${styles.slotBtn} ${isFull ? styles.slotBtnFull : ""}`}
              disabled={isFull}
            >
              {slotData.time}
              <span className={styles.slots}>
                {isFull ? "FULL" : `${slotData.available ?? availableCount} Available`}
              </span>
            </button>
          );
        });
      })()}
    </div>

   <div className={styles.viewAllDates}>
     <Link href="">View all dates <i className="bi bi-chevron-right"></i></Link>
   </div>


    {/* POPUP */}
    {selectedInfo?.id === card.id && (
      <div className={styles.infoOverlay}>
        <div className={styles.infoPopup}>

          <h1>{card.title}</h1>
          <hr />
          <p style={{display:'flex',gap:'20px',}}>
            <Image src={card.image} width={250} height={250} alt="info card image" />
            {card.info}</p>

          <button
            className={styles.closeBtn}
            onClick={() => setSelectedInfo(null)}
          >
            OK
          </button>
        </div>
      </div>
    )}
    
  </div>
))}

      </div>
    </div>
  );
};

export default BookingForm;
