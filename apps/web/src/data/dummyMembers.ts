// dummyMembers.ts
//
// Placeholder data for the Members page. The real list will come from Supabase
// later; everything here is fabricated except the signed-in user's email.

import type { Member } from '@mmsb/core';

// Fixed dates rather than `new Date()`, so the Added column does not shift
// between renders while the page is still backed by dummy data.
const FABRICATED_MEMBERS: Member[] = [
  {
    id: 'dummy-member-nadia',
    name: 'Nadia Rahman',
    email: 'nadia.rahman@example.com',
    role: 'admin',
    createdAt: new Date('2026-01-12'),
  },
  {
    id: 'dummy-member-lim',
    name: 'Lim Wei Sheng',
    email: 'lim.weisheng@example.com',
    role: 'supervisor',
    createdAt: new Date('2026-02-03'),
  },
  {
    id: 'dummy-member-arjun',
    name: 'Arjun Pillai',
    email: 'arjun.pillai@example.com',
    role: 'supervisor',
    createdAt: new Date('2026-03-14'),
  },
  {
    id: 'dummy-member-siti',
    name: 'Siti Aminah',
    email: 'siti.aminah@example.com',
    role: 'viewer',
    createdAt: new Date('2026-04-22'),
  },
];

// Seeding the self row with the real auth user id (rather than a fixed
// placeholder id) is what lets the self-removal guard key off `id` instead of
// a nullable email — `userId` is always present by the time this page
// mounts, whereas `email` can legitimately be null.
export function createDummyMembers(
  currentUserId: string,
  currentUserEmail: string | null,
): Member[] {
  return [
    {
      id: currentUserId,
      name: 'You',
      email: currentUserEmail ?? '—',
      role: 'admin',
      createdAt: new Date('2026-01-05'),
    },
    ...FABRICATED_MEMBERS,
  ];
}
