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
| `apps/web/src/data/memberRoles.ts` | New. Role display metadata keyed by `MemberRole`: sort rank, labels, badge classes, dropdown descriptions. Shared by the page and the add modal so the table badge and the dropdown option cannot drift apart. |
| `apps/web/src/app/MembersPage.tsx` | New. Route component, owns the `members` state. |
| `apps/web/src/components/AddMemberModal.tsx` | New. |
| `apps/web/src/components/RemoveMemberModal.tsx` | New. |
| `apps/web/src/app/main.tsx` | Add `<Route path="/members" element={<MembersPage />} />` inside `AppLayout`. |
| `apps/web/src/components/AppSidebar.tsx` | Add a `Members` `NavLink` (lucide `Users` icon) between Projects and Settings. |

## Sidebar entry

`AppSidebar` renders a flat `<ul>` of top-level `NavLink`s — currently Projects (with a nested
project → borehole tree derived from the URL) and Settings. Members becomes a third `<li>`,
inserted **between** them, so the order reads Projects → Members → Settings: the two content
sections first, account/config last.

```tsx
<li>
  <NavLink to="/members" onClick={onNavigate} className={navLinkClassName}>
    <Users className="size-4 shrink-0" aria-hidden="true" />
    Members
  </NavLink>
</li>
```

- Icon: lucide-react `Users`, added to the existing `import { Layers, Settings } from 'lucide-react'`.
  Sized `size-4 shrink-0` and `aria-hidden` like the others — the link text is the accessible name.
- Styling: reuses the existing `navLinkClassName` helper, so the active state picks up the same
  indigo `ACTIVE_CLASSES` and the idle/hover treatment matches Projects and Settings. No new
  classes.
- `onClick={onNavigate}` is required: `AppLayout` passes that prop to close the mobile drawer after
  a tap. Omitting it leaves the drawer open over the new page on small screens.
- No `end` prop. Projects uses `end` because it has child routes (`/projects/:code`) that should not
  keep the parent highlighted; Members has no children, so plain prefix matching is correct and
  `/members` highlights only itself.
- No nested tree under Members — the page is a single flat list with no drill-down routes.

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
and the `onConfirm` callback — and all data originates from `createDummyMembers`. The add modal
hands up a `{ name, email, role }` draft and the page mints `id` and `createdAt`, so identity is
created on the line the real Supabase insert will replace, not inside the modal. Wiring the backend
later means replacing those three things; the table, badges, sidebar entry and route are untouched.

The modals are *nearly* untouched, not entirely: `AddMemberModal` still owes an
`isSubmitting`/`submitError` lifecycle, and its client-side duplicate-email scan gives way to
handling Postgres error `23505` the way `AddProjectModal` does. Those are additions to the modal's
async behaviour, not changes to the seam.

## Backend integration (added 2026-08-06)

The dummy data is gone. The page reads and writes the existing `user_to_role` table
(`user_id`, `role_id`, `name`, `email`, + audit columns), whose `role_id` points at a fixed `roles`
lookup — `(1, owner)`, `(2, admin)`, `(3, supervisor)`, `(4, viewer)`.

Three things about the shipped design are not obvious from the diff:

- **`MEMBER_ROLE_LIST` gained `owner`, in first position.** The list is privilege order
  (`memberRoleRank` is `indexOf`) *and* it matches the `roles` ids 1..4, mirrored as one
  compiler-checked `Record<MemberRole, number>` in `apps/web/src/supabase/memberRow.ts`. Owner is
  excluded from `ASSIGNABLE_MEMBER_ROLES`: it is never granted or revoked from the dashboard, only
  in SQL.
- **Add member is an edge function, not an insert.** `LoginPage` signs in with
  `shouldCreateUser: false`, so the dashboard is invite-only and granting access means creating the
  `auth.users` record first. That needs the service role key, which must never reach the Vite bundle
  — hence `packages/supabase/functions/invite-member`. Its trickiest branch is *re-adding a removed person*:
  the soft delete left both their auth account and their `user_to_role` row in place, so the row is
  revived rather than inserted (a plain insert hits `23505` on the primary key).
- **Removal is now real revocation.** `useAuth()` carries the caller's role, and `ProtectedRoute`
  blocks a signed-in user with no live row. It renders an "access has been removed" panel rather
  than redirecting to `/login`, because `LoginPage` redirects to `/projects` whenever `userId` is
  set — a redirect here would loop forever.

Enforcement is in three layers, because a disabled button is cosmetic against the anon key: UI
gating, a caller-role check inside the edge function, and the RLS policies in
`packages/supabase/policies/user_to_role.sql`. That file is reference SQL to run by hand — there is no
migration tooling in this repo.

Not done: the Members tab is still visible to every signed-in user (only Add/Remove are gated), and
there is no toast, so the modal cannot distinguish "invite sent" from "access restored" on success
even though the function reports which happened.

