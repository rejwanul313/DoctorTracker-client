import type { IconName } from '../ui/Icon';

export interface NavItem {
  title: string;
  href: string;
  icon: IconName;
  /** Shows the total doctors badge. */
  badge?: 'doctors';
}

export const NAV_SECTIONS: { subheader: string; items: NavItem[] }[] = [
  { subheader: 'Overview', items: [{ title: 'Dashboard', href: '/dashboard', icon: 'dashboard' }] },
  {
    subheader: 'Management',
    items: [
      { title: 'Doctors', href: '/doctors', icon: 'doctor', badge: 'doctors' },
      { title: 'Patients', href: '/patients', icon: 'patients' },
    ],
  },
];
