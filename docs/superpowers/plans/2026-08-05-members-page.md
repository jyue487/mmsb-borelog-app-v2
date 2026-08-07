# Members Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Members tab to the web dashboard sidebar with an admin-facing page that lists members and lets an admin add or remove one, backed entirely by in-memory dummy data.

**Architecture:** A `Member` domain type lives in `@mmsb/core` alongside `Project`/`Borehole`. `apps/web/src/data/dummyMembers.ts` seeds the list with the signed-in user plus fabricated rows. `MembersPage` owns all state and renders a table modelled on `ProjectListPage`; two modals modelled on `AddProjectModal` handle add and remove-confirm. Every mutation funnels through two callbacks in `MembersPage`, which is the seam the real backend replaces later.

**Tech Stack:** React 19 (React Compiler), react-router 8, Tailwind v4, lucide-react, TypeScript 6, Vite 8, pnpm workspace + Turborepo.

**Spec:** `docs/superpowers/specs/2026-08-05-members-page-design.md`

## Global Constraints

- **No test runner exists in this repo.** No package defines a `test` script and no framework is installed. This plan does **not** add one — adding Vitest + React Testing Library is a separate decision the user has not made. Every task therefore substitutes a **typecheck + lint + explicit manual browser check** for an automated test cycle. Do not write test files; do not install a test framework.
- **`pnpm --filter web lint` exits 1 at the baseline.** `apps/web/src/context/AuthContextProvider.tsx:65` has a pre-existing `react-refresh/only-export-components` **error** (the file exports both `useAuth` and `AuthContextProvider`), and `ProjectPage.tsx` and `AddProjectModal.tsx` carry pre-existing `react-hooks/exhaustive-deps` warnings. None of these are this plan's to fix — moving `useAuth` to its own module would ripple through every consumer and is out of scope. So "lint passes" below means **no new errors relative to that baseline**, not exit code 0. Verify by comparing against a `git stash`ed tree if in doubt.
- **Package filter names are inconsistent.** Use `pnpm --filter web …` for the web app and `pnpm --filter @mmsb/core …` for core. (`apps/mobile` is not touched by this plan.)
- **`verbatimModuleSyntax: true`** in `apps/web/tsconfig.app.json` — type-only imports MUST use `import type { X }` or inline `type` specifiers, or the build fails.
- **`noUnusedLocals` and `noUnusedParameters` are on** — an unused import fails `pnpm --filter web build`.
- **Web uses relative imports only.** No `@/` alias (that is mobile-only).
- **Every colour class needs a `dark:` counterpart.** The dashboard is styled for both themes throughout.
- **Do not touch Supabase, `AppSchema`, RLS, or `apps/mobile`.** This is front-end-only with dummy data.
- **Roles are exactly:** `admin`, `supervisor`, `viewer`.
- **Do not add role-based gating** of the Members tab. Everyone signed in sees it for now.

---

### Task 1: `Member` type in `@mmsb/core`

**Files:**
- Create: `packages/core/src/interfaces/Member.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `MEMBER_ROLE_LIST` (readonly tuple `['admin', 'supervisor', 'viewer']`), `type MemberRole = 'admin' | 'supervisor' | 'viewer'`, `interface Member { id: string; name: string; email: string; role: MemberRole; createdAt: Date }`. All three are importable from `@mmsb/core` and used by every later task.

- [ ] **Step 1: Create the interface file**

Create `packages/core/src/interfaces/Member.ts`. Match the `export interface` style used by `Project.ts` in the same directory:

```ts
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
```

- [ ] **Step 2: Export it from the package entry point**

`packages/core/src/index.ts` currently reads:

```ts
export * from './interfaces/Project';
export * from './interfaces/Borehole';
```

Add a third line so the file reads:

```ts
export * from './interfaces/Project';
export * from './interfaces/Borehole';
export * from './interfaces/Member';
```

- [ ] **Step 3: Verify core compiles**

Run: `pnpm --filter @mmsb/core build`
Expected: exits 0, no output errors.

- [ ] **Step 4: Verify the type is reachable from the web app**

Run: `pnpm --filter web build`
Expected: PASS. This proves the new export resolves through the workspace link before any consumer depends on it.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/interfaces/Member.ts packages/core/src/index.ts
git commit -m "Add Member type to @mmsb/core"
```

