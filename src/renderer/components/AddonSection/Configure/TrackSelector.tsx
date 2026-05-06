import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { InstallerStore } from 'renderer/redux/store';
import { Check2, ChevronDown } from 'react-bootstrap-icons';
import { Addon, AddonTrack } from 'renderer/utils/InstallerConfiguration';
import cn from 'renderer/utils/cn';
import { showAddonTrackTextureRow, splitTrackTitle } from 'renderer/components/ui/trackDisplay';
import '../index.css';

const transitionCard =
  'transition-[transform,box-shadow,border-color,background-color] duration-150 ease-out motion-reduce:transition-none';

const SkeletonLine = () => (
  <span className="mt-0.5 inline-block h-5 w-32 animate-pulse rounded bg-navy-light/80 motion-reduce:animate-none" />
);

export const Tracks: React.FC = ({ children }) => (
  <div className="grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] xl:gap-8">
    {children}
  </div>
);

type TrackProps = {
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  handleSelected(track: AddonTrack): void;
};

export const Track: React.FC<TrackProps> = ({ isSelected, isInstalled, handleSelected, addon, track }) => {
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name,
  );

  const { channel, texture } = splitTrackTitle(track.name);
  const showTextureRow = showAddonTrackTextureRow(addon.key);

  return (
    <button
      type="button"
      className={cn(
        'group relative flex min-h-[100px] w-full min-w-0 max-w-none flex-col rounded-xl border-2 bg-navy-dark p-4 text-left sm:min-h-[110px] sm:p-[18px] xl:min-h-[128px] xl:rounded-2xl xl:p-5 2xl:min-h-[140px] 2xl:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark disabled:cursor-not-allowed',
        transitionCard,
        'hover:-translate-y-px hover:border-cyan/40 hover:shadow-[0_0_22px_-6px_rgba(0,224,254,0.38)]',
        isSelected &&
          'border-cyan bg-navy-light/30 shadow-[inset_0_1px_24px_-12px_rgba(0,224,254,0.45)] ring-1 ring-cyan/35',
        !isSelected && 'border-navy-light/70 text-white',
      )}
      onClick={() => handleSelected(track)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1 font-manrope text-fbw-base font-semibold leading-snug text-quasi-white sm:text-fbw-md xl:text-fbw-lg 2xl:text-fbw-xl">
          {channel}
        </span>
        {isSelected && (
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-cyan/50 bg-cyan/15 text-cyan xl:size-10 2xl:size-11"
            aria-label="Selected release track"
          >
            <Check2 className="size-[18px] xl:size-5" strokeWidth={2.5} />
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 font-manrope xl:mt-4 xl:space-y-2">
        {showTextureRow && (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-fbw-xs text-quasi-white/55 sm:text-fbw-sm">Texture</dt>
            <dd className="min-w-0 flex-1 break-words text-right font-manrope text-fbw-sm font-medium text-quasi-white/90 sm:text-fbw-base xl:text-fbw-md">
              {texture ?? '—'}
            </dd>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-fbw-xs text-quasi-white/55 sm:text-fbw-sm">Build</dt>
          <dd className="min-w-0 flex-1 break-all text-right font-mono text-fbw-md font-bold leading-snug text-cyan/95 sm:text-fbw-lg xl:text-[17px]">
            {latestVersionName ?? <SkeletonLine />}
          </dd>
        </div>
      </dl>

      {isInstalled && (
        <span
          className={cn(
            'mt-auto inline-flex max-w-full pt-2.5 font-manrope text-fbw-xs font-semibold uppercase tracking-wide',
            isSelected ? 'text-utility-green' : 'text-quasi-white/55',
          )}
          aria-label={isInstalled ? 'Installed on this machine' : undefined}
        >
          <span className="rounded-full border border-white/15 bg-navy/60 px-2 py-0.5 text-quasi-white/85">
            On disk
          </span>
        </span>
      )}
    </button>
  );
};

type QATrackSelectorProps = {
  addon: Addon;
  tracks: AddonTrack[];
  selectedTrack: AddonTrack | null;
  installedTrack: AddonTrack | null;
  onTrackSelection: (track: AddonTrack) => void;
};

export const QATrackSelector: React.FC<QATrackSelectorProps> = ({
  addon,
  tracks,
  selectedTrack,
  installedTrack,
  onTrackSelection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedQATrack = tracks.find((track) => track.key === selectedTrack?.key);
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[selectedQATrack?.key]?.name,
  );

  const { channel: qaChannel, texture: qaTexture } = selectedQATrack
    ? splitTrackTitle(selectedQATrack.name)
    : { channel: '', texture: undefined };
  const showTextureRow = showAddonTrackTextureRow(addon.key);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTrackSelect = (track: AddonTrack) => {
    onTrackSelection(track);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full min-w-0" ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          'flex min-h-[104px] w-full flex-row items-stretch justify-between rounded-xl border-2 bg-navy-dark px-4 py-4 text-left text-white transition-all duration-150 ease-out sm:min-h-[112px] sm:px-5 sm:py-5 xl:min-h-[120px] xl:rounded-2xl xl:px-6 xl:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark',
          'hover:-translate-y-px hover:border-cyan/35 hover:shadow-[0_0_22px_-6px_rgba(0,224,254,0.35)]',
          selectedQATrack ? 'border-cyan ring-1 ring-cyan/30' : 'border-navy-light/70',
        )}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 flex-col justify-center gap-2">
          <span className="truncate font-manrope text-fbw-base font-semibold text-quasi-white">
            {selectedQATrack ? qaChannel : 'Select QA Build'}
          </span>
          {selectedQATrack && (
            <>
              {showTextureRow && (
                <div className="flex items-start justify-between gap-4 font-manrope text-fbw-sm">
                  <span className="shrink-0 text-quasi-white/55">Texture</span>
                  <span className="min-w-0 flex-1 break-words text-right font-medium text-quasi-white">{qaTexture ?? '—'}</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 font-manrope text-fbw-sm">
                <span className="shrink-0 text-quasi-white/55">Build</span>
                <span className="min-w-0 flex-1 break-all text-right font-mono text-fbw-md font-bold leading-snug text-cyan">
                  {latestVersionName ?? <SkeletonLine />}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex min-w-[5.5rem] flex-col items-end justify-between gap-2">
          {installedTrack?.key === selectedQATrack?.key && (
            <span className="border-utility-green/35 bg-utility-green/10 rounded-full border px-2 py-0.5 font-manrope text-fbw-xs font-semibold uppercase tracking-wide text-utility-green">
              On disk
            </span>
          )}
          <ChevronDown
            className={cn('stroke-current text-quasi-white transition-transform duration-150', isOpen && 'rotate-180')}
            strokeWidth={2}
            aria-hidden
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute inset-x-0 top-[calc(100%+6px)] z-10 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-navy-dark py-1 shadow-panel-deep ring-1 ring-black/40"
          role="listbox"
        >
          {tracks
            .slice()
            .sort((a, b) => b.key.localeCompare(a.key, undefined, { numeric: true }))
            .map((track) => (
              <QATrackDropdownItem
                key={track.key}
                addon={addon}
                track={track}
                isSelected={track.key === selectedTrack?.key}
                isInstalled={track.key === installedTrack?.key}
                onSelect={() => handleTrackSelect(track)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

type QATrackDropdownItemProps = {
  addon: Addon;
  track: AddonTrack;
  isSelected: boolean;
  isInstalled: boolean;
  onSelect: () => void;
};

const QATrackDropdownItem: React.FC<QATrackDropdownItemProps> = ({
  addon,
  track,
  isSelected,
  isInstalled,
  onSelect,
}) => {
  const latestVersionName = useSelector<InstallerStore, string | undefined>(
    (state) => state.latestVersionNames[addon.key]?.[track.key]?.name,
  );

  const { channel, texture } = splitTrackTitle(track.name);
  const showTextureRow = showAddonTrackTextureRow(addon.key);

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition-colors duration-150 focus-visible:bg-navy-light/60 focus-visible:outline-none',
        isSelected ? 'bg-navy-light/35 text-cyan' : 'text-white hover:bg-navy-light/45',
      )}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-manrope text-fbw-base font-semibold">{channel}</span>
        {showTextureRow && (
          <span className="font-manrope text-fbw-sm text-quasi-white/55">
            Texture: <span className="text-quasi-white/85">{texture ?? '—'}</span>
          </span>
        )}
        <span
          className={cn(
            'break-all font-mono text-fbw-md font-bold leading-snug',
            isSelected ? 'text-cyan/95' : 'text-quasi-white/75',
          )}
        >
          {latestVersionName ?? '…'}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {isSelected && <Check2 className="size-5 text-cyan" strokeWidth={2.5} aria-label="Selected" />}
        {isInstalled && (
          <span className="rounded-full border border-white/15 px-2 py-0.5 font-manrope text-fbw-xs uppercase tracking-wide text-quasi-white/70">
            On disk
          </span>
        )}
      </div>
    </button>
  );
};
