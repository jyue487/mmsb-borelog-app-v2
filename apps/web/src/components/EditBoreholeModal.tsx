// EditBoreholeModal.tsx
//
// The borehole counterpart of EditProjectModal, down to the overlay, the
// Escape/backdrop handling and the submit shape. Two things differ, and both
// come from the Borehole type: three of the fields are `number | null`, so they
// are held as strings and parsed on submit, and the verifier signature is shown
// but not editable — it is drawn on the mobile signature pad and there is no pad
// here.
//
// This is the ONLY place a borehole can be renamed. BoreholePage passes onEdit
// only when canEditBoreholeDetails(role), which is owners and admins, so the
// field needs no role check of its own — and the database backs that up with the
// boreholes_name_immutable trigger, so a supervisor calling PostgREST directly is
// refused rather than merely unoffered. See packages/supabase/policies/boreholes.sql.
//
// Renaming is not a cosmetic edit: the name is this page's URL key
// (/projects/:projectCode/boreholes/:boreholeName) and there is no unique
// constraint behind it, so the submit below checks the project for a clash and
// BoreholePage moves the router to the new address afterwards.

import type { Borehole } from '@mmsb/core';
import { X } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';

import { useAuth } from '../context/auth';
import { BOREHOLE_COLUMNS, mapBoreholeRow } from '../supabase/boreholeRow';
import { supabase } from '../supabase/supabase.server';
import {
  ERROR_CLASSES,
  FIELD_CLASSES,
  HELPER_CLASSES,
  LABEL_CLASSES,
} from './fieldClasses';

type EditBoreholeModalProps = {
  borehole: Borehole;
  onClose: () => void;
  onBoreholeUpdated: (borehole: Borehole) => void;
};

// The three coordinate fields are optional, so blank is a value — `null` — and
// not an error. Anything else has to parse as a finite number.
//
// Deliberately not rounded to 3 dp the way mobile's checkAndReturn* path does:
// AddBulkBoreholesModal stores what was pasted, and BoreholeDetailStrip already
// formats with toFixed(3) for display.
function parseOptionalNumber(
  value: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: true, value: null };
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue)
    ? { ok: true, value: parsedValue }
    : { ok: false };
}

function toInputValue(value: number | null): string {
  return value === null ? '' : String(value);
}

