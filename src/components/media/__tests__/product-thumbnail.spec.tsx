import { fireEvent, render, screen } from '@testing-library/react';
import { placeholderTintClass, ProductThumbnail } from '@/components/media/product-thumbnail';

describe('ProductThumbnail', () => {
  it('renders the image when a URL is given', () => {
    const { container } = render(
      <ProductThumbnail src="https://cdn.example.com/lamp.webp" name="Desk Lamp" />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/lamp.webp',
    );
  });

  it('falls back to the initial when the image fails to load', () => {
    const { container } = render(
      <ProductThumbnail src="https://cdn.example.com/missing.webp" name="desk lamp" />,
    );
    const img = container.querySelector('img');
    if (!img) throw new Error('image not rendered');
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('shows an icon when the name has no letter or digit', () => {
    const { container } = render(<ProductThumbnail name="--" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('placeholderTintClass', () => {
  it('uses the accent tint without a usable category', () => {
    expect(placeholderTintClass(null)).toBe('bg-primary/10 text-primary');
    expect(placeholderTintClass(Number.NaN)).toBe('bg-primary/10 text-primary');
  });

  it('maps category ids onto the tint palette, including negative and fractional ids', () => {
    expect(placeholderTintClass(1)).toBe('bg-tint-2 text-tint-2-foreground');
    expect(placeholderTintClass(6)).toBe('bg-tint-2 text-tint-2-foreground');
    expect(placeholderTintClass(-1)).toBe('bg-tint-5 text-tint-5-foreground');
    expect(placeholderTintClass(2.7)).toBe('bg-tint-3 text-tint-3-foreground');
  });
});
