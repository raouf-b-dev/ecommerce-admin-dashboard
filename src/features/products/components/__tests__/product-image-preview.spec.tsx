import { act, fireEvent, render, screen } from '@testing-library/react';
import { ProductImagePreview } from '@/features/products/components/product-image-preview';

function preview() {
  return screen.getByTestId('product-image-preview');
}

function probeImage(container: HTMLElement) {
  const img = container.querySelector('img.hidden');
  if (!img) throw new Error('probe image not rendered');
  return img;
}

describe('ProductImagePreview', () => {
  it('shows the placeholder message when the URL is empty', () => {
    render(<ProductImagePreview url="" name="Desk Lamp" />);
    expect(preview()).toHaveAttribute('data-status', 'empty');
    expect(screen.getByText(/lettered placeholder/i)).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('flags a value that is not an absolute http(s) URL', () => {
    render(<ProductImagePreview url="lamp.jpg" name="Desk Lamp" />);
    expect(preview()).toHaveAttribute('data-status', 'invalid');
  });

  it('moves from loading to loaded when the image loads', () => {
    const { container } = render(
      <ProductImagePreview url="https://cdn.example.com/lamp.webp" name="Desk Lamp" />,
    );
    expect(preview()).toHaveAttribute('data-status', 'loading');
    fireEvent.load(probeImage(container));
    expect(preview()).toHaveAttribute('data-status', 'loaded');
  });

  it('reports an unreachable image', () => {
    const { container } = render(
      <ProductImagePreview url="https://cdn.example.com/missing.webp" name="Desk Lamp" />,
    );
    fireEvent.error(probeImage(container));
    expect(preview()).toHaveAttribute('data-status', 'error');
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i);
  });

  it('waits for typing to pause before probing a new URL', () => {
    vi.useFakeTimers();
    try {
      const { container, rerender } = render(<ProductImagePreview url="" name="Desk Lamp" />);
      rerender(<ProductImagePreview url="https://c" name="Desk Lamp" />);
      rerender(<ProductImagePreview url="https://cdn.example.com/lamp.webp" name="Desk Lamp" />);

      expect(preview()).toHaveAttribute('data-status', 'loading');
      expect(container.querySelector('img.hidden')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(probeImage(container)).toHaveAttribute('src', 'https://cdn.example.com/lamp.webp');
    } finally {
      vi.useRealTimers();
    }
  });
});
