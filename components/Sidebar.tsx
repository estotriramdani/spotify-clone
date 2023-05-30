'use client';

import React, { useMemo } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { HiHome } from 'react-icons/hi';
import { BiSearch } from 'react-icons/bi';

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const pathname = usePathname();

  const routes = useMemo(
    () => [
      {
        icons: HiHome,
        label: 'Home',
        active: pathname !== '/search',
        href: '/',
      },
      {
        icons: BiSearch,
        label: 'Search',
        active: pathname === '/search',
        href: '/search',
      },
    ],
    [pathname]
  );

  return <div className='flex h-full'>{children}</div>;
};

export default Sidebar;