export default function EditBoreholeModal({
  borehole,
  onClose,
  onBoreholeUpdated,
}: EditBoreholeModalProps) {
  const { userId } = useAuth();

  const [name, setName] = useState(borehole.name);
  const [typeOfBoring, setTypeOfBoring] = useState(borehole.typeOfBoring ?? '');
  const [typeOfRig, setTypeOfRig] = useState(borehole.typeOfRig ?? '');
  const [diameterOfBoring, setDiameterOfBoring] = useState(
    borehole.diameterOfBoring ?? '',
  );
  const [easting, setEasting] = useState(
    toInputValue(borehole.eastingInMetres),
  );
  const [northing, setNorthing] = useState(
    toInputValue(borehole.northingInMetres),
  );
  const [reducedLevel, setReducedLevel] = useState(
    toInputValue(borehole.reducedLevelInMetres),
  );
  const [drillerName, setDrillerName] = useState(borehole.drillerName ?? '');
  const [verifierName, setVerifierName] = useState(borehole.verifierName ?? '');

  // Keyed by field so each error sits under its own input. Cleared for a field
  // as soon as it is edited, the same way EditProjectModal clears submitError.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const parsedEasting = parseOptionalNumber(easting);
    const parsedNorthing = parseOptionalNumber(northing);
    const parsedReducedLevel = parseOptionalNumber(reducedLevel);

    const trimmedName = name.trim();

    const nextFieldErrors: Record<string, string> = {};

    if (!trimmedName) {
      nextFieldErrors.name = 'Borehole name is required.';
    }

    if (!parsedEasting.ok) {
      nextFieldErrors.easting = 'Easting must be a number.';
    }

    if (!parsedNorthing.ok) {
      nextFieldErrors.northing = 'Northing must be a number.';
    }

    if (!parsedReducedLevel.ok) {
      nextFieldErrors.reducedLevel = 'Reduced level must be a number.';
    }

    // Every field is parsed before bailing out, so one bad value does not hide
    // another. Testing the three `ok` flags rather than the size of the map is
    // what narrows the parse results below to their success branch.
    if (
      !trimmedName ||
      !parsedEasting.ok ||
      !parsedNorthing.ok ||
      !parsedReducedLevel.ok
    ) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Nothing in Postgres stops two boreholes on one project sharing a name,
      // and AddBulkBoreholesModal only looks for duplicates within the batch
      // being pasted. Since the name is the URL key, a clash makes
      // fetchBoreholeByProjectIdAndName ambiguous and one of the two boreholes
      // unreachable — so check before renaming. Only on an actual rename: an
      // unchanged name would always find itself excluded and cost a round trip
      // for nothing.
      if (trimmedName !== borehole.name) {
        const { data: clashingBoreholes, error: clashError } = await supabase
          .from('boreholes')
          .select('id')
          .eq('project_id', borehole.projectId)
          .eq('name', trimmedName)
          .neq('id', borehole.id)
          .limit(1);

        if (clashError) {
          throw clashError;
        }

        if (clashingBoreholes && clashingBoreholes.length > 0) {
          setFieldErrors({
            name: 'Another borehole in this project already uses that name.',
          });

          return;
        }
      }

      const { data, error } = await supabase
        .from('boreholes')
        .update({
          name: trimmedName,
          type_of_boring: typeOfBoring.trim(),
          type_of_rig: typeOfRig.trim(),
          diameter_of_boring: diameterOfBoring.trim(),
          easting_in_metres: parsedEasting.value,
          northing_in_metres: parsedNorthing.value,
          reduced_level_in_metres: parsedReducedLevel.value,
          driller_name: drillerName.trim(),
          verifier_name: verifierName.trim(),
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', borehole.id)
        .select(BOREHOLE_COLUMNS)
        .single();

      if (error) {
        throw error;
      }

      onBoreholeUpdated(mapBoreholeRow(data));
      onClose();
    } catch (error) {
      console.error('Error updating borehole:', error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to save the borehole details.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const clearErrors = (field: string) => {
    setFieldErrors((currentErrors) => {
      if (!(field in currentErrors)) {
        return currentErrors;
      }

      const remainingErrors = { ...currentErrors };
      delete remainingErrors[field];

      return remainingErrors;
    });

    if (submitError) {
      setSubmitError(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-borehole-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2
              id="edit-borehole-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Edit borehole details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update the details recorded for this borehole.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          {/* Deliberately not autoFocus — that stays on Type of boring below.
              The common edit is the details; a rename is the exception, and the
              cursor should not land in it.

              Also deliberately not uppercased on the way in, unlike mobile's old
              name input: AddBulkBoreholesModal stores what was pasted, so the
              dashboard is where a borehole's capitalisation comes from and a
              rename should not quietly change it. Only trimmed, on submit. */}
          <div>
            <TextField
              id="edit-borehole-name"
              label="Borehole name"
              value={name}
              onChange={(value) => {
                setName(value);
                clearErrors('name');
              }}
              disabled={isSubmitting}
              error={fieldErrors.name}
            />

            <p className={HELPER_CLASSES}>
              Renaming changes this page&rsquo;s address and the name the report
              is filed under. Only owners and admins can do it.
            </p>
          </div>

          <TextField
            id="edit-borehole-type-of-boring"
            label="Type of boring"
            value={typeOfBoring}
            onChange={(value) => {
              setTypeOfBoring(value);
              clearErrors('typeOfBoring');
            }}
            placeholder="e.g. Rotary Wash Boring"
            disabled={isSubmitting}
            autoFocus
          />

          <TextField
            id="edit-borehole-type-of-rig"
            label="Type of rig"
            value={typeOfRig}
            onChange={(value) => {
              setTypeOfRig(value);
              clearErrors('typeOfRig');
            }}
            placeholder="e.g. YWE D90R"
            disabled={isSubmitting}
          />

          <TextField
            id="edit-borehole-diameter"
            label="Diameter of boring"
            value={diameterOfBoring}
            onChange={(value) => {
              setDiameterOfBoring(value);
              clearErrors('diameterOfBoring');
            }}
            placeholder="e.g. 89mm/114mm"
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              id="edit-borehole-easting"
              label="Easting (m)"
              value={easting}
              onChange={(value) => {
                setEasting(value);
                clearErrors('easting');
              }}
              placeholder="e.g. 321456.23"
              disabled={isSubmitting}
              inputMode="decimal"
              error={fieldErrors.easting}
            />

            <TextField
              id="edit-borehole-northing"
              label="Northing (m)"
              value={northing}
              onChange={(value) => {
                setNorthing(value);
                clearErrors('northing');
              }}
              placeholder="e.g. 345678.90"
              disabled={isSubmitting}
              inputMode="decimal"
              error={fieldErrors.northing}
            />

            <TextField
              id="edit-borehole-reduced-level"
              label="Reduced level (m)"
              value={reducedLevel}
              onChange={(value) => {
                setReducedLevel(value);
                clearErrors('reducedLevel');
              }}
              placeholder="e.g. 12.50"
              disabled={isSubmitting}
              inputMode="decimal"
              error={fieldErrors.reducedLevel}
            />
          </div>

          <TextField
            id="edit-borehole-driller"
            label="Driller name"
            value={drillerName}
            onChange={(value) => {
              setDrillerName(value);
              clearErrors('drillerName');
            }}
            placeholder="e.g. Ahmad"
            disabled={isSubmitting}
          />

          <TextField
            id="edit-borehole-verifier"
            label="Verifier name"
            value={verifierName}
            onChange={(value) => {
              setVerifierName(value);
              clearErrors('verifierName');
            }}
            placeholder="e.g. Michael"
            disabled={isSubmitting}
          />

          {borehole.verifierSignatureBase64 && (
            <div>
              <p className={LABEL_CLASSES}>Verifier signature</p>

              <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
                <img
                  src={borehole.verifierSignatureBase64}
                  alt={`Signature of ${borehole.verifierName || 'verifier'}`}
                  className="h-12 w-auto max-w-full object-contain"
                />
              </div>

              <p className={HELPER_CLASSES}>
                Signatures are captured in the field app and cannot be changed
                here.
              </p>
            </div>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400"
            >
              {submitError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving changes...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  inputMode?: 'decimal';
  error?: string;
};

// Nine near-identical fields is enough that spelling each one out the way
// EditProjectModal does would bury the parts that actually differ.
function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  inputMode,
  error,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASSES}>
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode={inputMode}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${FIELD_CLASSES} disabled:cursor-not-allowed disabled:opacity-60`}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className={ERROR_CLASSES}>
          {error}
        </p>
      )}
    </div>
  );
}
