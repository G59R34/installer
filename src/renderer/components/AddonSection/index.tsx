import React, { FC, useCallback, useEffect, useState } from 'react';
import { DownloadItem } from 'renderer/redux/types';
import { useSelector } from 'react-redux';
import { InstallerStore, useAppDispatch, useAppSelector } from '../../redux/store';
import { Addon, AddonCategoryDefinition, AddonTrack } from 'renderer/utils/InstallerConfiguration';
import { NavLink, Redirect, Route, useHistory, useParams } from 'react-router-dom';
import { Gear, InfoCircle, JournalText, Sliders } from 'react-bootstrap-icons';
import settings, { useSetting } from 'renderer/rendererSettings';
import { ipcRenderer } from 'electron';
import { AddonBar, AddonBarItem } from '../App/AddonBar';
import { NoAvailableAddonsSection } from '../NoAvailableAddonsSection';
import { ReleaseNotes } from './ReleaseNotes';
import { setSelectedTrack } from 'renderer/redux/features/selectedTrack';
import { PromptModal, useModals } from 'renderer/components/Modal';
import ReactMarkdown from 'react-markdown';
import { Button, ButtonType } from 'renderer/components/Button';
import { MainActionButton } from 'renderer/components/AddonSection/MainActionButton';
import { ApplicationStatus, InstallStatus, InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import { setApplicationStatus } from 'renderer/redux/features/applicationStatus';
import { LocalApiConfigEditUI } from '../LocalApiConfigEditUI';
import { Configure } from 'renderer/components/AddonSection/Configure';
import { InstallManager } from 'renderer/utils/InstallManager';
import { StateSection } from 'renderer/components/AddonSection/StateSection';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { MyInstall } from 'renderer/components/AddonSection/MyInstall';
import rehypeRaw from 'rehype-raw';
import { Simulators } from 'renderer/utils/SimManager';
import { InstallStatusSummary } from 'renderer/components/ui/InstallStatusSummary';
import cn from 'renderer/utils/cn';

const abortControllers = new Array<AbortController>(20);
abortControllers.fill(new AbortController());

interface InstallButtonProps {
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SidebarButton: FC<InstallButtonProps> = ({
  type = ButtonType.Neutral,
  disabled = false,
  onClick,
  className = '',
  children,
}) => (
  <Button
    type={type}
    disabled={disabled}
    className={cn('w-full min-h-[44px] max-w-[16rem] text-fbw-md font-bold', className)}
    onClick={onClick}
  >
    {children}
  </Button>
);

interface SideBarLinkProps {
  to: string;
  disabled?: boolean;
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children, disabled = false }) => (
  <NavLink
    className={cn(
      'group relative flex w-full flex-row items-center gap-x-3 rounded-lg border border-transparent py-2.5 pl-2.5 pr-3 font-manrope text-fbw-base font-semibold leading-snug no-underline transition-[padding,background-color,border-color,transform,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark',
      disabled
        ? 'cursor-not-allowed text-gray-500 opacity-60'
        : 'text-quasi-white/90 hover:-translate-y-px hover:border-white/10 hover:bg-navy-light/35 hover:text-cyan',
    )}
    activeClassName="border-cyan/45 bg-navy-light/50 text-cyan shadow-[inset_3px_0_0_0_rgb(0,224,254)]"
    to={to}
    style={{ pointerEvents: disabled ? 'none' : 'unset' }}
  >
    {children}
  </NavLink>
);

export interface AircraftSectionURLParams {
  publisherName: string;
}

export const AddonSection = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [managedSim] = useSetting<Simulators>('cache.main.managedSim');

  const { publisherName } = useParams<AircraftSectionURLParams>();
  const publisherData = useAppSelector((state) =>
    state.configuration.publishers.find((pub) => pub.name === publisherName)
      ? state.configuration.publishers.find((pub) => pub.name === publisherName)
      : state.configuration.publishers[0],
  );

  const [selectedAddon, setSelectedAddon] = useState<Addon>(() => {
    try {
      return publisherData.addons[0];
    } catch (e) {
      throw new Error('Invalid publisher key: ' + publisherName);
    }
  });

  const [hiddenAddon, setHiddenAddon] = useState<Addon | undefined>(undefined);

  const installedTracks = useAppSelector((state) => state.installedTracks);
  const selectedTracks = useAppSelector((state) => state.selectedTracks);
  const installStates = useAppSelector((state) => state.installStatus);
  const releaseNotes = useAppSelector((state) => state.releaseNotes[selectedAddon.key]);

  useEffect(() => {
    const hiddenAddon = publisherData.addons.find((addon) => addon.key === selectedAddon.hidesAddon);

    if (hiddenAddon) {
      setHiddenAddon(hiddenAddon);
      history.push(`/addon-section/${publisherName}/hidden-addon-cover`);
    } else {
      setHiddenAddon(undefined);
      history.push(`/addon-section/${publisherName}/main/configure/release-track`);
    }

    settings.set('cache.main.lastShownAddonKey', selectedAddon.key);
  }, [history, publisherData.addons, publisherName, selectedAddon]);

  useEffect(() => {
    const firstAvailableAddon = publisherData.addons
      .filter((addon) => addon.simulator === managedSim)
      .find((addon) => addon.enabled);

    if (!firstAvailableAddon) {
      history.push(`/addon-section/${publisherName}/no-available-addons`);
      return;
    }

    const lastSeenAddonKey = settings.get('cache.main.lastShownAddonKey');
    const addonToSelect =
      publisherData.addons
        .filter((addon) => addon.simulator === managedSim)
        .find((addon) => addon.key === lastSeenAddonKey) ||
      publisherData.addons.find((addon) => addon.key === firstAvailableAddon.key);

    setSelectedAddon(addonToSelect);
  }, [history, publisherData.addons, publisherName, managedSim]);

  const installedTrack = (installedTracks[selectedAddon.key] as AddonTrack) ?? null;

  const setCurrentlySelectedTrack = useCallback(
    (newSelectedTrack: AddonTrack) => {
      dispatch(setSelectedTrack({ addonKey: selectedAddon.key, track: newSelectedTrack }));
    },
    [dispatch, selectedAddon.key],
  );

  const selectedTrack = (selectedTracks[selectedAddon.key] as AddonTrack) ?? null;

  const installedReleaseLabel = useAppSelector((s) =>
    installedTrack ? s.latestVersionNames[selectedAddon.key]?.[installedTrack.key]?.name : undefined,
  );
  const selectedReleaseLabel = useAppSelector((s) =>
    selectedTrack ? s.latestVersionNames[selectedAddon.key]?.[selectedTrack.key]?.name : undefined,
  );

  const download: DownloadItem = useSelector((state: InstallerStore) =>
    state.downloads.find((download) => download.id === selectedAddon.key),
  );

  const isDownloading = download?.progress.totalPercent >= 0;
  const status = installStates[selectedAddon.key]?.status;
  const showInstallSummary =
    status !== undefined &&
    [InstallStatus.UpToDate, InstallStatus.GitInstall, InstallStatus.NeedsUpdate, InstallStatus.TrackSwitch].includes(
      status,
    );
  const showUninstall =
    status !== undefined &&
    [
      InstallStatus.UpToDate,
      InstallStatus.NeedsUpdate,
      InstallStatus.TrackSwitch,
      InstallStatus.DownloadDone,
      InstallStatus.GitInstall,
    ].includes(status);
  const isInstalling = InstallStatusCategories.installing.includes(status);
  const isFinishingDependencyInstall = status === InstallStatus.InstallingDependencyEnding;

  const canCancelInstall =
    status !== undefined &&
    isInstalling &&
    !isFinishingDependencyInstall &&
    [InstallStatus.Downloading, InstallStatus.Decompressing, InstallStatus.InstallingDependency].includes(status);

  useEffect(() => {
    const checkApplicationInterval = setInterval(async () => {
      // Map app references to definition objects
      const disallowedRunningExternalApps = ExternalApps.forAddon(selectedAddon, publisherData);

      for (const app of disallowedRunningExternalApps ?? []) {
        // Determine what state the app is in
        let state = false;
        switch (app.detectionType) {
          case 'ws':
            state = await ExternalApps.determineStateWithWS(app);
            break;
          case 'http':
            state = await ExternalApps.determineStateWithHttp(app);
            break;
          case 'tcp':
            state = await ExternalApps.determineStateWithTcp(app);
            break;
        }

        // Dispatch the app's state
        dispatch(
          setApplicationStatus({
            applicationName: app.key,
            applicationStatus: state ? ApplicationStatus.Open : ApplicationStatus.Closed,
          }),
        );
      }
    }, 500);

    return () => clearInterval(checkApplicationInterval);
  }, [dispatch, publisherData, selectedAddon]);

  useEffect(() => {
    if (!isInstalling) {
      void InstallManager.refreshAddonInstallState(selectedAddon);
    }
  }, [isInstalling, selectedAddon]);

  useEffect(() => {
    if (download && isDownloading) {
      ipcRenderer.send('set-window-progress-bar', download.progress.totalPercent / 100);
    } else {
      ipcRenderer.send('set-window-progress-bar', -1);
    }
  }, [download, isDownloading]);

  const [addonDiscovered] = useSetting<boolean>('cache.main.discoveredAddons.' + hiddenAddon?.key);

  useEffect(() => {
    if (addonDiscovered) {
      setSelectedAddon(hiddenAddon);
    }
  }, [addonDiscovered, hiddenAddon]);

  const { showModal, showModalAsync } = useModals();

  const handleTrackSelection = (track: AddonTrack) => {
    if (!isInstalling) {
      if (track.isExperimental) {
        showModal(
          <PromptModal
            title="Warning!"
            bodyText={track.warningContent}
            confirmColor={ButtonType.Caution}
            onConfirm={() => {
              setCurrentlySelectedTrack(track);

              // Update install state
              void InstallManager.refreshAddonInstallState(selectedAddon);
            }}
            dontShowAgainSettingName="mainSettings.disableExperimentalWarning"
          />,
        );
      } else {
        setCurrentlySelectedTrack(track);

        // Update install state
        void InstallManager.refreshAddonInstallState(selectedAddon);
      }
    }
  };

  const handleInstall = async () => {
    await InstallManager.installAddon(selectedAddon, publisherData, showModalAsync);
  };

  const handleCancel = useCallback(() => {
    if (isInstalling && !isFinishingDependencyInstall) {
      InstallManager.cancelDownload(selectedAddon);
    }
  }, [isInstalling, isFinishingDependencyInstall, selectedAddon]);

  const UninstallButton = (): JSX.Element => {
    switch (status) {
      case InstallStatus.UpToDate:
      case InstallStatus.NeedsUpdate:
      case InstallStatus.TrackSwitch:
      case InstallStatus.DownloadDone:
      case InstallStatus.GitInstall: {
        return (
          <SidebarButton
            type={ButtonType.Neutral}
            onClick={() => InstallManager.uninstallAddon(selectedAddon, publisherData, showModalAsync)}
          >
            Uninstall
          </SidebarButton>
        );
      }
      default:
        return <></>;
    }
  };

  if (!publisherData) {
    return null;
  }

  if (publisherData.addons.length === 0) {
    return <NoAvailableAddonsSection />;
  }

  return (
    <div className="flex size-full flex-row">
      <div
        className="z-40 h-full flex-none border-r border-white/5 bg-gradient-to-b from-navy-dark/90 via-navy-medium to-navy-medium shadow-[12px_0_48px_rgba(0,0,0,0.35)]"
        style={{ width: '29rem' }}
      >
        <div className="flex h-full flex-col divide-y divide-white/5">
          <AddonBar>
            <div className="flex flex-col gap-y-4">
              {publisherData.addons
                .filter((it) => it.simulator === managedSim)
                .filter((it) => !it.category)
                .map((addon) => (
                  <AddonBarItem
                    selected={selectedAddon.key === addon.key && addon.enabled}
                    enabled={addon.enabled || !!addon.hidesAddon}
                    addon={addon}
                    key={addon.key}
                    onClick={() => {
                      history.push(`/addon-section/${publisherData.name}/`);

                      setSelectedAddon(addon);
                    }}
                  />
                ))}
            </div>

            <div className="flex h-full flex-col gap-y-4">
              {publisherData.defs
                ?.filter((it) => it.kind === 'addonCategory')
                .map((category: AddonCategoryDefinition) => {
                  const categoryAddons = publisherData.addons
                    .filter((it) => it.simulator === managedSim)
                    .filter((it) => it.category?.substring(1) === category.key);

                  if (categoryAddons.length === 0) {
                    return null;
                  }

                  let classes = '';
                  if (category.styles?.includes('align-bottom')) {
                    classes += 'mt-auto';
                  }

                  return (
                    <div key={category.key} className={classes}>
                      <h4 className="font-manrope font-medium text-quasi-white">{category.title}</h4>

                      <div className="flex flex-col gap-y-4">
                        {publisherData.addons
                          .filter((it) => it.simulator === managedSim)
                          .filter((it) => it.category?.substring(1) === category.key)
                          .map((addon) => (
                            <AddonBarItem
                              selected={selectedAddon.key === addon.key && addon.enabled}
                              enabled={addon.enabled || !!addon.hidesAddon}
                              addon={addon}
                              key={addon.key}
                              onClick={() => {
                                history.push(`/addon-section/${publisherData.name}/`);

                                setSelectedAddon(addon);
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </AddonBar>
        </div>
      </div>
      <div className={`flex size-full flex-col bg-navy`}>
        <div className="relative flex h-full flex-row">
          <div className="w-full">
            <Route path={`/addon-section/FlyByWire Simulations/configuration/fbw-local-api-config`}>
              <LocalApiConfigEditUI />
            </Route>

            <Route exact path={`/addon-section/${publisherName}`}>
              {publisherData.addons.every((addon) => !addon.enabled) ? (
                <Redirect to={`/addon-section/${publisherName}/no-available-addons`} />
              ) : (
                <Redirect to={`/addon-section/${publisherName}/main/configure`} />
              )}
            </Route>

            <Route path={`/addon-section/${publisherName}/no-available-addons`}>
              <NoAvailableAddonsSection />
            </Route>

            <Route path={`/addon-section/${publisherName}/main`}>
              <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
                <div
                  key={selectedAddon.key}
                  className="absolute inset-0 bg-cover bg-center motion-safe:animate-hero-in motion-safe:[animation-duration:180ms]"
                  style={{
                    backgroundImage:
                      (selectedAddon.backgroundImageShadow ?? true)
                        ? `linear-gradient(rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.06)), url(${selectedAddon.backgroundImageUrls[0]})`
                        : `url(${selectedAddon.backgroundImageUrls[0]})`,
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/65 via-[#0a1628]/50 to-black/80"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_70%_0%,transparent_0%,rgba(0,0,0,0.35)_55%,rgba(5,12,28,0.88)_100%)]"
                  aria-hidden
                />

                <div className="relative z-10 flex h-full min-h-0 flex-col">
                  <div className="relative z-20 shrink-0">
                    <StateSection
                      publisher={publisherData}
                      addon={selectedAddon}
                      onCancelInstall={canCancelInstall ? handleCancel : undefined}
                    />
                  </div>
                  <div className="flex min-h-0 flex-1 flex-row min-w-0">
                    <Route exact path={`/addon-section/${publisherName}/main/configure`}>
                      <Redirect to={`/addon-section/${publisherName}/main/configure/release-track`} />
                    </Route>

                    <Route
                      path={`/addon-section/:publisher/main/configure/:aspectKey`}
                      render={({
                        match: {
                          params: { aspectKey },
                        },
                      }) => (
                        <Configure
                          routeAspectKey={aspectKey}
                          selectedAddon={selectedAddon}
                          selectedTrack={selectedTrack}
                          installedTrack={installedTrack}
                          onTrackSelection={handleTrackSelection}
                        />
                      )}
                    />

                    <Route path={`/addon-section/${publisherName}/main/release-notes`}>
                      {releaseNotes && releaseNotes.length > 0 ? (
                        <ReleaseNotes addon={selectedAddon} />
                      ) : (
                        <Redirect to={`/addon-section/${publisherName}/main/configure`} />
                      )}
                    </Route>

                    <Route path={`/addon-section/${publisherName}/main/simbridge-config`}>
                      <LocalApiConfigEditUI />
                    </Route>

                    <Route path={`/addon-section/${publisherName}/main/about`}>
                      <About addon={selectedAddon} />
                    </Route>

                    <div className="relative ml-auto flex h-full min-h-0 w-[min(100%,300px)] min-w-[260px] max-w-[320px] shrink-0 flex-col items-center justify-between border-l border-white/10 bg-gradient-to-b from-navy-dark/82 via-navy-dark/72 to-navy/88 px-6 py-8 shadow-[-12px_0_40px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:px-8">
                    <div className="flex w-full flex-col items-start gap-y-5 place-self-start">
                      <SideBarLink to={`/addon-section/${publisherName}/main/configure`}>
                        <Sliders size={22} />
                        Configure
                      </SideBarLink>
                      {releaseNotes && releaseNotes.length > 0 && (
                        <SideBarLink to={`/addon-section/${publisherName}/main/release-notes`}>
                          <JournalText size={22} />
                          Release Notes
                        </SideBarLink>
                      )}
                      {selectedAddon.key.includes('simbridge') && ( // TODO find a better way to do this...
                        <SideBarLink
                          to={`/addon-section/${publisherName}/main/simbridge-config`}
                          disabled={InstallStatusCategories.installing.includes(status)}
                        >
                          <Gear size={22} />
                          Settings
                        </SideBarLink>
                      )}
                      <SideBarLink to={`/addon-section/${publisherName}/main/about`}>
                        <InfoCircle size={22} />
                        About
                      </SideBarLink>
                    </div>

                    <div className="flex w-full flex-col gap-y-4">
                      {showInstallSummary && installStates[selectedAddon.key] && (
                        <InstallStatusSummary
                          installedReleaseLabel={installedReleaseLabel}
                          installState={installStates[selectedAddon.key]}
                          installedTrack={installedTrack}
                          selectedReleaseLabel={selectedReleaseLabel}
                          selectedTrack={selectedTrack}
                        />
                      )}
                      {installStates[selectedAddon.key] && (
                        <MainActionButton installState={installStates[selectedAddon.key]} onInstall={handleInstall} />
                      )}
                      {showUninstall && (
                        <div className="mt-2 border-t border-white/10 pt-5">
                          <p className="mb-2 font-manrope text-[11px] font-semibold uppercase tracking-[0.14em] text-quasi-white/45">
                            Remove package
                          </p>
                          <UninstallButton />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </Route>
          </div>
        </div>
      </div>
    </div>
  );
};

const About: FC<{ addon: Addon }> = ({ addon }) => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto py-10 sm:py-12 lg:py-16">
    <div className="mx-auto w-full max-w-configure px-6 sm:px-10 lg:px-14">
      <div className="flex items-center justify-between">
        <h2 className="font-manrope text-fbw-xl font-bold text-white 2xl:text-[26px]">About</h2>

        <h2 className="font-manrope text-fbw-lg text-white 2xl:text-fbw-xl">{addon.aircraftName}</h2>
      </div>
      <ReactMarkdown
        className="font-manrope text-xl font-light leading-relaxed text-white"
        linkTarget={'_blank'}
        rehypePlugins={[rehypeRaw]}
      >
        {addon.description}
      </ReactMarkdown>

      {addon.techSpecs && addon.techSpecs.length > 0 && (
        <>
          <h3 className="font-bold text-white">Tech Specs</h3>

          <div className="flex flex-row gap-x-16">
            {addon.techSpecs.map((spec) => (
              <span key={spec.name} className="flex flex-col items-start">
                <span className="mb-1 text-2xl text-quasi-white">{spec.name}</span>
                <span className="font-manrope text-4xl font-semibold text-cyan">{spec.value}</span>
              </span>
            ))}
          </div>
        </>
      )}

      <MyInstall addon={addon} />
    </div>
  </div>
);
