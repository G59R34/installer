import React, { FC } from 'react';
import type { UpdateInfo } from '@flybywiresim/fragmenter';
import { PromptModal } from 'renderer/components/Modal/index';
import { Download, Hdd, HddFill } from 'react-bootstrap-icons';
import { ButtonType } from 'renderer/components/Button';
import { FreeDiskSpaceInfo } from 'renderer/utils/FreeDiskSpace';
import cn from 'renderer/utils/cn';

const GIB = 1_074_000_000;
const MIB = 1_049_000;

function formatSize(size: number): string {
  const numGigabytes = size / GIB;

  if (numGigabytes > 1) {
    return `${numGigabytes.toFixed(1)} GiB`;
  } else {
    const numMegabytes = size / MIB;

    return `${numMegabytes.toFixed(1)} MiB`;
  }
}

const StatRow: FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  /** Slightly larger primary figure (e.g. download size). */
  emphasizeValue?: boolean;
  valueClassName?: string;
}> = ({ icon, label, value, emphasizeValue, valueClassName }) => (
  <div className="flex min-w-0 flex-col gap-2 rounded-sm sm:flex-row sm:items-center sm:justify-between sm:gap-x-4">
    <div className="flex min-w-0 flex-1 items-start gap-x-3 sm:items-center sm:gap-x-5">
      {icon}
      <span className="min-w-0 flex-1 font-manrope text-xl leading-snug text-quasi-white sm:text-2xl lg:text-3xl">
        {label}
      </span>
    </div>
    <span
      className={cn(
        'shrink-0 self-start font-manrope font-bold tabular-nums sm:self-auto',
        emphasizeValue ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl',
        valueClassName ?? 'text-quasi-white',
      )}
    >
      {value}
    </span>
  </div>
);

export interface InstallSizeDialogProps {
  updateInfo: UpdateInfo;
  freeDeskSpaceInfo: FreeDiskSpaceInfo;
  onConfirm?: () => void;
  onCancel?: () => void;
  dontShowAgainSettingName: string;
}

export const InstallSizeDialog: FC<InstallSizeDialogProps> = ({
  updateInfo,
  freeDeskSpaceInfo,
  onConfirm,
  onCancel,
  dontShowAgainSettingName,
}) => {
  const requiredDiskSpace = updateInfo.requiredDiskSpace + updateInfo.downloadSize + 10 * MIB;

  const showTemporaryAsSeparate = freeDeskSpaceInfo.freeSpaceInDest !== freeDeskSpaceInfo.freeSpaceInTemp;

  const sufficientSpaceInDest = freeDeskSpaceInfo.freeSpaceInDest > requiredDiskSpace;
  const sufficientSpaceInTemp = freeDeskSpaceInfo.freeSpaceInTemp > requiredDiskSpace;

  const canInstall = sufficientSpaceInDest && sufficientSpaceInTemp;

  const availableDiskSpaceColorDest = sufficientSpaceInDest ? 'text-utility-green' : 'text-utility-red';
  const availableDiskSpaceColorTemp = sufficientSpaceInTemp ? 'text-utility-green' : 'text-utility-red';

  return (
    <PromptModal
      title={'Package size'}
      bodyText={
        <div className="mt-5 flex min-w-0 flex-col gap-y-6 sm:gap-y-8">
          <StatRow
            emphasizeValue
            icon={<Download size={28} className="shrink-0 sm:size-[30px]" />}
            label="Download size"
            value={formatSize(updateInfo.downloadSize)}
          />

          <hr className="m-0" />

          <StatRow
            icon={<HddFill size={28} className="shrink-0 sm:size-[30px]" />}
            label="Required disk space"
            value={formatSize(requiredDiskSpace)}
          />

          <div className="flex min-w-0 flex-col gap-y-5">
            <StatRow
              icon={<Hdd size={28} className="shrink-0 sm:size-[30px]" />}
              label="Available disk space (destination)"
              value={formatSize(freeDeskSpaceInfo.freeSpaceInDest)}
              valueClassName={availableDiskSpaceColorDest}
            />

            {showTemporaryAsSeparate && (
              <StatRow
                icon={<Hdd size={28} className="shrink-0 sm:size-[30px]" />}
                label="Available disk space (temporary)"
                value={formatSize(freeDeskSpaceInfo.freeSpaceInTemp)}
                valueClassName={availableDiskSpaceColorTemp}
              />
            )}
          </div>

          {!canInstall && (
            <div className="flex w-full min-w-0 flex-col gap-4 rounded-md border-2 border-utility-red px-5 py-4 text-utility-red sm:flex-row sm:items-start sm:gap-x-6 sm:px-7 sm:py-3.5">
              <Hdd className="shrink-0 text-utility-red" size={36} />

              <div className="flex min-w-0 flex-col gap-y-2">
                <span className="font-manrope text-2xl font-bold sm:text-4xl">Not enough available disk space</span>

                <span className="text-lg sm:text-2xl">Try to free up space in order to install this addon.</span>
              </div>
            </div>
          )}
        </div>
      }
      confirmText="Install"
      confirmColor={ButtonType.Positive}
      onConfirm={onConfirm}
      confirmEnabled={canInstall}
      onCancel={onCancel}
      dontShowAgainSettingName={sufficientSpaceInDest ? dontShowAgainSettingName : undefined}
    />
  );
};
