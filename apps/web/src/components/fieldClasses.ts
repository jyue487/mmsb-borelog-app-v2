// fieldClasses.ts
//
// The form field treatment the member modals share. Lifted out of
// AddMemberModal once EditMemberModal needed the same inputs — two copies of a
// class string this long drift silently, and the drift only shows up as one
// modal looking subtly wrong next to the other.

export const FIELD_CLASSES =
  'w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';

export const LABEL_CLASSES =
  'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300';

export const ERROR_CLASSES =
  'mt-2 text-sm font-medium text-red-600 dark:text-red-400';

export const HELPER_CLASSES = 'mt-2 text-sm text-slate-500 dark:text-slate-400';
