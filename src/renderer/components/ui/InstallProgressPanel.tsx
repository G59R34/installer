import React, { FC, Fragment } from 'react';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';
import { InstallState } from 'renderer/redux/features/installStatus';
import { DownloadItem } from 'renderer/redux/types';
import { Button, ButtonType } from 'renderer/components/Button';
import { Check2 } from 'react-bootstrap-icons';
import cn from 'renderer/utils/cn';

const STEPS = [
  { id: 'prep', label: 'Prepare' },
  { id: 'download', label: 'Download' },
  { id: 'extract', label: 'Extract' },
  { id: 'finish', label: 'Finalize' },
] as const;

function humanStepTitle(status: InstallStatus): string {
  switch (status) {
    case InstallStatus.DownloadPrep:
      return 'Preparing download';
    case InstallStatus.DownloadPending:
      return 'Waiting';
    case InstallStatus.Downloading:
      return 'Downloading';
    case InstallStatus.DownloadRetry:
      return 'Retrying connection';
    case InstallStatus.Decompressing:
      return 'Extracting package';
    case InstallStatus.InstallingDependency:
      return 'Installing dependency';
    case InstallStatus.InstallingDependencyEnding:
      return 'Completing dependency install';
    case InstallStatus.DownloadEnding:
      return 'Finalizing';
    case InstallStatus.DownloadDone:
      return 'Complete';
    default:
      return 'Working';
  }
}

function activeStepIndex(status: InstallStatus): number {
  switch (status) {
    case InstallStatus.DownloadPrep:
    case InstallStatus.DownloadPending:
      return 0;
    case InstallStatus.Downloading:
    case InstallStatus.DownloadRetry:
      return 1;
    case InstallStatus.Decompressing:
    case InstallStatus.InstallingDependency:
    case InstallStatus.InstallingDependencyEnding:
      return 2;
    case InstallStatus.DownloadEnding:
    case InstallStatus.DownloadDone:
      return 3;
    default:
      return 0;
  }
}

export interface InstallProgressPanelProps {
  installState: InstallState;
  download: DownloadItem;
  progressPercent: number;
  /** When telemetry is unavailable, UI shows placeholders. */
  downloadedMegabytes?: number;
  totalMegabytes?: number;
  speedMegabytesPerSecond?: number;
  estimatedSecondsRemaining?: number;
  /** Shown in the banner when installation can be cancelled (sidebar duplicate hidden). */
  onCancel?: () => void;
}

function formatMb(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) {
    return '—';
  }
  return `${n.toFixed(1)} MB`;
}

