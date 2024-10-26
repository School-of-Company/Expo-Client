'use client';

import Link from 'next/link';
import React from 'react';
import { NavItem } from '../../model/types';
import { useNavigation } from '../../model/useNavigation';

const Navigation: React.FC = () => {
  const { navItems, getColor } = useNavigation();

  return (
    <nav className="flex gap-[50px] mobile:gap-8">
      {navItems.map((item: NavItem) => (
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
  );
};

export default Navigation;
