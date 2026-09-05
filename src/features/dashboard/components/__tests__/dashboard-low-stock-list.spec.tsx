import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DashboardLowStockList } from '@/features/dashboard/components/dashboard-low-stock-list';
import type { InventoryAlertItemDto } from '@/features/dashboard/types';

describe('DashboardLowStockList', () => {
  const mockAlerts: InventoryAlertItemDto[] = [
    {
      productId: 101,
      sku: 'WIDGET-01',
      productTitle: 'Critical Widget',
      availableQuantity: 0,
      lowStockThreshold: 10,
    },
    {
      productId: 102,
      sku: 'GADGET-02',
      productTitle: 'Low Gadget',
      availableQuantity: 3,
      lowStockThreshold: 15,
    },
  ];

  it('renders empty message when no items are present', () => {
    render(
      <MemoryRouter>
        <DashboardLowStockList items={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No low-stock SKUs.')).toBeInTheDocument();
  });

  it('renders compact list items with status badges and stock numbers without table elements', () => {
    render(
      <MemoryRouter>
        <DashboardLowStockList items={mockAlerts} totalAtRisk={17} />
      </MemoryRouter>,
    );

    // No table markup
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Renders list items
    expect(screen.getByText('Critical Widget')).toBeInTheDocument();
    expect(screen.getByText('Low Gadget')).toBeInTheDocument();

    // Renders badges
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Low stock')).toBeInTheDocument();

    // Renders stock numbers
    expect(screen.getByText('/ 10')).toBeInTheDocument();
    expect(screen.getByText('/ 15')).toBeInTheDocument();

    // Links to individual inventory pages
    expect(screen.getByRole('link', { name: 'Critical Widget' })).toHaveAttribute(
      'href',
      '/inventory/101',
    );

    // Footer link uses totalAtRisk from overview query
    const footerLink = screen.getByRole('link', { name: '17 at risk → Inventory' });
    expect(footerLink).toBeInTheDocument();
    expect(footerLink).toHaveAttribute('href', '/inventory?lowStockOnly=true');
  });

  it('caps display at 5 items if more are passed', () => {
    const sixAlerts: InventoryAlertItemDto[] = Array.from({ length: 6 }, (_, i) => ({
      productId: i + 1,
      sku: `SKU-${i + 1}`,
      productTitle: `Product ${i + 1}`,
      availableQuantity: i,
      lowStockThreshold: 10,
    }));

    render(
      <MemoryRouter>
        <DashboardLowStockList items={sixAlerts} totalAtRisk={24} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 5')).toBeInTheDocument();
    expect(screen.queryByText('Product 6')).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: '24 at risk → Inventory' })).toBeInTheDocument();
  });
});