function formatEta(sec: number | undefined): string {
  if (sec === undefined || !Number.isFinite(sec) || sec < 0) {
    return '—';
  }
  if (sec < 60) {
    return `${Math.round(sec)}s`;
  }
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

export const InstallProgressPanel: FC<InstallProgressPanelProps> = ({
  installState,
  download,
  progressPercent,
  downloadedMegabytes,
  totalMegabytes,
  speedMegabytesPerSecond,
  estimatedSecondsRemaining,
  onCancel,
}) => {
  const status = installState.status;
  const stepIdx = activeStepIndex(status);
  const title = humanStepTitle(status);
  const pct = Math.round(Math.min(100, Math.max(0, progressPercent)));

  const interrupted = download.progress.interrupted;

  const showNetworkStats =
    status === InstallStatus.Downloading ||
    status === InstallStatus.DownloadRetry ||
    status === InstallStatus.DownloadPrep ||
    status === InstallStatus.DownloadPending;

  const secondaryStatusHint = (() => {
    if (showNetworkStats) {
      return null;
    }
    switch (status) {
      case InstallStatus.Decompressing:
      case InstallStatus.InstallingDependency:
        return 'Unpacking and installing files — avoid closing the installer until this step finishes.';
      case InstallStatus.InstallingDependencyEnding:
        return 'Finishing the dependency install…';
      case InstallStatus.DownloadEnding:
        return 'Applying updates and cleaning up…';
      default:
        return null;
    }
  })();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-manrope text-fbw-xs font-semibold uppercase tracking-[0.12em] text-quasi-white/45">
            Installation in progress
          </p>
          <h3 className="mt-1 font-manrope text-fbw-xl font-semibold leading-tight tracking-tight text-quasi-white">
            {title}
          </h3>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          {onCancel && (
            <Button
              type={ButtonType.Danger}
              className="min-h-[40px] px-5 font-manrope text-fbw-sm font-bold sm:order-2"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto flex items-baseline gap-0.5 sm:order-1 sm:ml-0">
            <span className="font-manrope text-4xl font-bold tabular-nums leading-none text-cyan sm:text-5xl">
              {pct}
            </span>
            <span className="font-manrope text-fbw-lg font-semibold text-quasi-white/35">%</span>
          </div>
        </div>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/55 shadow-inner ring-1 ring-white/10">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-cyan/95 to-cyan transition-[width] duration-200 ease-out',
            interrupted && 'from-utility-amber/90 to-utility-amber',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="min-w-0">
        <div className="flex w-full min-w-0 items-center">
          {STEPS.map((step, i) => (
            <Fragment key={step.id}>
              {i > 0 && (
                <div
                  className={cn(
                    'h-[3px] min-w-[10px] flex-1 rounded-full transition-colors duration-300',
                    stepIdx >= i ? 'bg-cyan/40' : 'bg-white/[0.08]',
                  )}
                  aria-hidden
                />
              )}
              <div className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2 sm:w-[5.5rem]">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-200 sm:size-10 sm:text-sm',
                    i < stepIdx &&
                      'border-utility-green/50 bg-utility-green/15 text-utility-green shadow-[0_0_12px_rgba(34,197,94,0.25)]',
                    i === stepIdx && 'border-cyan bg-cyan/15 text-cyan shadow-[0_0_18px_rgba(0,224,254,0.35)]',
                    i > stepIdx && 'border-white/15 bg-navy/60 text-quasi-white/40',
                  )}
                >
                  {i < stepIdx ? (
                    <Check2 className="size-4 sm:size-[18px]" aria-hidden strokeWidth={3} />
                  ) : (
                    <span aria-hidden>{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-center font-manrope text-fbw-xs font-semibold leading-tight sm:text-fbw-sm',
                    i < stepIdx && 'text-utility-green',
                    i === stepIdx && 'text-quasi-white',
                    i > stepIdx && 'text-quasi-white/40',
                  )}
                >
                  {step.label}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        {download.module ? (
          <p className="min-w-0 shrink-0 font-manrope text-fbw-sm text-quasi-white/80 sm:max-w-[min(100%,280px)]">
            <span className="text-quasi-white/45">Package</span>{' '}
            <span className="font-semibold text-quasi-white">
              {download.module === 'full' ? 'Full package' : download.module}
            </span>
            {download.moduleCount > 1 && (
              <span className="ml-2 tabular-nums text-quasi-white/50">
                {download.moduleIndex + 1}/{download.moduleCount}
              </span>
            )}
          </p>
        ) : null}

        {showNetworkStats ? (
          <dl className="grid w-full min-w-0 gap-x-6 gap-y-2 font-manrope text-fbw-sm sm:grid-cols-3 sm:justify-end sm:text-right">
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-quasi-white/50">Transferred</dt>
              <dd className="tabular-nums text-quasi-white">
                {formatMb(downloadedMegabytes)} / {formatMb(totalMegabytes)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-quasi-white/50">Speed</dt>
              <dd className="tabular-nums text-quasi-white">
                {speedMegabytesPerSecond !== undefined && Number.isFinite(speedMegabytesPerSecond)
                  ? `${speedMegabytesPerSecond.toFixed(2)} MB/s`
                  : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-quasi-white/50">Remaining</dt>
              <dd className="tabular-nums text-quasi-white">{formatEta(estimatedSecondsRemaining)}</dd>
            </div>
          </dl>
        ) : secondaryStatusHint ? (
          <p className="max-w-xl font-manrope text-fbw-sm leading-relaxed text-quasi-white/55">{secondaryStatusHint}</p>
        ) : null}
      </div>

      {interrupted && (
        <p
          className="border-utility-amber/35 bg-utility-amber/10 rounded-lg border border-dashed px-3 py-2 font-manrope text-fbw-sm text-utility-amber"
          role="status"
        >
          Waiting for network…
        </p>
      )}
    </div>
  );
};
