import React from 'react';

export const NoAvailableAddonsSection = (): JSX.Element => (
  <div className="flex size-full items-center justify-center px-6 text-center motion-safe:animate-fade-in-up">
    <p className="max-w-lg font-manrope text-3xl font-medium leading-relaxed text-quasi-white/90 drop-shadow-md">
      There are currently no available addons provided by this publisher.
    </p>
  </div>
);
