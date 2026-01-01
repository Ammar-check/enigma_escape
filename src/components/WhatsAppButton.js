'use client';

import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const phoneNumber = '966583863748'; // Saudi number without +
  const message = 'Hello, I am interested in booking an escape room at Enigma Escape Games';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappBtn}
      aria-label="Contact us on WhatsApp"
      title="Contact us on WhatsApp"
    >
      <i className="bi bi-whatsapp"></i>
    </a>
  );
}
