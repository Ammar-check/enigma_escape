import siteData from '@/data/siteData.json';
import EventDetailClient from './EventDetailClient'

// Generate static params for all rooms
export function generateStaticParams() {
  return siteData.events.map((event) => ({
    id: event.id.toString(),
  }));
}

export default function EventPage({ params }) {
  const event = siteData.events.find(
    (e) => e.id === parseInt(params.id)
  );

  return <EventDetailClient event={event} />;
}