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
          // 모바일은 글자를 숨기므로 이름을 따로 주고, 아이콘만 남아도 44px 을 누를 수 있게 한다
          aria-label={item.label}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-20"
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
