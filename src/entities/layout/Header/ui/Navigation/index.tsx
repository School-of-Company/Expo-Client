'use client';

import Link from 'next/link';
import { NavItem } from '../../model/types';
import { useNavigation } from '../../model/useNavigation';

const Navigation = () => {
  const { navItems, getColor } = useNavigation();

  return (
    <nav className="flex gap-40 mobile:gap-20">
      {navItems.map((item: NavItem) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-20"
        >
          <div>
            <item.icon fill={getColor(item.href)} />
          </div>
          <span
            className="block text-caption1r mobile:hidden"
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
