// The single source of truth for the role set: the add-member dropdown and the
// badge colour map are both derived from this, so adding a fourth role is one
// edit here plus a compiler error at each `Record<MemberRole, …>`.
export const MEMBER_ROLE_LIST = ['admin', 'supervisor', 'viewer'] as const;

export type MemberRole = (typeof MEMBER_ROLE_LIST)[number];

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  createdAt: Date;
}
