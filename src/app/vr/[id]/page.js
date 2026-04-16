import siteData from '@/data/siteData.json';
import VrDetailClient from './VrDetailClient';


// Generate static params for all rooms
export function generateStaticParams() {
  return siteData.vrRoomCards.map((room) => ({
    id: room.id.toString(),
  }));
}


export default function VRDetailPage({ params }) {
  const room = siteData.vrRoomCards.find(r => r.id === parseInt(params.id));
  
  return <VrDetailClient room={room} />;
}