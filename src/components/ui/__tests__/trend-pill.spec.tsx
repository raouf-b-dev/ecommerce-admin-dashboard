import { render, screen } from '@testing-library/react';
import { TrendPill } from '@/components/ui/trend-pill';

describe('TrendPill', () => {
  it('renders positive delta with up arrow', () => {
    render(<TrendPill delta={14.5} />);
    expect(screen.getByText('+14.5%')).toBeInTheDocument();
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('renders negative delta with down arrow', () => {
    render(<TrendPill delta={-8.2} />);
    expect(screen.getByText('-8.2%')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('renders neutral delta when delta is 0', () => {
    render(<TrendPill delta={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders n/a when delta is null', () => {
    render(<TrendPill delta={null} />);
    expect(screen.getByText('n/a')).toBeInTheDocument();
  });
});
