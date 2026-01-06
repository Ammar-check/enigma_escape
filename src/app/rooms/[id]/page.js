import siteData from '@/data/siteData.json';
import RoomDetailClient from './RoomDetailClient';

// Generate static params for all rooms
export function generateStaticParams() {
  return siteData.rooms.map((room) => ({
    id: room.id.toString(),
  }));
}

export default function RoomDetailPage({ params }) {
  const room = siteData.rooms.find(r => r.id === parseInt(params.id));
  
  return <RoomDetailClient room={room} />;
}
