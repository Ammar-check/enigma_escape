export const ROOM_CATALOG = [
  { slug: 'the-butcher', name: 'The Butcher', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'the-lost-city', name: 'The Lost City', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'sherlock-doomsday-device', name: 'Sherlock & Doomsday Device', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'outdoor-escape', name: 'Outdoor Escape', type: 'escape', minPlayers: 2, maxPlayers: 8 },
  { slug: 'vr-room-1', name: 'VR Room 1', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-2', name: 'VR Room 2', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-3', name: 'VR Room 3', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-4', name: 'VR Room 4', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-5', name: 'VR Room 5', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-6', name: 'VR Room 6', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-7', name: 'VR Room 7', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-8', name: 'VR Room 8', type: 'vr', minPlayers: 2, maxPlayers: 4 },
  { slug: 'vr-room-9', name: 'VR Room 9', type: 'vr', minPlayers: 2, maxPlayers: 4 },
];

export const ROOM_MAP = ROOM_CATALOG.reduce((acc, room) => {
  acc[room.slug] = room;
  return acc;
}, {});
