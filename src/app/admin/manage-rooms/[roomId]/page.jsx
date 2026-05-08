import { ROOM_CATALOG } from '@/data/roomCatalog';
import RoomSlotsClient from './RoomSlotsClient';

export function generateStaticParams() {
  return ROOM_CATALOG.map((room) => ({ roomId: room.slug }));
}

export default function ManageRoomSlotsPage({ params }) {
  return <RoomSlotsClient roomId={params.roomId} />;
}
