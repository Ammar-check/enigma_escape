'use client';

<<<<<<< HEAD
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
=======
import { motion } from 'framer-motion';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const phoneNumber = '+966583863748'; // Replace spaces from the number
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappButton}
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(37, 211, 102, 0.7)',
            '0 0 0 20px rgba(37, 211, 102, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        className={styles.pulseRing}
      />
      <i className="bi bi-whatsapp"></i>
    </motion.a>
  );
}

>>>>>>> 8fefd2e8229bce64fbc240f025b79e20646131e2
