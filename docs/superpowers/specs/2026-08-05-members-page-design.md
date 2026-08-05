# Members page (web dashboard) — design

**Date:** 2026-08-05
**Scope:** `apps/web` front end only. No Supabase schema, no auth changes, no RLS. All data is
in-memory dummy data seeded on mount.

## Goal

Add a **Members** tab to the web dashboard sidebar. It lists everyone with dashboard access and
lets an admin add a member or remove one. Roles are global: `admin`, `supervisor`, `viewer`.

This iteration exists to settle the UI. The backend (real signup, deletion, role storage) is a
later piece of work.

## Decisions

| Question | Decision |
| --- | --- |
| Role set | Three: `admin`, `supervisor`, `viewer`. `admin` is a real role on the user. |
| Role scope | Global — one role per user, not per project. |
| Add-member fields | Full name, email, role. **No password field** — credentials are the backend's problem later. |
| Who sees the tab | Everyone, for now. The session carries no role yet, so the signed-in user is treated as an admin. Gating is deliberately out of scope. |

## Data shape

New file `packages/core/src/interfaces/Member.ts`, re-exported from `packages/core/src/index.ts`:

```ts
export const MEMBER_ROLE_LIST = ['admin', 'supervisor', 'viewer'] as const;

export type MemberRole = (typeof MEMBER_ROLE_LIST)[number];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  createdAt: Date;
};
```

It goes in `@mmsb/core` rather than a web-local types file because `apps/web` already imports its
domain types (`Project`, `Borehole`) from there, and `Member` is pure TypeScript with no
react-native dependency. `apps/mobile` does not depend on `@mmsb/core`, so nothing on the mobile
side is affected.

`MEMBER_ROLE_LIST` is the single source of truth for the role dropdown and the badge colour map,
so adding a fourth role later is one edit plus a compiler error at the colour map.

## Files

| File | Purpose |
| --- | --- |
| `packages/core/src/interfaces/Member.ts` | New. Type + role list above. |
| `packages/core/src/index.ts` | Add `export * from './interfaces/Member';` |
| `apps/web/src/data/dummyMembers.ts` | New. `createDummyMembers(currentUserEmail: string \| null): Member[]` |
| `apps/web/src/app/MembersPage.tsx` | New. Route component, owns the `members` state. |
| `apps/web/src/components/AddMemberModal.tsx` | New. |
| `apps/web/src/components/RemoveMemberModal.tsx` | New. |
| `apps/web/src/app/main.tsx` | Add `<Route path="/members" element={<MembersPage />} />` inside `AppLayout`. |
| `apps/web/src/components/AppSidebar.tsx` | Add a `Members` `NavLink` (lucide `Users` icon) between Projects and Settings. |

## Dummy data

`createDummyMembers(currentUserEmail)` returns roughly five members. The **first entry is the
signed-in user** (`currentUserEmail`, role `admin`, name `"You"` if no better name is available);
the rest are fixed fabricated rows covering all three roles.

Seeding the real signed-in email matters: it makes the "you cannot remove yourself" row render as
the disabled state during development instead of being an untested branch. If `currentUserEmail` is
`null`, the self row is omitted and only the fabricated rows show.

IDs come from `crypto.randomUUID()`. `createdAt` values are hardcoded ISO date literals (e.g.
`new Date('2026-03-14')`) rather than `new Date()`, so the Added column is stable between renders.

## MembersPage

State: `const [members, setMembers] = useState<Member[]>(() => createDummyMembers(email))`, plus
`isAddMemberOpen: boolean` and `memberPendingRemoval: Member | null`.

`email` comes from `useAuth()`. `MembersPage` sits behind `ProtectedRoute`, which already returns
early while `loading` is true and redirects when there is no `userId` — so the page only ever
mounts with a resolved session and the `useState` initialiser sees the real email on first render.
No effect, no re-seeding, and therefore no way to clobber members the admin has already added.

Layout mirrors `ProjectListPage`:

- Page header: `MMSB Dashboard` eyebrow, `Members` heading, one-line description.
- A card `<section>` with a header row: `Member list` + `N members` on the left, an `Add member`
  button (indigo, matching `Add Project`) on the right.
- A table inside `overflow-x-auto`.

Columns:

| Column | Content |
| --- | --- |
| Member | Name in `font-medium`, email beneath in muted small text. A `You` chip follows the name on the signed-in user's row. |
| Role | Badge — `admin` indigo, `supervisor` amber, `viewer` slate. Same rounded-pill shape as the project code badge. |
| Added | `createdAt` formatted as a short date. |
| Action | `Remove` button, right-aligned, red text. |

Ordering: `admin` → `supervisor` → `viewer`, then name A–Z within a role. Re-applied after an add,
the way `ProjectListPage` re-sorts after `onProjectAdded`.

Empty state (all members removed): centred "No members yet" with a hint to add one — same shape as
the projects empty state. No loading skeleton; the dummy list is synchronous.

Self-removal guard: on the row whose email matches the signed-in email (case-insensitive), the
Remove button renders `disabled` with `title="You cannot remove yourself"`. Disabled, not hidden,
so the reason is discoverable.

## AddMemberModal

Props: `{ isOpen, onClose, existingMembers: Member[], onMemberAdded: (member: Member) => void }`.

Structurally a copy of `AddProjectModal`: fixed `bg-slate-950/60` overlay, `role="dialog"`,
`aria-modal`, Escape closes, mousedown on the backdrop closes, header / body / footer split by
borders.

Fields: Full name (text, autofocus), Email (email), Role (`<select>` over `MEMBER_ROLE_LIST`,
default `viewer`).

Validation on submit, all client-side, errors rendered inline beneath the offending field in the
existing red style with `aria-invalid` + `aria-describedby`:

- Name — required after trimming.
- Email — required, and must match a basic `x@y.z` pattern.
- Email — must not already exist in `existingMembers` (case-insensitive) → "A member with this
  email already exists."

On success: build `{ id: crypto.randomUUID(), name: trimmed, email: trimmed lowercased, role, createdAt: new Date() }`,
call `onMemberAdded`, reset, close. There is no async work, so no `isSubmitting` state.

## RemoveMemberModal

Props: `{ member: Member | null, onClose, onConfirm: (member: Member) => void }`. Renders nothing
when `member` is `null`.

Same modal chrome. Body: "Remove **{name}**? They will lose access to the dashboard." Footer:
Cancel (outline) and Remove (red, destructive). Confirming calls `onConfirm`, which filters the
member out of `members` in the page.

A confirm step rather than a one-click delete, because removal is destructive and the button sits
in a dense table row.

## Backend seam

Every mutation flows through exactly two handlers in `MembersPage` — the `onMemberAdded` callback
and the `onConfirm` callback — and all data originates from `createDummyMembers`. Wiring the real
backend later means replacing those three things; the table, badges, modals, sidebar entry and
route are untouched.

## Out of scope

- Editing an existing member's role.
- Hiding the tab from non-admins, or any authorization check.
- Password entry, invite emails, resend/reset flows.
- Per-project role assignment.
- Persistence of any kind — a page refresh resets the list.

## Verification

No test runner exists in this repo. Verification is:

1. `pnpm --filter web build` (runs `tsc -b`) passes.
2. `pnpm --filter web lint` passes.
3. Manual pass in `pnpm --filter web dev`: sidebar entry highlights on `/members`; add a member and
   see it land in the right sort position; duplicate email is rejected; remove a member via the
   confirm dialog; your own row's Remove button is disabled.
