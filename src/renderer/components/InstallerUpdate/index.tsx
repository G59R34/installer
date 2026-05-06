import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import * as path from 'path';
import channels from 'common/channels';

type IpcCallback = Parameters<(typeof ipcRenderer)['on']>[1];

enum UpdateState {
  Standby,
  DownloadingUpdate,
  RestartToUpdate,
}

export const InstallerUpdate = (): JSX.Element => {
  const [updateState, setUpdateState] = useState(UpdateState.Standby);

  const updateNeeded = updateState !== UpdateState.Standby;

  let buttonText;
  switch (updateState) {
    case UpdateState.Standby:
      buttonText = '';
      break;
    case UpdateState.DownloadingUpdate:
      buttonText = 'Downloading update';
      break;
    case UpdateState.RestartToUpdate:
      buttonText = 'Restart to update';
      break;
  }

  useEffect(() => {
    const updateErrorHandler: IpcCallback = (_, args) => {
      console.error('Update error', args);
    };

    const updateAvailableHandler: IpcCallback = () => {
      console.log('Update available');

      setUpdateState(UpdateState.DownloadingUpdate);
    };

    const updateDownloadedHandler: IpcCallback = (_, args) => {
      console.log('Update downloaded', args);

      setUpdateState(UpdateState.RestartToUpdate);

      Notification.requestPermission()
        .then(() => {
          console.log('Showing Update notification');
          new Notification('Restart to update!', {
            icon: path.join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'An update to the installer has been downloaded',
          });
        })
        .catch((e) => console.log(e));
    };

    ipcRenderer.on(channels.update.error, updateErrorHandler);
    ipcRenderer.on(channels.update.available, updateAvailableHandler);
    ipcRenderer.on(channels.update.downloaded, updateDownloadedHandler);

    return () => {
      ipcRenderer.off(channels.update.error, updateErrorHandler);
      ipcRenderer.off(channels.update.available, updateAvailableHandler);
      ipcRenderer.off(channels.update.downloaded, updateDownloadedHandler);
    };
  }, []);

  return (
    <div
      className={`z-50 flex h-full cursor-pointer items-center justify-center place-self-start rounded-l-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 shadow-lg ring-1 ring-amber-300/35 transition-all duration-300 ease-out-expo hover:from-amber-400 hover:to-yellow-400 hover:shadow-xl hover:ring-amber-200/50 active:scale-[0.98] ${
        updateNeeded ? 'visible' : 'hidden'
      } ${updateState === UpdateState.RestartToUpdate ? 'motion-safe:animate-attention-pulse' : ''}`}
      onClick={() => {
        if (updateState === UpdateState.RestartToUpdate) {
          ipcRenderer.send('restartAndUpdate');
        }
      }}
    >
      <div className="text-lg font-semibold text-white">{buttonText}</div>
    </div>
  );
};
