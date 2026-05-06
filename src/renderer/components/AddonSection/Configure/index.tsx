import React, { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Addon, AddonTrack, ConfigurationAspect } from 'renderer/utils/InstallerConfiguration';
import { QATrackSelector, Track, Tracks } from './TrackSelector';
import { ConfigurationAspectDisplay } from 'renderer/components/AddonSection/Configure/ConfigurationAspectDisplay';
import cn from 'renderer/utils/cn';

import './index.css';
import rehypeRaw from 'rehype-raw';

export interface ConfigureProps {
  routeAspectKey: string;
  selectedAddon: Addon;
  selectedTrack: AddonTrack | null;
  installedTrack: AddonTrack | null;
  onTrackSelection: (track: AddonTrack) => void;
}

export const Configure: FC<ConfigureProps> = ({
  routeAspectKey,
  selectedAddon,
  selectedTrack,
  installedTrack,
  onTrackSelection,
}) => {
  const history = useHistory();
  const { aspectKey: currentAspectKey } = useParams<{ aspectKey: string }>();

  let page;
  if (routeAspectKey === 'release-track') {
    page = (
      <>
        <section className="mb-12 xl:mb-16">
          <h2 className="mb-8 font-manrope text-fbw-xl font-bold tracking-tight text-white 2xl:text-[26px] 2xl:leading-snug">
            Choose Your Version
          </h2>
          <div className="flex flex-col gap-10 xl:flex-row xl:gap-x-16 2xl:gap-x-20">
            <div className="min-w-0 flex-1">
              <span className="mb-4 ml-0.5 block font-manrope text-fbw-xs font-semibold uppercase tracking-[0.14em] text-quasi-white/55">
                Mainline Releases
              </span>
              <Tracks>
                {selectedAddon.tracks
                  .filter((track) => !track.isExperimental && !track.isQualityAssurance)
                  .map((track) => (
                    <Track
                      addon={selectedAddon}
                      key={track.key}
                      track={track}
                      isSelected={selectedTrack?.key === track.key}
                      isInstalled={installedTrack?.key === track.key}
                      handleSelected={() => onTrackSelection(track)}
                    />
                  ))}
              </Tracks>
            </div>
            {selectedAddon.tracks.some((track) => track.isExperimental && !track.isQualityAssurance) && (
              <div className="min-w-0 flex-1">
                <span className="mb-4 ml-0.5 block font-manrope text-fbw-xs font-semibold uppercase tracking-[0.14em] text-quasi-white/55">
                  Experimental versions
                </span>
                <Tracks>
                  {selectedAddon.tracks
                    .filter((track) => track.isExperimental && !track.isQualityAssurance)
                    .map((track) => (
                      <Track
                        addon={selectedAddon}
                        key={track.key}
                        track={track}
                        isSelected={selectedTrack?.key === track.key}
                        isInstalled={installedTrack?.key === track.key}
                        handleSelected={() => onTrackSelection(track)}
                      />
                    ))}
                </Tracks>
              </div>
            )}
          </div>
        </section>
        {selectedAddon.tracks.some((track) => track.isQualityAssurance) && (
          <section className="mb-14 border-t border-white/10 pt-12">
            <span className="mb-4 ml-0.5 block font-manrope text-fbw-xs font-semibold uppercase tracking-[0.14em] text-quasi-white/55">
              Quality Assurance
            </span>
            <QATrackSelector
              addon={selectedAddon}
              tracks={selectedAddon.tracks.filter((track) => track.isQualityAssurance)}
              selectedTrack={selectedTrack}
              installedTrack={installedTrack}
              onTrackSelection={onTrackSelection}
            />
          </section>
        )}
        {selectedTrack && selectedTrack.description && (
          <section className="border-t border-white/10 pt-12 xl:pt-14">
            <h2 className="mb-5 font-manrope text-fbw-xl font-bold tracking-tight text-white 2xl:text-[26px]">
              Description
            </h2>
            <div className="configure-markdown-content max-w-none">
              <ReactMarkdown linkTarget={'_blank'} rehypePlugins={[rehypeRaw]}>
                {selectedTrack.description}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </>
    );
  } else {
    const aspect = selectedAddon.configurationAspects?.find((it) => it.key === routeAspectKey);

    if (!aspect) {
      console.error(
        `Tried to build page for unknown configuration aspect (addon=${selectedAddon.key}, aspectKey=${routeAspectKey})`,
      );
      history.push('/addon-section/:publisher/main/configure/release-track');
      return null;
    }

    page = <ConfigurationAspectDisplay aspect={aspect} />;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between">
      <div
        key={`${selectedAddon.key}-${routeAspectKey}`}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-10 motion-safe:animate-fade-in motion-safe:[animation-duration:180ms] motion-safe:[animation-fill-mode:both] sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-16 xl:py-[4.5rem]"
      >
        <div className="mx-auto w-full max-w-configure">{page}</div>
      </div>

      {selectedAddon.configurationAspects?.length > 0 && (
        <div className="flex w-full shrink-0 flex-wrap gap-x-10 gap-y-4 border-t border-white/10 bg-navy-light/78 px-8 py-9 shadow-[0_-12px_40px_rgba(0,0,0,0.2)] backdrop-blur-md sm:px-12 lg:px-14">
          <ConfigurationAspectTab
            aspect={
              {
                key: 'release-track',
                tabSupertitle: 'Configure',
                tabTitle: 'Release Track',
              } as ConfigurationAspect
            }
            selected={'release-track' === currentAspectKey}
          />

          {selectedAddon.configurationAspects.map((aspect) => (
            <ConfigurationAspectTab key={aspect.key} aspect={aspect} selected={aspect.key === currentAspectKey} />
          ))}
        </div>
      )}
    </div>
  );
};

const ConfigurationAspectTab: FC<{ aspect: ConfigurationAspect; selected: boolean }> = ({ aspect, selected }) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/addon-section/:publisher/main/configure/${aspect.key}`);
  };

  return (
    <button
      type="button"
      className={cn(
        'flex flex-col gap-y-1 rounded-md pb-3 pt-1 text-left font-manrope font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-light',
        selected ? 'text-quasi-white' : 'cursor-pointer text-gray-300 hover:text-cyan',
      )}
      data-selected={selected}
      onClick={handleClick}
    >
      <span className="text-fbw-lg">{aspect.tabSupertitle}</span>
      <span className="configuration-aspect-tab-underline text-fbw-xl">{aspect.tabTitle}</span>
    </button>
  );
};
