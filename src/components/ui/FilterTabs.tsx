import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { memo } from 'react';
import type { LabelColor } from '@/lib/conditions';
import { fNumber } from '@/lib/format';
import { Label } from './Label';

export interface FilterTab {
  value: string;
  label: string;
  count?: number;
  color?: LabelColor;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

/** Tabs with count badges; scrolls horizontally on small screens. */
export const FilterTabs = memo(function FilterTabs({
  tabs,
  value,
  onChange,
  ariaLabel,
}: FilterTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_e, v: string) => onChange(v)}
      aria-label={ariaLabel}
      variant="scrollable"
      scrollButtons={false}
      sx={{
        px: 2.5,
        boxShadow: (t) => `inset 0 -2px 0 0 ${t.alpha(t.vars.palette.grey[500], 0.08)}`,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={
              <Label
                variant={active && (!tab.color || tab.color === 'default') ? 'filled' : 'soft'}
                color={tab.color ?? 'default'}
              >
                {tab.count === undefined ? '…' : fNumber(tab.count)}
              </Label>
            }
          />
        );
      })}
    </Tabs>
  );
});
