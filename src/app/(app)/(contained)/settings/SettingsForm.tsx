/**
 * The settings form.
 *
 * As you type a new handle it tells you straight away whether it's the right
 * format and whether someone else already has it. Saving works even without
 * JavaScript.
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { CircleAlert, CircleCheck, Save } from 'lucide-react';
import { Button } from '@/components/Button';
import { Switch } from '@/components/Switch';
import { handleSchema } from '@/lib/validation';
import { updateSettings, type SettingsState } from './actions';

type Profile = { handle: string; displayName: string; isPrivate: boolean };
type Status = { tone: 'positive' | 'negative' | null; text: string };

const inputClass =
  'h-11 w-full rounded-md border border-line-strong bg-raised px-3 text-body transition-colors focus-visible:border-accent focus-visible:outline-offset-1 aria-invalid:border-negative';

/**
 * The small line of help or feedback under a field, in green for good news and
 * red for problems.
 */
function Help({ id, status }: { id: string; status: Status }) {
  const Icon =
    status.tone === 'positive' ? CircleCheck : status.tone ? CircleAlert : null;
  const color = { positive: 'text-positive', negative: 'text-negative' };
  return (
    <p
      id={id}
      aria-live="polite"
      className={`flex items-center gap-1.5 text-body-sm ${status.tone ? color[status.tone] : 'text-muted'}`}
    >
      {Icon && <Icon size={14} aria-hidden />}
      {status.text}
    </p>
  );
}

/**
 * Works out what to say under the handle field: a format problem, "Checking…",
 * available or taken.
 */
function useHandleStatus(value: string, current: string): Status {
  const [availability, setAvailability] = useState<{
    handle: string;
    available: boolean;
  }>();
  const parsed = handleSchema.safeParse(value);
  const handle = parsed.success ? parsed.data : null;

  useEffect(() => {
    if (!handle || handle === current) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/handles/check?h=${encodeURIComponent(handle)}`,
        { signal: controller.signal },
      ).catch(() => null);
      const body: { available?: boolean } | null = await res
        ?.json()
        .catch(() => null);
      if (typeof body?.available === 'boolean') {
        setAvailability({ handle, available: body.available });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [handle, current]);

  if (!parsed.success) {
    return { tone: 'negative', text: parsed.error.issues[0]?.message ?? '' };
  }
  if (handle === current) return { tone: null, text: 'Your current handle' };
  if (availability?.handle !== handle) return { tone: null, text: 'Checking…' };
  return availability.available
    ? { tone: 'positive', text: `@${handle} is available` }
    : { tone: 'negative', text: 'That handle is taken' };
}

/**
 * Your display name, handle and privacy switch, with a Save button that tells
 * you how it went.
 */
export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, saving] = useActionState<SettingsState, FormData>(
    updateSettings,
    {},
  );
  const [handle, setHandle] = useState(profile.handle);
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate);
  const live = useHandleStatus(handle, profile.handle);
  const handleStatus: Status =
    state.errors?.handle && state.handle === handle.trim().toLowerCase()
      ? { tone: 'negative', text: state.errors.handle }
      : live;

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-body-sm font-bold">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={profile.displayName}
          maxLength={50}
          required
          aria-invalid={Boolean(state.errors?.displayName) || undefined}
          aria-describedby="displayName-help"
          className={inputClass}
        />
        {state.errors?.displayName && (
          <Help
            id="displayName-help"
            status={{ tone: 'negative', text: state.errors.displayName }}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="handle" className="text-body-sm font-bold">
          Handle
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-muted">
            @
          </span>
          <input
            id="handle"
            name="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={handleStatus.tone === 'negative' || undefined}
            aria-describedby="handle-help"
            className={`${inputClass} pl-7.5`}
          />
        </div>
        <Help id="handle-help" status={handleStatus} />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-col gap-1">
          <span className="text-label">Private profile</span>
          <p id="private-help" className="text-body-sm text-muted">
            Only people you approve can follow you and see your films.
          </p>
        </div>
        <Switch
          checked={isPrivate}
          onChange={setIsPrivate}
          label="Private profile"
          describedBy="private-help"
        />
        <input type="hidden" name="isPrivate" value={String(isPrivate)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          icon={Save}
          loading={saving}
          disabled={handleStatus.tone === 'negative'}
        >
          Save changes
        </Button>
        {!saving && state.saved && (
          <Help id="form-status" status={{ tone: 'positive', text: 'Saved' }} />
        )}
        {!saving && state.errors?.form && (
          <Help
            id="form-status"
            status={{ tone: 'negative', text: state.errors.form }}
          />
        )}
      </div>
    </form>
  );
}
