import { FC } from 'react';

export interface NavItem {
  href: string;
  icon: FC<{ fill: string }>;
  label: string;
}
