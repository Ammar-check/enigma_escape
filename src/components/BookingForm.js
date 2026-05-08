import { useEffect, useState } from "react";
import styles from "./BookingForm.module.css";
import { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import siteData from '@/data/siteData.json';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const BookingForm = ({ initialRoomId = null }) => {
  const router = useRouter();
  const getDatePart = (value) => String(value || "").slice(0, 10);
  const getTimePart = (value) => String(value || "").slice(11, 16);
  const isInSlotRange = (time, start, end) => Boolean(time && start && end && time >= start.slice(0, 5) && time < end.slice(0, 5));

  const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(initialRoomId ? String(initialRoomId) : "");
  const [showAllRooms, setShowAllRooms] = useState(!initialRoomId);
  const dateRef = useRef(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [slotAvailability, setSlotAvailability] = useState({});
  const [selectedSlotBooking, setSelectedSlotBooking] = useState(null);
  const [selectedAdults, setSelectedAdults] = useState(2);
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


  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoom(String(initialRoomId));
      setShowAllRooms(false);
    } else {
      setSelectedRoom("");
      setShowAllRooms(true);
    }
  }, [initialRoomId]);

const filteredCard =
  showAllRooms || selectedRoom === ""
    ? siteData.bookingCard
    : siteData.bookingCard.filter((card) => String(card.id) === selectedRoom);

  const getRoomSlugById = (id) => {
    const map = {
      1: "the-butcher",
      2: "the-lost-city",
      3: "sherlock-doomsday-device",
      4: "vr-room-1",
      5: "outdoor-escape",
    };
    return map[id] || "the-butcher";
  };

  const getRoomTourNamesById = (id) => {
    const map = {
      1: ["The Butcher", "the-butcher"],
      2: ["The Lost City", "the-lost-city"],
      3: ["Sherlock", "Sherlock & Doomsday Device", "sherlock-doomsday-device"],
      4: ["VR Room", "VR Room 1", "vr-room-1"],
      5: ["Mind Shield", "Outdoor Escape", "outdoor-escape"],
    };
    return map[id] || [];
  };

  useEffect(() => {
    const loadSlots = async () => {
      const activeCards = filteredCard || [];
      if (activeCards.length === 0) {
        setSlotAvailability({});
        return;
      }

      const nextAvailability = {};
      await Promise.all(
        activeCards.map(async (card) => {
          const roomSlug = getRoomSlugById(card.id);
          const roomNames = getRoomTourNamesById(card.id);
          const roomMatchers = [...roomNames, roomSlug, card.title].filter(Boolean);
          const roomOrFilter = roomMatchers.map((value) => `tour.ilike.%${value}%`).join(",");
          const [{ data: slotData, error: slotError }, { data: bookingData, error: bookingError }] = await Promise.all([
            supabase
              .from("room_slots")
              .select("slot_date,start_time,end_time,capacity,is_blocked,price_2,price_3,price_4,price_5,price_6,price_7,price_8")
              .eq("room_slug", roomSlug)
              .eq("slot_date", formattedDate)
              .order("start_time", { ascending: true }),
            supabase
              .from("bookings")
              .select("start_at,participants,adults,tour")
              .or(roomOrFilter)
              .gte("start_at", `${formattedDate}T00:00:00`)
              .lt("start_at", `${formattedDate}T23:59:59`),
          ]);

          if (slotError || bookingError) {
            nextAvailability[card.id] = [];
            return;
          }

          nextAvailability[card.id] = (slotData || []).map((slot) => {
            const bookedPlayers = (bookingData || []).reduce((sum, booking) => {
              if (!booking.start_at) return sum;
              const bookingDate = getDatePart(booking.start_at);
              const bookingTime = getTimePart(booking.start_at);
              if (bookingDate === formattedDate && isInSlotRange(bookingTime, slot.start_time, slot.end_time)) {
                return sum + Number(booking.participants || booking.adults || 0);
              }
              return sum;
            }, 0);
            const capacity = Number(slot.capacity ?? 0);
            const availableSeats = Math.max(capacity - bookedPlayers, 0);
            const isFull = Boolean(slot.is_blocked) || availableSeats <= 0;

            return {
              time: slot.start_time?.slice(0, 5) || "--:--",
              status: isFull ? "full" : "available",
              available: availableSeats,
              capacity,
              prices: {
                2: Number(slot.price_2 ?? 340),
                3: Number(slot.price_3 ?? 495),
                4: Number(slot.price_4 ?? 640),
                5: Number(slot.price_5 ?? 775),
                6: Number(slot.price_6 ?? 900),
                7: Number(slot.price_7 ?? 1120),
                8: Number(slot.price_8 ?? 1280),
              },
            };
          });
        })
      );
      setSlotAvailability(nextAvailability);
    };

    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedDate, selectedRoom, showAllRooms]);

  useEffect(() => {
    if (!selectedSlotBooking) return;
    const availableSeats = Number(selectedSlotBooking.slot?.available ?? 0);
    const maxSelectableAdults = Math.min(8, availableSeats);
    if (maxSelectableAdults >= 2 && selectedAdults > maxSelectableAdults) {
      setSelectedAdults(maxSelectableAdults);
    }
  }, [selectedSlotBooking, selectedAdults]);


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
            {siteData.bookingCard.map((card) => (
              <option key={card.id} value={String(card.id)}>
                {card.title}
              </option>
            ))}
          </select>
        </div>
        {initialRoomId && !showAllRooms && (
          <button
            type="button"
            className={styles.viewAllRoomsBtn}
            onClick={() => {
              setShowAllRooms(true);
              setSelectedRoom("");
            }}
          >
            View all rooms
          </button>
        )}
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
        const slotsFromBackend = slotAvailability[card.id] || [];
        const slots = slotsFromBackend;
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
              onClick={() => {
                if (isFull) return;
                setSelectedAdults(2);
                setSelectedSlotBooking({ card, slot: slotData, date: displayDate, dbDate: formattedDate });
              }}
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

    {selectedSlotBooking?.card?.id === card.id && (
      <div className={styles.infoOverlay}>
        <div className={styles.bookingPopup}>
          {(() => {
            const availableSeats = Number(selectedSlotBooking.slot?.available ?? 0);
            const maxSelectableAdults = Math.min(8, availableSeats);
            const selectableAdults = [2, 3, 4, 5, 6, 7, 8].filter((value) => value <= maxSelectableAdults);
            const notEnoughSeats = availableSeats < selectedAdults;
            return (
              <>
          <h2 className={styles.bookingPopupTitle}>{selectedSlotBooking.card.title}</h2>
          <p className={styles.bookingPopupDate}>
            <i className="bi bi-clock-history"></i> {selectedSlotBooking.date} {selectedSlotBooking.slot.time}
          </p>
          <hr className={styles.bookingPopupDivider} />
          <div className={styles.bookingPopupRows}>
            <div className={styles.bookingPopupRow}>
              <span>Adults</span>
              <div className={styles.adultsControl}>
                <button
                  onClick={() => setSelectedAdults((prev) => Math.max(2, prev - 1))}
                  type="button"
                  disabled={selectableAdults.length === 0}
                >
                  -
                </button>
                <select
                  value={selectedAdults}
                  onChange={(e) => setSelectedAdults(Number(e.target.value))}
                  disabled={selectableAdults.length === 0}
                >
                  {selectableAdults.length === 0 ? (
                    <option value={selectedAdults}>{selectedAdults}</option>
                  ) : (
                    selectableAdults.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))
                  )}
                </select>
                <button
                  onClick={() => setSelectedAdults((prev) => Math.min(maxSelectableAdults, prev + 1))}
                  type="button"
                  disabled={selectableAdults.length === 0}
                >
                  +
                </button>
              </div>
            </div>
            <div className={styles.bookingPopupRow}>
              <span>Available</span>
              <span>{selectedSlotBooking.slot.available}</span>
            </div>
            <div className={styles.bookingPopupRow}>
              <span>Price</span>
              <span>
                {(selectedSlotBooking.slot.prices?.[selectedAdults] ?? 0).toLocaleString()} SAR
              </span>
            </div>
          </div>
          {notEnoughSeats && (
            <p className={styles.bookingSeatWarning}>Not enough seats for selected adults.</p>
          )}
          <div className={styles.bookingPopupActions}>
            <button
              className={styles.bookingCancelBtn}
              onClick={() => {
                setSelectedSlotBooking(null);
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.bookingConfirmBtn}
              type="button"
              disabled={notEnoughSeats || availableSeats < 2}
              onClick={() => {
                if (notEnoughSeats || availableSeats < 2) return;
                const room = selectedSlotBooking.card.title;
                const roomSlug = getRoomSlugById(selectedSlotBooking.card.id);
                const date = selectedSlotBooking.dbDate || formattedDate;
                const time = selectedSlotBooking.slot.time;
                const adults = String(selectedAdults);
                const price = String(selectedSlotBooking.slot.prices?.[selectedAdults] ?? 0);
                const query = new URLSearchParams({ room, roomSlug, date, time, adults, price });
                setSelectedSlotBooking(null);
                router.push(`/booking/checkout?${query.toString()}`);
              }}
            >
              Book
            </button>
          </div>
              </>
            );
          })()}
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
