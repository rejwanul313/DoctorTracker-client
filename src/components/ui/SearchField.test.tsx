import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/test/renderWithTheme';
import { ConditionLabel } from './Label';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reports the trimmed value once, after the user stops typing', () => {
    const onSearch = vi.fn();
    renderWithTheme(<SearchField value="" onSearch={onSearch} placeholder="Search doctors" />);
    const input = screen.getByRole('searchbox', { name: 'Search doctors' });

    fireEvent.change(input, { target: { value: 'f' } });
    fireEvent.change(input, { target: { value: 'far' } });
    fireEvent.change(input, { target: { value: 'farh ' } });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('farh');
  });

  it('syncs when the value is cleared from outside (e.g. "Clear filters")', () => {
    const onSearch = vi.fn();
    const { rerender } = renderWithTheme(
      <SearchField value="rahman" onSearch={onSearch} placeholder="Search" />,
    );
    const input = screen.getByRole<HTMLInputElement>('searchbox');
    expect(input.value).toBe('rahman');
    rerender(<SearchField value="" onSearch={onSearch} placeholder="Search" />);
    expect(input.value).toBe('');
  });
});

describe('ConditionLabel', () => {
  it('always shows the condition as text, not color alone', () => {
    renderWithTheme(<ConditionLabel condition="Critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});