## Supervisor passwords (added 2026-08-06)

### Why

The two clients authenticate differently, and the Members page had been ignoring it:

| Client | Sign-in |
| --- | --- |
| `apps/mobile` | `supabase.auth.signInWithPassword` (`src/app/auth/sign-in.tsx`) |
| `apps/web` | `supabase.auth.signInWithOtp`, `shouldCreateUser: false` (`LoginPage.tsx`) |

Everyone added from the Members page went through `inviteUserByEmail` — an account with **no
password**. Correct for owners, admins and viewers, who only ever open the dashboard. Wrong for
supervisors: they are the field engineers who key data into the mobile app, they need a password,
and they are not expected to open the dashboard at all. There was no way to give one to them
outside the Supabase console.

So the role now decides the shape of the whole flow:

- **supervisor** → `admin.auth.admin.createUser({ email, password, email_confirm: true })`, no email
  of any kind.
- **admin / viewer** → `inviteUserByEmail`, exactly as before, and a password is *rejected* rather
  than ignored. One on an OTP-only account would be dead weight nobody knows exists.

`email_confirm: true` earns its place twice: it suppresses the confirmation email, and it marks the
address verified — without which `signInWithPassword` fails outright if the project has email
confirmation switched on.

Supervisors keep dashboard access. Nothing gates them out; they simply are not expected to use it.

### Passwords are set, never viewed

Supabase stores a bcrypt hash, so an existing password cannot be read back. Showing one would mean
keeping a second, readable copy in the database — every admin, and anyone who got read access to
that table, would then hold every supervisor's real password. That was considered and rejected.

`EditMemberModal` therefore offers *replace*, not *reveal*, and says so in as many words. The
show-while-typing toggle covers the real need: these passwords are typed by an admin **for someone
else** and then read aloud or messaged across, so the usual reason to mask input barely applies,
while a typo nobody can see costs a support round trip with someone out on site.

### The three places a password has to be applied

The obvious branch is creating a new account. The two easy-to-miss ones both **skip `createUser`
entirely**, and missing either means the admin picks a password that silently never applies:

1. **Reviving a removed supervisor.** The soft delete never touched `auth.users`, so the account is
   still there and `createUser` is never reached.
2. **Adopting an existing auth account** — someone hard-deleted from `user_to_role` in the past, or
   created straight in the Supabase console. Same situation, reached via the `email_exists` fallback.

Both call `setUserPassword` from `packages/supabase/functions/_shared/members.ts`.

### Shape of the backend

| File | Role |
| --- | --- |
| `packages/supabase/functions/_shared/members.ts` | CORS, JSON helpers, role ids, `PASSWORD_MIN_LENGTH`, `requireManagerCaller`, `findUserIdByEmail`, `setUserPassword`. Directories under `functions/` starting with `_` are bundled into importers rather than deployed, so this needs no config. |
| `packages/supabase/functions/invite-member/` | Unchanged contract plus an optional `password`. Also lifts the ban when re-adding. |
| `packages/supabase/functions/set-member-password/` | New. `POST { userId, password }`. |
| `packages/supabase/functions/remove-member/` | New. `POST { userId }`. Bans the auth account, then soft-deletes the row. |

`set-member-password` is separate rather than another branch in `invite-member`: different verb,
different target, and "invite" would have started lying. Its authorization is two-sided — the
**caller** must be an owner or admin, and the **target** must be a live supervisor row. That second
check is the one that matters, because the conditional password section in the modal is only an
affordance; it is what stops a hand-crafted request setting a password on an admin's account. It
deliberately has no separate self-check: an owner or admin is by definition not a supervisor, so the
target check already rejects self-service.

Minimum length is 8 — stricter than GoTrue's own floor of 6, so 8 is the limit users actually hit.
It lives in `MEMBER_PASSWORD_MIN_LENGTH` (`@mmsb/core`) for the web app and as `PASSWORD_MIN_LENGTH`
in the shared edge module, which re-checks it; edge functions cannot import from the workspace. A
project-level policy stricter than either surfaces as GoTrue's `weak_password`, which both functions
map to a 400 so it lands under the field rather than as a 500.

### EditMemberModal

`RemoveMemberModal` is gone, absorbed into `EditMemberModal` — one entry point per row, holding both
the password controls and removal. Three things worth knowing:

- **Removal is an inline two-step inside a danger zone**, not a nested modal. A dialog stacked on a
  dialog has no sane focus story. The soft delete itself moved across unchanged, invariant check and
  all.
- **State resets by remount, not by an effect.** `MembersPage` keys the modal on the member's id, so
  a half-typed password and an armed remove confirmation both die when you open it for someone else,
  with nothing to keep in sync.
- **Focus never lands on the destructive button.** The password field takes it when there is one, the
  Done button when there is not, and the confirm step's Keep button when that appears — so Enter can
  never remove anyone.

