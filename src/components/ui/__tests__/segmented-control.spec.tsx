import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '@/components/ui/segmented-control';

describe('SegmentedControl', () => {
  const options = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
  ];

  it('renders all options and indicates selected option', () => {
    render(
      <SegmentedControl
        options={options}
        value={30}
        onChange={vi.fn()}
        ariaLabel="Period"
      />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Period' })).toBeInTheDocument();
    const radio30 = screen.getByRole('radio', { name: '30 days' });
    expect(radio30).not.toHaveAttribute('aria-label');
    expect(radio30).toHaveAttribute('aria-checked', 'true');

    const radio7 = screen.getByRole('radio', { name: '7 days' });
    expect(radio7).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicking an option', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SegmentedControl
        options={options}
        value={7}
        onChange={handleChange}
        ariaLabel="Period"
      />,
    );

    await user.click(screen.getByRole('radio', { name: '90 days' }));
    expect(handleChange).toHaveBeenCalledWith(90);
  });

  it('roving arrow keys cycle options and trigger onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SegmentedControl
        options={options}
        value={7}
        onChange={handleChange}
        ariaLabel="Period"
      />,
    );

    const radio7 = screen.getByRole('radio', { name: '7 days' });
    radio7.focus();
    await user.keyboard('{ArrowRight}');
    expect(handleChange).toHaveBeenCalledWith(30);

    await user.keyboard('{ArrowLeft}');
    expect(handleChange).toHaveBeenCalledWith(7);

    // Test wrap-around backwards from first item
    await user.keyboard('{ArrowLeft}');
    expect(handleChange).toHaveBeenCalledWith(90);
  });

  it('names an icon-only option from its ariaLabel', () => {
    render(
      <SegmentedControl
        options={[
          { value: 'light', label: <svg aria-hidden="true" />, ariaLabel: 'Light theme' },
          { value: 'dark', label: <svg aria-hidden="true" />, ariaLabel: 'Dark theme' },
        ]}
        value="dark"
        onChange={vi.fn()}
        ariaLabel="Theme"
      />,
    );

    expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Light theme' })).toHaveAttribute(
      'title',
      'Light theme',
    );
  });
});
