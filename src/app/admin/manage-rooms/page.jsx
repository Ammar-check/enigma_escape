'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.css';

const initialRooms = [
  {
    id: 'room-1',
    name: 'Butcher',
    slots: [
      {
        id: 'slot-1',
        date: '2026-05-07',
        startTime: '14:00',
        endTime: '15:00',
        capacity: 6,
        bookings: [
          { id: 'bk-1', customer: 'Ahmed Al-Rashid', players: 4 },
          { id: 'bk-2', customer: 'Sara Mohammed', players: 2 },
        ],
      },
      {
        id: 'slot-2',
        date: '2026-05-07',
        startTime: '16:00',
        endTime: '17:00',
        capacity: 8,
        bookings: [{ id: 'bk-3', customer: 'Khalid Ibrahim', players: 5 }],
      },
    ],
  },
  {
    id: 'room-2',
    name: 'Sherlock',
    slots: [
      {
        id: 'slot-3',
        date: '2026-05-08',
        startTime: '12:00',
        endTime: '13:00',
        capacity: 5,
        bookings: [{ id: 'bk-4', customer: 'Layla Al-Saud', players: 3 }],
      },
    ],
  },
  { id: 'room-3', name: 'Lost City', slots: [] },
];

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState(initialRooms[0].id);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: 6,
  });

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) || rooms[0],
    [rooms, activeRoomId]
  );

  const handleAddSlot = (event) => {
    event.preventDefault();
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) return;

    const slotToAdd = {
      id: `slot-${Date.now()}`,
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      capacity: Number(newSlot.capacity) || 1,
      bookings: [],
    };

    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? { ...room, slots: [...room.slots, slotToAdd] }
          : room
      )
    );
    setNewSlot({ date: '', startTime: '', endTime: '', capacity: 6 });
  };

  const deleteSlot = (slotId) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? { ...room, slots: room.slots.filter((slot) => slot.id !== slotId) }
          : room
      )
    );
  };

  const updateSlotCapacity = (slotId, capacity) => {
    const parsed = Math.max(1, Number(capacity) || 1);
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? {
              ...room,
              slots: room.slots.map((slot) =>
                slot.id === slotId ? { ...slot, capacity: parsed } : slot
              ),
            }
          : room
      )
    );
  };

  const deleteBooking = (slotId, bookingId) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoom.id
          ? {
              ...room,
              slots: room.slots.map((slot) =>
                slot.id === slotId
                  ? {
                      ...slot,
                      bookings: slot.bookings.filter(
                        (booking) => booking.id !== bookingId
                      ),
                    }
                  : slot
              ),
            }
          : room
      )
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Rooms</h1>
        <p className={styles.subtitle}>
          Create dated time slots per room, set seat capacity, and delete slot
          bookings.
        </p>
      </div>

      <div className={styles.roomTabs}>
        {rooms.map((room) => (
          <button
            key={room.id}
            className={`${styles.roomTab} ${
              activeRoomId === room.id ? styles.roomTabActive : ''
            }`}
            onClick={() => setActiveRoomId(room.id)}
          >
            {room.name}
            <span className={styles.roomCount}>{room.slots.length} slots</span>
          </button>
        ))}
      </div>

      <form className={styles.slotForm} onSubmit={handleAddSlot}>
        <h3 className={styles.sectionTitle}>Add Time Slot for {activeRoom?.name}</h3>
        <div className={styles.formGrid}>
          <input
            type="date"
            value={newSlot.date}
            onChange={(event) =>
              setNewSlot((prev) => ({ ...prev, date: event.target.value }))
            }
            className={styles.input}
            required
          />
          <input
            type="time"
            value={newSlot.startTime}
            onChange={(event) =>
              setNewSlot((prev) => ({ ...prev, startTime: event.target.value }))
            }
            className={styles.input}
            required
          />
          <input
            type="time"
            value={newSlot.endTime}
            onChange={(event) =>
              setNewSlot((prev) => ({ ...prev, endTime: event.target.value }))
            }
            className={styles.input}
            required
          />
          <input
            type="number"
            min="1"
            value={newSlot.capacity}
            onChange={(event) =>
              setNewSlot((prev) => ({ ...prev, capacity: event.target.value }))
            }
            className={styles.input}
            placeholder="Seat capacity"
            required
          />
        </div>
        <button type="submit" className={styles.primaryBtn}>
          <i className="bi bi-plus-circle-fill"></i> Add Slot
        </button>
      </form>

      <div className={styles.slotList}>
        {(activeRoom?.slots || []).length === 0 ? (
          <div className={styles.emptyState}>
            No time slots yet for this room. Add the first slot above.
          </div>
        ) : (
          activeRoom.slots.map((slot) => {
            const bookedSeats = slot.bookings.reduce(
              (sum, booking) => sum + booking.players,
              0
            );
            return (
              <div key={slot.id} className={styles.slotCard}>
                <div className={styles.slotTop}>
                  <div>
                    <h4 className={styles.slotTitle}>
                      {slot.date} | {slot.startTime} - {slot.endTime}
                    </h4>
                    <p className={styles.slotMeta}>
                      Booked seats: {bookedSeats} / {slot.capacity}
                    </p>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteSlot(slot.id)}
                    type="button"
                  >
                    <i className="bi bi-trash3-fill"></i> Delete Slot
                  </button>
                </div>

                <div className={styles.capacityRow}>
                  <label className={styles.label}>Seats in this timeframe:</label>
                  <input
                    type="number"
                    min="1"
                    value={slot.capacity}
                    className={styles.capacityInput}
                    onChange={(event) =>
                      updateSlotCapacity(slot.id, event.target.value)
                    }
                  />
                </div>

                <div className={styles.bookingTableWrap}>
                  <table className={styles.bookingTable}>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Players</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slot.bookings.length === 0 ? (
                        <tr>
                          <td colSpan={3} className={styles.noBookings}>
                            No bookings in this timeframe.
                          </td>
                        </tr>
                      ) : (
                        slot.bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.customer}</td>
                            <td>{booking.players}</td>
                            <td>
                              <button
                                className={styles.smallDeleteBtn}
                                onClick={() => deleteBooking(slot.id, booking.id)}
                                type="button"
                              >
                                Delete Booking
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
