import React, { FC } from 'react';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';
import { InstallState } from 'renderer/redux/features/installStatus';
import { AddonTrack } from 'renderer/utils/InstallerConfiguration';
import cn from 'renderer/utils/cn';

export interface InstallStatusSummaryProps {
  installState: InstallState;
  installedTrack: AddonTrack | null;
  selectedTrack: AddonTrack | null;
  /** Latest known release label for the installed track (from network). */
  installedReleaseLabel?: string;
  /** Latest known release label for the selected track. */
  selectedReleaseLabel?: string;
}

function statusMeta(status: InstallStatus): {
  label: string;
  tone: 'ok' | 'warn' | 'muted' | 'danger';
  describe?: string;
} {
  switch (status) {
    case InstallStatus.UpToDate:
      return { label: 'Installed', tone: 'ok', describe: 'Up to date on selected release track' };
    case InstallStatus.GitInstall:
      return { label: 'Installed', tone: 'ok', describe: 'Managed via git checkout' };
    case InstallStatus.NeedsUpdate:
      return { label: 'Update available', tone: 'warn' };
    case InstallStatus.TrackSwitch:
      return { label: 'Track mismatch', tone: 'warn', describe: 'Installed build differs from selected track' };
    default:
      return { label: 'Status', tone: 'muted' };
  }
}

const toneClasses: Record<'ok' | 'warn' | 'muted' | 'danger', string> = {
  ok: 'border-utility-green/40 bg-utility-green/10 text-utility-green ring-utility-green/25',
  warn: 'border-utility-amber/45 bg-utility-amber/10 text-utility-amber ring-utility-amber/25',
  muted: 'border-white/15 bg-navy-light/40 text-quasi-white/90 ring-white/10',
  danger: 'border-utility-red/45 bg-utility-red/10 text-utility-red ring-utility-red/20',
};

/**
 * Non-interactive install readout. Primary actions (Install / Update) stay in MainActionButton.
 */
export const InstallStatusSummary: FC<InstallStatusSummaryProps> = ({
  installState,
  installedTrack,
  selectedTrack,
  installedReleaseLabel,
  selectedReleaseLabel,
}) => {
  const status = installState.status;
  const meta = statusMeta(status);

  const showDetails =
    status === InstallStatus.UpToDate ||
    status === InstallStatus.GitInstall ||
    status === InstallStatus.NeedsUpdate ||
    status === InstallStatus.TrackSwitch;

  if (!showDetails) {
    return null;
  }

  return (
    <div
      className="w-full min-w-[230px] max-w-[260px] select-none rounded-xl border border-white/10 bg-navy-dark/80 p-5 shadow-inner-sm ring-1 ring-white/5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex max-w-[15rem] items-center rounded-full border px-3 py-1.5 font-manrope text-fbw-sm font-semibold leading-tight ring-1',
            toneClasses[meta.tone],
          )}
        >
          {meta.label}
        </span>
      </div>

      {meta.describe && (
        <p className="mt-2 font-manrope text-fbw-sm leading-snug text-quasi-white/75">{meta.describe}</p>
      )}

      <dl className="mt-3 space-y-2 border-t border-white/10 pt-3 font-manrope text-fbw-base leading-snug text-quasi-white/90">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-fbw-sm text-quasi-white/60">Selected track</dt>
          <dd className="min-w-0 flex-1 break-words text-right font-medium text-quasi-white">
            {selectedTrack?.name ?? '—'}
          </dd>
        </div>
        {selectedReleaseLabel && (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-fbw-sm text-quasi-white/60">Selected build</dt>
            <dd className="min-w-0 flex-1 break-all text-right font-mono text-fbw-sm font-semibold leading-snug text-cyan/95">
              {selectedReleaseLabel}
            </dd>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-fbw-sm text-quasi-white/60">Installed track</dt>
          <dd className="min-w-0 flex-1 break-words text-right font-medium text-quasi-white">
            {installedTrack?.name ?? '—'}
          </dd>
        </div>
        {installedReleaseLabel && (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-fbw-sm text-quasi-white/60">Installed build</dt>
            <dd className="min-w-0 flex-1 break-all text-right font-mono text-fbw-sm font-semibold leading-snug text-quasi-white/90">
              {installedReleaseLabel}
            </dd>
          </div>
        )}
      </dl>

      <div
        className="mt-3 min-h-[1.5rem] rounded-lg border border-dashed border-white/10 bg-navy/35"
        aria-hidden
        title="Reserved for future maintenance actions"
      />
    </div>
  );
};
