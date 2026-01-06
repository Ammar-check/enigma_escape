import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BootstrapClient from '@/components/BootstrapClient';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'Enigma Escape Games | Immersive Escape Room Experience',
  description: 'Experience the thrill of immersive escape rooms at Enigma Escape Games. Book your adventure today!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-pattern" suppressHydrationWarning={true}>
        <LanguageProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </LanguageProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
