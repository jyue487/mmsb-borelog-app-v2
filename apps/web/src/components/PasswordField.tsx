// PasswordField.tsx
//
// A password input with a show-while-typing toggle. Shared by AddMemberModal
// (choosing a new supervisor's password) and EditMemberModal (replacing one).
//
// The toggle exists because these passwords are typed by an admin *for someone
// else* and then read aloud or messaged across — the usual reason to mask input
// (a shoulder-surfer while you type your own secret) barely applies, and a typo
// nobody can see costs a support round trip with someone out on site.

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import {
  ERROR_CLASSES,
  FIELD_CLASSES,
  HELPER_CLASSES,
  LABEL_CLASSES,
} from './fieldClasses';

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  disabled = false,
  autoFocus = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          // Not "off": browsers ignore that on password inputs and offer the
          // signed-in admin's *own* saved password, which is the one credential
          // that must never land in this field.
          autoComplete="new-password"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`${FIELD_CLASSES} pr-11`}
        />

        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          disabled={disabled}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-lg px-3 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-slate-200"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className={ERROR_CLASSES}>
          {error}
        </p>
      ) : (
        helperText && (
          <p id={helperId} className={HELPER_CLASSES}>
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
