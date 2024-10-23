'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Calendar, Museum, Person } from '@/assets/icons';
import { Logo } from '@/assets/svg';

interface NavItem {
  href: string;
  icon: React.FC<{ fill: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/participants', icon: Calendar, label: '참가자 명단' },
  { href: '/create-exhibition', icon: Museum, label: '박람회 만들기' },
  { href: '/admin', icon: Person, label: '김진원 관리자' },
];

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string): boolean => pathname === path;

  const getColor = (path: string): string =>
    isActive(path) ? '#448FFF' : '#121212';

  return (
    <div className="flex h-[90px] w-full items-center justify-around bg-white">
      <Link href="/">
        <Logo />
      </Link>
      <nav className="flex gap-[50px] mobile:gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-5"
          >
            <div>
              <item.icon fill={getColor(item.href)} />
            </div>
            <span
              className="block mobile:hidden"
              style={{ color: getColor(item.href) }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Header;