The row button became **Edit** (indigo) rather than **Remove** (red): it now leads to the password
controls too, and destruction lives behind the danger zone. `removalBlockedReason` became
`manageBlockedReason`; the three rules were already exactly right for the wider button, so only the
wording changed.

### Removal had to become real revocation (2026-08-07)

Found in testing: **a removed supervisor could still sign in to the mobile app.** Three things lined
up. The soft delete only touches `user_to_role`, leaving `auth.users` intact, so
`signInWithPassword` still succeeded. `apps/mobile/src/app/_layout.tsx` gates its whole route stack
on `userId !== null` and nothing else — there is no membership check, unlike web's `ProtectedRoute`.
And PowerSync authenticates with the Supabase JWT, so sync carried on.

Removal therefore moved out of the browser into `remove-member`, which bans the auth account *and*
soft-deletes the row. It bans first: a partial failure then leaves someone locked out but still
listed, which is visible and fixed by pressing Remove again, rather than off the list but still able
to log in — the exact bug being closed. `invite-member` lifts the ban on re-add, in both the revive
and the adopt-existing-account branches; without that, adding someone back would put them in the
list and leave them unable to sign in, with nothing explaining why.

Hard-deleting the auth account was considered and rejected. It removes the need for the revive
branch, but every FK into `auth.users` is `ON DELETE CASCADE` — it would take the membership row and
its audit trail, plus every `project_to_user` and `borehole_to_user` assignment — while the
`created_by`/`updated_by`/`deleted_by` columns on all eight tables carry no FK at all, so they would
be left dangling with no error. For a borehole log that ends up in an engineering report, losing who
recorded it is the wrong trade for twenty lines of already-working code.

Two limits are inherent and were accepted: a ban does not invalidate an already-issued JWT before it
expires, and data already synced to a device stays there.

### Removed tab (2026-08-07)

Banning makes "removed" a state someone is *in* rather than an event that happened, so the page grew
a place to see it. `MembersPage` now fetches `user_to_role` without the `deleted_at` filter — one
round trip, split client-side — and `Member` carries `deletedAt: Date | null`.

- **Owners and admins only.** Who lost access is administrative history; everyone else sees the page
  exactly as before, with no tab strip rendered at all.
- **Read-only, deliberately.** No Restore button and no permanent delete. Adding someone back is the
  existing Add member flow, which finds the row by email, lifts the ban and revives it — a Restore
  button would be a shortcut, not new capability.
- Removed rows sort by `deletedAt` descending, not by role rank. Nobody scans this list for a person
  by seniority; they scan it for "who did we just remove".
- `MEMBER_COLUMNS` gained `deleted_at` in **both** copies — `apps/web/src/supabase/memberRow.ts` and
  `packages/supabase/functions/_shared/members.ts`. The edge functions return rows straight to
  `mapMemberRow`, so a column in one and not the other arrives as `undefined` rather than as an
  error. `mapMemberRow` maps it with `row.deleted_at ? new Date(...) : null` for exactly that reason:
  an `undefined` would read as "removed" in every `!== null` test.

**Hard delete was designed and then dropped.** The idea was a two-stage trash bin — ban on removal,
permanently delete from the Removed tab — which would have made the CASCADE loss a deliberate act
rather than a silent side effect, and would have freed the email for reuse. It was cut as unnecessary
for now. If it comes back, the thing to re-check first is that `boreholes.driller_name` and
`verifier_name` are free text on the borehole, so the report-facing attribution never depended on
`created_by` at all; what a delete actually costs is the system audit trail and the
`project_to_user` / `borehole_to_user` assignment rows.

### Traps for whoever comes next

- **Supervisors invited before this change have no password at all.** Nothing migrates them. Open
  their Edit modal and set one.
- **`supabase/` is untracked in git.** `git add supabase/` has to happen or the edge functions exist
  on one machine only. There is still no migration tooling — `policies/user_to_role.sql` is run by
  hand, and `supabase functions deploy` is a manual step per function.
- **`ASSIGNABLE_ROLE_IDS` in the edge module and `MEMBER_ROLE_TO_ROLE_ID` in the web app mirror each
  other by hand.** Nothing links them. Same for the two password minimums.

## Out of scope

- Editing an existing member's role or name. `EditMemberModal` is password + remove only: changing a
  role would drag the password field in and out mid-edit and leave orphaned passwords behind.
- Hiding the tab from non-admins, or any authorization check.
- Invite emails, self-service password reset, and any "forgot password" flow on mobile.
- Per-project role assignment.

## Verification

No test runner exists in this repo. Verification is:

1. `pnpm --filter web build` (runs `tsc -b`) passes.
2. `pnpm --filter web lint` passes.
3. Manual pass in `pnpm --filter web dev`: sidebar entry highlights on `/members`; add a member and
   see it land in the right sort position; duplicate email is rejected; remove a member via the
   confirm dialog; your own row's Remove button is disabled.