---

### Task 2: Dummy data and role display metadata

**Files:**
- Create: `apps/web/src/data/dummyMembers.ts` (new `data/` directory)
- Create: `apps/web/src/data/memberRoles.ts`

**Interfaces:**
- Consumes: `Member`, `MemberRole` from `@mmsb/core` (Task 1).
- Produces:
  - `createDummyMembers(currentUserEmail: string | null): Member[]` — returns a fresh array every call. Task 3 calls it exactly once, from a `useState` initialiser.
  - `MEMBER_ROLE_RANK: Record<MemberRole, number>`, `MEMBER_ROLE_LABELS: Record<MemberRole, string>`, `MEMBER_ROLE_BADGE_CLASSES: Record<MemberRole, string>`, `MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string>`. Task 3 uses the first three; Task 4 uses the labels and descriptions. They live in one module so a new role is a single edit, and so the label a member sees in the table matches the label in the dropdown by construction.

- [ ] **Step 1: Create the data module**

Create `apps/web/src/data/dummyMembers.ts` with this exact content:

```ts
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

// Seeding the real signed-in email matters: it makes the "you cannot remove
// yourself" row render in its disabled state during development, instead of
// being a branch nobody ever sees.
export function createDummyMembers(currentUserEmail: string | null): Member[] {
  if (currentUserEmail === null) {
    return [...FABRICATED_MEMBERS];
  }

  return [
    {
      id: 'dummy-member-current-user',
      name: 'You',
      email: currentUserEmail,
      role: 'admin',
      createdAt: new Date('2026-01-05'),
    },
    ...FABRICATED_MEMBERS,
  ];
}
```

Note the spread in both branches: `FABRICATED_MEMBERS` is module state and must never be handed out by reference, or a later `.sort()` could reorder it permanently.

- [ ] **Step 2: Create the role display module**

Create `apps/web/src/data/memberRoles.ts`. Everything the UI needs to *show* a role lives here, so the table badge and the dropdown option can never drift apart:

