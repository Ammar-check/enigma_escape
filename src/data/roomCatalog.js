export const VR_CANONICAL_SLUG = 'vr-room';
export const VR_LEGACY_SLUGS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `vr-room-${n}`);
export const VR_ALL_SLOT_SLUGS = [VR_CANONICAL_SLUG, ...VR_LEGACY_SLUGS];

/** Map legacy vr-room-1..9 (or canonical) to one slug for admin listing & cards. */
export function mergeVrRoomSlugForAdminStats(slug) {
  if (!slug) return slug;
  if (slug === VR_CANONICAL_SLUG || VR_LEGACY_SLUGS.includes(slug)) return VR_CANONICAL_SLUG;
  return slug;
}

export const ROOM_CATALOG = [
  { slug: 'the-butcher', name: 'The Butcher', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'the-lost-city', name: 'The Lost City', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'sherlock-doomsday-device', name: 'Sherlock & Doomsday Device', type: 'escape', minPlayers: 2, maxPlayers: 6 },
  { slug: 'outdoor-escape', name: 'Outdoor Escape', type: 'escape', minPlayers: 2, maxPlayers: 8 },
  { slug: VR_CANONICAL_SLUG, name: 'VR Room', type: 'vr', minPlayers: 2, maxPlayers: 4 },
];

export const ROOM_MAP = ROOM_CATALOG.reduce((acc, room) => {
  acc[room.slug] = room;
  return acc;
}, {});
