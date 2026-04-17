import { useState } from "react";
import styles from "./BookingForm.module.css";
import { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import siteData from '@/data/siteData.json';
import Link from "next/link";

const BookingForm = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const dateRef = useRef(null);
  const [selectedInfo, setSelectedInfo] = useState(null);


  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

  const getSaudiDate = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    // weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

  const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formattedDate = formatDateLocal(selectedDate);


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
            <option value="VR Rooms">VR Rooms</option>
            <option value="Mind Shield">Mind Shield</option>
          </select>
        </div>
      </div>

      <div className={styles.bottomRow}>
        {/* Pick Date */}
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            const picked = new Date(date);
            picked.setHours(0, 0, 0, 0);
            setSelectedDate(picked);
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
    {selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}
  </div>

  {/* Next Button */}
  <button className={styles.navBtn} onClick={goNext}>
    &#8250;
  </button>
</div>


    <div className={styles.dateSec}>
      {card.availability?.[formattedDate]?.length > -1 ? (
    card.availability[formattedDate].map((time, i) => (
      <button key={i} className={styles.slotBtn}>
        {time}
        <br /><span className={styles.slots}>10 available</span>
      </button>
    ))
  ) : (
    <span>No slots available</span>
  )}
    </div>

   <div style={{textAlign:'center',margin:"5px 0"}}>View all dates <Link href=""><i className="bi bi-chevron-right" style={{color:'white'}}></i></Link></div>


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

       <div className={styles.bottomRow}>
        {/* Pick Date */}
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            const picked = new Date(date);
            picked.setHours(0, 0, 0, 0);
            setSelectedDate(picked);
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
    </div>
  );
};

export default BookingForm;