```ts
// memberRoles.ts
//
// How each role is presented in the web UI. Keyed by MemberRole, so adding a
// role to MEMBER_ROLE_LIST in @mmsb/core surfaces a compiler error in every
// map below rather than a silently missing label.

import type { MemberRole } from '@mmsb/core';

// Sort order for the member list: most privileged first.
export const MEMBER_ROLE_RANK: Record<MemberRole, number> = {
  admin: 0,
  supervisor: 1,
  viewer: 2,
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  viewer: 'Viewer',
};

export const MEMBER_ROLE_BADGE_CLASSES: Record<MemberRole, string> = {
  admin: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  supervisor:
    'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  admin: 'Full access, including managing members.',
  supervisor: 'Can record and edit borehole data.',
  viewer: 'Read-only access to projects and logs.',
};
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm --filter web build`
Expected: PASS. (Neither module is imported yet — this only proves the types line up.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/data/dummyMembers.ts apps/web/src/data/memberRoles.ts
git commit -m "Add dummy member data and role display metadata"
```

---

### Task 3: Members page, route, and sidebar entry

This is the first visible deliverable: a Members tab you can click that renders the table. The modals are stubbed out in Tasks 4 and 5, so this task wires no add/remove behaviour yet.

**Files:**
- Create: `apps/web/src/app/MembersPage.tsx`
- Modify: `apps/web/src/app/main.tsx`
- Modify: `apps/web/src/components/AppSidebar.tsx`

**Interfaces:**
- Consumes: `Member` from `@mmsb/core` (Task 1); `createDummyMembers`, `MEMBER_ROLE_RANK`, `MEMBER_ROLE_LABELS`, `MEMBER_ROLE_BADGE_CLASSES` (Task 2); `useAuth()` from `../context/AuthContextProvider`, which returns `{ userId, email, isSignIn, loading }`.
- Produces: the `MembersPage` default export, and the module-scope helper `sortMembers(members: Member[]): Member[]` used again in Task 4.

- [ ] **Step 1: Create the page**

Create `apps/web/src/app/MembersPage.tsx`. The `Add member` button and Remove buttons are wired to local state that nothing consumes yet — that is intentional; Tasks 4 and 5 attach the modals.

```tsx
// MembersPage.tsx

import type { Member } from '@mmsb/core';
import { useState } from 'react';

import { useAuth } from '../context/AuthContextProvider';
import { createDummyMembers } from '../data/dummyMembers';
import {
  MEMBER_ROLE_BADGE_CLASSES,
  MEMBER_ROLE_LABELS,
  MEMBER_ROLE_RANK,
} from '../data/memberRoles';

const ADDED_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

// Sorts a copy. The caller's array must not be reordered in place — the dummy
// list is module state and `members` is React state.
function sortMembers(members: Member[]): Member[] {
  return [...members].sort((a, b) => {
    const rankDifference =
      MEMBER_ROLE_RANK[a.role] - MEMBER_ROLE_RANK[b.role];

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export default function MembersPage() {
  // `ProtectedRoute` already blocks rendering until the session resolves, so
  // `email` is populated on the very first render and the seed can stay a
  // one-shot initialiser — no effect that could clobber members just added.
  const { email } = useAuth();

  // Only the reader is destructured. `setMembers` arrives in Task 4 alongside
  // the first thing that mutates the list, and the two modal flags arrive with
  // their modals — `noUnusedLocals` is on, so state with no consumer yet is a
  // build error, not a warning.
  const [members] = useState<Member[]>(() =>
    sortMembers(createDummyMembers(email)),
  );

  const isCurrentUser = (member: Member) =>
    email !== null && member.email.toLowerCase() === email.toLowerCase();

  return (
    <div className="min-h-full bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MMSB Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">Members</h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add or remove people who can access the dashboard.
          </p>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">Member list</h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {members.length} member{members.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Inert until Task 4 attaches the modal — see the note below. */}
            <button
              type="button"
              className="cursor-pointer inline-flex items-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:self-auto"
            >
              Add member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                No members yet
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use Add member to give someone access to the dashboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Member
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Added
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="bg-white dark:bg-slate-900"
                    >
                      <td className="min-w-64 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {member.name}
                          </p>

                          {isCurrentUser(member) && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 break-all text-sm text-slate-500 dark:text-slate-400">
                          {member.email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1 text-sm font-semibold ${MEMBER_ROLE_BADGE_CLASSES[member.role]}`}
                        >
                          {MEMBER_ROLE_LABELS[member.role]}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {ADDED_DATE_FORMATTER.format(member.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        {isCurrentUser(member) ? (
                          // Disabled rather than hidden, so the reason is
                          // discoverable instead of the button just missing.
                          <button
                            type="button"
                            disabled
                            title="You cannot remove yourself"
                            className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-400 dark:text-slate-600"
                          >
                            Remove
                          </button>
                        ) : (
                          // Inert until Task 5 attaches the confirm modal.
                          <button
                            type="button"
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-950/50"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
```

**Why the Add member and Remove buttons have no `onClick` yet.** `noUnusedLocals` is on and eslint sets `@typescript-eslint/no-unused-vars` to `error`, so a `setIsAddMemberOpen` that nothing reads is a **hard build failure** (TS6133), not a warning. Rather than parking dead state behind `void` statements or suppression comments, each piece of state lands in the task that introduces its consumer: Task 4 adds `setMembers` + `isAddMemberOpen` with the add modal, Task 5 adds `memberPendingRemoval` with the confirm modal. The cost is that both buttons are inert for exactly one commit; the benefit is that every task builds and lints green on its own.

- [ ] **Step 2: Register the route**

In `apps/web/src/app/main.tsx`, add the import alongside the other page imports:

```tsx
import MembersPage from './MembersPage.tsx';
```

and add the route inside the `<Route element={<AppLayout />}>` block, after the `/projects/...` routes and before `/settings`:

```tsx
<Route path="/members" element={<MembersPage />} />
```

- [ ] **Step 3: Add the sidebar entry**

In `apps/web/src/components/AppSidebar.tsx`, extend the lucide import on line 3:

```tsx
import { Layers, Settings, Users } from 'lucide-react';
```

Then insert a new `<li>` **between** the Projects `<li>` (the one containing the nested project tree, closing at `</li>` just before the Settings entry) and the Settings `<li>`:

```tsx
<li>
  <NavLink to="/members" onClick={onNavigate} className={navLinkClassName}>
    <Users className="size-4 shrink-0" aria-hidden="true" />
    Members
  </NavLink>
</li>
```

Three details that matter:
- `onClick={onNavigate}` is required — `AppLayout.tsx:51` passes it to the mobile drawer instance so the drawer closes after a tap. Without it the drawer stays open over the new page.
- **No `end` prop.** Projects needs `end` because `/projects/:projectCode` would otherwise keep the parent highlighted; Members has no child routes, so plain prefix matching is correct.
- Reuse the existing `navLinkClassName` helper — no new classes, so the active/idle/hover treatment matches its neighbours exactly.

- [ ] **Step 4: Verify it compiles and lints**

Run: `pnpm --filter web build`
Expected: PASS.

Run: `pnpm --filter web lint`
Expected: PASS (warnings about the not-yet-consumed state are acceptable; errors are not).

- [ ] **Step 5: Verify in the browser**

Run: `pnpm --filter web dev`, sign in, then check:
- The sidebar shows Projects → **Members** → Settings, with the `Users` icon.
- Clicking Members navigates to `/members` and highlights that entry in indigo — and only that entry.
- The table lists 5 members in this exact order: Nadia Rahman (Admin), then your own row (Admin, named "You", with a "You" chip), then the supervisors Arjun Pillai and Lim Wei Sheng, then Siti Aminah (Viewer). Admins first, then alphabetical within each role — and since the seeded self row is literally named "You", it sorts after Nadia among the admins. That is correct behaviour, not a bug: the sort rule is role rank then name, with no special case pinning the signed-in user to the top.
- Your own row's Remove button is greyed out; hovering it shows "You cannot remove yourself".
- Narrow the window below `lg`: the hamburger drawer opens, tapping Members navigates **and closes the drawer**.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/MembersPage.tsx apps/web/src/app/main.tsx apps/web/src/components/AppSidebar.tsx
git commit -m "Add Members page, route and sidebar entry"
```

---

### Task 4: Add member modal

**Files:**
- Create: `apps/web/src/components/AddMemberModal.tsx`
- Modify: `apps/web/src/app/MembersPage.tsx`

**Interfaces:**
- Consumes: `MEMBER_ROLE_LIST`, `Member`, `MemberRole` from `@mmsb/core` (Task 1); `MEMBER_ROLE_LABELS`, `MEMBER_ROLE_DESCRIPTIONS` (Task 2); `sortMembers` from Task 3.
- Produces: `AddMemberModal` with props `{ isOpen: boolean; onClose: () => void; existingMembers: Member[]; onMemberAdded: (member: Member) => void }`.

- [ ] **Step 1: Create the modal**

Create `apps/web/src/components/AddMemberModal.tsx`. The structure mirrors `AddProjectModal.tsx` (fixed overlay, `role="dialog"`, Escape to close, mousedown-on-backdrop to close, header/body/footer split by borders). There is no async work here, so — unlike `AddProjectModal` — there is no `isSubmitting` state.

```tsx
// AddMemberModal.tsx

import { MEMBER_ROLE_LIST, type Member, type MemberRole } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';

import {
  MEMBER_ROLE_DESCRIPTIONS,
  MEMBER_ROLE_LABELS,
} from '../data/memberRoles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_CLASSES =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';

const LABEL_CLASSES =
  'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300';

const ERROR_CLASSES = 'mt-2 text-sm font-medium text-red-600 dark:text-red-400';

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: Member[];
  onMemberAdded: (member: Member) => void;
};

export default function AddMemberModal({
  isOpen,
  onClose,
  existingMembers,
  onMemberAdded,
}: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('viewer');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const resetModal = () => {
    setName('');
    setEmail('');
    setRole('viewer');
    setNameError(null);
    setEmailError(null);
  };

  const closeModal = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const normalisedEmail = email.trim().toLowerCase();

    const nextNameError =
      trimmedName.length === 0 ? 'Enter the member’s full name.' : null;

    let nextEmailError: string | null = null;

    if (normalisedEmail.length === 0) {
      nextEmailError = 'Enter an email address.';
    } else if (!EMAIL_PATTERN.test(normalisedEmail)) {
      nextEmailError = 'Enter a valid email address.';
    } else if (
      existingMembers.some(
        (member) => member.email.toLowerCase() === normalisedEmail,
      )
    ) {
      nextEmailError = 'A member with this email already exists.';
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);

    if (nextNameError !== null || nextEmailError !== null) {
      return;
    }

    onMemberAdded({
      id: crypto.randomUUID(),
      name: trimmedName,
      email: normalisedEmail,
      role,
      createdAt: new Date(),
    });

    resetModal();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="add-member-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Add member
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Give someone access to the dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="member-name" className={LABEL_CLASSES}>
              Full name
            </label>

            <input
              id="member-name"
              name="memberName"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (nameError) {
                  setNameError(null);
                }
              }}
              placeholder="e.g. Nadia Rahman"
              autoFocus
              autoComplete="off"
              aria-invalid={nameError !== null}
              aria-describedby={nameError ? 'member-name-error' : undefined}
              className={FIELD_CLASSES}
            />

            {nameError && (
              <p id="member-name-error" role="alert" className={ERROR_CLASSES}>
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="member-email" className={LABEL_CLASSES}>
              Email
            </label>

            <input
              id="member-email"
              name="memberEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (emailError) {
                  setEmailError(null);
                }
              }}
              placeholder="e.g. nadia.rahman@mmsb.com"
              autoComplete="off"
              aria-invalid={emailError !== null}
              aria-describedby={emailError ? 'member-email-error' : undefined}
              className={FIELD_CLASSES}
            />

            {emailError && (
              <p id="member-email-error" role="alert" className={ERROR_CLASSES}>
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="member-role" className={LABEL_CLASSES}>
              Role
            </label>

            <select
              id="member-role"
              name="memberRole"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as MemberRole)
              }
              className={`${FIELD_CLASSES} cursor-pointer`}
            >
              {MEMBER_ROLE_LIST.map((memberRole) => (
                <option key={memberRole} value={memberRole}>
                  {MEMBER_ROLE_LABELS[memberRole]}
                </option>
              ))}
            </select>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {MEMBER_ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Add member
          </button>
        </div>
      </form>
    </div>
  );
}
```

The `as MemberRole` cast on the `<select>` change handler is the one unavoidable cast: DOM change events type `value` as `string`, and the options are generated from `MEMBER_ROLE_LIST`, so the value is always a valid role.

- [ ] **Step 2: Wire it into the page**

Three edits to `apps/web/src/app/MembersPage.tsx`.

**(a)** Add the import below the `useState` import:

```tsx
import AddMemberModal from '../components/AddMemberModal';
```

**(b)** Task 3 deliberately destructured only the reader, because unused state is a build error under `noUnusedLocals`. This task introduces both consumers, so widen the declaration and add the open flag. Replace:

```tsx
  const [members] = useState<Member[]>(() =>
    sortMembers(createDummyMembers(email)),
  );
```

with:

```tsx
  const [members, setMembers] = useState<Member[]>(() =>
    sortMembers(createDummyMembers(email)),
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
```

Delete the Task 3 comment above it that explains the narrow destructuring — it no longer applies. Keep the comment about `ProtectedRoute` and the one-shot initialiser; that one still does.

**(c)** Wire the Add member button, which Task 3 left inert. Remove the `{/* Inert until Task 4 attaches the modal — see the note below. */}` comment above it and add the handler:

```tsx
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
```

**(d)** Render the modal just before the final `</div>` of the outer page `<div>` (i.e. after `</section>`'s parent `</div>`, matching how `ProjectListPage` renders `AddProjectModal` as the last child of the page root):

```tsx
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        existingMembers={members}
        onMemberAdded={(newMember) => {
          setMembers((currentMembers) =>
            sortMembers([...currentMembers, newMember]),
          );
        }}
      />
```

- [ ] **Step 3: Verify it compiles and lints**

Run: `pnpm --filter web build`
Expected: PASS.

Run: `pnpm --filter web lint`
Expected: PASS.

- [ ] **Step 4: Verify in the browser**

Run `pnpm --filter web dev` and, on `/members`:
- Click **Add member** — the modal opens with the name field focused and Role defaulting to Viewer.
- Submit it empty — both "Enter the member's full name." and "Enter an email address." appear; the modal stays open.
- Type `not-an-email` — on submit you get "Enter a valid email address."
- Enter `nadia.rahman@example.com` (any capitalisation) with a valid name — you get "A member with this email already exists."
- Change the Role dropdown — the helper line under it changes with the selection.
- Add `Test Person` / `test.person@mmsb.com` / Supervisor — the modal closes and the row appears **between the admins and the viewer**, last among the supervisors (after Arjun Pillai and Lim Wei Sheng, since `T` follows `L`), with today's date in Added and the count incremented.
- Reopen the modal — all fields are reset and no errors are showing.
- Press Escape, and separately click the dark backdrop — both close the modal.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/AddMemberModal.tsx apps/web/src/app/MembersPage.tsx
git commit -m "Add member modal to the Members page"
```

---

### Task 5: Remove member confirmation modal

**Files:**
- Create: `apps/web/src/components/RemoveMemberModal.tsx`
- Modify: `apps/web/src/app/MembersPage.tsx`

**Interfaces:**
- Consumes: `Member` from `@mmsb/core` (Task 1). Introduces the `memberPendingRemoval` state itself — Task 3 could not declare it, since unused state fails the build under `noUnusedLocals`.
- Produces: `RemoveMemberModal` with props `{ member: Member | null; onClose: () => void; onConfirm: (member: Member) => void }`. It renders `null` when `member` is `null`, so the page needs no separate open flag.

- [ ] **Step 1: Create the modal**

Create `apps/web/src/components/RemoveMemberModal.tsx`:

```tsx
// RemoveMemberModal.tsx

import type { Member } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect } from 'react';

type RemoveMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member) => void;
};

export default function RemoveMemberModal({
  member,
  onClose,
  onConfirm,
}: RemoveMemberModalProps) {
  useEffect(() => {
    if (member === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [member]);

  if (member === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <h2
            id="remove-member-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            Remove member
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remove{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {member.name}
            </span>{' '}
            <span className="break-all">({member.email})</span>? They will lose
            access to the dashboard.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(member)}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
```

This one is a `<div>`, not a `<form>` — there is no input to submit, and the confirm button is a plain `onClick`.

- [ ] **Step 2: Wire it into the page**

Three edits to `apps/web/src/app/MembersPage.tsx`.

**(a)** Add the import next to the `AddMemberModal` import:

```tsx
import RemoveMemberModal from '../components/RemoveMemberModal';
```

**(b)** Add the state this task consumes, directly below the `isAddMemberOpen` line from Task 4:

```tsx
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<Member | null>(null);
```

**(c)** Wire the per-row Remove button, which Task 3 left inert. It sits in the `: (` branch of the `isCurrentUser(member) ? … : …` ternary — the enabled branch, not the disabled one. Remove the `// Inert until Task 5 attaches the confirm modal.` comment above it and add the handler:

```tsx
                          <button
                            type="button"
                            onClick={() => setMemberPendingRemoval(member)}
```

Leave the disabled self-row button exactly as it is — it must stay handler-free.

**(d)** Render the modal immediately after `<AddMemberModal … />`:

```tsx
      <RemoveMemberModal
        member={memberPendingRemoval}
        onClose={() => setMemberPendingRemoval(null)}
        onConfirm={(member) => {
          setMembers((currentMembers) =>
            currentMembers.filter(
              (currentMember) => currentMember.id !== member.id,
            ),
          );
          setMemberPendingRemoval(null);
        }}
      />
```

Filtering preserves order, so no re-sort is needed here.

- [ ] **Step 3: Verify it compiles and lints**

Run: `pnpm --filter web build`
Expected: PASS.

Run: `pnpm --filter web lint`
Expected: PASS, with **no** unused-variable warnings left over from Task 3 — every piece of state is now consumed.

- [ ] **Step 4: Verify in the browser**

Run `pnpm --filter web dev` and, on `/members`:
- Click Remove on Siti Aminah — the dialog names her and shows her email.
- Cancel, Escape, and clicking the backdrop each dismiss it with the row still present.
- Click Remove and confirm — the row disappears and the member count drops by one.
- Remove every member except yourself — the table still renders your row, and its Remove button is still disabled.
- Add a member, then remove that same member, to confirm the two flows compose.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/RemoveMemberModal.tsx apps/web/src/app/MembersPage.tsx
git commit -m "Add remove member confirmation to the Members page"
```

---

## Final verification

After Task 5, run the full workspace build once to confirm nothing else regressed:

- [ ] Run: `pnpm build` from the repo root. Expected: PASS (`@mmsb/core` → `web`).
- [ ] Run: `pnpm --filter web lint`. Expected: PASS.
- [ ] Run: `pnpm --filter apps/mobile check-types`. Expected: PASS — proves the `@mmsb/core` change did not disturb mobile (which does not depend on core, so this should be unaffected).
- [ ] Confirm `git status` is clean and the branch holds five commits, one per task.

## Known follow-ups (explicitly out of scope)

These are recorded so the next person does not mistake them for oversights:

- ~~Real Supabase-backed signup and deletion, and a `members` table with a role column. Two traps for whoever does it: (a) `MembersPage` formats `member.createdAt` with `Intl.DateTimeFormat`, which throws `RangeError: Invalid time value` on anything that is not a real `Date` — Supabase returns `created_at` as an ISO **string**, so the row mapper must do `new Date(row.created_at)`; web has no existing date-column mapper to copy, since `supabase/projectRow.ts` has none. (b) `AddMemberModal` still owes an `isSubmitting`/`submitError` lifecycle and needs its client-side duplicate-email scan replaced by handling Postgres error code `23505`, the way `AddProjectModal.tsx` already does.~~ **Done 2026-08-06** — backed by the existing `user_to_role` table rather than a new `members` table. See "Backend integration" in the design spec. Both traps are closed: `mapMemberRow` revives the date and `MembersPage` additionally renders `—` for an `Invalid Date`, and `AddMemberModal` has the full async lifecycle. Note the duplicate case surfaces as the edge function's `duplicate` code rather than a raw `23505`, since the insert no longer happens in the browser.
- Hiding or disabling the Members tab for non-admins. **Partly done 2026-08-06** — `useAuth()` now carries the role and Add/Remove are gated to owner + admin, but the tab itself is still shown to everyone (a read-only "who has access" list is useful to a supervisor). Hiding it entirely is a one-line change in `AppSidebar.tsx`.
- Editing an existing member's role.
- ~~Password entry, invite emails, and password-reset flows.~~ **Password entry done 2026-08-06** —
  supervisors (and only supervisors) are created with a password, because the mobile app signs in
  with `signInWithPassword` while the dashboard uses an emailed OTP. `RemoveMemberModal` was absorbed
  into a new `EditMemberModal` holding both the password controls and removal. See "Supervisor
  passwords" in the design spec. The trap: three separate branches resolve a user id, and the two
  that skip `createUser` — reviving a removed supervisor, and adopting a pre-existing auth account —
  must push the password explicitly or it silently never applies. Still out of scope: invite emails,
  and any self-service password reset. Note passwords can only ever be **replaced**, not shown —
  Supabase keeps a bcrypt hash, and storing a readable second copy was considered and rejected.
- Automated tests. There is no test runner in this repo; if one is wanted, adding Vitest + React Testing Library to `apps/web` is its own piece of work, and the validation logic in `AddMemberModal` is the first thing worth covering.
