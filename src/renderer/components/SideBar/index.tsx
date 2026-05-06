import React, { FC } from 'react';
import { useIsDarkTheme } from 'renderer/rendererSettings';
import { NavLink, useRouteMatch } from 'react-router-dom';

export interface SideBarProps {
  className?: string;
}

export const SideBar: FC<SideBarProps> = ({ className, children }) => {
  const darkTheme = useIsDarkTheme();

  const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

  return (
    <div
      className={`flex flex-col gap-y-5 ${textClass} ${darkTheme ? 'border-r border-white/5 bg-gradient-to-b from-navy-dark to-navy-dark/95 shadow-[12px_0_40px_rgba(0,0,0,0.25)]' : 'bg-quasi-white'} h-full px-6 py-7 ${className}`}
      style={{ width: '28rem' }}
    >
      {children}
    </div>
  );
};

export interface SideBarItemProps {
  enabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SideBarItem: FC<SideBarItemProps> = ({
  enabled = true,
  selected = false,
  onClick = () => {},
  className,
  children,
}) => {
  const darkTheme = useIsDarkTheme();

  const defaultBorderStyle = darkTheme ? 'border-navy-dark' : 'border-quasi-white';

  const enabledUnselectedStyle = darkTheme
    ? 'bg-navy-dark border-navy-light text-quasi-white'
    : 'bg-grey-medium text-navy';

  const dependantStyles = selected
    ? ` bg-dodger-light text-navy-dark`
    : `${enabledUnselectedStyle} ${enabled && 'hover:border-dodger-light'}`;

  return (
    <div
      className={`relative flex w-full items-center justify-between overflow-hidden rounded-xl border-2 p-5 shadow-sm transition-all duration-300 ease-out-expo ${defaultBorderStyle} ${dependantStyles} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0' : 'cursor-not-allowed'} no-underline ${className}`}
      onClick={enabled ? onClick : undefined}
    >
      {children}
    </div>
  );
};

export const SideBarTitle: FC = ({ children }) => {
  const darkTheme = useIsDarkTheme();

  const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

  return (
    <div className="flex flex-col -space-y-7">
      <h2 className={`${textClass} -mb-1 font-bold`}>{children}</h2>
    </div>
  );
};

export interface SideBarLinkProps {
  to: string;
}

export const SideBarLink: FC<SideBarLinkProps> = ({ to, children }) => {
  const match = useRouteMatch(to);

  return (
    <NavLink to={to} className="no-underline">
      <SideBarItem selected={!!match}>{children}</SideBarItem>
    </NavLink>
  );
};
